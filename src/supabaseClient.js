import { createClient } from '@supabase/supabase-js';

// 1. 환경 변수 로드
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
// 방금 .env에 추가한 비서 키를 가져옵니다.


// 2. [일반 모드] 랜딩 화면 및 단순 조회용 (기존 유지)
// 이 연결은 주소창 오류를 방지하고 앱의 기본 구동을 담당합니다.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 3. [비서 모드] 가입 및 수익 배분용 (마스터키)
// 보안(RLS)을 통과하여 데이터를 강제로 기록하고 수정할 수 있는 권한을 가집니다.


// 기존 앱과의 호환성을 위해 키 값도 내보냅니다.
export { supabaseAnonKey };