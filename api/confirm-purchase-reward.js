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
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: '주문번호가 필요합니다.'
            });
        }
        const { data: purchaseLog, error: purchaseLogError } = await supabaseAdmin
            .from('purchase_reward_logs')
            .select('*')
            .eq('order_id', orderId)
            .eq('status', 'pending')
            .maybeSingle();

        if (purchaseLogError || !purchaseLog) {
            return res.status(404).json({
                success: false,
                message: '확정 가능한 pending 주문을 찾을 수 없습니다.'
            });
        }
        const { error: confirmError } = await supabaseAdmin
            .from('purchase_reward_logs')
            .update({
                status: 'confirmed',
                confirmed_at: new Date().toISOString(),
            })
            .eq('order_id', orderId)
            .eq('status', 'pending');

        if (confirmError) {
            return res.status(500).json({
                success: false,
                message: '구매 보상 확정 처리에 실패했습니다.'
            });
        }
        const distributeResponse = await fetch(`${req.headers.origin}/api/distribute-purchase-profit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userNickname: purchaseLog.buyer_nickname,
                totalAmount: purchaseLog.reward_amount,
                orderId: purchaseLog.order_id,
            }),
        });

        const distributeResult = await distributeResponse.json();

        if (!distributeResponse.ok) {
            return res.status(500).json({
                success: false,
                message: distributeResult.message || '구매 보상 분배 처리에 실패했습니다.'
            });
        }

        return res.status(200).json({
            success: true,
            message: '구매 보상 확정 요청 입구가 준비되었습니다.'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || '서버 오류'
        });
    }
}