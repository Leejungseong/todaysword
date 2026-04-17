import React, { useState, useRef } from 'react';

const AdVideoPopup = ({ videoUrl, onClose, onComplete, onGoToMall, rewardTime = 30 }) => {
  const [isFinished, setIsFinished] = useState(false);
  const startTimeRef = useRef(Date.now());
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

  // DB에서 넘어온 값(예: 124)이 여기에 자동으로 꽂힙니다.
  const MIN_WATCH_TIME = rewardTime;

  const handleYouTubeClose = () => {
    const elapsedTime = (Date.now() - startTimeRef.current) / 1000;

    if (elapsedTime >= MIN_WATCH_TIME) {
      setIsFinished(true); // 약속된 124초를 채웠을 때만 승인
    } else {
      alert(`광고주와의 약속을 위해 최소 ${MIN_WATCH_TIME}초 시청이 필요합니다. (현재 ${Math.floor(elapsedTime)}초)`);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        {!isFinished ? (
          <>
            <div style={styles.videoWrapper}>
              {isYouTube ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop()}?autoplay=1&mute=1`}
                  style={{ width: '100%', aspectRatio: '16/9', border: 'none' }}
                  title="YouTube AD"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <video 
                  src={videoUrl} 
                  controls 
                  autoPlay 
                  muted 
                  style={styles.video} 
                  onEnded={() => setIsFinished(true)} 
                />
              )}
            </div>
            <div style={styles.buttonGroup}>
              {isYouTube && (
                <button onClick={handleYouTubeClose} style={styles.rewardBtn}>
                  시청 완료 및 적립 확인
                </button>
              )}
              <button onClick={() => { onGoToMall(); onClose(); }} style={styles.orangeBtn}>쇼핑몰 알아보기</button>
              <button onClick={onClose} style={styles.redBtn}>광고 시청 중단 하기</button>
            </div>
          </>
        ) : (
          <div style={{ padding: '30px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎊</div>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#333', fontWeight: 'bold' }}>적립 완료!</h3>
            <p style={{ margin: '20px 0', fontSize: '16px', fontWeight: 'bold', color: '#007bff' }}>정직한 시청에 감사드립니다. 수익금이 적립되었습니다.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={onComplete} style={{ flex: 1, padding: '16px', borderRadius: '12px', background: '#f0f0f0', border: 'none', fontWeight: 'bold' }}>확인</button>
              <button onClick={onGoToMall} style={{ flex: 1, padding: '16px', borderRadius: '12px', background: '#ff9800', color: 'white', border: 'none', fontWeight: 'bold' }}>쇼핑몰 알아보기</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 30000 },
  content: { background: 'white', borderRadius: '20px', width: '95%', maxWidth: '400px', overflow: 'hidden' },
  videoWrapper: { width: '100%', backgroundColor: '#000' },
  video: { width: '100%', display: 'block' },
  buttonGroup: { display: 'flex', flexDirection: 'column' },
  rewardBtn: { width: '100%', padding: '18px', background: '#007bff', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '16px' },
  orangeBtn: { width: '100%', padding: '15px', background: '#ff9800', color: 'white', border: 'none', fontWeight: 'bold', marginTop: '2px' },
  redBtn: { width: '100%', padding: '15px', background: '#666', color: 'white', border: 'none', fontWeight: 'bold', marginTop: '2px' }
};

export default AdVideoPopup;