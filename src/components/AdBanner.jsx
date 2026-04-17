import React, { useEffect, useState } from 'react';
/* ✅ 핀포인트 1: 34개 빌드 경고의 주범인 AdMob 라이브러리 임포트 제거 */
import { supabase } from '../supabaseClient';

const AdBanner = () => {
  const [currentAd, setCurrentAd] = useState(null);

  useEffect(() => {
    const loadAd = async () => {
      try {
        // [A] 수파베이스 자체 광고 로직 (원본 유지)
        const { data: myAd } = await supabase
          .from('ads')
          .select('*, advertisers!inner(is_approved)')
          .eq('is_running', true)
          .gt('total_budget', 0)
          .eq('advertisers.is_approved', true)
          .limit(1)
          .single();

        if (myAd) {
          setCurrentAd(myAd);
          return;
        }

        /* ✅ 핀포인트 2: 애드몹 초기화 및 호출 로직 삭제. 
           향후 이 자리에 애드센스(AdSense) 표준 스크립트가 위치하게 됩니다. */
        console.log('ℹ️ 자체 광고가 없어 보조 광고 영역을 준비합니다.');

      } catch (error) {
        console.error('⚠️ 광고 로드 오류:', error);
      }
    };

    loadAd();
  }, []);

  if (currentAd) {
    return (
      <div
        className="my-custom-ad"
        /* ✅ 핀포인트 3: 중복 onClick 제거. 
           이제 App.js의 handleBannerClick이 동영상을 먼저 띄우는 권한을 독점합니다. */
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '60px',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #ddd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 999
        }}
      >
        {currentAd.image_url ? (
          <img
            src={currentAd.image_url}
            alt={currentAd.ad_title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: '14px', color: '#333', fontWeight: 'bold' }}>
            {currentAd.ad_title}
          </span>
        )}
      </div>
    );
  }

  return (
    /* ✅ 핀포인트 4: 애드몹 대신 애드센스가 들어갈 자리 (네펜데스 귀속 수익원) */
    <div id="adsense-area" style={{ position: 'fixed', bottom: 0, width: '100%', height: '60px', textAlign: 'center', background: '#f9f9f9' }}>
      {/* 구글 애드센스 승인 후 코드를 삽입하는 영역입니다 */}
      <small style={{ color: '#ccc' }}>Sponsored</small>
    </div>
  );
};

export default AdBanner;