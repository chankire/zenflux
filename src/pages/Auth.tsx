import { useState, useEffect } from "react";
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
  newPassword?: string;
  confirmPassword?: string;
}

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(true);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AuthFormData>();

  useEffect(() => {
    // Detect password recovery flow from Supabase email link
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
    const type = hashParams.get('type');
    if (type === 'recovery') {
      setIsResetPassword(true);
      setIsSignUp(false);
      setIsForgotPassword(false);
    }
  }, []);

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

  const handleMagicLink = async (email: string) => {
    if (!email) {
      toast({ variant: "destructive", title: "Email required", description: "Please enter your email address." });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (error) throw error;

      setMagicLinkSent(true);
      toast({
        title: "Magic link sent!",
        description: "Check your email and click the link to sign in securely.",
      });
    } catch (error: any) {
      console.error('Magic link error:', error);
      toast({
        variant: "destructive",
        title: "Magic link failed",
        description: error.message || "Failed to send magic link. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AuthFormData) => {
    // Handle reset password flow
    if (isResetPassword) {
      if (!data.newPassword || !data.confirmPassword) {
        toast({ variant: "destructive", title: "Missing password", description: "Please enter and confirm your new password." });
        return;
      }
      if (data.newPassword !== data.confirmPassword) {
        toast({ variant: "destructive", title: "Passwords do not match", description: "Make sure both passwords are the same." });
        return;
      }
      setLoading(true);
      try {
        const { error } = await supabase.auth.updateUser({ password: data.newPassword });
        if (error) throw error;

        // Clean up URL hash tokens after successful reset
        try {
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        } catch {}

        toast({ title: "Password updated", description: "Your password has been changed successfully." });
        setIsResetPassword(false);
        navigate("/dashboard");
      } catch (error: any) {
        console.error('Password update error:', error);
        toast({ variant: "destructive", title: "Update failed", description: error.message || "Could not update password." });
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isForgotPassword) {
      await handleForgotPassword(data.email);
      return;
    }

    // Handle magic link flow
    if (useMagicLink && !isSignUp) {
      await handleMagicLink(data.email);
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const redirectUrl = `${window.location.origin}/dashboard`;
        
        // Enhanced signup with better error handling
        const { data: signUpResult, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password || undefined,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              first_name: data.firstName || '',
              last_name: data.lastName || '',
              full_name: `${data.firstName || ''} ${data.lastName || ''}`.trim()
            }
          }
        });

        if (error) throw error;

        // Check if user already exists but needs verification
        if (signUpResult.user && !signUpResult.session) {
          toast({ 
            title: "Account created!", 
            description: "Please check your email to verify your account and complete setup." 
          });
        } else if (signUpResult.session) {
          toast({ 
            title: "Account created!", 
            description: "Your account has been created and you're now signed in." 
          });
          navigate("/dashboard");
        }
      } else {
        // Standard password login
        const { error } = await supabase.auth.signInWithPassword({ 
          email: data.email, 
          password: data.password 
        });
        
        if (error) throw error;
        
        toast({ title: "Welcome back!", description: "You have been signed in successfully." });
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let errorMessage = "An error occurred during authentication.";
      let showSignInOption = false;
      
      if (error.message?.includes("User already registered") || 
          error.message?.includes("email address is already in use")) {
        errorMessage = "This email is already registered.";
        showSignInOption = true;
      } else if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please try again or use the magic link option.";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Please check your email and click the confirmation link to verify your account.";
      } else if (error.message?.includes("Email rate limit exceeded")) {
        errorMessage = "Too many email attempts. Please wait a few minutes before trying again.";
      } else if (error.message?.includes("Invalid email")) {
        errorMessage = "Please enter a valid email address.";
      } else if (error.message?.includes("Password should be at least")) {
        errorMessage = "Password must be at least 6 characters long.";
      } else if (error.message?.includes("violates row-level security policy")) {
        errorMessage = "Account setup is temporarily unavailable. Please try again in a moment or contact support.";
      }
      
      toast({ 
        variant: "destructive", 
        title: showSignInOption ? "Email Already Registered" : "Authentication failed", 
        description: errorMessage + (showSignInOption ? " Please sign in instead." : ""),
        action: showSignInOption ? (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setIsSignUp(false);
              setUseMagicLink(true);
            }}
          >
            Sign In
          </Button>
        ) : undefined
      });
      
      // Auto-switch to sign-in mode if user already exists
      if (showSignInOption) {
        setTimeout(() => {
          setIsSignUp(false);
          setUseMagicLink(true);
        }, 2000);
      }
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
              {isResetPassword
                ? "Set a New Password"
                : isForgotPassword
                ? "Reset Your Password"
                : magicLinkSent
                ? "Check Your Email"
                : isSignUp
                ? "Create Your Account"
                : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-center">
              {isResetPassword
                ? "Enter and confirm your new password to complete the reset"
                : isForgotPassword
                ? "Enter your email address and we'll send you a password reset link"
                : magicLinkSent
                ? "We've sent you a secure sign-in link. Check your email and click the link to access your dashboard."
                : isSignUp
                ? "Start forecasting with AI in minutes"
                : useMagicLink
                ? "Sign in securely with a magic link sent to your email"
                : "Sign in to continue to your dashboard"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Show success state for magic link */}
            {magicLinkSent && (
              <div className="text-center py-8">
                <Mail className="w-16 h-16 mx-auto text-primary mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Magic link sent to your email address
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setMagicLinkSent(false);
                    setUseMagicLink(false);
                  }}
                >
                  Try a different method
                </Button>
              </div>
            )}

            {!magicLinkSent && (
              <>
                {/* Google Sign In - Hide in forgot password mode */}
                {!isForgotPassword && !isResetPassword && (
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

                {/* Magic Link Toggle for Sign In */}
                {!isSignUp && !isForgotPassword && !isResetPassword && (
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Button
                      variant={useMagicLink ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseMagicLink(true)}
                    >
                      Magic Link
                    </Button>
                    <Button
                      variant={!useMagicLink ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseMagicLink(false)}
                    >
                      Password
                    </Button>
                  </div>
                )}
              </>
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
              
              {!isResetPassword && (
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
              )}
              
              {!isForgotPassword && !isResetPassword && !useMagicLink && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password", {
                      required: !isForgotPassword && !useMagicLink ? "Password is required" : false,
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

              {isResetPassword && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...register("newPassword", {
                        required: "New password is required",
                        minLength: { value: 6, message: "Password must be at least 6 characters" }
                      })}
                      placeholder="••••••••"
                    />
                    {errors.newPassword && (
                      <p className="text-sm text-destructive mt-1">{errors.newPassword.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...register("confirmPassword", { required: "Please confirm your new password" })}
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              )}
              
              {!magicLinkSent && (
                <Button type="submit" className="w-full" disabled={loading} variant="hero">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isResetPassword 
                    ? "Update Password" 
                    : isForgotPassword 
                    ? "Send Reset Email" 
                    : isSignUp 
                    ? "Create Account"
                    : useMagicLink
                    ? "Send Magic Link"
                    : "Sign In"}
                </Button>
              )}
              
              {!isSignUp && !isForgotPassword && !isResetPassword && (
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
              {isForgotPassword || isResetPassword ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setIsResetPassword(false);
                    try {
                      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
                    } catch {}
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