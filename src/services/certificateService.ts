import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface UserCertificate {
  id: string;
  user_id: string;
  certificate_name: string;
  issuing_organization: string;
  issue_date?: string;
  expiration_date?: string;
  credential_id?: string;
  credential_url?: string;
  created_at: string;
}

export const certificateService = {
  async getCertificates(userId: string): Promise<UserCertificate[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('user_certificates')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('issue_date', { ascending: false });

    if (error) throw error;
    return data as UserCertificate[];
  }
};
