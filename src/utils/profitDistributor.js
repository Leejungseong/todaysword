export const distributeProfit = async (userNickname, totalAmount, adId, viewToken) => {
  try {
    const response = await fetch('/api/distribute-profit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userNickname, totalAmount, adId, viewToken }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || '정산 서버 호출 실패');
    }

    console.log(`✅ [${userNickname}] 서버 정산 완료!`);
    return { success: true, data: result.data };

  } catch (error) {
    console.error('정산 오류:', error.message);
    return { success: false, message: error.message };
  }
};