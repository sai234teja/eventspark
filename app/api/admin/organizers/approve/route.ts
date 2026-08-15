import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { env } from '@/lib/env';
import { cookies } from 'next/headers';
import * as z from 'zod';
import { createClient } from '@supabase/supabase-js';

const approveSchema = z.object({
  applicationId: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
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

    // 2. Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Validate input
    const body = await req.json();
    const parsedData = approveSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    const { applicationId, action } = parsedData.data;

    // 4. Update the application status
    const status = action === 'approve' ? 'APPROVED' : 'REJECTED';

    const { data: application, error: updateError } = await supabase
      .from('organizer_applications')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('id', applicationId)
      .eq('status', 'PENDING')
      .select()
      .single();

    if (updateError || !application) {
      console.error('Update Application Error:', updateError);
      return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
    }

    // 5. If APPROVED, promote the user using Service Role to bypass RLS/Triggers
    if (action === 'approve') {
      // Must use service role to elevate privileges (bypassing the custom trigger/RLS)
      const supabaseAdmin = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY || ''
      );

      const { error: roleUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({ role: 'organizer' })
        .eq('id', application.user_id);

      if (roleUpdateError) {
        console.error('Role Update Error:', roleUpdateError);
        return NextResponse.json({ error: 'Failed to promote user role' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, application }, { status: 200 });
  } catch (error: any) {
    console.error('Admin Approve Route Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
