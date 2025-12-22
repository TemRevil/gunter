import React, { useContext, useState } from 'react';
import {
    Settings as SettingsIcon, Moon, Sun, Download,
    Upload, FileText, Lock, ShieldAlert, Globe, Eye, EyeOff, Key,
    UserCheck, FileBarChart, Palette, Save, Printer, ShieldCheck
} from 'lucide-react';
import { StoreContext } from '../store/StoreContext';

const LicenseSection = ({ settings, setData, t }) => (
    <section className="settings-section-card">
        <header className="settings-section-header">
            <div className="settings-section-icon security" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)' }}>
                <ShieldCheck size={24} />
            </div>
            <div>
                <h3 style={{ margin: 0, fontSize: 'var(--fs-h3)' }}>{t('license')}</h3>
                <p style={{ margin: 0, fontSize: 'var(--fs-sm)', opacity: 0.6 }}>{t('activationStatus')}</p>
            </div>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="settings-item-row" style={{ cursor: 'default' }}>
                <div>
                    <span className="settings-item-label">{t('activationStatus')}</span>
                    <span className="settings-item-subtext" style={{ color: 'var(--success-color)', fontWeight: 700 }}>{t('activated')}</span>
                </div>
                <div style={{ color: 'var(--success-color)' }}>
                    <ShieldCheck size={20} />
                </div>
            </div>

            <div className="password-box">
                <div className="password-box-header">
                    <span style={{ fontWeight: 700 }}>{t('activationKey')}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input
                        type="text"
                        readOnly
                        value={(() => {
                            if (!settings.license) return 'XXXX-XXXX-XXXX-XXXX';
                            const key = settings.license;
                            let masked = '';
                            let seen = 0;
                            for (let i = key.length - 1; i >= 0; i--) {
                                if (key[i] === '-') {
                                    masked = '-' + masked;
                                } else if (seen < 4) {
                                    masked = key[i] + masked;
                                    seen++;
                                } else {
                                    masked = '*' + masked;
                                }
                            }
                            return masked;
                        })()}
                        style={{
                            flex: 1,
                            background: 'var(--bg-body)',
                            textAlign: 'center',
                            fontFamily: 'monospace',
                            letterSpacing: '2px',
                            fontWeight: 700,
                            borderRadius: 'var(--radius-md)'
                        }}
                    />
                    <button
                        className="btn btn-primary"
                        style={{ borderRadius: 'var(--radius-md)' }}
                        onClick={() => {
                            window.customConfirm?.(t('change'), t('changeKeyConfirm'), () => {
                                setData(prev => ({
                                    ...prev,
                                    settings: { ...prev.settings, license: null }
                                }));
                                window.location.reload();
                            });
                        }}
                    >
                        {t('change')}
                    </button>
                </div>
            </div>
        </div>
    </section>
);

const Settings = () => {
    const {
        settings, toggleTheme, updateReceiptSettings,
        exportData, importData, setData, data, t
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

    const toggleSecurity = (key) => {
        setData(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                security: {
                    ...(prev?.settings?.security || {}),
                    [key]: !(prev?.settings?.security?.[key] ?? false)
                }
            }
        }));
    };

    const SecurityCheckbox = ({ label, subtext, settingKey }) => {
        const isActive = settings?.security?.[settingKey] ?? false;

        return (
            <div className="settings-item-row" onClick={() => toggleSecurity(settingKey)}>
                <div>
                    <span className="settings-item-label">{label}</span>
                    {subtext && <span className="settings-item-subtext">{subtext}</span>}
                </div>
                <div className={`toggle-switch ${isActive ? 'active' : ''}`}>
                    <div className="toggle-knob" />
                </div>
            </div>
        );
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

    const setLanguage = (lang) => {
        setData(prev => ({
            ...prev,
            settings: { ...prev.settings, language: lang }
        }));
    };

    return (
        <div className="view-container">
            <header className="view-header">
                <div className="view-title">
                    <div className="view-icon">
                        <SettingsIcon size={24} />
                    </div>
                    <div>
                        <h1>{t('settings')}</h1>
                        <p>{settings.language === 'ar' ? 'تخصيص الخيارات والأمان والحسابات' : 'Customize options, security and accounts'}</p>
                    </div>
                </div>
            </header>

            <div className="settings-view">
                <div className="settings-main-grid">
                    {/* Right Column: Security (Longest) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        <section className="settings-section-card" style={{ height: '100%' }}>
                            <header className="settings-section-header">
                                <div className="settings-section-icon security">
                                    <ShieldAlert size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: 'var(--fs-h3)' }}>{t('securityPermissions')}</h3>
                                    <p style={{ margin: 0, fontSize: 'var(--fs-sm)', opacity: 0.6 }}>{settings.language === 'ar' ? 'تحديد متى يطلب النظام التحقق من المدير' : 'Determine when the system requires manager verification'}</p>
                                </div>
                            </header>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div className="settings-item-subtext" style={{ fontWeight: 800, color: 'var(--accent-color)', marginBottom: '0.25rem' }}>{settings.language === 'ar' ? 'العمليات الأساسية' : 'Core Operations'}</div>
                                <SecurityCheckbox label={t('deleteOperations')} subtext={settings.language === 'ar' ? 'طلب كلمة المرور عند حذف أي عملية بيع' : 'Require password when deleting any sale'} settingKey="authOnDeleteOperation" />
                                <SecurityCheckbox label={t('addOperations')} subtext={settings.language === 'ar' ? 'تأمين تسجيل أي فاتورة بيع جديدة' : 'Secure recording of any new sale invoice'} settingKey="authOnAddOperation" />

                                <div className="settings-item-subtext" style={{ fontWeight: 800, color: 'var(--accent-color)', marginTop: '1rem', marginBottom: '0.25rem' }}>{settings.language === 'ar' ? 'إدارة المخزن' : 'Storage Management'}</div>
                                <SecurityCheckbox label={t('deletePart')} subtext={settings.language === 'ar' ? 'منع حذف أي صنف من المخزن بدون إذن' : 'Prevent deleting any item from storage without permission'} settingKey="authOnDeletePart" />
                                <SecurityCheckbox label={t('addPart')} subtext={settings.language === 'ar' ? 'طلب الرقم السري عند تسجيل صنف جديد' : 'Require PIN when registering a new item'} settingKey="authOnAddPart" />
                                <SecurityCheckbox label={t('editPart')} subtext={settings.language === 'ar' ? 'تأمين تغيير بيانات القطع المتوفرة' : 'Secure changing of available items data'} settingKey="authOnUpdatePart" />

                                <div className="settings-item-subtext" style={{ fontWeight: 800, color: 'var(--accent-color)', marginTop: '1rem', marginBottom: '0.25rem' }}>{settings.language === 'ar' ? 'العملاء والمالية' : 'Customers & Finance'}</div>
                                <SecurityCheckbox label={t('deleteCustomer')} settingKey="authOnDeleteCustomer" />
                                <SecurityCheckbox label={t('addTransaction')} subtext={settings.language === 'ar' ? 'تأمين إضافة مبالغ يدوية لحساب العملاء' : 'Secure manual addition of amounts to customer accounts'} settingKey="authOnAddTransaction" />
                                <SecurityCheckbox label={t('deleteTransaction')} settingKey="authOnDeleteTransaction" />
                            </div>
                        </section>
                    </div>

                    {/* Left Column: Stacking Passwords and Receipt */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                        {/* Language Selection */}
                        <section className="settings-section-card">
                            <header className="settings-section-header">
                                <div className="settings-section-icon appearance" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-color)' }}>
                                    <Globe size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: 'var(--fs-h3)' }}>{t('language')}</h3>
                                    <p style={{ margin: 0, fontSize: 'var(--fs-sm)', opacity: 0.6 }}>{settings.language === 'ar' ? 'اختيار لغة واجهة النظام' : 'Choose system interface language'}</p>
                                </div>
                            </header>

                            <div className="settings-button-grid">
                                <button
                                    className={`btn ${settings.language === 'ar' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setLanguage('ar')}
                                    style={{ padding: '1rem', borderRadius: 'var(--radius-lg)' }}
                                >
                                    العربية
                                </button>
                                <button
                                    className={`btn ${settings.language === 'en' ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setLanguage('en')}
                                    style={{ padding: '1rem', borderRadius: 'var(--radius-lg)' }}
                                >
                                    English
                                </button>
                            </div>
                        </section>

                        {/* 2. Password & Access */}
                        <section className="settings-section-card">
                            <header className="settings-section-header">
                                <div className="settings-section-icon auth">
                                    <Key size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: 'var(--fs-h3)' }}>{t('passwords')}</h3>
                                    <p style={{ margin: 0, fontSize: 'var(--fs-sm)', opacity: 0.6 }}>{settings.language === 'ar' ? 'إدارة الوصول وحماية لوحة التحكم' : 'Manage access and dashboard protection'}</p>
                                </div>
                            </header>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="password-box">
                                    <div className="password-box-header">
                                        <span style={{ fontWeight: 700 }}>{t('systemPassword')}</span>
                                        <span style={{ fontSize: 'var(--fs-xs)', opacity: 0.6 }}>{t('current')}: <code style={{ color: 'var(--accent-color)' }}>{settings.loginPassword}</code></span>
                                    </div>
                                    <form onSubmit={(e) => handlePasswordUpdate('loginPassword', e)} style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input type="text" name="password" placeholder={settings.language === 'ar' ? 'كلمة مرور جديدة...' : 'New password...'} required />
                                        <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-md)' }}>{t('change')}</button>
                                    </form>
                                </div>

                                <div className="password-box">
                                    <div className="password-box-header">
                                        <span style={{ fontWeight: 700 }}>{t('adminPassword')}</span>
                                        <span style={{ fontSize: 'var(--fs-xs)', opacity: 0.6 }}>{t('current')}: <code style={{ color: 'var(--accent-color)' }}>{settings.adminPassword}</code></span>
                                    </div>
                                    <form onSubmit={(e) => handlePasswordUpdate('adminPassword', e)} style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input type="text" name="password" placeholder={settings.language === 'ar' ? 'كلمة مرور جديدة...' : 'New password...'} required />
                                        <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-md)' }}>{t('change')}</button>
                                    </form>
                                </div>
                            </div>
                        </section>

                        {/* 3. Receipt Settings */}
                        <section className="settings-section-card">
                            <header className="settings-section-header">
                                <div className="settings-section-icon receipt">
                                    <FileBarChart size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: 'var(--fs-h3)' }}>{t('receiptSettings')}</h3>
                                    <p style={{ margin: 0, fontSize: 'var(--fs-sm)', opacity: 0.6 }}>{settings.language === 'ar' ? 'تخصيص فاتورة البيع' : 'Customize sales invoice'}</p>
                                </div>
                            </header>

                            <form onSubmit={handleReceiptUpdate}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>{t('businessName')}</label>
                                        <input type="text" name="title" defaultValue={settings.receipt.title || ''} required />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('detailedAddress')}</label>
                                        <input type="text" name="address" defaultValue={settings.receipt.address || ''} />
                                    </div>
                                    <div className="settings-button-grid">
                                        <div className="form-group">
                                            <label>{t('phone')}</label>
                                            <input type="text" name="phone" defaultValue={settings.receipt.phone || ''} />
                                        </div>
                                        <div className="form-group">
                                            <label>{t('receiptFooter')}</label>
                                            <input type="text" name="footer" defaultValue={settings.receipt.footer || ''} />
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ padding: '0.7rem 1.5rem' }}>
                                        <Save size={16} /> {t('save')}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary receipt-preview-btn"
                                        style={{ padding: '0.7rem 1rem' }}
                                        onClick={() => {
                                            const mockOp = {
                                                id: 'PREVIEW',
                                                timestamp: new Date().toISOString(),
                                                customerName: 'Customer Preview',
                                                partName: 'Part Preview',
                                                quantity: 2,
                                                price: 1500,
                                                paidAmount: 1000,
                                                paymentStatus: 'partial'
                                            };
                                            import('../utils/printing').then(m => m.printReceipt(mockOp, settings));
                                        }}
                                    >
                                        <Printer size={16} /> {t('preview')}
                                    </button>
                                </div>
                            </form>
                        </section>
                        <LicenseSection settings={settings} setData={setData} t={t} />
                    </div>
                </div>

                {/* 4. Display & Backups - Full Width Bottom */}
                <section className="settings-section-card settings-footer-section">
                    <header className="settings-section-header">
                        <div className="settings-section-icon appearance">
                            <Palette size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 'var(--fs-h3)' }}>{t('backupAndDisplay')}</h3>
                            <p style={{ margin: 0, fontSize: 'var(--fs-sm)', opacity: 0.6 }}>{settings.language === 'ar' ? 'التحكم في العرض وتصدير/استيراد الملفات' : 'Control display and export/import files'}</p>
                        </div>
                    </header>

                    <div className="settings-button-grid" style={{ alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div className="settings-item-row" onClick={toggleTheme}>
                                <div>
                                    <span className="settings-item-label">{t('darkMode')}</span>
                                    <span className="settings-item-subtext">{settings.language === 'ar' ? 'تغيير مظهر النظام بالكامل' : 'Change entire system appearance'}</span>
                                </div>
                                <div style={{ color: 'var(--accent-color)' }}>
                                    {settings.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                                </div>
                            </div>
                            <SecurityCheckbox
                                label={settings.language === 'ar' ? 'إظهار الرصيد اليومي' : 'Show Daily Balance'}
                                subtext={settings.language === 'ar' ? 'عرض إجمالي النقدية في القائمة الجانبية' : 'Display total cash in the sidebar'}
                                settingKey="showSessionBalance"
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div className="settings-button-grid">
                                <button className="btn btn-secondary shadow-sm" style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }} onClick={() => {
                                    const now = new Date();
                                    const blob = new Blob([exportData()], { type: 'text/plain' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `backup_${now.toISOString().split('T')[0]}.txt`;
                                    a.click();
                                    window.showToast?.(settings.language === 'ar' ? 'جاري تصدير البيانات...' : 'Exporting data...', 'success');
                                }}>
                                    <Download size={20} /> {t('exportData')}
                                </button>

                                <label className="btn btn-secondary shadow-sm" style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                    <Upload size={20} /> {t('importData')}
                                    <input type="file" hidden onChange={onImport} />
                                </label>
                            </div>
                        </div>

                    </div>
                </section>
            </div>
        </div>
    );
};

export default Settings;
