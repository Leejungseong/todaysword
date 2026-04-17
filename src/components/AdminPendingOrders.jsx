import { useEffect, useState } from 'react';

const AdminPendingOrders = ({ onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleConfirm = async (orderId) => {
    const response = await fetch('/api/confirm-purchase-reward', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || '확정 처리 실패');
      return;
    }

    alert('확정 처리 완료');
    window.location.reload();
  };

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const response = await fetch('/api/admin-pending-orders');
        const result = await response.json();

        if (!response.ok) {
          alert(JSON.stringify(result));
          setLoading(false);
          return;
        }

        setOrders(result);
      } catch (error) {
        console.error('pending 주문 조회 오류:', error);
        alert('pending 주문 조회 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, []);

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
        maxWidth: '500px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        padding: '20px',
        textAlign: 'left',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ marginBottom: '15px' }}>관리자 주문 확정 창</h3>

        <p style={{ fontSize: '14px', marginBottom: '20px' }}>
          pending 상태의 구매 주문을 확인하고 확정 처리하는 관리자 전용 공간입니다.
        </p>

        {loading ? (
          <p style={{ fontSize: '14px', marginBottom: '20px' }}>불러오는 중입니다...</p>
        ) : orders.length === 0 ? (
          <p style={{ fontSize: '14px', marginBottom: '20px' }}>pending 주문이 없습니다.</p>
        ) : (
          <div style={{ marginBottom: '20px' }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '10px',
                  backgroundColor: '#fafafa'
                }}
              >
                <p style={{ fontSize: '13px', margin: '0 0 6px 0' }}>
                  <strong>주문번호:</strong> {order.order_id}
                </p>
                <p style={{ fontSize: '13px', margin: '0 0 6px 0' }}>
                  <strong>구매자:</strong> {order.buyer_nickname}
                </p>
                <p style={{ fontSize: '13px', margin: '0 0 6px 0' }}>
                  <strong>구매금액:</strong> {order.purchase_amount}원
                </p>
                <p style={{ fontSize: '13px', margin: 0 }}>
                  <strong>보상원금:</strong> {order.reward_amount}원
                </p>
                <button
                  onClick={() => handleConfirm(order.order_id)}
                  style={{
                    marginTop: '10px',
                    padding: '8px',
                    width: '100%',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  확정 처리
                </button>
              </div>
            ))}
          </div>
        )}

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
          닫기
        </button>
      </div>
    </div>
  );
};

export default AdminPendingOrders;