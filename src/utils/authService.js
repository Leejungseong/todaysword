import { supabase } from '../supabaseClient';

export const signUpPartner = async (partnerData) => {
  try {
    // [진단 1] 데이터 확인 (선생님의 원본 alert 그대로 유지)
    const phone = partnerData?.phone || "번호없음";
    alert("1. 가입 시도 번호: " + phone);

    // 1. 중복 확인
    const { data: existingUser, error: checkError } = await supabase
      .from('partners')
      .select('*')
      .eq('phone', phone)
      .maybeSingle();

    if (checkError) {
      alert("⚠️ 중복 체크 중 에러: " + checkError.message);
    }

    if (existingUser) {
      alert("진단: 이미 가입된 번호입니다.");
      return { success: false, message: "이미 가입된 번호입니다.", isExisting: true, data: existingUser };
    }

    // --- [10단계 계보 자동 생성 로직 시작] ---
    let newPath = [];
    let newLevel = 1;
    const referrer_id = partnerData?.referrer_id;

    if (referrer_id && referrer_id !== '네펜데스') {
      const { data: refData } = await supabase
        .from('partners')
        .select('path, level')
        .eq('nickname', referrer_id)
        .maybeSingle();

      if (refData) {
        newPath = Array.isArray(refData.path) ? [...refData.path, referrer_id] : [referrer_id];
        newLevel = (refData.level || 1) + 1;
      }
    } else if (referrer_id === '네펜데스') {
      newPath = ['네펜데스'];
      newLevel = 1;
    }
    // --- [10단계 계보 자동 생성 로직 끝] ---

    // 2. 실제 DB 저장
    alert("2. DB 저장을 시도합니다...");
    const { data, error } = await supabase
      .from('partners')
      .insert([{
        ...partnerData,
        path: newPath,
        level: newLevel
      }])
      .select();

    // [진단 2] 결과 판독 (선생님의 원본 로직 그대로)
    if (error) {
      alert("⛔ DB 저장 실패 사유: " + error.message);
      throw error;
    }

    if (!data || data.length === 0) {
      alert("⚠️ 경고: DB 에러는 없으나 데이터가 비어있음");
      return { success: false, message: "데이터 반환 없음" };
    }

    alert("✅ 최종 성공! DB에 기록되었습니다.");
    return { success: true, data };

  } catch (error) {
    // [진단 3] 최종 오류 보고
    const errorMsg = error?.message || "알 수 없는 시스템 오류";
    alert("❌ 시스템 오류 발생: " + errorMsg);
    return { success: false, message: errorMsg };
  }
};
export const checkDuplicateNickname = async (nickname) => {
  try {
    // 💡 supabase를 supabaseAdmin으로 수정하여 상단 선언과 일치시킴
    const { data, error } = await supabase
      .from('partners')
      .select('nickname')
      .eq('nickname', nickname)
      .maybeSingle();

    if (error) throw error;
    return !!data; 
  } catch (error) {
    console.error("닉네임 체크 중 오류:", error.message);
    return false; 
  }
};