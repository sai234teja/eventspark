import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { env } from '@/lib/env';
import { cookies } from 'next/headers';
import * as z from 'zod';

const applySchema = z.object({
  fullName: z.string().min(2),
  organizationName: z.string().min(2),
  organizationType: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().min(10),
  city: z.string().min(2),
  address: z.string().min(5),
  reason: z.string().min(20),
});

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore inside Route Handler
            }
          },
        },
      }
    );

    // 1. Authenticate user from server
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate input
    const body = await req.json();
    const parsedData = applySchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    const applicationData = parsedData.data;

    // 3. Check for existing application
    const { data: existingApp, error: existingError } = await supabase
      .from('organizer_applications')
      .select('status')
      .eq('user_id', user.id)
      .single();

    if (existingApp && existingApp.status === 'PENDING') {
      return NextResponse.json(
        { error: 'You already have a pending application.' },
        { status: 400 }
      );
    }
    
    if (existingApp && existingApp.status === 'APPROVED') {
      return NextResponse.json(
        { error: 'You are already an approved organizer.' },
        { status: 400 }
      );
    }

    // 4. Upsert the application
    const { error: insertError } = await supabase
      .from('organizer_applications')
      .upsert(
        {
          user_id: user.id,
          organization_name: applicationData.organizationName,
          organization_type: applicationData.organizationType,
          phone: applicationData.phone,
          website: applicationData.website || null,
          description: applicationData.description,
          city: applicationData.city,
          address: applicationData.address,
          reason: applicationData.reason,
          status: 'PENDING',
          submitted_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (insertError) {
      console.error('Application Insert Error:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit application. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Apply Route Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
