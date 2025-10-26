import React, { useEffect, useRef } from "react";
import "./WordPopup.css";
import { getRandomVerse } from "../utils/getRandomVerse";

function WordPopup({ lang, onClose }) {
  const canvasRef = useRef(null);
  const verse = getRandomVerse(); // 내부에서 랜덤 추출 (기존 구조 유지)

  useEffect(() => {
    // === 폭죽 효과 (좌↔우, 아래→위) ===
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let particles = [];
    const create = (x, y, dx, dy, color) => ({ x, y, dx, dy, color, life: 100 });

    const launch = () => {
      for (let i = 0; i < 6; i++) {
        // 좌 -> 우
        particles.push(create(0, Math.random() * canvas.height, Math.random() * 4 + 2, (Math.random() - 0.5) * 2, "rgba(255,100,100,0.8)"));
        // 우 -> 좌
        particles.push(create(canvas.width, Math.random() * canvas.height, -Math.random() * 4 - 2, (Math.random() - 0.5) * 2, "rgba(100,200,255,0.8)"));
        // 아래 -> 위
        particles.push(create(Math.random() * canvas.width, canvas.height, (Math.random() - 0.5) * 2, -Math.random() * 5 - 2, "rgba(255,255,100,0.8)"));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.dx;
        p.y += p.dy;
        p.life -= 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        if (p.life <= 0) particles.splice(i, 1);
      });
      frame = requestAnimationFrame(animate);
    };

    const interval = setInterval(launch, 400);
    let frame = requestAnimationFrame(animate);

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="popup-overlay">
      <canvas ref={canvasRef} className="fireworks"></canvas>
      <div className="popup-content">
        <h2>{lang === "en" ? verse.en : verse.ko}</h2>
        <p className="verse-ref">— {verse.ref}</p>
        <p>
          {lang === "en"
            ? "Today’s theme is " + verse.theme
            : "오늘 주신 말씀의 주제는 " + verse.theme + " 입니다."}
        </p>
        <button className="close-btn" onClick={onClose}>
          {lang === "en" ? "Close with Prayer ✝️" : "기도로 마치기 ✝️"}
        </button>
      </div>
    </div>
  );
}

export default WordPopup;
