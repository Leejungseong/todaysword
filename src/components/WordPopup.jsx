import React, { useEffect, useRef } from 'react';
import './WordPopup.css';

const WordPopup = ({ verse, onClose, onSignup }) => {
  const canvasRef = useRef(null);

  // --- [폭죽 애니메이션 로직: 그대로 유지] ---
  useEffect(() => {
    if (!verse || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let particles = [];
    const createParticle = (side) => ({
      x: side === 'left' ? 0 : canvas.width,
      y: canvas.height,
      vx: side === 'left' ? Math.random() * 5 + 2 : Math.random() * -5 - 2,
      vy: Math.random() * -15 - 5,
      size: Math.random() * 4 + 1,
      color: `hsl(${Math.random() * 360}, 100%, 60%)`,
      opacity: 1,
      gravity: 0.15
    });
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (particles.length < 200) {
        particles.push(createParticle('left'));
        particles.push(createParticle('right'));
      }
      particles.forEach((p, i) => {
        p.vx *= 0.99; p.vy += p.gravity; p.x += p.vx; p.y += p.vy; p.opacity -= 0.005;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        if (p.opacity <= 0 || p.y > canvas.height) particles.splice(i, 1);
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [verse]);

  // 🚀 [가입 버튼 클릭 시: 별도의 입력 팝업창을 띄우는 로직]
  const handlePartnerJoin = (e) => {
    e.stopPropagation(); 

    if (onSignup) {
      onSignup(); // 닉네임/전화번호 입력창을 여는 부모의 함수 실행
      onClose();  // 현재 성경 구절 창은 닫기
    } else {
      alert("가입 창을 연결할 수 없습니다.");
    }
  };

  if (!verse) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          pointerEvents: 'none', zIndex: 0, background: 'transparent'
        }} 
      />
      
      <div className="popup-content" onClick={(e) => e.stopPropagation()} style={{ zIndex: 1 }}>
        <span className="verse-ref">{verse.ref}</span>
        <h2>{verse.ko}</h2>
        <p className="verse-en">{verse.en}</p>
        
        <div className="button-group">
          <button className="partner-btn" onClick={handlePartnerJoin}>
            🚀 행운 파트너 참여하기
          </button>
          <button className="close-btn" onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
};

export default WordPopup;