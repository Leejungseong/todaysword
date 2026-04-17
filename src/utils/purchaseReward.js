export const sendPurchaseReward = async (
  buyerNickname,
  orderId,
  purchaseAmount,
  advertiserId
) => {
  try {
    const response = await fetch('/api/purchase-reward', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        buyerNickname,
        orderId,
        purchaseAmount,
        advertiserId,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || '구매 보상 처리 실패');
    }

    console.log(`✅ 구매 보상 요청 성공`);
    return { success: true };

  } catch (error) {
    console.error('구매 보상 오류:', error.message);
    return { success: false, message: error.message };
  }
};