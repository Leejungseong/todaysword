import { supabase } from '../supabaseClient';

export const getSupabaseNotice = async () => {
  try {
    const { data, error } = await supabase
      .from('notices')
      .select('content, created_at')
      .order('created_at', { ascending: false });

    if (error) return null;
    return data; 
  } catch (err) {
    return null;
  }
};