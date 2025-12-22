import React, { useState } from 'react';
import { Key } from 'lucide-react';

const LicenseScreen = ({ onActivate }) => {
    const [code, setCode] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onActivate(code);
    };

    return (
        <div className="login-overlay">
            <div className="login-box card shadow-2xl">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', color: 'var(--accent-color)' }}>
                        <Key size={40} />
                    </div>
                </div>
                <h2>تنشيط النظام</h2>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                    النظام غير منشط. برجاء إدخال كود التنشيط الخاص بك للمتابعة.
                </p>
                <form onSubmit={handleSubmit} className="license-form-group">
                    <input
                        type="text"
                        placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="search-input"
                        style={{ maxWidth: '100%', width: '100%' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>
                        <Key size={18} /> تنشيط الآن
                    </button>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        * هذا النظام محمي بموجب ترخيص الاستخدام.
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LicenseScreen;
