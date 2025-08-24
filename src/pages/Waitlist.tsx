import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { validateEmail, sanitizeInput, rateLimit, logSecurityEvent } from "@/lib/security";

const Waitlist = () => {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    role: "",
    email: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side rate limiting
    if (!rateLimit.isAllowed('waitlist-signup', 2, 300000)) { // 2 requests per 5 minutes
      toast({
        title: "Too many attempts",
        description: "Please wait a few minutes before trying again.",
        variant: "destructive",
      });
      logSecurityEvent('rate_limit_exceeded', { form: 'waitlist' });
      return;
    }
    
    // Validate inputs
    if (!validateEmail(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.name.trim().length < 2 || formData.company.trim().length < 2) {
      toast({
        title: "Invalid input",
        description: "Name and company must be at least 2 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Sanitize inputs before sending
      const sanitizedData = {
        name: sanitizeInput(formData.name, 100),
        email: sanitizeInput(formData.email, 255).toLowerCase(),
        company: sanitizeInput(formData.company, 100),
        role: sanitizeInput(formData.role, 50)
      };
      
      const { supabase } = await import("@/integrations/supabase/client");
      
      const { error } = await supabase.functions.invoke('send-waitlist-request', {
        body: sanitizedData
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Welcome to the waitlist!",
        description: "We'll reach out soon with early access details.",
      });
      
      logSecurityEvent('waitlist_signup_success', { email: sanitizedData.email });
    } catch (error: any) {
      console.error('Error sending waitlist request:', error);
      logSecurityEvent('waitlist_signup_error', { error: error.message });
      toast({
        variant: "destructive",
        title: "Error joining waitlist",
        description: error.message || "Please try again or contact us directly.",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">You're on the list!</CardTitle>
            <CardDescription>
              Thanks for joining the ZenFlux waitlist. We'll reach out soon with early access details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button asChild variant="outline" className="w-full">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Demo
                </Link>
              </Button>
              <Button 
                onClick={() => {
                  const shareText = "Check out ZenFlux - AI-powered cash flow forecasting that's 99% accurate 1 year out!";
                  const shareUrl = window.location.origin;
                  if (navigator.share) {
                    navigator.share({ title: "ZenFlux Demo", text: shareText, url: shareUrl });
                  } else {
                    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                    toast({ title: "Link copied!", description: "Share ZenFlux with your network" });
                  }
                }}
                variant="ghost"
                className="w-full"
              >
                Share ZenFlux with Others
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Back to Home Button */}
        <Button 
          variant="ghost" 
          asChild
          className="mb-4"
        >
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Join the ZenFlux Waitlist</CardTitle>
            <CardDescription className="text-center">
              Get early access to AI-powered cash flow forecasting that's 99% accurate, 1 year ahead.
            </CardDescription>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                type="text"
                placeholder="Your company name"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={(value) => handleInputChange('role', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="founder">Founder/CEO</SelectItem>
                  <SelectItem value="cfo">CFO</SelectItem>
                  <SelectItem value="finance-director">Finance Director</SelectItem>
                  <SelectItem value="finance-manager">Finance Manager</SelectItem>
                  <SelectItem value="controller">Controller</SelectItem>
                  <SelectItem value="analyst">Financial Analyst</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" variant="hero">
              Request Early Access
            </Button>
            
            <div className="text-center">
              <Button asChild variant="ghost" size="sm">
                <Link to="/">← Back to Demo</Link>
              </Button>
            </div>
          </form>
          
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              🔒 Your financial data is encrypted and never shared.
            </p>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Waitlist;