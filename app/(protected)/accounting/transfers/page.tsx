import React from 'react';

const placeholderStyle: React.CSSProperties = {
    padding: '1.5rem',
    backgroundColor: '#fff8e1',
    border: '1px solid #ffecb3',
    borderRadius: '8px',
    textAlign: 'center',
}

const TransfersPage = () => {
  return (
    <div>
      <h1>تحويلات الخزنة</h1>
      <div style={placeholderStyle}>
        <p>واجهة كاملة لإدارة وعرض التحويلات بين الخزن سيتم تطويرها هنا.</p>
        <p>حاليًا، يمكن إنشاء التحويلات عبر الـ API فقط.</p>
      </div>
    </div>
  );
};

export default TransfersPage;
