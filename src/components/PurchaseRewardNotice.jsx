import React from 'react';

const PurchaseRewardNotice = ({ onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <div style={{
        width: '90%',
        maxWidth: '400px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        padding: '20px',
        textAlign: 'left'
      }}>
        <h3 style={{ marginBottom: '15px' }}>구매 보상 안내</h3>

        <p style={{ fontSize: '14px', marginBottom: '10px' }}>
          • 구매 보상은 즉시 지급되지 않습니다.
        </p>

        <p style={{ fontSize: '14px', marginBottom: '10px' }}>
          • 주문 확정 후 지급됩니다.
        </p>

        <p style={{ fontSize: '14px', marginBottom: '10px' }}>
          • 환불, 취소, 이의 신청 기간 종료 후 처리됩니다.
        </p>

        <p style={{ fontSize: '14px', marginBottom: '20px' }}>
          • 광고주 최종 확정 후 보상이 지급됩니다.
        </p>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default PurchaseRewardNotice;