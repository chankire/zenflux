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
import { Chrome, Mail, ArrowLeft, Loader2, Shield } from "lucide-react";

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
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<AuthFormData>();

  useEffect(() => {
    // Handle password recovery flow from Supabase email link
    const handleAuthRedirect = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      // Check URL params for password recovery
      const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');
      
      if (type === 'recovery' && accessToken) {
        setIsResetPassword(true);
        setIsSignUp(false);
        setIsForgotPassword(false);
        toast({
          title: "Password Reset Ready",
          description: "Enter your new password below.",
        });
      } else if (data?.session?.user && !isResetPassword) {
        // User is already authenticated, redirect to dashboard
        navigate("/dashboard");
      }
    };

    handleAuthRedirect();
  }, [navigate, toast, isResetPassword]);

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
        title: "Google Sign-In Failed",
        description: "Please try another sign-in method.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    if (!email) {
      toast({ 
        variant: "destructive", 
        title: "Email Required", 
        description: "Please enter your email address." 
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email and click the reset link to set a new password.",
      });
      
      setIsForgotPassword(false);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        variant: "destructive",
        title: "Password Reset Failed",
        description: "Please check your email and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (email: string) => {
    if (!email) {
      toast({ 
        variant: "destructive", 
        title: "Email Required", 
        description: "Please enter your email address." 
      });
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
        title: "Magic Link Sent!",
        description: "Check your email and click the link to sign in.",
      });
    } catch (error: any) {
      console.error('Magic link error:', error);
      toast({
        variant: "destructive",
        title: "Magic Link Failed",
        description: "Please try again or use password sign-in.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AuthFormData) => {
    // Handle password reset flow
    if (isResetPassword) {
      if (!data.newPassword || !data.confirmPassword) {
        toast({ 
          variant: "destructive", 
          title: "Password Required", 
          description: "Please enter and confirm your new password." 
        });
        return;
      }
      
      if (data.newPassword !== data.confirmPassword) {
        toast({ 
          variant: "destructive", 
          title: "Passwords Don't Match", 
          description: "Please ensure both passwords are identical." 
        });
        return;
      }
      
      if (data.newPassword.length < 6) {
        toast({ 
          variant: "destructive", 
          title: "Password Too Short", 
          description: "Password must be at least 6 characters long." 
        });
        return;
      }

      setLoading(true);
      try {
        const { error } = await supabase.auth.updateUser({ 
          password: data.newPassword 
        });
        
        if (error) throw error;

        // Clean up URL hash after successful reset
        window.history.replaceState({}, document.title, window.location.pathname);
        
        toast({ 
          title: "Password Updated Successfully", 
          description: "You can now sign in with your new password." 
        });
        
        setIsResetPassword(false);
        navigate("/dashboard");
      } catch (error: any) {
        console.error('Password update error:', error);
        toast({ 
          variant: "destructive", 
          title: "Password Update Failed", 
          description: "Please try the password reset process again." 
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Handle forgot password
    if (isForgotPassword) {
      await handleForgotPassword(data.email);
      return;
    }

    // Handle magic link
    if (useMagicLink && !isSignUp) {
      await handleMagicLink(data.email);
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Sign up flow
        const { data: signUpResult, error } = await supabase.auth.signUp({
          email: data.email.trim().toLowerCase(),
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              first_name: data.firstName?.trim() || '',
              last_name: data.lastName?.trim() || '',
              full_name: `${data.firstName?.trim() || ''} ${data.lastName?.trim() || ''}`.trim()
            }
          }
        });

        if (error) {
          // Handle specific signup errors
          if (error.message.includes("already registered") || 
              error.message.includes("already been taken") ||
              error.message.includes("duplicate")) {
            toast({
              variant: "destructive",
              title: "Email Already Registered",
              description: "This email is already in use. Please sign in instead.",
              action: <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsSignUp(false)}
              >
                Sign In
              </Button>
            });
            setTimeout(() => setIsSignUp(false), 2000);
            return;
          }
          throw error;
        }

        if (signUpResult.user && !signUpResult.session) {
          toast({ 
            title: "Account Created!", 
            description: "Please check your email to verify your account." 
          });
        } else if (signUpResult.session) {
          toast({ 
            title: "Welcome to ZenFlux!", 
            description: "Your account has been created successfully." 
          });
          navigate("/dashboard");
        }
      } else {
        // Sign in flow
        const { error } = await supabase.auth.signInWithPassword({ 
          email: data.email.trim().toLowerCase(), 
          password: data.password 
        });
        
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              variant: "destructive",
              title: "Invalid Credentials",
              description: "Email or password is incorrect. Try the magic link option instead.",
              action: <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setUseMagicLink(true)}
              >
                Use Magic Link
              </Button>
            });
            return;
          }
          throw error;
        }
        
        toast({ 
          title: "Welcome Back!", 
          description: "You've been signed in successfully." 
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      let title = "Authentication Failed";
      let description = "An unexpected error occurred. Please try again.";
      
      if (error.message?.includes("Email not confirmed")) {
        title = "Email Not Verified";
        description = "Please check your email and click the verification link.";
      } else if (error.message?.includes("rate limit")) {
        title = "Too Many Attempts";
        description = "Please wait a few minutes before trying again.";
      }
      
      toast({ 
        variant: "destructive", 
        title, 
        description 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
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
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Z</span>
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              {isResetPassword
                ? "Set New Password"
                : isForgotPassword
                ? "Reset Password"
                : magicLinkSent
                ? "Check Your Email"
                : isSignUp
                ? "Create Account"
                : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-center">
              {isResetPassword
                ? "Enter your new password to complete the reset"
                : isForgotPassword
                ? "Enter your email to receive a password reset link"
                : magicLinkSent
                ? "We've sent you a secure sign-in link via email"
                : isSignUp
                ? "Start forecasting with enterprise-grade AI"
                : useMagicLink
                ? "Sign in securely with a magic link"
                : "Sign in to access your AI forecasting dashboard"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {magicLinkSent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-muted-foreground">
                  Click the secure link in your email to access ZenFlux
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setMagicLinkSent(false)}
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Password Reset Form */}
                {isResetPassword && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span className="text-blue-800 text-sm">Enter your new secure password</span>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter new password (min 6 characters)"
                        {...register("newPassword", { 
                          required: "Password is required",
                          minLength: { value: 6, message: "Password must be at least 6 characters" }
                        })}
                        className={errors.newPassword ? "border-red-500" : ""}
                      />
                      {errors.newPassword && (
                        <p className="text-red-500 text-xs">{errors.newPassword.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        {...register("confirmPassword", { 
                          required: "Please confirm your password",
                          validate: value => value === watch('newPassword') || "Passwords don't match"
                        })}
                        className={errors.confirmPassword ? "border-red-500" : ""}
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating Password...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </div>
                )}

                {/* Forgot Password Form */}
                {isForgotPassword && !isResetPassword && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        {...register("email", { 
                          required: "Email is required",
                          pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }
                        })}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending Reset Link...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full"
                      onClick={() => setIsForgotPassword(false)}
                    >
                      Back to Sign In
                    </Button>
                  </div>
                )}

                {/* Main Auth Form */}
                {!isForgotPassword && !isResetPassword && (
                  <div className="space-y-4">
                    {/* Sign Up Fields */}
                    {isSignUp && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="John"
                            {...register("firstName", { required: isSignUp })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            {...register("lastName", { required: isSignUp })}
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        {...register("email", { required: "Email is required" })}
                      />
                    </div>

                    {!useMagicLink && (
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder={isSignUp ? "Create password (min 6 chars)" : "Enter your password"}
                          {...register("password", { 
                            required: !useMagicLink,
                            minLength: isSignUp ? { value: 6, message: "Minimum 6 characters" } : undefined
                          })}
                        />
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {isSignUp ? "Creating Account..." : useMagicLink ? "Sending Link..." : "Signing In..."}
                        </>
                      ) : (
                        <>
                          {isSignUp ? "Create Account" : useMagicLink ? "Send Magic Link" : "Sign In"}
                        </>
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>

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

                    {!isSignUp && (
                      <div className="flex items-center justify-between text-sm">
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => setUseMagicLink(!useMagicLink)}
                        >
                          {useMagicLink ? "Use Password Instead" : "Use Magic Link"}
                        </Button>
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => setIsForgotPassword(true)}
                        >
                          Forgot Password?
                        </Button>
                      </div>
                    )}

                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => {
                          setIsSignUp(!isSignUp);
                          setUseMagicLink(false);
                          reset();
                        }}
                      >
                        {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;