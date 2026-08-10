'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Loader2, AlertCircle, KeyRound, Mail, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/ui/BrandLogo';
import LightPillar from '@/components/ui/LightPillar';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    console.log('handleLogin called');
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Calling signInWithPassword...');
      const result = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('TIMEOUT after 10s')), 10000)
        )
      ]) as { data: any; error: any };

      console.log('Result received:', result);

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
        return;
      }

      console.log('Session set, redirecting...');
      window.location.replace('/dashboard');
      
    } catch (err: any) {
      console.log('Caught error:', err.message);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
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
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Welcome back</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter your credentials to access your EventSpark account
          </p>
        </div>

        {/* Card container */}
        <div className="bg-white dark:bg-[#111118] border border-slate-200 dark:border-slate-800 p-8 rounded-[12px] shadow-sm space-y-6">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-[8px] text-red-650 dark:text-red-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-9 pr-4 h-[48px] rounded-[8px] bg-slate-50 dark:bg-slate-950 border ${
                    error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-[#6C47FF]'
                  } text-slate-900 dark:text-white focus:outline-none transition-all text-sm font-semibold`}
                  placeholder="name@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-[#6C47FF] hover:underline font-semibold">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-9 pr-4 h-[48px] rounded-[8px] bg-slate-50 dark:bg-slate-950 border ${
                    error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-[#6C47FF]'
                  } text-slate-900 dark:text-white focus:outline-none transition-all text-sm font-semibold`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] bg-[#6C47FF] hover:bg-[#6C47FF]/90 text-white font-bold rounded-[8px] text-sm tracking-wide transition-all shadow-md shadow-[#6C47FF]/10 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          {/* Social Sign In Divider */}
          <div className="relative my-4 flex items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
            <span className="flex-shrink mx-4 text-slate-450 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">or continue with</span>
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
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-[#6C47FF] hover:underline font-semibold">
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
}
