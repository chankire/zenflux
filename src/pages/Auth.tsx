import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface AuthFormData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AuthFormData>();

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true);
    try {
      if (isSignUp) {
        // For the mock system, we'll just redirect to sign in
        toast({
          title: "Sign Up Not Available",
          description: "Please use the test login: test@example.com / testpass",
        });
        setIsSignUp(false);
        return;
      }

      // Use mock authentication
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Sign In Failed",
          description: error.message || "Invalid credentials. Use test@example.com / testpass",
        });
        return;
      }
      
      toast({ 
        title: "Welcome Back!", 
        description: "You've been signed in successfully." 
      });
      navigate("/dashboard");
      
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({ 
        variant: "destructive", 
        title: "Authentication Failed",
        description: "Please try test@example.com / testpass"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestUserLogin = async () => {
    setLoading(true);
    try {
      const { error } = await signIn('test@example.com', 'testpass');
      
      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Test User Logged In!",
        description: "You're now signed in with the demo account.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error('Test user login error:', error);
      toast({
        variant: "destructive",
        title: "Test Login Failed",
        description: error.message || "Could not log in test user.",
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
              {isSignUp ? "Create Account" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignUp 
                ? "Sign up is disabled in demo mode" 
                : "Sign in to access your AI forecasting dashboard"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {/* Demo Notice */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Demo Mode:</strong> Use <code>test@example.com</code> with password <code>testpass</code>
                </AlertDescription>
              </Alert>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Sign Up Fields - disabled in demo */}
                {isSignUp && (
                  <div className="grid grid-cols-2 gap-2 opacity-50">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        disabled
                        {...register("firstName")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        disabled
                        {...register("lastName")}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="test@example.com"
                    {...register("email", { required: "Email is required" })}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="testpass"
                    {...register("password", { required: "Password is required" })}
                    className={errors.password ? "border-red-500" : ""}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs">{errors.password.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || isSignUp}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    isSignUp ? "Sign Up Disabled" : "Sign In"
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
                  className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-200 hover:border-blue-300"
                  onClick={handleTestUserLogin}
                  disabled={loading}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Quick Test Login (Demo)
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      reset();
                    }}
                    disabled={loading}
                  >
                    {isSignUp ? "Back to Sign In" : "Need an account? (Demo Only)"}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;