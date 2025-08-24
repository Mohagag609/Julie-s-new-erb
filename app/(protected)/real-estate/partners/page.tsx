import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
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

const formStyle: React.CSSProperties = {
    marginTop: '2rem',
    padding: '1.5rem',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
}

const inputStyle: React.CSSProperties = {
    padding: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginRight: '0.5rem',
}

const buttonStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#0070f3',
    color: 'white',
    cursor: 'pointer',
}


async function addPartner(formData: FormData) {
  'use server';

  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const note = formData.get('note') as string;

  if (!name) {
    return; // Basic validation
  }

  await prisma.partner.create({
    data: {
      name,
      phone,
      note,
    },
  });

  revalidatePath('/real-estate/partners');
}

const PartnersPage = async () => {
  let partners = [];
  try {
    partners = await prisma.partner.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error("Failed to fetch partners:", error);
  }

  return (
    <div>
      <h1>إدارة الشركاء</h1>

      <form action={addPartner} style={formStyle}>
        <h2>إضافة شريك جديد</h2>
        <input type="text" name="name" placeholder="اسم الشريك" required style={inputStyle} />
        <input type="text" name="phone" placeholder="رقم الهاتف" style={inputStyle} />
        <input type="text" name="note" placeholder="ملاحظات" style={inputStyle} />
        <button type="submit" style={buttonStyle}>إضافة</button>
      </form>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>الاسم</th>
            <th style={thStyle}>الهاتف</th>
            <th style={thStyle}>ملاحظات</th>
            <th style={thStyle}>تاريخ الإنشاء</th>
          </tr>
        </thead>
        <tbody>
          {partners.length === 0 ? (
            <tr>
              <td colSpan={4} style={{...tdStyle, textAlign: 'center'}}>لا يوجد شركاء لعرضهم.</td>
            </tr>
          ) : (
            partners.map((partner) => (
              <tr key={partner.id}>
                <td style={tdStyle}>{partner.name}</td>
                <td style={tdStyle}>{partner.phone || '-'}</td>
                <td style={tdStyle}>{partner.note || '-'}</td>
                <td style={tdStyle}>{new Date(partner.createdAt).toLocaleDateString('ar-EG')}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PartnersPage;
