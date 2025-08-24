import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Chrome, Mail, ArrowLeft, Loader2 } from "lucide-react";

interface AuthFormData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AuthFormData>();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast({
        variant: "destructive",
        title: "Google sign-in failed",
        description: error.message || "Failed to sign in with Google.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Password reset email sent!",
        description: "Check your email for a password reset link.",
      });
      
      setIsForgotPassword(false);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: error.message || "Failed to send password reset email.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AuthFormData) => {
    if (isForgotPassword) {
      await handleForgotPassword(data.email);
      return;
    }

    setLoading(true);
    
    try {
      if (isSignUp) {
        const redirectUrl = `${window.location.origin}/dashboard`;
        
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              first_name: data.firstName,
              last_name: data.lastName,
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Account created!",
          description: "Please check your email to verify your account and complete setup.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
        
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let errorMessage = "An error occurred during authentication.";
      
      if (error.message.includes("User already registered")) {
        errorMessage = "This email is already registered. Try signing in instead.";
      } else if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please check your email and click the confirmation link.";
      }
      
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Back to Home */}
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">Z</span>
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              {isForgotPassword ? "Reset Your Password" : isSignUp ? "Create Your Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-center">
              {isForgotPassword 
                ? "Enter your email address and we'll send you a password reset link" 
                : isSignUp 
                ? "Start forecasting with AI in minutes" 
                : "Sign in to continue to your dashboard"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Google Sign In - Hide in forgot password mode */}
            {!isForgotPassword && (
              <div className="space-y-4 mb-6">
                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full" 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Continue with Google
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {isSignUp && !isForgotPassword && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      {...register("firstName", { required: isSignUp && !isForgotPassword })}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive mt-1">First name is required</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      {...register("lastName", { required: isSignUp && !isForgotPassword })}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive mt-1">Last name is required</p>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>
              
              {!isForgotPassword && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password", {
                      required: !isForgotPassword ? "Password is required" : false,
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                  )}
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={loading} variant="hero">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isForgotPassword ? "Send Reset Email" : isSignUp ? "Create Account" : "Sign In"}
              </Button>
              
              {!isSignUp && !isForgotPassword && (
                <div className="mt-2 text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Forgot your password?
                  </Button>
                </div>
              )}
            </form>
            
            <div className="mt-6 text-center">
              {isForgotPassword ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsForgotPassword(false);
                    reset();
                  }}
                  className="text-sm"
                >
                  Back to sign in
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setIsForgotPassword(false);
                    reset();
                  }}
                  className="text-sm"
                >
                  {isSignUp 
                    ? "Already have an account? Sign in" 
                    : "Don't have an account? Sign up"
                  }
                </Button>
              )}
            </div>

            {isSignUp && (
              <Alert className="mt-4">
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  By creating an account, you'll be guided through a quick setup to connect your financial data and generate your first AI-powered forecast.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;