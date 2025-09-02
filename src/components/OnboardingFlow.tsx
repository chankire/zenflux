import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, Building2, CreditCard, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import CSVUploader from "./CSVUploader";

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [organizationData, setOrganizationData] = useState({
    name: "",
    currency: "USD",
  });
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "Company Setup",
      description: "Tell us about your company",
      completed: false,
    },
    {
      id: 2,
      title: "Upload Data",
      description: "Import your transaction history",
      completed: false,
    },
    {
      id: 3,
      title: "Ready to Forecast",
      description: "Your setup is complete!",
      completed: false,
    },
  ];

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  const handleCompanySetup = async () => {
    if (!organizationData.name.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter your company name.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // 1. Verify user authentication with retry
      let user;
      let authAttempts = 0;
      const maxAuthAttempts = 3;

      while (authAttempts < maxAuthAttempts) {
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
        
        if (currentUser && !authError) {
          user = currentUser;
          break;
        }

        authAttempts++;
        if (authAttempts < maxAuthAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        }
      }

      if (!user) {
        throw new Error('Authentication failed. Please refresh and sign in again.');
      }

      console.log('User authenticated:', user.id);

      // 2. Check if user already has an organization
      const { data: existingMemberships } = await supabase
        .from('memberships')
        .select('organization_id, organizations!inner(*)')
        .eq('user_id', user.id)
        .limit(1);

      if (existingMemberships && existingMemberships.length > 0) {
        toast({
          title: "Organization already exists!",
          description: "Redirecting to your dashboard.",
        });
        setCurrentStep(3);
        return;
      }

      // 3. Generate unique slug
      let slug;
      try {
        const { data: slugData, error: slugError } = await supabase
          .rpc('generate_org_slug', { org_name: organizationData.name.trim() });
        
        if (slugError) throw slugError;
        slug = slugData;
      } catch (slugError) {
        // Fallback: create slug manually
        slug = organizationData.name.trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substr(2, 6);
      }

      console.log('Generated slug:', slug);

      // 4. Create organization with transaction
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: organizationData.name.trim(),
          slug: slug,
          base_currency: organizationData.currency,
          created_by: user.id,
          settings: {
            currency: organizationData.currency,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            created_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (orgError) {
        console.error('Organization creation error:', orgError);
        if (orgError.message.includes('duplicate key') || orgError.message.includes('already exists')) {
          throw new Error('An organization with this name already exists. Please choose a different name.');
        }
        throw new Error(`Failed to create organization: ${orgError.message}`);
      }

      console.log('Organization created successfully:', org);

      // 5. Create membership
      const { data: membership, error: membershipError } = await supabase
        .from("memberships")
        .insert({
          user_id: user.id,
          organization_id: org.id,
          role: 'org_owner'
        })
        .select()
        .single();

      if (membershipError) {
        console.error('Membership creation error:', membershipError);
        // Organization was created, but membership failed - try to clean up or proceed
        toast({
          title: "Organization created with warning",
          description: "Organization created but membership setup incomplete. Proceeding to next step.",
          variant: "default",
        });
      } else {
        console.log('Membership created successfully:', membership);
      }

      toast({
        title: "Company setup complete!",
        description: "Your organization has been created successfully.",
      });

      setCurrentStep(2);
    } catch (error: any) {
      console.error('Error in company setup:', error);
      
      let errorMessage = "Failed to create organization. Please try again.";
      
      if (error.message?.includes('Authentication failed')) {
        errorMessage = "Please refresh the page and sign in again.";
      } else if (error.message?.includes('already exists')) {
        errorMessage = "An organization with this name already exists. Please choose a different name.";
      } else if (error.message?.includes('violates row-level security')) {
        errorMessage = "Account setup error. Please contact support if this persists.";
      }
      
      toast({
        title: "Setup failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDataUploadComplete = () => {
    toast({
      title: "Data uploaded successfully!",
      description: "Your transaction history has been imported.",
    });
    setCurrentStep(3);
  };

  const handleComplete = () => {
    toast({
      title: "Welcome to ZenFlux!",
      description: "Your account is ready. Let's generate your first forecast.",
    });
    onComplete();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Building2 className="w-16 h-16 mx-auto text-primary mb-4" />
              <h3 className="text-2xl font-semibold">Set up your company</h3>
              <p className="text-muted-foreground">We'll create your organization and set up multi-tenant data isolation.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  placeholder="Enter your company name"
                  value={organizationData.name}
                  onChange={(e) => setOrganizationData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="currency">Base Currency</Label>
                <select
                  id="currency"
                  className="w-full p-2 border border-input rounded-md bg-background"
                  value={organizationData.currency}
                  onChange={(e) => setOrganizationData(prev => ({ ...prev, currency: e.target.value }))}
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>
            </div>
            
            <Button 
              onClick={handleCompanySetup} 
              className="w-full" 
              disabled={uploading}
              variant="hero"
            >
              {uploading ? "Setting up..." : "Create Organization"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Upload className="w-16 h-16 mx-auto text-primary mb-4" />
              <h3 className="text-2xl font-semibold">Upload your transaction data</h3>
              <p className="text-muted-foreground">Import CSV files from your bank or accounting software to get started with real forecasting.</p>
            </div>
            
            <CSVUploader onUploadComplete={handleDataUploadComplete} />
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                variant="ghost" 
                onClick={handleDataUploadComplete}
              >
                Skip for now
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 mx-auto text-accent mb-4" />
              <h3 className="text-2xl font-semibold">You're all set!</h3>
              <p className="text-muted-foreground">Your ZenFlux account is ready. Let's generate your first AI-powered forecast.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-gradient-card border">
                <CreditCard className="w-8 h-8 mx-auto text-primary mb-2" />
                <h4 className="font-semibold">Connect Banks</h4>
                <p className="text-sm text-muted-foreground">Link accounts via Plaid</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-card border">
                <Upload className="w-8 h-8 mx-auto text-accent mb-2" />
                <h4 className="font-semibold">Import More Data</h4>
                <p className="text-sm text-muted-foreground">QuickBooks, Xero, CSVs</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-card border">
                <Building2 className="w-8 h-8 mx-auto text-primary-glow mb-2" />
                <h4 className="font-semibold">Invite Team</h4>
                <p className="text-sm text-muted-foreground">Collaborate on forecasts</p>
              </div>
            </div>
            
            <Button 
              onClick={handleComplete} 
              className="w-full" 
              variant="hero"
              size="lg"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">Z</span>
            </div>
          </div>
          <CardTitle className="text-3xl">Welcome to ZenFlux</CardTitle>
          <CardDescription>Let's get your AI-powered forecasting set up in just a few steps</CardDescription>
          
          {/* Progress */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {steps.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Step indicators */}
          <div className="flex justify-center gap-4 mt-4">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-2">
                <Badge 
                  variant={currentStep >= step.id ? "default" : "secondary"}
                  className={currentStep >= step.id ? "bg-primary" : ""}
                >
                  {step.id}
                </Badge>
                <span className={`text-sm ${currentStep >= step.id ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {renderCurrentStep()}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;