"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, Mail, User, KeyRound, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/ui/BrandLogo';
import SpecularButton from '@/components/ui/SpecularButton';
import LightPillar from '@/components/ui/LightPillar';
import { TearableCard } from '@/components/ui/TearableCard';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'organizer']),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isTearing, setIsTearing] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setGoogleLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting: isLoading },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: 'user',
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setError(null);
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (signUpError) throw signUpError;
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0A0A0F] p-6 transition-colors duration-300 relative overflow-hidden">
        {/* LightPillar Background */}
        <LightPillar
          topColor="#6C47FF"
          bottomColor="#FF9FFC"
          intensity={1.2}
          rotationSpeed={0.5}
          interactive={true}
          quality="high"
          className="z-0 pointer-events-none opacity-60"
          mixBlendMode="normal"
        />
        <div className="w-full max-w-[440px] relative z-10">
          <TearableCard
            isTorn={isTearing}
            onTearComplete={() => {
              router.push('/auth/login');
            }}
          >
            <div className="bg-white dark:bg-[#111118] p-8 rounded-[12px] shadow-sm border border-slate-200 dark:border-slate-800 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
                <Mail className="h-7 w-7" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Check your email</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                We've sent you a verification link. Please check your email to verify your account before logging in.
              </p>
              <div className="pt-4">
                <button 
                  onClick={() => setIsTearing(true)}
                  className="text-[#6C47FF] hover:underline font-semibold flex items-center justify-center gap-1.5 text-sm mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" /> Return to login
                </button>
              </div>
            </div>
          </TearableCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0F] text-slate-900 dark:text-white flex items-center justify-center p-6 transition-colors duration-300 relative overflow-hidden">
      {/* LightPillar Background */}
      <LightPillar
        topColor="#6C47FF"
        bottomColor="#FF9FFC"
        intensity={1.2}
        rotationSpeed={0.5}
        interactive={true}
        quality="high"
        className="z-0 pointer-events-none opacity-60"
        mixBlendMode="normal"
      />
      <div className="w-full max-w-[440px] space-y-6 relative z-10">
        
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <BrandLogo />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create an account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Join EventSpark to browse and book event passes easily
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-slate-800 p-8 rounded-[12px] shadow-sm space-y-6">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-[8px] text-red-650 dark:text-red-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="font-semibold">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} method="post">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  {...register('fullName')}
                  type="text"
                  className={`w-full pl-9 pr-4 h-[48px] rounded-[8px] bg-slate-50 dark:bg-slate-950 border ${
                    errors.fullName ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-[#6C47FF]'
                  } text-slate-900 dark:text-white focus:outline-none transition-all text-sm font-semibold`}
                  placeholder="Your full name"
                />
              </div>
              {errors.fullName && <p className="text-xs text-red-500 font-semibold">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  {...register('email')}
                  type="email"
                  className={`w-full pl-9 pr-4 h-[48px] rounded-[8px] bg-slate-50 dark:bg-slate-950 border ${
                    errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-[#6C47FF]'
                  } text-slate-900 dark:text-white focus:outline-none transition-all text-sm font-semibold`}
                  placeholder="name@email.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 font-semibold">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  {...register('password')}
                  type="password"
                  className={`w-full pl-9 pr-4 h-[48px] rounded-[8px] bg-slate-50 dark:bg-slate-950 border ${
                    errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-[#6C47FF]'
                  } text-slate-900 dark:text-white focus:outline-none transition-all text-sm font-semibold`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-xs text-red-500 font-semibold">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">I want to...</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setValue('role', 'user')}
                  className={`flex-1 py-2.5 rounded-[8px] border text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedRole === 'user'
                      ? 'border-[#6C47FF] bg-indigo-50/20 text-[#6C47FF]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  Attend Events
                </button>
                <button
                  type="button"
                  onClick={() => setValue('role', 'organizer')}
                  className={`flex-1 py-2.5 rounded-[8px] border text-xs font-bold uppercase tracking-wider transition-all ${
                    selectedRole === 'organizer'
                      ? 'border-[#6C47FF] bg-indigo-50/20 text-[#6C47FF]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  Organize Events
                </button>
              </div>
              {errors.role && <p className="text-xs text-red-500 font-semibold">{errors.role.message}</p>}
            </div>

            <div className="w-full h-[48px] relative mt-2 block">
              <SpecularButton
                type="submit"
                disabled={isLoading}
                className="w-full h-[48px] !px-0 !py-0 flex items-center justify-center gap-2 font-bold text-sm tracking-wide shadow-md shadow-[#6C47FF]/10"
                radius={8}
                tint="#6C47FF"
                tintOpacity={1}
                baseColor="#6C47FF"
                lineColor="#ffffff"
                textColor="#ffffff"
                intensity={1}
                thickness={1}
                speed={0.4}
                followMouse
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Sign up'
                )}
              </SpecularButton>
            </div>
          </form>

          {/* Social Sign In Divider */}
          <div className="relative my-4 flex items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
            <span className="flex-shrink mx-4 text-slate-450 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">or sign up with</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
          </div>

          {/* Google Button */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            variant="outline"
            className="w-full h-[48px] border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-[8px] font-bold text-sm text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
            )}
            Google Account
          </Button>
        </div>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#6C47FF] hover:underline font-semibold">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
