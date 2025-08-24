'use client';

import React, { useState } from 'react';

const placeholderStyle: React.CSSProperties = {
    padding: '1.5rem',
    backgroundColor: '#eef0f2',
    border: '1px solid #dde0e2',
    borderRadius: '8px',
    textAlign: 'center',
    lineHeight: '1.6',
}

const buttonStyle: React.CSSProperties = {
    display: 'inline-block',
    margin: '1rem 0',
    padding: '0.75rem 1.5rem',
    border: 'none',
    backgroundColor: '#0070f3',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
}

const resultStyle: React.CSSProperties = {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: 'white',
    border: '1px solid #ccc'
}

const BackupsPage = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleRunBackup = async () => {
        setLoading(true);
        setResult(null);
        setError(null);
        try {
            const res = await fetch('/api/backups/run', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.details || 'Failed to run backup');
            }
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

  return (
    <div>
      <h1>النسخ الاحتياطي المحلي</h1>
      <div style={placeholderStyle}>
        <p>
            يقوم هذا الإجراء بإنشاء نسخة احتياطية كاملة من قاعدة البيانات في ملف JSON محلي.
            <br />
            سيتم حفظ الملف في مجلد <code>/backups</code> في جذر المشروع.
        </p>
        <button onClick={handleRunBackup} disabled={loading} style={buttonStyle}>
            {loading ? 'جاري إنشاء النسخة الاحتياطية...' : 'بدء عملية النسخ الاحتياطي الآن'}
        </button>

        {result && (
            <div style={resultStyle}>
                <p style={{color: 'green'}}>تم إنشاء النسخة الاحتياطية بنجاح!</p>
                <p><strong>الملف:</strong> <code>{result.file}</code></p>
            </div>
        )}
        {error && (
            <div style={{...resultStyle, borderColor: 'red'}}>
                <p style={{color: 'red'}}>فشل إنشاء النسخة الاحتياطية:</p>
                <p><code>{error}</code></p>
            </div>
        )}
      </div>
    </div>
  );
};

export default BackupsPage;
