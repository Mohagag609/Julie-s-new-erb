import React from 'react';

const placeholderStyle: React.CSSProperties = {
    padding: '1.5rem',
    backgroundColor: '#eef0f2',
    border: '1px solid #dde0e2',
    borderRadius: '8px',
    textAlign: 'center',
    lineHeight: '1.6',
}

const linkStyle: React.CSSProperties = {
    display: 'inline-block',
    margin: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#0070f3',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px'
}

const ReportsPage = () => {
  return (
    <div>
      <h1>التقارير</h1>
      <div style={placeholderStyle}>
        <p>يمكنك تحميل التقارير المتاحة مباشرة من الروابط أدناه.</p>
        <div>
            <a href="/api/reports/installments" target="_blank" style={linkStyle}>تحميل تقرير الأقساط (PDF)</a>
            <a href="/api/reports/bank" style={linkStyle}>تحميل تقرير كشف البنك (Excel)</a>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
