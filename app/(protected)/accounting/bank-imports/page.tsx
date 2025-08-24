import React from 'react';

const placeholderStyle: React.CSSProperties = {
    padding: '1.5rem',
    backgroundColor: '#fff8e1',
    border: '1px solid #ffecb3',
    borderRadius: '8px',
    textAlign: 'center',
    lineHeight: '1.6',
}

const codeStyle: React.CSSProperties = {
    backgroundColor: '#eee',
    padding: '0.2rem 0.4rem',
    borderRadius: '4px',
    fontFamily: 'monospace',
}

const BankImportsPage = () => {
  return (
    <div>
      <h1>استيراد كشف حساب بنكي والمطابقة</h1>
      <div style={placeholderStyle}>
        <p>سيتم هنا تطوير واجهة لتحميل ملفات كشف الحساب (CSV/Excel) وعرضها.</p>
        <p>حاليًا، يمكن استيراد الحركات وتشغيل المطابقة عبر الـ API:</p>
        <ul>
            <li><code style={codeStyle}>POST /api/accounting/bank-imports</code>: لاستيراد حركة بنكية جديدة.</li>
            <li><code style={codeStyle}>POST /api/accounting/bank-imports?mode=match</code>: لتشغيل عملية المطابقة الآلية.</li>
        </ul>
      </div>
    </div>
  );
};

export default BankImportsPage;
