import { prisma } from '@/lib/prisma';
import React from 'react';

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '1rem',
};

const thStyle: React.CSSProperties = {
  backgroundColor: '#f2f2f2',
  padding: '0.75rem',
  border: '1px solid #ddd',
  textAlign: 'right',
};

const tdStyle: React.CSSProperties = {
  padding: '0.75rem',
  border: '1px solid #ddd',
  textAlign: 'right',
};

const placeholderStyle: React.CSSProperties = {
    marginTop: '2rem',
    padding: '1.5rem',
    backgroundColor: '#fff8e1',
    border: '1px solid #ffecb3',
    borderRadius: '8px',
    textAlign: 'center',
}

const ReturnsPage = async () => {
  let returns = [];
  try {
    returns = await prisma.return.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        unit: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch returns:", error);
  }

  return (
    <div>
      <h1>إدارة المرتجعات</h1>

      <div style={placeholderStyle}>
        <p>نموذج تسجيل مرتجع جديد سيتوفر هنا قريباً.</p>
        <p>سيسمح باختيار وحدة وتحديد سبب الإرجاع.</p>
      </div>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>كود الوحدة</th>
            <th style={thStyle}>سبب الإرجاع</th>
            <th style={thStyle}>حالة إعادة البيع</th>
            <th style={thStyle}>تاريخ الإرجاع</th>
          </tr>
        </thead>
        <tbody>
          {returns.length === 0 ? (
            <tr>
              <td colSpan={4} style={{...tdStyle, textAlign: 'center'}}>لا توجد مرتجعات لعرضها.</td>
            </tr>
          ) : (
            returns.map((ret) => (
              <tr key={ret.id}>
                <td style={tdStyle}>{ret.unit.code}</td>
                <td style={tdStyle}>{ret.reason || '-'}</td>
                <td style={tdStyle}>{ret.resaleStatus}</td>
                <td style={tdStyle}>{new Date(ret.createdAt).toLocaleDateString('ar-EG')}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReturnsPage;
