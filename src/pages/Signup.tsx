import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { signUpSchema } from "@/lib/validation";
import { z } from "zod";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, isSupabaseConfigured } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    try {
      signUpSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await signUp(
        formData.email, 
        formData.password, 
        formData.fullName, 
        formData.phone
      );
      
      if (error) {
        toast({
          title: "Signup failed",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created!",
          description: isSupabaseConfigured 
            ? "Welcome to EventSpark! Please check your email for verification."
            : "Welcome to EventSpark! You're now logged in (Demo Mode).",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <Sparkles className="h-8 w-8 text-purple-300" />
            <span className="text-2xl font-bold text-white">EventSpark</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Join EventSpark</h1>
          <p className="text-purple-200 mt-2">Create your account to get started</p>
          {!isSupabaseConfigured && (
            <div className="mt-2 p-2 bg-yellow-600/20 border border-yellow-500/30 rounded-md">
              <p className="text-yellow-200 text-sm">
                Demo Mode: Supabase not configured
              </p>
            </div>
          )}
        </div>

        <Card className="bg-white/10 backdrop-blur-sm border-purple-300/20">
          <CardHeader>
            <CardTitle className="text-white">Sign Up</CardTitle>
            <CardDescription className="text-purple-200">
              Fill in your details to create an account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-purple-200">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`pl-10 bg-white/5 border-purple-300/30 text-white placeholder:text-purple-300 ${errors.fullName ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {errors.fullName && <p className="text-red-400 text-sm">{errors.fullName}</p>}
              </div>
              
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-purple-200">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 bg-white/5 border-purple-300/30 text-white placeholder:text-purple-300 ${errors.email ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-purple-200">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`pl-10 bg-white/5 border-purple-300/30 text-white placeholder:text-purple-300 ${errors.phone ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-purple-200">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 bg-white/5 border-purple-300/30 text-white placeholder:text-purple-300 ${errors.password ? 'border-red-500' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-purple-400 hover:text-purple-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-purple-200">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-purple-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 bg-white/5 border-purple-300/30 text-white placeholder:text-purple-300 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-purple-400 hover:text-purple-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword}</p>}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, agreeToTerms: checked as boolean }))
                  }
                />
                <Label htmlFor="terms" className="text-sm text-purple-200">
                  I agree to the{" "}
                  <Link to="/terms" className="text-purple-300 hover:text-purple-200">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-purple-300 hover:text-purple-200">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              {errors.agreeToTerms && <p className="text-red-400 text-sm">{errors.agreeToTerms}</p>}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
              <div className="text-center text-sm text-purple-200">
                Already have an account?{" "}
                <Link to="/login" className="text-purple-300 hover:text-purple-200 font-medium">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
