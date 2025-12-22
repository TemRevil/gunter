import React, { useState } from 'react';
import { useStore } from './store/StoreContext';
import Sidebar from './components/Sidebar';
import Operations from './views/Operations';
import Storage from './views/Storage';
import Customers from './views/Customers';
import Notifications from './views/Notifications';
import Settings from './views/Settings';
import LicenseScreen from './components/LicenseScreen';
import LoginScreen from './components/LoginScreen';
import EndSessionModal from './components/EndSessionModal';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';
import Modal from './components/Modal';
import { Menu, Lock } from 'lucide-react';

function App() {
    const {
        isLicensed, activateLicense, settings,
        notifications
    } = useStore();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentTab, setCurrentTab] = useState('operations');
    const [isMobileShow, setIsMobileShow] = useState(false);
    const [isEndSessionOpen, setIsEndSessionOpen] = useState(false);

    const [showSettingsAuth, setShowSettingsAuth] = useState(false);
    const [settingsPassInput, setSettingsPassInput] = useState('');

    const renderTabContent = () => {
        switch (currentTab) {
            case 'operations': return <Operations />;
            case 'storage': return <Storage />;
            case 'customers': return <Customers />;
            case 'notifications': return <Notifications />;
            case 'settings': return <Settings />;
            default: return <Operations />;
        }
    };

    const handleTabChange = (tab) => {
        if (tab === 'settings') {
            setShowSettingsAuth(true);
            return;
        }
        setCurrentTab(tab);
        setIsMobileShow(false);
    };

    const handleSettingsAuth = (e) => {
        e.preventDefault();
        if (settingsPassInput === settings.adminPassword) {
            setShowSettingsAuth(false);
            setSettingsPassInput('');
            setCurrentTab('settings');
            setIsMobileShow(false);
        } else {
            window.showToast?.('كلمة مرور المدير غير صحيحة', 'danger');
        }
    };

    // Global Wrapper to ensure Toast/Confirm are always available
    return (
        <div key={settings.theme} data-theme={settings.theme}>
            <Toast />
            <ConfirmDialog />

            {!isLicensed() ? (
                <LicenseScreen onActivate={(code) => {
                    if (activateLicense(code)) {
                        window.showToast?.('تم تنشيط النظام بنجاح', 'success');
                    } else {
                        window.showToast?.('كود التنشيط غير صحيح!', 'danger');
                    }
                }} />
            ) : !isLoggedIn ? (
                <LoginScreen onLogin={(pass) => {
                    if (pass === settings.loginPassword) {
                        setIsLoggedIn(true);
                        window.showToast?.('تم تسجيل الدخول بنجاح', 'success');
                    } else {
                        window.showToast?.('كلمة المرور غير صحيحة!', 'danger');
                    }
                }} />
            ) : (
                <div className="app-container">
                    <button
                        id="mobile-menu-toggle"
                        className="btn btn-primary"
                        style={{
                            display: 'none',
                            position: 'fixed',
                            bottom: '1.5rem',
                            left: '1.5rem',
                            zIndex: 10002,
                            borderRadius: '50%',
                            width: '60px',
                            height: '60px',
                            boxShadow: 'var(--shadow-lg)'
                        }}
                        onClick={() => setIsMobileShow(!isMobileShow)}
                    >
                        <Menu size={24} />
                    </button>

                    <div
                        className={`mobile-overlay ${isMobileShow ? 'show' : ''}`}
                        onClick={() => setIsMobileShow(false)}
                    ></div>

                    <Sidebar
                        currentTab={currentTab}
                        setTab={handleTabChange}
                        onLogout={() => setIsEndSessionOpen(true)}
                        notificationsCount={notifications.length}
                        isMobileShow={isMobileShow}
                    />

                    <main className="main-content">
                        {renderTabContent()}
                    </main>

                    <EndSessionModal
                        isOpen={isEndSessionOpen}
                        onClose={() => setIsEndSessionOpen(false)}
                        onFinish={() => {
                            setIsEndSessionOpen(false);
                            setIsLoggedIn(false);
                        }}
                    />

                    <Modal
                        show={showSettingsAuth}
                        onClose={() => setShowSettingsAuth(false)}
                        title="التحقق من الهوية"
                    >
                        <form onSubmit={handleSettingsAuth}>
                            <div className="form-group">
                                <label>كلمة مرور المدير للوصول للإعدادات</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="password"
                                        required
                                        autoFocus
                                        value={settingsPassInput}
                              