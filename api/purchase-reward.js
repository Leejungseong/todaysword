import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'POST만 허용됩니다.'
        });
    }

    try {
        const { buyerNickname, orderId, purchaseAmount, advertiserId } = req.body;

        if (!buyerNickname || !orderId || !purchaseAmount || !advertiserId) {
            return res.status(400).json({
                success: false,
                message: '필수 값이 부족합니다.'
            });
        }
        const { data: advertiser, error: advertiserError } = await supabaseAdmin
            .from('advertisers')
            .select('cashback_percent')
            .eq('id', advertiserId)
            .maybeSingle();

        if (advertiserError || !advertiser) {
            return res.status(404).json({
                success: false,
                message: '광고주 계약 정보를 찾을 수 없습니다.'
            });
        }
        const rewardAmount = Math.floor((purchaseAmount * advertiser.cashback_percent) / 100);
        console.log('구매 보상 원금:', rewardAmount);
        const { data: existingOrder } = await supabaseAdmin
            .from('purchase_reward_logs')
            .select('id')
            .eq('order_id', orderId)
            .maybeSingle();

        if (existingOrder) {
            return res.status(400).json({
                success: false,
                message: '이미 처리된 주문입니다.'
            });
        }
        const { error: purchaseLogError } = await supabaseAdmin
            .from('purchase_reward_logs')
            .insert({
                buyer_nickname: buyerNickname,
                order_id: orderId,
                purchase_amount: purchaseAmount,
                reward_amount: rewardAmount,
                reward_type: 'purchase',
                status: 'pending',
            });

        if (purchaseLogError) {
            return res.status(500).json({
                success: false,
                message: '구매 보상 기록 저장에 실패했습니다.'
            });
        }


        return res.status(200).json({
            success: true,
            message: '구매 보상 요청이 pending 상태로 접수되었습니다.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || '서버 오류'
        });
    }
}