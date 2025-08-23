import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Phone, Building } from "lucide-react";
import { validateEmail, sanitizeInput, rateLimit, logSecurityEvent } from "@/lib/security";

const ContactForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side rate limiting
    if (!rateLimit.isAllowed('demo-request', 1, 300000)) { // 1 request per 5 minutes
      toast({
        title: "Too many attempts",
        description: "Please wait a few minutes before trying again.",
        variant: "destructive",
      });
      logSecurityEvent('rate_limit_exceeded', { form: 'demo-request' });
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
    
    setLoading(true);

    try {
      // Sanitize inputs before sending
      const sanitizedData = {
        name: sanitizeInput(formData.name, 100),
        email: sanitizeInput(formData.email, 255).toLowerCase(),
        company: sanitizeInput(formData.company, 100),
        phone: sanitizeInput(formData.phone, 20),
        message: sanitizeInput(formData.message, 1000)
      };
      
      const { error } = await supabase.functions.invoke('send-demo-request', {
        body: sanitizedData
      });

      if (error) throw error;

      toast({
        title: "Demo request sent!",
        description: "We'll get back to you within 24 hours to schedule your personalized demo.",
      });
      
      logSecurityEvent('demo_request_success', { email: sanitizedData.email });

      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: ''
      });
    } catch (error: any) {
      console.error('Error sending demo request:', error);
      logSecurityEvent('demo_request_error', { error: error.message });
      toast({
        variant: "destructive",
        title: "Error sending request",
        description: error.message || "Please try again or contact us directly.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Request a Personalized Demo
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how ZenFlux can transform your cash flow forecasting. Get a tailored demo with your own data scenarios.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="border-border/50 bg-gradient-card shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Schedule Your Demo
              </CardTitle>
              <CardDescription>
                Fill out the form below and we'll contact you within 24 hours to schedule a personalized demonstration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">
                      <Building className="w-4 h-4 inline mr-1" />
                      Company Name *
                    </Label>
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      required
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="ACME Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Tell us about your requirements</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="What are your current cash flow challenges? How many bank accounts do you manage? What's your monthly transaction volume?"
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? "Sending Request..." : "Request Demo"}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  We respect your privacy. Your information will only be used to contact you about the demo.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;