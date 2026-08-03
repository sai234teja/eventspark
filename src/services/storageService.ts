import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const storageService = {
  async getSignedUrl(bucket: string, path: string): Promise<string> {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60); // 1 hour

    if (error) throw error;
    return data.signedUrl;
  },

  async deleteFile(bucket: string, path: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },

  getPublicUrl(bucket: string, path: string): string {
    const supabase = getSupabase();
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
};
