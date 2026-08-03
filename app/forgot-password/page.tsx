'use client';

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      forgotPasswordSchema.parse({ email });
      setError("");
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({ title: "Reset email sent", description: "Please check your inbox." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send reset email.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4"><BrandLogo /></div>
          <h1 className="text-3xl font-bold text-white">Forgot Password</h1>
          <p className="text-slate-400 mt-2">Securely recover your account</p>
        </div>

        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-2xl">
          {isSuccess ? (
            <CardContent className="pt-6 pb-6 text-center space-y-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-emerald-500" />
              </motion.div>
              <h2 className="text-xl font-semibold text-white">Check your email</h2>
              <p className="text-slate-400 text-sm">
                We've sent password reset instructions to <strong>{email}</strong>.
              </p>
              <div className="pt-4">
                <Link href="/login">
                  <Button variant="outline" className="w-full bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-white">Reset Password</CardTitle>
                <CardDescription className="text-slate-400">
                  Enter your email and we'll send you a recovery link.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleReset}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-slate-950/50 border-slate-800 text-white"
                        autoFocus
                      />
                    </div>
                    {error && <p className="text-rose-400 text-xs">{error}</p>}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isLoading || !email}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                  <Link href="/login" className="text-sm text-slate-400 hover:text-slate-300 flex items-center justify-center">
                    <ArrowLeft className="mr-1 h-3 w-3" /> Back to sign in
                  </Link>
                </CardFooter>
              </form>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
