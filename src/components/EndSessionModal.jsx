import React, { useState, useContext, useEffect } from 'react';
import { Power, Download, Printer, ShieldCheck, AlertCircle } from 'lucide-react';
import { StoreContext } from '../store/StoreContext';
import { printEndSessionReport } from '../utils/printing';

const EndSessionModal = ({ isOpen, onClose, onFinish }) => {
    const {
        data, settings, exportData,
        operations, transactions
    } = useContext(StoreContext);

    const [actualAmount, setActualAmount] = useState('');
    const [password, setPassword] = useState('');
    const [expectedAmount, setExpectedAmount] = useState(0);

    useEffect(() => {
        if (isOpen) {
            const todayStr = new Date().toISOString().split('T')[0];
            const dailyTx = data.transactions.filter(tx =>
                tx.type === 'payment' && tx.date.startsWith(todayStr)
            );
            const dailyTotal = dailyTx.reduce((acc, tx) => acc + (parseFloat(tx.amount) || 0), 0);
            setExpectedAmount(dailyTotal);
        }
    }, [isOpen, data]);

    const handleNumericInput = (val) => {
        const cleaned = val.replace(/[^0-9.]/g, '');
        setActualAmount(cleaned);
    };

    if (!isOpen) return null;

    const diff = (parseFloat(actualAmount) || 0) - expectedAmount;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== settings.adminPassword) {
            window.showToast?.('كلمة مرور المدير غير صحيحة', 'danger');
            return;
        }

        const backup = exportData();
        const now = new Date();
        const blob = new Blob([backup], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_${now.toISOString().split('T')[0]}.txt`;
        link.click();

        printEndSessionReport(expectedAmount, parseFloat(actualAmount) || 0, diff, settings);

        onFinish();
    };

    return (
        <div className="modal-overlay">
            <div className="modal card" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--danger-color)' }}>
                        <Power size={24} />
                        <h2 style={{ margin: 0 }}>إغلاق اليومية</h2>
                    </div>
                    <button className="btn-icon" onClick={onClose}>&times;</button>
                </div>

                <div className="summary-box" style={{
                    background: 'var(--bg-input)',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: '1.5rem',
                    border: '1px solid var(--border-color)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>المبيعات النقدية اليوم (بالنظام):</span>
                        <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{expectedAmount.toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                        تشمل: الدفعات الكاملة والجزئية وسداد الديون المستلمة اليوم.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>المبلغ الموجود فعلياً في الخزنة</label>
                        <input
                            type="text"
                            required
                            autoFocus
                            placeholder="أدخل المبلغ..."
                            value={actualAmount}
                            onChange={(e) => handleNumericInput(e.target.value)}
                        />
                    </div>

                    {actualAmount && (
                        <div style={{
                            marginBottom: '1.5rem',
                            fontWeight: 700,
                            color: diff === 0 ? 'var(--success-color)' : (diff < 0 ? 'var(--danger-color)' : 'var(--success-color)')
                        }}>
                            الفرق: {diff === 0 ? 'مطابق (0)' : (diff < 0 ? `عجز (${Math.abs(diff).toLocaleString()})` : `زيادة (${diff.toLocaleString()})`)}
                        </div>
                    )}

                    <div className="form-group">
                        <label>كلمة مرور المدير للتأكيد</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                required
                                placeholder="كلمة المرور..."
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <ShieldCheck size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                        </div>
                    </div>

                    <div className="modal-footer" style={{ border: 'none', padding: 0, marginTop: '2rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', background: 'var(--danger-color)', border: 'none' }}>
                            إغلاق وطباعة ونسخ احتياطي
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EndSessionModal;
