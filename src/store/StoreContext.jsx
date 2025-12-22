import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

const DB_KEY = 'mech_system_db_v3'; // Bump version for React migration

const defaultData = {
    operations: [],
    parts: [],
    customers: [],
    notifications: [],
    transactions: [],
    settings: {
        theme: 'dark',
        loginPassword: '1',
        adminPassword: '1',
        receipt: {
            title: 'اسم المركز / المحل',
            address: 'العنوان بالتفصيل',
            phone: '01000000000',
            footer: 'شكراً لزيارتكم!'
        },
        license: null
    }
};

export const StoreProvider = ({ children }) => {
    const [data, setData] = useState(() => {
        const stored = localStorage.getItem(DB_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return { ...defaultData, ...parsed };
            } catch (e) {
                return defaultData;
            }
        }
        return defaultData;
    });

    useEffect(() => {
        localStorage.setItem(DB_KEY, JSON.stringify(data));
        // Also update theme on body
        if (data.settings.theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }, [data]);

    const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

    const getValidLicenseCodes = () => [
        'OEYySzQtTTlYN1EtUDFMNVYtUjNONlctVDBZOFo=',
        'QzVIM0otRzlTMUQtSzdGNEEtTDBQMk8tQjZNOE4=',
        'UTFMVzJFLVIzVDRZLVU1STZPLVA3QThTLUQ5RjBH',
        'WjlYOEMtN1Y2QjUtTjRNM0stMkwxSjAtUTVXNEU=',
        'UDBPOUktOFU3WTYtVDVSNEUtM1cyUTEtQTBaOVg='
    ].map(c => atob(c));

    const isLicensed = () => !!data.settings.license && getValidLicenseCodes().includes(data.settings.license);

    const activateLicense = (code) => {
        setData(prev => ({
            ...prev,
            settings: { ...prev.settings, license: code }
        }));
        return getValidLicenseCodes().includes(code);
    };

    const addNotification = (text, type = 'info') => {
        const note = {
            id: generateId(),
            text,
            type,
            time: new Date().toLocaleTimeString('ar-EG'),
            read: false
        };
        setData(prev => ({
            ...prev,
            notifications: [note, ...prev.notifications]
        }));
    };

    const clearNotifications = () => {
        setData(prev => ({ ...prev, notifications: [] }));
    };

    const addOperation = (op) => {
        const newOp = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            ...op
        };
        setData(prev => {
            const part = prev.parts.find(p => p.id === op.partId);
            const updatedParts = prev.parts.map(p => {
                if (p.id === op.partId) {
                    const currentQty = !isNaN(p.quantity) ? p.quantity : 0;
                    const opQty = !isNaN(op.quantity) ? op.quantity : 1;
                    const newQty = currentQty - opQty;
                    if (newQty <= (p.threshold || 5)) {
                        setTimeout(() => addNotification(`تنبيه: مخزون منخفض للقطعة "${p.name}" (المتبقى: ${newQty})`, 'danger'), 0);
                    }
                    return { ...p, quantity: newQty };
                }
                return p;
            });

            // Update customer balance if needed (logic from original store.js)
            const total = op.price;
            const paid = op.paidAmount || 0;
            const balanceChange = (op.paymentStatus === 'paid') ? 0 : (total - paid);

            const updatedCustomers = prev.customers.map(c =>
                c.id === op.customerId ? { ...c, balance: (c.balance || 0) + balanceChange } : c
            );

            return {
                ...prev,
                operations: [...prev.operations, newOp],
                parts: updatedParts,
                customers: updatedCustomers
            };
        });
        return newOp;
    };

    const deleteOperation = (id) => {
        setData(prev => {
            const op = prev.operations.find(o => o.id === id);
            if (!op) return prev;

            const updatedParts = prev.parts.map(p =>
                p.id === op.partId ? { ...p, quantity: p.quantity + (op.quantity || 1) } : p
            );

            // Reverse balance change
            const total = op.price;
            const paid = op.paidAmount || 0;
            const balanceChange = (op.paymentStatus === 'paid') ? 0 : (total - paid);

            const updatedCustomers = prev.customers.map(c =>
                c.id === op.customerId ? { ...c, balance: (c.balance || 0) - balanceChange } : c
            );

            return {
                ...prev,
                operations: prev.operations.filter(o => o.id !== id),
                parts: updatedParts,
                customers: updatedCustomers
            };
        });
        addNotification(`تم حذف عملية بيع لم يتم استرجاع قيمتها بالكامل`, 'warning');
    };

    const addPart = (part) => {
        const newPart = { id: generateId(), ...part };
        setData(prev => ({ ...prev, parts: [...prev.parts, newPart] }));
        return newPart;
    };

    const updatePart = (id, updates) => {
        setData(prev => ({
            ...prev,
            parts: prev.parts.map(p => p.id === id ? { ...p, ...updates } : p)
        }));
    };

    const deletePart = (id) => {
        setData(prev => ({ ...prev, parts: prev.parts.filter(p => p.id !== id) }));
    };

    const addCustomer = (cust) => {
        const newCust = { id: generateId(), balance: 0, ...cust };
        setData(prev => ({ ...prev, customers: [...prev.customers, newCust] }));
        return newCust;
    };

    const updateCustomer = (id, updates) => {
        setData(prev => ({
            ...prev,
            customers: prev.customers.map(c => c.id === id ? { ...c, ...updates } : c)
        }));
    };

    const deleteCustomer = (id) => {
        setData(prev => ({ ...prev, customers: prev.customers.filter(c => c.id !== id) }));
    };

    const toggleTheme = () => {
        setData(prev => ({
            ...prev,
            settings: { ...prev.settings, theme: prev.settings.theme === 'light' ? 'dark' : 'light' }
        }));
    };

    const updateReceiptSettings = (receipt) => {
        setData(prev => ({
            ...prev,
            settings: { ...prev.settings, receipt }
        }));
    };

    const exportData = () => {
        const backup = JSON.parse(JSON.stringify(data));
        delete backup.settings.license;
        const str = JSON.stringify(backup, null, 2);
        return btoa(unescape(encodeURIComponent(str)));
    };

    const importData = (encodedStr) => {
        try {
            const jsonStr = decodeURIComponent(escape(atob(encodedStr)));
            const parsed = JSON.parse(jsonStr);
            if (parsed && parsed.operations) {
                const currentLicense = data.settings.license;
                setData({ ...parsed, settings: { ...parsed.settings, license: currentLicense } });
                return true;
            }
        } catch (e) {
            return false;
        }
        return false;
    };

    const value = {
        data,
        isLicensed,
        activateLicense,
        addOperation,
        deleteOperation,
        addPart,
        updatePart,
        deletePart,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addNotification,
        clearNotifications,
        toggleTheme,
        updateReceiptSettings,
        exportData,
        importData,
        setData,
        // Short hands for convenience
        operations: data.operations,
        parts: data.parts,
        customers: data.customers,
        notifications: data.notifications,
        settings: data.settings
    };

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export { StoreContext };
export const useStore = () => useContext(StoreContext);
