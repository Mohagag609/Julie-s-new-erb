import React from 'react';

const placeholderStyle: React.CSSProperties = {
    padding: '1.5rem',
    backgroundColor: '#fff8e1',
    border: '1px solid #ffecb3',
    borderRadius: '8px',
    textAlign: 'center',
}

const VouchersPage = () => {
  return (
    <div>
      <h1>سندات القبض والصرف</h1>
      <div style={placeholderStyle}>
        <p>واجهة كاملة لإدارة وعرض السندات سيتم تطويرها هنا.</p>
        <p>حاليًا، يمكن إنشاء السندات عبر الـ API فقط.</p>
      </div>
    </div>
  );
};

export default VouchersPage;
