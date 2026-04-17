import React from 'react';

const PrivacyPolicy = ({ onClose }) => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', fontSize: '14px', lineHeight: '1.6', color: '#333' }}>
      <h2 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>개인정보 처리방침</h2>
      <p>본 서비스(Fortune Cookie)는 사용자의 개인정보를 소중히 보호합니다.</p>
      
      <h3 style={{ fontSize: '16px', marginTop: '15px' }}>1. 개인정보 수집 및 이용</h3>
      <p>본 서비스는 서비스 제공 및 개선을 위해 최소한의 정보만을 활용합니다.</p>
      
      <h3 style={{ fontSize: '16px', marginTop: '15px' }}>2. Google AdSense 광고 및 쿠키</h3>
      <p>본 사이트는 Google AdSense를 이용하며, Google은 사용자의 방문 기록을 바탕으로 맞춤형 광고를 제공하기 위해 쿠키를 사용할 수 있습니다. 사용자는 Google의 광고 설정을 통해 이를 거부할 수 있습니다.</p>
      
      <h3 style={{ fontSize: '16px', marginTop: '15px' }}>3. 제3자 제공</h3>
      <p>본 서비스는 사용자의 동의 없이 개인정보를 외부에 제공하지 않습니다.</p>
      
      <button 
        onClick={onClose} 
        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007AFF', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        확인 및 닫기
      </button>
    </div>
  );
};

export default PrivacyPolicy;