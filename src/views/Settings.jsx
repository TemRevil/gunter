import React, { useContext, useState } from 'react';
import {
    Settings as SettingsIcon, Moon, Sun, Download,
    Upload, FileText, Lock, ShieldAlert, Globe, Eye, EyeOff, Key,
    UserCheck, FileBarChart, Palette, Save, Printer
} from 'lucide-react';
import { StoreContext } from '../store/StoreContext';

const Settings = () => {
    const {
        settings, toggleTheme, updateReceiptSettings,
        exportData, importData, setData, data
    } = useContext(StoreContext);


    const handleReceiptUpdate = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const receipt = {
            title: fd.get('title'),
            address: fd.get('address'),
            phone: fd.get('phone'),
            footer: fd.get('footer')
        };
        updateReceiptSettings(receipt);
        window.showToast?.('تم حفظ إعدادات الوصل', 'success');
    };

    const handlePasswordUpdate = (type, e) => {
        e.preventDefault();
        const pass = new FormData(e.target).get('password');
        setData(prev => ({
            ...prev,
            settings: { ...prev.settings, [type]: pass }
        }));
        e.target.reset();
        window.showToast?.('تم تغيير كلمة المرور بنجاح', 'success');
    };

    const onImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (re) => {
            if (importData(re.target.result)) {
                window.showToast?.('تم استعادة البيانات بنجاح', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                window.showToast?.('فشل في استيراد الملف', 'danger');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="view-container">
            <header className="view-header">
                <div className="view-title">
                    <div className="view-icon">
                        <SettingsIcon size={24} />
                    </div>
                    <div>
                        <h1>الإعدادات</h1>
                        <p>تخصيص النظام والنسخ الاحتياطي</p>
                    </div>
                </div>
            </header>

            <div className="settings-container" style={{ padding: '1rem 0', maxWidth: '1000px', flex: 1, overflowY: 'auto' }}>

                {/* 1. Protection Settings */}
                <div className="card shadow-sm" style={{ marginBottom: '2rem', padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <div style={{ background: 'rgba(255, 107, 107, 0.1)', padding: '10px', borderRadius: '12px' }}>
                            <Lock size={24} style={{ color: 'var(--danger-color)' }} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>إعدادات الحماية</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.6 }}>تغيير كلمات المرور الخاصة بالدخول والإعدادات</p>
                        </div>
                    </div>

                    <div className="settings-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                        <div className="setting-item" style={{ background: 'var(--bg-hover)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ fontWeight: 600 }}>كلمة مرور النظام</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    الحالية: <b style={{ color: 'var(--accent-color)', fontFamily: 'monospace' }}>{settings.loginPassword}</b>
                                </span>
                            </label>
                            <form onSubmit={(e) => handlePasswordUpdate('loginPassword', e)} style={{ display: 'flex', gap: '0.75rem' }}>
                                <input type="text" name="password" placeholder="أدخل كلمة مرور جديدة..." required style={{ flex: 1 }} />
                                <button type="submit" className="btn btn-primary shadow-sm">تغيير</button>
                            </form>
                        </div>

                        <div className="setting-item" style={{ background: 'var(--bg-hover)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ fontWeight: 600 }}>كلمة مرور الإعدادات</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    الحالية: <b style={{ color: 'var(--accent-color)', fontFamily: 'monospace' }}>{settings.adminPassword}</b>
                                </span>
                            </label>
                            <form onSubmit={(e) => handlePasswordUpdate('adminPassword', e)} style={{ display: 'flex', gap: '0.75rem' }}>
                                <input type="text" name="password" placeholder="أدخل كلمة مرور جديدة..." required style={{ flex: 1 }} />
                                <button type="submit" className="btn btn-primary shadow-sm">تغيير</button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* 2. License Information */}
                <div className="card shadow-sm" style={{ marginBottom: '2rem', padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '12px' }}>
                            <UserCheck size={24} style={{ color: 'var(--success-color)' }} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>معلومات الترخيص (License)</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.6 }}>حالة تنشيط نسخة النظام الخاصة بك</p>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'linear-gradient(135deg, var(--bg-hover), var(--bg-input))',
                        padding: '1.5rem',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div>
                            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                حالة النظام:
                                <span className="badge success" style={{ padding: '4px 12px' }}>مُنشط بنجاح</span>
                            </p>
                            <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                كود التنشيط: <span style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                                    {settings.license ?
                                        (settings.license.includes('-') ?
                                            settings.license.split('-').map((p, i, a) => i === a.length - 1 ? p : 'XXXX').join('-') :
                                            `****${settings.license.slice(-4)}`)
                                        : '---'}
                                </span>
                            </p>
                        </div>
                        <button className="btn btn-outline shadow-sm" style={{ borderRadius: '10px' }} onClick={() => window.location.reload()}>
                            تغيير الكود
                        </button>
                    </div>
                </div>

                {/* 3. Receipt Settings */}
                <div className="card shadow-sm" style={{ marginBottom: '2rem', padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <div style={{ background: 'rgba(66, 153, 225, 0.1)', padding: '10px', borderRadius: '12px' }}>
                            <FileBarChart size={24} style={{ color: 'var(--accent-color)' }} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>بيانات الوصل (الفاتورة)</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.6 }}>تخصيص المعلومات التي تظهر في فواتير الطباعة</p>
                        </div>
                    </div>

                    <form onSubmit={handleReceiptUpdate}>
                        <div className="settings-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label style={{ fontWeight: 600 }}>اسم المحل / العنوان الرئيسي</label>
                                <input type="text" name="title" defaultValue={settings.receipt.title || ''} required />
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: 600 }}>العنوان</label>
                                <input type="text" name="address" defaultValue={settings.receipt.address || ''} />
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: 600 }}>رقم الهاتف</label>
                                <input type="text" name="phone" defaultValue={settings.receipt.phone || ''} />
                            </div>
                            <div className="form-group">
                                <label style={{ fontWeight: 600 }}>رسالة الترحيب / الملحوظة</label>
                                <input type="text" name="footer" defaultValue={settings.receipt.footer || ''} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 2.5rem' }}>
                                <Save size={18} /> حفظ التغييرات
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 2rem' }}
                                onClick={() => {
                                    const mockOp = {
                                        id: 'preview',
                                        timestamp: new Date().toISOString(),
                                        customerName: 'عميل تجريبي',
                                        partName: 'قطعة تجريبية (Preview)',
                                        quantity: 2,
                                        price: 1500,
                                        paidAmount: 1000,
                                        paymentStatus: 'partial'
                                    };
                                    import('../utils/printing').then(m => m.printReceipt(mockOp, settings));
                                }}
                            >
                                <Printer size={18} /> معاينة مصغرة
                            </button>
                        </div>
                    </form>
                </div>

                {/* 4. Appearance and Data */}
                <div className="card shadow-sm" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <div style={{ background: 'rgba(159, 122, 234, 0.1)', padding: '10px', borderRadius: '12px' }}>
                            <Palette size={24} style={{ color: 'var(--accent-color)' }} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>المظهر والبيانات</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.6 }}>النسخ الاحتياطي وإدارة الثيمات</p>
                        </div>
                    </div>

                    <div className="settings-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
                        <div className="setting-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-hover)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)' }}>
                            <span style={{ fontWeight: 600 }}>الوضع الليلي</span>
                            <button className="btn btn-secondary shadow-sm" onClick={toggleTheme} style={{ padding: '0.6rem', borderRadius: '12px' }}>
                                {settings.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                        </div>
                        <div className="setting-item">
                            <button className="btn btn-secondary shadow-sm" style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', borderRadius: 'var(--radius-md)' }} onClick={() => {
                                const now = new Date();
                                const blob = new Blob([exportData()], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `backup_${now.toISOString().split('T')[0]}.txt`;
                                a.click();
                                window.showToast?.('جاري تصدير البيانات...', 'success');
                            }}>
                                <Download size={20} /> تصدير نسخة احتياطية
                            </button>
                        </div>
                        <div className="setting-item">
                            <label className="btn btn-secondary shadow-sm" style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', cursor: 'pointer', borderRadius: 'var(--radius-md)' }}>
                                <Upload size={20} /> استيراد بيانات
                                <input type="file" hidden onChange={onImport} />
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
