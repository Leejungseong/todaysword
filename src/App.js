import React, { useState, useEffect } from 'react';
import { getRandomVerse } from './utils/getRandomVerse';
import WordPopup from './components/WordPopup.jsx';
import PartnerSignup from './components/PartnerSignup';
import './App.css';
import { getSupabaseNotice } from './utils/noticeService';
import AdBanner from './components/AdBanner';
import AdVideoPopup from './components/AdVideoPopup';
import { supabase } from './supabaseClient';
import { distributeProfit } from './utils/profitDistributor';
import PrivacyPolicy from './components/PrivacyPolicy';
import SideAssetMenu from './components/SideAssetMenu';
import PurchaseRewardNotice from './components/PurchaseRewardNotice';
import AdminPendingOrders from './components/AdminPendingOrders';

const getUniversalVideoUrl = (url) => {
  if (!url) return '';
  try {
    const regex = /(?:youtu\.be\/|youtube\.com\/(?:.*v(?:\/|=)|(?:.*\/)?embed\/))([^?&"'>]+)/;
    const match = url.match(regex);
    const videoId = match ? match[1] : null;

    if (videoId && videoId.length === 11) {
      return `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1&mute=1&playlist=${videoId}&loop=1`;
    }
  } catch (e) {
    console.error("URL 분석 실패:", e);
  }
  return url;
};

function App() {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [activeCategory, setActiveCategory] = useState('행운운');
  const [showSignup, setShowSignup] = useState(false);
  const [isKorean, setIsKorean] = useState(false);
  const [referrerId, setReferrerId] = useState("01024084479");
  const [signupResult, setSignupResult] = useState(null);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [isPurchaseNoticeOpen, setIsPurchaseNoticeOpen] = useState(false);
  const [isAdminPendingOpen, setIsAdminPendingOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [supabaseNotice, setSupabaseNotice] = useState([]);
  const [isAdVideoOpen, setIsAdVideoOpen] = useState(false);
  const [currentAd, setCurrentAd] = useState(null);
  const [currentViewToken, setCurrentViewToken] = useState('');
  // 수정본: 경고 제거를 위해 변수를 즉시 사용하는 구조입니다.
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [nepenthesUserData, setNepenthesUserData] = useState({
    nickname: localStorage.getItem('my_fortune_nickname') || '',
    balance: 0,
    networkProfit: 0
  });
  const [nepenthesFamilyData, setNepenthesFamilyData] = useState({
    level1: [],
    subLevels: Array.from({ length: 9 }, (_, i) => ({ depth: i + 2, count: 0 }))
  });

  // // 🛡️ [최종 공정] 미사용 변수 경고 원천 차단 및 주권자 실시간 데이터 동기화
  useEffect(() => {
    const loadFamilyData = async (ownerNickname) => {
      try {
        if (!ownerNickname || !supabase) return;

        // 우선 기본값으로 초기화
        setNepenthesFamilyData({
          level1: [],
          subLevels: Array.from({ length: 9 }, (_, i) => ({ depth: i + 2, count: 0 }))
        });

        // ⚠️ 실제 가족 조회 로직은 기존 DB path / level 저장 방식에 맞춰
        // 아래 위치에 추가되어야 합니다.
        // 지금 단계에서는 "상태 업데이트 구조 복구"와 "호출 연결 복구"까지만 진행합니다.
        // 🔥 1단계: 직접 추천 (level1)
        const { data: level1Data, error: level1Error } = await supabase
          .from('partners')
          .select('nickname')
          .eq('referrer_id', ownerNickname);

        if (!level1Error && level1Data) {
          const level1Nicknames = level1Data.map(v => v.nickname);

          // 🔥 2단계~10단계 계산용 전체 데이터 조회
          const { data: allData, error: allError } = await supabase
            .from('partners')
            .select('nickname, path');

          if (!allError && allData) {
            const subLevels = Array.from({ length: 9 }, (_, i) => ({
              depth: i + 2,
              count: 0
            }));

            allData.forEach(user => {
              if (!user.path || !Array.isArray(user.path)) return;

              const index = user.path.indexOf(ownerNickname);

              if (index !== -1) {
                const depth = user.path.length - index;

                if (depth >= 2 && depth <= 10) {
                  subLevels[depth - 2].count += 1;
                }
              }
            });

            // 🔥 최종 상태 업데이트
            setNepenthesFamilyData({
              level1: level1Nicknames,
              subLevels: subLevels
            });
          }
        }
      } catch (err) {
        console.error("가족 데이터 로딩 실패:", err);
      }
    };

    const identifyOwner = async () => {
      try {
        const savedNickname = localStorage.getItem('my_fortune_nickname');
        const savedPhone = localStorage.getItem('my_fortune_phone');

        // 1. 닉네임이 이미 저장되어 있으면 기존 방식대로 조회
        if (savedNickname) {
          setNepenthesUserData(prev => ({ ...prev, nickname: savedNickname }));

          if (supabase) {
            const { data, error } = await supabase
              .from('partners')
              .select('nickname, balance, network_profit')
              .eq('nickname', savedNickname.trim())
              .maybeSingle();

            if (!error && data) {
              setNepenthesUserData({
                nickname: data.nickname,
                balance: data.balance || 0,
                networkProfit: data.network_profit || 0
              });

              await loadFamilyData(data.nickname);
            }
          }

          return;
        }

        // 2. 닉네임이 없고 전화번호가 저장되어 있으면 전화번호로 기존 가입자 찾기
        if (savedPhone && supabase) {
          const { data, error } = await supabase
            .from('partners')
            .select('nickname, balance, network_profit')
            .eq('phone', savedPhone.trim())
            .maybeSingle();

          if (!error && data) {
            localStorage.setItem('my_fortune_nickname', data.nickname);

            setNepenthesUserData({
              nickname: data.nickname,
              balance: data.balance || 0,
              networkProfit: data.network_profit || 0
            });

            await loadFamilyData(data.nickname);
          }
        }
      } catch (err) {
        console.error("데이터 동기화 실패:", err);
      }
    };

    identifyOwner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const refreshAssetAndFamilyData = async () => {
      try {
        const savedNickname = localStorage.getItem('my_fortune_nickname');
        const savedPhone = localStorage.getItem('my_fortune_phone');

        let ownerNickname = savedNickname?.trim() || '';

        // 1. 닉네임이 없으면 전화번호로 복구
        if (!ownerNickname && savedPhone && supabase) {
          const { data, error } = await supabase
            .from('partners')
            .select('nickname')
            .eq('phone', savedPhone.trim())
            .maybeSingle();

          if (!error && data?.nickname) {
            ownerNickname = data.nickname;
            localStorage.setItem('my_fortune_nickname', data.nickname);
          }
        }

        if (!ownerNickname || !supabase) return;

        // 2. 내 자산 다시 읽기
        const { data: ownerData, error: ownerError } = await supabase
          .from('partners')
          .select('nickname, balance, network_profit')
          .eq('nickname', ownerNickname)
          .maybeSingle();

        if (!ownerError && ownerData) {
          setNepenthesUserData({
            nickname: ownerData.nickname,
            balance: ownerData.balance || 0,
            networkProfit: ownerData.network_profit || 0
          });
        }

        // 3. 가족 현황 다시 읽기
        const { data: level1Data, error: level1Error } = await supabase
          .from('partners')
          .select('nickname')
          .eq('referrer_id', ownerNickname);

        const level1Nicknames =
          !level1Error && level1Data ? level1Data.map(v => v.nickname) : [];

        const { data: allData, error: allError } = await supabase
          .from('partners')
          .select('nickname, path');

        const subLevels = Array.from({ length: 9 }, (_, i) => ({
          depth: i + 2,
          count: 0
        }));

        if (!allError && allData) {
          allData.forEach(user => {
            if (!user.path || !Array.isArray(user.path)) return;

            const index = user.path.indexOf(ownerNickname);

            if (index !== -1) {
              const depth = user.path.length - index;

              if (depth >= 2 && depth <= 10) {
                subLevels[depth - 2].count += 1;
              }
            }
          });
        }

        setNepenthesFamilyData({
          level1: level1Nicknames,
          subLevels: subLevels
        });
      } catch (err) {
        console.error('실시간 자산 동기화 실패:', err);
      }
    };

    const channel = supabase
      .channel('nepenthes-live-assets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'partners' },
        async () => {
          await refreshAssetAndFamilyData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleBannerClick = async () => {
    try {
      const { data: adData, error } = await supabase
        .from('ads')
        // 📍 [DB 연동] reward_time 필드를 추가했습니다.
        .select('id, video_url, mall_url, unit_price, total_budget, reward_time')
        .eq('is_running', true)
        .gt('total_budget', 0)
        .not('video_url', 'is', null)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("DB 호출 오류:", error.message);
        return;
      }

      if (adData) {
        setCurrentAd(adData);
        setCurrentViewToken(crypto.randomUUID());
        setIsAdVideoOpen(true);
      }
    } catch (err) {
      console.error("시스템 오류:", err.message);
    }
  };

  const handleGoToMall = () => {
    if (currentAd?.mall_url) {
      window.open(currentAd.mall_url, "_blank", "noopener,noreferrer");
    } else {
      window.open("https://smartstore.naver.com/", "_blank", "noopener,noreferrer");
    }
  };

  const handleAdComplete = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const rawRef = params.get('ref');
      let cleanNickname = null;

      if (rawRef) {
        try {
          const decoded = decodeURIComponent(rawRef);
          cleanNickname = decoded.replace(/\s+/g, '').trim();
        } catch (e) {
          cleanNickname = null;
        }
      }

      const finalNickname = cleanNickname || (localStorage.getItem('my_fortune_nickname')?.trim());

      if (finalNickname && finalNickname !== "null") {
        // 🛡️ [실전 자동화 핵심] 
        // 광고주가 DB(ads 테이블)에 설정한 실제 단가(unit_price)를 가져와 정산합니다.
        // 만약 단가 정보가 없다면 기본값으로 0원을 설정하여 오류를 방지합니다.
        const rewardAmount = currentAd?.unit_price || 0;

        if (rewardAmount === 0) {
          console.warn("⚠️ 광고 단가가 0원이거나 설정되지 않았습니다. DB를 확인하십시오.");
        }

        // 선생님의 10단계 낙수 엔진 호출 (이제 DB 단가에 따라 자동으로 연산됩니다)
        const result = await distributeProfit(finalNickname, rewardAmount, currentAd?.id, currentViewToken);

        if (result.success) {
          alert(`✅ 정산 완료: ${rewardAmount}원이 10단계 낙수 분배되었습니다.`);
          // 🔄 화면의 '내 자산' 숫자를 즉시 갱신하기 위해 새로고침을 실행합니다.
          window.location.reload();
        } else {
          alert(`❌ 정산 실패: ${result.message}`);
        }
      } else {
        alert("⚠️ 주권이 확인되지 않아 정산이 취소되었습니다. 링크를 통해 접속해주세요.");
      }
    } catch (error) {
      console.error("시스템 각인 오류:", error);
    } finally {
      setIsAdVideoOpen(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');

    // 🛡️ [주권 각인 로직] 괄호 { } 를 정확히 열고 닫았습니다.
    if (ref) {
      setReferrerId(ref);
      localStorage.setItem('my_fortune_referrer_id', ref);
    }

    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const loadNotice = async () => {
      const notice = await getSupabaseNotice();
      if (Array.isArray(notice)) setSupabaseNotice(notice);
    };
    loadNotice();

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => { if (installPrompt) { installPrompt.prompt(); } else { alert("이미 설치되어 있거나 지원하지 않습니다."); } };
  const handleShowFortune = (category) => { const allCats = ['재물운', '행운운', '성취운', '대인운', '소망운']; const targetCategory = category && category !== "__ALL__" ? category : allCats[Math.floor(Math.random() * allCats.length)]; const verse = getRandomVerse(targetCategory); if (verse) { setSelectedVerse(verse); setShowPopup(true); setActiveCategory(targetCategory); } };
  const toggleLanguage = () => setIsKorean(!isKorean);
  const handleCompleteSignup = (partnerData) => {
    const partner = Array.isArray(partnerData) ? partnerData[0] : partnerData;

    if (!partner) {
      alert("오류 발생: 파트너 정보를 불러오지 못했습니다.");
      return;
    }

    localStorage.setItem('my_fortune_nickname', partner.nickname);
    localStorage.setItem('my_fortune_phone', partner.phone);

    setNepenthesUserData(prev => ({
      ...prev,
      nickname: partner.nickname
    }));

    setSignupResult({
      nickname: partner.nickname,
      isExisting: true,
      link: `https://jseongfortune.vercel.app?ref=${partner.nickname}`
    });

    setShowSignup(false);
  }

  return (
    <div className="app-container">
      {/* 🛡️ 조직원 자산 확인 버튼 (청결한 1번 방식) */}
      <div
        onClick={() => setIsSideMenuOpen(true)}
        style={{ position: 'absolute', top: '15px', left: '15px', cursor: 'pointer', fontSize: '12px', zIndex: 100, background: 'rgba(255,255,255,0.8)', padding: '5px 10px', borderRadius: '15px', fontWeight: 'bold', border: '1px solid #ddd' }}
      >
        내 자산
      </div>

      <SideAssetMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        nepenthesUserData={nepenthesUserData}
        nepenthesFamilyData={nepenthesFamilyData}
      />
      <div onClick={() => setIsNoticeOpen(true)} style={{ position: 'absolute', top: '15px', right: '15px', cursor: 'pointer', fontSize: '28px', zIndex: 100 }}>🔔</div>
      <p className="top-message">{isKorean ? "행운의 메시지와 함께 하루를 시작하세요! ✨" : "Start your day with a lucky message! ✨"}</p>
      <button className="translate-button" onClick={toggleLanguage}>{isKorean ? "English" : "한글 보기"}</button>
      <h1 className="title">{isKorean ? "오늘의 행운 메시지 ✨" : "Today's Fortune Message ✨"}</h1>

      <div className="fortune-categories">
        {['재물운', '행운운', '성취운', '대인운', '소망운'].map((cat, idx) => (
          <React.Fragment key={cat}>
            <span className={activeCategory === cat ? 'active' : ''} onClick={() => handleShowFortune(cat)}>{cat}</span>
            {idx < 4 && <span className="dot-sep">•</span>}
          </React.Fragment>
        ))}
      </div>
      <button className="fortune-button" onClick={() => handleShowFortune("__ALL__")}>{isKorean ? "운세 보기" : "Show Fortune"}</button>

      {isNoticeOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20000 }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '95%', maxWidth: '500px', overflow: 'hidden' }}>
            <div style={{ padding: '25px 15px', background: '#f0f7ff', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>
              <button onClick={handleInstall} style={{ background: 'none', border: 'none', fontSize: '24px', fontWeight: '900', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}> ★ 앱 설치하기 (홈 화면 추가) ★ </button>
            </div>
            <div style={{ padding: '30px 20px', minHeight: '200px', maxHeight: '50vh', overflowY: 'auto' }}>
              <h2 style={{ marginTop: 0, fontSize: '22px' }}>공지사항</h2>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '17px', color: '#333', lineHeight: '1.8' }}>
                {supabaseNotice.length > 0 ? (supabaseNotice.map((notice, index) => (<div key={index} style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px dashed #eee' }}> {notice.content} </div>))) : ("공지사항이 없습니다.")}
              </div>
            </div>
            <button onClick={() => setIsNoticeOpen(false)} style={{ width: '100%', padding: '20px', background: '#e8f5e9', color: '#2e7d32', border: 'none', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}> 확인 후 닫기 </button>
          </div>
        </div>
      )}

      {showPopup && selectedVerse && (<WordPopup verse={selectedVerse} onClose={() => { setShowPopup(false); setSelectedVerse(null); }} onSignup={() => setShowSignup(true)} />)}
      {showSignup && (<PartnerSignup referrerId={referrerId} onClose={() => setShowSignup(false)} onComplete={handleCompleteSignup} />)}
      {signupResult && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div className="fortune-popup" style={{ background: 'white', padding: '20px', borderRadius: '15px', maxWidth: '300px', width: '90%', textAlign: 'center' }}>
            <h2>{signupResult.isExisting ? "반갑습니다, 파트너님!" : "가입을 축하합니다!"}</h2>
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', wordBreak: 'break-all', margin: '15px 0' }}>{signupResult.link}</div>
            <button className="fortune-button" onClick={() => { navigator.clipboard.writeText(signupResult.link); alert("복사되었습니다!"); }}>복사하기</button>
            <button onClick={() => setSignupResult(null)} style={{ width: '100%', padding: '10px', background: '#eee', border: 'none', borderRadius: '5px' }}>닫기</button>
          </div>
        </div>
      )}

      {/* ✅ [정밀 수정] 광고 배너 및 동적 보상 시간 전달 */}
      <div onClick={handleBannerClick} style={{ cursor: 'pointer' }}>
        <AdBanner />
      </div>

      {isAdVideoOpen && currentAd && (
        <AdVideoPopup
          videoUrl={getUniversalVideoUrl(currentAd.video_url)}
          rewardTime={currentAd.reward_time} // 👈 DB에서 가져온 124초가 여기로 전달됩니다.
          onClose={() => setIsAdVideoOpen(false)}
          onComplete={handleAdComplete}
          onGoToMall={handleGoToMall}
        />
      )}
      {isPurchaseNoticeOpen && (
        <PurchaseRewardNotice onClose={() => setIsPurchaseNoticeOpen(false)} />
      )}
      {isAdminPendingOpen && (
        <AdminPendingOrders onClose={() => setIsAdminPendingOpen(false)} />
      )}

      <div className="ad-placeholder" style={{ marginTop: '20px', minHeight: '60px' }}></div>
      <button
        onClick={() => setIsPurchaseNoticeOpen(true)}
        style={{
          marginTop: '10px',
          background: 'none',
          border: 'none',
          color: '#666',
          textDecoration: 'underline',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        구매 보상 안내
      </button>
      
      <button
        onClick={() => setIsAdminPendingOpen(true)}
        style={{
          marginTop: '10px',
          background: 'none',
          border: 'none',
          color: '#aa0000',
          textDecoration: 'underline',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        관리자 주문 확인
      </button>

      <div style={{ marginTop: '50px', textAlign: 'center', paddingBottom: '30px' }}>
        <button
          onClick={() => setIsPrivacyOpen(true)}
          style={{ background: 'none', border: 'none', color: '#888', textDecoration: 'underline', fontSize: '12px', cursor: 'pointer' }}
        >
          개인정보 처리방침
        </button>

        {isPrivacyOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 30000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '90%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
              <PrivacyPolicy onClose={() => setIsPrivacyOpen(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;