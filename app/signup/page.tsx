'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useToast } from "@/hooks/use-toast";
import { useAuth, supabase } from "@/contexts/AuthContext";
import { signUpSchema } from "@/lib/validation";
import { z } from "zod";
import { motion } from "framer-motion";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";

export default function Signup() {
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
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
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { data, error } = await signUp(formData.email, formData.password, formData.fullName, formData.phone);
      if (error) {
        toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      } else {
        toast({
          title: "Account created!",
          description: isSupabaseConfigured 
            ? "Welcome to EventSpark! Please check your email for verification."
            : "Welcome to EventSpark! You're now logged in (Demo Mode).",
        });
        router.push("/dashboard");
      }
    } catch (error) {
      toast({ title: "Signup failed", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: "OAuth Error", description: error.message, variant: "destructive" });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10 my-8"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><BrandLogo /></div>
          <h1 className="text-3xl font-bold text-white">Join EventSpark</h1>
          <p className="text-slate-400 mt-2">Create your account to get started</p>
        </div>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Sign Up</CardTitle>
            <CardDescription className="text-slate-400">
              Continue with Google or fill in your details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              type="button" 
              variant="outline" 
              className="w-full bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800"
              onClick={handleGoogleSignup}
              disabled={isGoogleLoading || isLoading}
            >
              {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              Sign up with Google
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900/50 px-2 text-slate-400">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-300">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input id="fullName" name="fullName" type="text" placeholder="John Doe" value={formData.fullName} onChange={handleInputChange} className="pl-10 bg-slate-950/50 border-slate-800 text-white" />
                </div>
                {errors.fullName && <p className="text-rose-400 text-xs">{errors.fullName}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input id="email" name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleInputChange} className="pl-10 bg-slate-950/50 border-slate-800 text-white" />
                </div>
                {errors.email && <p className="text-rose-400 text-xs">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 123-4567" value={formData.phone} onChange={handleInputChange} className="pl-10 bg-slate-950/50 border-slate-800 text-white" />
                </div>
                {errors.phone && <p className="text-rose-400 text-xs">{errors.phone}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={handleInputChange} className="pl-10 pr-10 bg-slate-950/50 border-slate-800 text-white" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-500 hover:text-slate-300">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.password && <PasswordStrengthMeter password={formData.password} />}
                {errors.password && <p className="text-rose-400 text-xs">{errors.password}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={formData.confirmPassword} onChange={handleInputChange} className="pl-10 pr-10 bg-slate-950/50 border-slate-800 text-white" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-slate-500 hover:text-slate-300">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-rose-400 text-xs">{errors.confirmPassword}</p>}
              </div>
              
              <div className="flex items-start space-x-2 mt-4">
                <Checkbox id="terms" checked={formData.agreeToTerms} onCheckedChange={(c) => setFormData(p => ({ ...p, agreeToTerms: c as boolean }))} className="mt-1 border-slate-700 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />
                <Label htmlFor="terms" className="text-sm text-slate-400 leading-snug">
                  I agree to the <Link href="/terms" className="text-indigo-400 hover:text-indigo-300">Terms of Service</Link> and <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</Link>
                </Label>
              </div>
              {errors.agreeToTerms && <p className="text-rose-400 text-xs">{errors.agreeToTerms}</p>}

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-6" disabled={isLoading || isGoogleLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <div className="w-full text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
