import React, { useEffect } from 'react';
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

const AdBanner = () => {
  useEffect(() => {
    const loadAd = async () => {
      try {
        // AdMob 초기화 (앱 전체용 ID는 AndroidManifest.xml에 이미 등록됨)
        await AdMob.initialize();

        // 실제 광고 단위 ID
        const adUnitId = 'ca-app-pub-1332603985253339/6904577478';

        // 배너 광고 표시
        await AdMob.showBanner({
          adId: adUnitId,
          adSize: BannerAdSize.BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
        });

        console.log('✅ 배너 광고가 정상적으로 로드되었습니다.');
      } catch (error) {
        console.error('⚠️ 배너 광고 로드 오류:', error);
      }
    };

    loadAd();

    // 언마운트 시 배너 숨기기
    return () => {
      AdMob.hideBanner();
    };
  }, []);

  return null;
};

export default AdBanner;
