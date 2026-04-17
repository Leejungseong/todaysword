import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  try {
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceKey
    );

    const { data, error } = await supabase
      .from('purchase_reward_logs')
      .select('*')
      .eq('status', 'pending')
      .order('rewarded_at', { ascending: false });

    if (error) {
      console.error('DB 조회 오류:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('서버 오류:', err);
    return res.status(500).json({ error: '서버 오류 발생' });
  }
}