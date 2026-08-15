'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  organizationName: z.string().min(2, 'Organization name is required'),
  organizationType: z.string().min(2, 'Organization type is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required'),
  website: z.string().url('Must be a valid URL (include https://)').optional().or(z.literal('')),
  description: z.string().min(10, 'Please provide a brief description'),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(5, 'Address is required'),
  reason: z.string().min(20, 'Please tell us why you want to organize events'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function OrganizerRegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [appStatus, setAppStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/organizer/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to submit application');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const checkStatus = async () => {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('organizer_applications')
          .select('status')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setAppStatus(data.status);
        }
      }
      setLoading(false);
    };
    checkStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6">
        <Loader2 className="w-8 h-8 text-[#6C47FF] animate-spin" />
      </div>
    );
  }

  if (success || appStatus === 'PENDING') {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#111118] border border-slate-800 rounded-2xl p-8 text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {success ? 'Application Received!' : 'Application Pending'}
          </h2>
          <p className="text-slate-400 text-sm">
            Thank you for applying to become an organizer on EventSpark. Our admin team is currently reviewing your application. You will be notified once a decision has been made.
          </p>
          <Link
            href="/dashboard"
            className="block w-full py-3 px-4 bg-[#6C47FF] hover:bg-[#5a3ae0] text-white rounded-xl font-semibold transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (appStatus === 'APPROVED') {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#111118] border border-slate-800 rounded-2xl p-8 text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">You are an Organizer!</h2>
          <p className="text-slate-400 text-sm">
            Your application has been approved. You can now access the Organizer Dashboard to create and manage events.
          </p>
          <Link
            href="/organizer/dashboard"
            className="block w-full py-3 px-4 bg-[#6C47FF] hover:bg-[#5a3ae0] text-white rounded-xl font-semibold transition-colors"
          >
            Go to Organizer Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <BrandLogo className="mx-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Apply to become an Organizer
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Host incredible events, manage attendees, and grow your community on EventSpark.
          </p>
        </div>

        <div className="bg-[#111118] py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-800">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-500 font-medium">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Your Full Name
                </label>
                <input
                  {...register('fullName')}
                  className="w-full px-4 py-3 bg-[#1A1A24] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#6C47FF] transition-colors"
                  placeholder="John Doe"
                />
                {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName.message}</p>}
              </div>

              {/* Organization Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Organization Name
                </label>
                <input
                  {...register('organizationName')}
                  className="w-full px-4 py-3 bg-[#1A1A24] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#6C47FF] transition-colors"
                  placeholder="TechEvents Ltd."
                />
                {errors.organizationName && <p className="text-xs text-red-400 mt-1">{errors.organizationName.message}</p>}
              </div>

              {/* Organization Type */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Organization Type
                </label>
                <select
                  {...register('organizationType')}
                  className="w-full px-4 py-3 bg-[#1A1A24] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#6C47FF] transition-colors appearance-none"
                >
                  <option value="">Select type...</option>
                  <option value="corporate">Corporate</option>
                  <option value="nonprofit">Non-Profit</option>
                  <option value="education">Educational Institution</option>
                  <option value="individual">Individual / Freelance</option>
                  <option value="other">Other</option>
                </select>
                {errors.organizationType && <p className="text-xs text-red-400 mt-1">{errors.organizationType.message}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Contact Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-3 bg-[#1A1A24] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#6C47FF] transition-colors"
                  placeholder="hello@organization.com"
                />
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  {...register('phone')}
                  className="w-full px-4 py-3 bg-[#1A1A24] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#6C47FF] transition-colors"
                  placeholder="+1 (555) 000-0000"
                />
                {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>}
              </div>

              {/* Website */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Website (Optional)
                </label>
                <input
                  {...register('website')}
                  type="url"
                  className="w-full px-4 py-3 bg-[#1A1A24] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#6C47FF] transition-colors"
                  placeholder="https://organization.com"
                />
                {errors.website && <p className="text-xs text-red-400 mt-1">{errors.website.message}</p>}
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  City
                </label>
                <input
                  {...register('city')}
                  className="w-full px-4 py-3 bg-[#1A1A24] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#6C47FF] transition-colors"
                  placeholder="San Francisco"
                />
                {errors.city && <p className="text-xs text-red-400 mt-1">{errors.city.message}</p>}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Address
                </label>
                <input
                  {...register('address')}
                  className="w-full px-4 py-3 bg-[#1A1A24] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#6C47FF] transition-colors"
                  placeholder="123 Event Street"
                />
                {errors.address && <p className="text-xs text-red-400 mt-1">{errors.address.message}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Organization Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-4 py-3 bg-[#1A1A24] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#6C47FF] transition-colors resize-none"
                placeholder="What does your organization do?"
              />
              {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>}
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Why do you want to organize events?
              </label>
              <textarea
                {...register('reason')}
                rows={3}
                className="w-full px-4 py-3 bg-[#1A1A24] border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#6C47FF] transition-colors resize-none"
                placeholder="Tell us about the kind of events you plan to host..."
              />
              {errors.reason && <p className="text-xs text-red-400 mt-1">{errors.reason.message}</p>}
            </div>

            <div className="pt-4 flex justify-end gap-4 border-t border-slate-800">
              <Link
                href="/dashboard"
                className="px-6 py-3 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-[#6C47FF] hover:bg-[#5a3ae0] text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
