import React from 'react';

const SideAssetMenu = ({ isOpen, onClose, nepenthesUserData, nepenthesFamilyData }) => {
  const copyToClipboard = () => {
    // 닉네임이 있을 때만 링크 복사 작동
    if (!nepenthesUserData?.nickname) {
      alert("주권 확인 중입니다. 잠시만 기다려 주세요.");
      return;
    }
    const link = `https://jseongfortune.vercel.app/?ref=${nepenthesUserData.nickname}`;
    navigator.clipboard.writeText(link);
    alert("초대 링크가 복사되었습니다!");
  };

  const drawerStyle = {
    position: 'fixed', top: 0, right: isOpen ? 0 : '-100%',
    width: '280px', height: '100%', backgroundColor: '#fff',
    transition: 'right 0.3s ease-in-out', zIndex: 40000,
    boxShadow: '-2px 0 15px rgba(0,0,0,0.2)', 
    display: 'flex', flexDirection: 'column',
    fontFamily: 'sans-serif'
  };

  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
           backgroundColor: 'rgba(0,0,0,0.5)', display: isOpen ? 'block' : 'none', zIndex: 39999 }} 
           onClick={onClose}></div>
      
      <div style={drawerStyle}>
        <div style={{ padding: '15px 15px 0 15px' }}>
          <div style={{ textAlign: 'right' }}>
            <button onClick={onClose} style={{ border: 'none', fontSize: '24px', background: 'none', cursor: 'pointer', color: '#999' }}>×</button>
          </div>
          <div style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            {/* ✅ 파트너 문구 영구 삭제: DB 데이터 유무에 따른 조건부 출력 */}
            <h2 style={{ margin: 0, fontSize: '16px', color: '#333' }}>
              {nepenthesUserData?.nickname ? `${nepenthesUserData.nickname}님` : '주권 확인 중...'}
            </h2>
            <p style={{ fontSize: '11px', color: '#007bff', fontWeight: 'bold', marginTop: '3px' }}>나눔 공동체의 주인님, 환영합니다.</p>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 15px' }}>
          <div style={{ background: '#fff9e6', padding: '10px', borderRadius: '10px', marginBottom: '15px', border: '1px solid #ffeeba' }}>
            <span style={{ fontSize: '11px', color: '#856404', fontWeight: 'bold' }}>📢 나의 초대 링크</span>
            <div style={{ display: 'flex', marginTop: '5px', gap: '5px' }}>
              {/* ✅ 닉네임이 확정될 때까지 '링크 생성 중' 표시 */}
              <input readOnly 
                value={nepenthesUserData?.nickname ? `https://jseongfortune.vercel.app/?ref=${nepenthesUserData.nickname}` : '링크 생성 중...'} 
                style={{ flex: 1, fontSize: '10px', border: '1px solid #ddd', padding: '6px', borderRadius: '4px', color: nepenthesUserData?.nickname ? '#333' : '#ccc' }} />
              <button onClick={copyToClipboard} style={{ padding: '6px 8px', background: '#ffc107', border: 'none', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>복사</button>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={styles.card}><span style={styles.label}>출금 가능 자산</span><strong style={styles.val}>{Number(nepenthesUserData?.balance || 0).toLocaleString()}원</strong></div>
            <div style={styles.card}><span style={styles.label}>네트워크 수익</span><strong style={{...styles.val, color:'#28a745'}}>{Number(nepenthesUserData?.networkProfit || 0).toLocaleString()}원</strong></div>
          </div>

          <div style={{ paddingBottom: '20px' }}>
            <h4 style={{ fontSize: '13px', color: '#333', marginBottom: '8px' }}>🌳 나의 가족 현황</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
              {nepenthesFamilyData?.level1?.length > 0 ? nepenthesFamilyData.level1.map((name, i) => (
                <span key={i} style={styles.badge}>{name}</span>
              )) : <span style={{fontSize:'10px', color:'#ccc'}}>1단계 가족을 초대해 보세요.</span>}
            </div>
            <div style={{ background: '#f8f9fa', padding: '8px', borderRadius: '8px' }}>
              <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                <tbody>
                  {nepenthesFamilyData?.subLevels?.map((level) => (
                    <tr key={level.depth} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '4px', color: '#888' }}>{level.depth}단계</td>
                      <td style={{ padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>{level.count.toLocaleString()}명</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ padding: '15px', backgroundColor: '#fff', borderTop: '1px solid #eee' }}>
          <button style={styles.withdrawBtn}>보상금 출금 / 계좌 관리</button>
        </div>
      </div>
    </>
  );
};

const styles = {
  card: { background: '#f8f9fa', padding: '10px', borderRadius: '8px', marginBottom: '8px' },
  label: { display: 'block', fontSize: '10px', color: '#999' },
  val: { fontSize: '15px', color: '#333', fontWeight: 'bold' },
  badge: { padding: '3px 7px', background: '#eee', borderRadius: '12px', fontSize: '10px', color: '#555' },
  withdrawBtn: { width: '100%', padding: '15px', background: '#ff9800', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }
};

export default SideAssetMenu;