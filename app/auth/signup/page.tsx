"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Loader2, AlertCircle, Mail, User, KeyRound, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/ui/BrandLogo';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'organizer']),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0A0A0F] p-6 transition-colors duration-300">
        <div className="w-full max-w-[440px] space-y-6 bg-white dark:bg-[#111118] p-8 rounded-[12px] shadow-sm border border-slate-200 dark:border-slate-800 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
            <Mail className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Check your email</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            We've sent you a verification link. Please check your email to verify your account before logging in.
          </p>
          <div className="pt-4">
            <Link href="/auth/login" className="text-[#6C47FF] hover:underline font-semibold flex items-center justify-center gap-1.5 text-sm">
              <ArrowLeft className="w-4 h-4" /> Return to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0F] text-slate-900 dark:text-white flex items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-[440px] space-y-6">
        
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

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-[48px] bg-[#6C47FF] hover:bg-[#6C47FF]/90 text-white font-bold rounded-[8px] text-sm tracking-wide transition-all shadow-md shadow-[#6C47FF]/10 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Sign up'
              )}
            </Button>
          </form>
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
