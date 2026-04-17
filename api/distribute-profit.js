import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'POST만 허용됩니다.' });
  }

  try {
    const { userNickname, totalAmount, adId, viewToken } = req.body;

    if (!userNickname || !totalAmount || !adId || !viewToken) {
      return res.status(400).json({ success: false, message: '필수 값이 부족합니다.' });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: todayRewardLog } = await supabaseAdmin
      .from('ad_view_reward_logs')
      .select('id')
      .eq('ad_id', adId)
      .eq('viewer_nickname', userNickname)
      .eq('status', 'completed')
      .gte('rewarded_at', todayStart.toISOString())
      .maybeSingle();

    if (todayRewardLog) {
      return res.status(400).json({
        success: false,
        message: '이 광고의 시청 보상은 하루 1회만 받을 수 있습니다.'
      });
    }
    const { error: rewardLogError } = await supabaseAdmin
      .from('ad_view_reward_logs')
      .insert({
        ad_id: adId,
        viewer_nickname: userNickname,
        reward_amount: totalAmount,
        view_token: viewToken,
        reward_type: 'ad_view',
        status: 'pending'
      });

    if (rewardLogError) {
      return res.status(400).json({
        success: false,
        message: '이미 처리된 광고 시청이거나 보상 기록 저장에 실패했습니다.'
      });
    }
    const markRewardLogFailed = async () => {
      await supabaseAdmin
        .from('ad_view_reward_logs')
        .update({ status: 'failed' })
        .eq('view_token', viewToken);
    };
    const { data: budgetDeducted, error: budgetError } = await supabaseAdmin.rpc('decrement_ad_budget', {
      ad_id: adId,
      deduct_amount: totalAmount
    });

    if (budgetError) {
      await markRewardLogFailed();
      return res.status(500).json({
        success: false,
        message: budgetError.message || '광고 예치금 차감 중 오류가 발생했습니다.'
      });
    }

    if (!budgetDeducted) {
      await markRewardLogFailed();
      return res.status(400).json({
        success: false,
        message: '광고 예치금이 부족하여 정산이 중단되었습니다.'
      });
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('partners')
      .select('*')
      .eq('nickname', userNickname)
      .single();

    if (userError || !user) {
      await markRewardLogFailed();
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

        // 본인 수익이 아닌 경우에만 네트워크 수익 누적
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
    const { error: completeLogError } = await supabaseAdmin
      .from('ad_view_reward_logs')
      .update({ status: 'completed' })
      .eq('view_token', viewToken);

    if (completeLogError) {
      return res.status(500).json({
        success: false,
        message: '보상 기록 완료 처리에 실패했습니다.'
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