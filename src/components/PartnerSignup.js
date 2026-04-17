import React, { useState, useEffect } from 'react';
import './PartnerSignup.css';
import { signUpPartner, checkDuplicateNickname } from '../utils/authService';
const PartnerSignup = ({ onComplete, onClose }) => {
  const [formData, setFormData] = useState({
    nickname: '',
    phone: '',
    referrer: '네펜데스'
  });
  const [isNicknameValid, setIsNicknameValid] = useState(false);
  const [nicknameMessage, setNicknameMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const checkNickname = async (nickname) => {
    if (!nickname || nickname.length < 2) {
      setNicknameMessage("닉네임은 2글자 이상 입력해주세요.");
      setIsNicknameValid(false);
      return;
    }

    setIsChecking(true);
    try {
      // 💡 1단계에서 만든 외부 함수를 호출합니다.
      const isDuplicate = await checkDuplicateNickname(nickname);

      if (isDuplicate) {
        setNicknameMessage("⛔ 이미 사용 중인 닉네임입니다.");
        setIsNicknameValid(false);
      } else {
        setNicknameMessage("✅ 사용 가능한 닉네임입니다.");
        setIsNicknameValid(true);
      }
    } catch (err) {
      console.error("체크 실패:", err);
    } finally {
      setIsChecking(false);
    }
  };
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    if (refParam) {
      setFormData(prev => ({ ...prev, referrer: refParam }));
    }
  }, []);

  const handleCopyLink = async (targetLink) => {
    const linkToCopy = targetLink || generatedLink;
    try {
      await navigator.clipboard.writeText(linkToCopy);
      alert("✅ 초대 링크가 클립보드에 복사되었습니다!");
    } catch (err) {
      alert("복사에 실패했습니다. 링크를 직접 선택하여 복사해주세요.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.nickname.length < 2 || formData.phone.length < 10) {
      alert("정보를 정확히 입력해주세요.");
      return;
    }

    try {
      const result = await signUpPartner({
        nickname: formData.nickname,
        phone: formData.phone,
        referrer_id: formData.referrer
      });

      // 1. 신규 가입 성공 혹은 이미 가입된 경우 처리
      if (result.success || result.isExisting) {
        // 이미 가입된 경우라면 기존 닉네임을 사용하여 링크 생성
        const finalNickname = result.isExisting ? result.data.nickname : formData.nickname;
        const myInviteLink = `${window.location.origin}/?ref=${finalNickname}`;

        setGeneratedLink(myInviteLink);
        setIsFinished(true);

        if (result.isExisting) {
          alert("이미 등록된 파트너입니다. 본인의 링크를 확인하세요.");
        }

        if (onComplete) onComplete(result.data);
      }

    } catch (error) {
      console.error("오류 발생:", error.message);
      alert("등록 과정 중 오류: " + error.message);
    }
  };

  return (
    <div className="signup-overlay">
      <div className="signup-content">
        {!isFinished ? (
          <>
            <div className="signup-header">
              <h3>🚀 행운 파트너 등록</h3>
              <p className="signup-desc">내 링크를 만들고 10단계 네트워크 수익을 받으세요!</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>추천인</label>
                <input
                  type="text"
                  value={formData.referrer}
                  readOnly
                  className="readonly-input"
                  style={{ color: '#007AFF', fontWeight: 'bold' }}
                />
              </div>

              <div className="input-group">
                <label>닉네임 (활동명)</label>
                <input
                  type="text"
                  placeholder="예: 행운대장"
                  value={formData.nickname}
                  onChange={(e) => {
                    setFormData({ ...formData, nickname: e.target.value });
                    checkNickname(e.target.value);
                  }}
                  required
                />
                <p style={{
                  fontSize: '12px',
                  marginTop: '5px',
                  color: isNicknameValid ? '#28a745' : '#dc3545',
                  fontWeight: '500',
                  minHeight: '18px'
                }}>
                  {isChecking ? "조회 중..." : nicknameMessage}
                </p>
              </div>

              <div className="input-group">
                <label>휴대폰 번호</label>
                <input
                  type="tel"
                  placeholder="'-' 없이 숫자만 입력"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="signup-buttons">
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isChecking}
                  style={{ 
                    backgroundColor: (isNicknameValid && !isChecking) ? '#007AFF' : '#cccccc',
                    opacity: (isNicknameValid && !isChecking) ? 1 : 0.8,
                    cursor: (isNicknameValid && !isChecking) ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {isChecking ? "조회 중..." : "가입하고 링크 받기"}
                </button>
                
                <button type="button" className="cancel-btn" onClick={onClose}>
                  취소
                </button>
              </div>
            </form>
          </>
        ) : (
          /* --- 개선된 가입 완료 및 링크 복사 화면 --- */
          <div className="success-container" style={{ textAlign: 'center', padding: '10px 0' }}>
            <h3 style={{ color: '#007AFF', marginBottom: '10px' }}>🎉 파트너 등록 정보</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              아래는 선생님의 고유 초대 링크입니다.
            </p>

            <div style={{
              background: '#f0f7ff',
              padding: '15px',
              borderRadius: '12px',
              border: '2px dashed #007AFF',
              wordBreak: 'break-all',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '25px',
              lineHeight: '1.5'
            }}>
              {generatedLink}
            </div>

            <div className="signup-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleCopyLink()}
                className="submit-btn"
                style={{ backgroundColor: '#28a745' }}
              >
                📋 초대 링크 복사하기
              </button>

              <button
                type="button"
                onClick={onClose}
                className="cancel-btn"
                style={{ textDecoration: 'underline' }}
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerSignup;