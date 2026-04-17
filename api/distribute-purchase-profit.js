import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'POST만 허용됩니다.' });
  }

  try {
    const { userNickname, totalAmount, orderId } = req.body;

    if (!userNickname || !totalAmount || !orderId) {
      return res.status(400).json({ success: false, message: '필수 값이 부족합니다.' });
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('partners')
      .select('*')
      .eq('nickname', userNickname)
      .single();

    if (userError || !user) {
      return res.status(404).json({ success: false, message: '수익 발생자를 찾을 수 없습니다.' });
    }

    const ancestors = user.path || [];
    const reversedPath = [...ancestors].reverse();
    const distributionResult = [];
    let distributedSoFar = 0;

    const workerShare = totalAmount * 0.5;
    distributionResult.push({ receiver: userNickname, amount: workerShare, type: '본인 수익' });
    distributedSoFar += workerShare;

    const rates = [0.15, 0.10, 0.07, 0.05, 0.04, 0.03, 0.03, 0.02, 0.01];
    reversedPath.forEach((sponsorName, index) => {
      if (index < rates.length) {
        const share = totalAmount * rates[index];
        distributionResult.push({ receiver: sponsorName, amount: share, type: `${index + 1}대 상위 수익` });
        distributedSoFar += share;
      }
    });

    const remainingAmount = totalAmount - distributedSoFar;
    if (remainingAmount > 0) {
      const adminEntry = distributionResult.find(d => d.receiver === '네펜데스');
      if (adminEntry) {
        adminEntry.amount += remainingAmount;
      } else {
        distributionResult.push({ receiver: '네펜데스', amount: remainingAmount, type: '낙수 집결' });
      }
    }

    const updateResults = await Promise.all(
      distributionResult.map(async (item) => {
        const flooredAmount = Math.floor(item.amount);

        const balanceResult = await supabaseAdmin.rpc('increment_balance', {
          user_nickname: item.receiver,
          amount: flooredAmount
        });

        if (balanceResult.error) {
          return balanceResult;
        }

        if (item.receiver !== userNickname) {
          const networkResult = await supabaseAdmin.rpc('increment_network_profit', {
            user_nickname: item.receiver,
            amount: flooredAmount
          });

          if (networkResult.error) {
            return networkResult;
          }
        }

        return { error: null };
      })
    );

    const failedResult = updateResults.find(result => result.error);

    if (failedResult) {
      return res.status(500).json({
        success: false,
        message: failedResult.error.message || 'DB 업데이트 실패'
      });
    }

    return res.status(200).json({
      success: true,
      data: distributionResult
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || '서버 오류'
    });
  }
}