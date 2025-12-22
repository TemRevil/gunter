import React, { useState, useContext } from 'react';
import { Boxes, Search, Plus, Trash2, PenTool, AlertTriangle, Hash, DollarSign } from 'lucide-react';
import { StoreContext } from '../store/StoreContext';
import Modal from '../components/Modal';
import DropdownMenu from '../components/DropdownMenu';

const Storage = () => {
    const { parts, addPart, updatePart, deletePart } = useContext(StoreContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [showStockModal, setShowStockModal] = useState(false);
    const [stockAmount, setStockAmount] = useState('0');

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        quantity: '0',
        price: '0',
        threshold: '5'
    });

    const filteredParts = parts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.code && p.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleNumericInput = (field, value, isFloat = false, setter) => {
        const regex = isFloat ? /[^0-9.]/g : /[^0-9]/g;
        const cleaned = value.replace(regex, '');
        setter(prev => typeof prev === 'string' ? cleaned : { ...prev, [field]: cleaned });
    };

    const handleOpenAdd = () => {
        setEditMode(false);
        setFormData({ name: '', code: '', quantity: '0', price: '0', threshold: '5' });
        setShowModal(true);
    };

    const handleOpenEdit = (part) => {
        setEditMode(true);
        setSelectedId(part.id);
        setFormData({
            name: part.name,
            code: part.code || '',
            quantity: String(part.quantity),
            price: String(part.price),
            threshold: String(part.threshold || 5)
        });
        setShowModal(true);
    };

    const handleOpenStock = (part) => {
        setSelectedId(part.id);
        setStockAmount('0');
        setShowStockModal(true);
    };

    const handleStockSubmit = (e) => {
        e.preventDefault();
        const part = parts.find(p => p.id === selectedId);
        if (part) {
            updatePart(selectedId, { quantity: part.quantity + (parseInt(stockAmount) || 0) });
            window.showToast?.('تم تحديث المخزون بنجاح', 'success');
        }
        setShowStockModal(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            quantity: parseInt(formData.quantity) || 0,
            price: parseFloat(formData.price) || 0,
            threshold: parseInt(formData.threshold) || 5
        };
        if (editMode) {
            updatePart(selectedId, data);
            window.showToast?.('تم تعديل القطعة بنجاح', 'success');
        } else {
            addPart(data);
            window.showToast?.('تم إضافة القطعة للمخزن', 'success');
        }
        setShowModal(false);
    };

    return (
        <div className="view-container">
            <header className="view-header">
                <div className="view-title">
                    <div className="view-icon">
                        <Boxes size={24} />
                    </div>
                    <div>
                        <h1>المخزن</h1>
                        <p>إدارة قطع الغيار والمخزون</p>
                    </div>
                </div>
                <div className="view-actions">
                    <div className="search-box">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="بحث عن قطعة..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={handleOpenAdd}>
                        <Plus size={18} /> إضافة قطعة
                    </button>
                </div>
            </header>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '30%' }}>الاسم</th>
                            <th style={{ width: '15%' }}>الكود</th>
                            <th style={{ width: '15%' }}>الكمية</th>
                            <th style={{ width: '15%' }}>السعر</th>
                            <th style={{ width: '15%' }}>الحالة</th>
                            <th style={{ width: '10%', textAlign: 'center' }}>العمليات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredParts.length > 0 ? (
                            filteredParts.map(part => (
                                <tr key={part.id}>
                                    <td className="font-medium">{part.name}</td>
                                    <td>{part.code || '-'}</td>
                                    <td style={{ textAlign: 'center' }}>{part.quantity}</td>
                                    <td>{part.price.toLocaleString()}</td>
                                    <td>
                                        {part.quantity <= (part.threshold || 5) && part.quantity > 0 ? (
                                            <span className="badge warning">
                                                <AlertTriangle size={12} style={{ marginLeft: '4px' }} />
                                                منخفض
                                            </span>
                                        ) : part.quantity === 0 ? (
                                            <span className="badge danger">نفذ</span>
                                        ) : (
                                            <span className="badge success">متوفر</span>
                                        )}
                                    </td>
                                    <td>
                                        <DropdownMenu options={[
                                            {
                                                label: 'تعديل البيانات',
                                                icon: <PenTool size={16} />,
                                                onClick: () => handleOpenEdit(part)
                                            },
                                            {
                                                label: 'إضافة مخزون',
                                                icon: <Plus size={16} />,
                                                onClick: () => handleOpenStock(part)
                                            },
                                            {
                                                label: 'حذف من المخزن',
                                                icon: <Trash2 size={16} />,
                                                className: 'danger',
                                                onClick: () => {
                                                    window.customConfirm?.('تأكيد الحذف', `هل أنت متأكد من حذف القطعة "${part.name}" نهائياً من المخزن؟`, () => {
                                                        deletePart(part.id);
                                                        window.showToast?.('تم حذف القطعة', 'success');
                                                    });
                                                }
                                            }
                                        ]} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                    {searchTerm ? 'لا توجد نتائج تطابق بحثك' : 'المخزن فارغ حالياً'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Main Part Modal */}
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                title={editMode ? "تعديل بيانات قطعة" : "إضافة قطعة جديدة للمخزن"}
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>اسم القطعة</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>الكود (اختياري)</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            />
                            <Hash size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>الكمية الحالية</label>
                            <input
                                type="text"
                                required
                                value={String(formData.quantity ?? '0')}
                                onChange={(e) => handleNumericInput('quantity', e.target.value, false, setFormData)}
                            />
                        </div>
                        <div className="form-group">
                            <label>سعر البيع</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    required
                                    value={String(formData.price ?? '0')}
                                    onChange={(e) => handleNumericInput('price', e.target.value, true, setFormData)}
                                />
                                <DollarSign size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>تنبيه نقص المخزون عند وصول الكمية لـ</label>
                        <input
                            type="text"
                            required
                            value={String(formData.threshold ?? '5')}
                            onChange={(e) => handleNumericInput('threshold', e.target.value, false, setFormData)}
                        />
                    </div>

                    <div className="modal-footer" style={{ border: 'none', padding: 0, marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>إلغاء</button>
                        <button type="submit" className="btn btn-primary">{editMode ? "تعديل القطعة" : "إضافة للمخزن"}</button>
                    </div>
                </form>
            </Modal>

            {/* Quick Stock Modal */}
            <Modal
                show={showStockModal}
                onClose={() => setShowStockModal(false)}
                title="تحديث كمية المخزون"
            >
                <form onSubmit={handleStockSubmit}>
                    <div className="form-group">
                        <label>الكمية المراد إضافتها لـ {parts.find(p => p.id === selectedId)?.name}</label>
                        <input
                            type="text"
                            required
                            autoFocus
                            value={String(stockAmount ?? '0')}
                            onChange={(e) => handleNumericInput('stockAmount', e.target.value, false, setStockAmount)}
                            placeholder="أدخل الكمية..."
                        />
                    </div>
                    <div className="modal-footer" style={{ border: 'none', padding: 0, marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowStockModal(false)}>إلغاء</button>
                        <button type="submit" className="btn btn-primary">إضافة للمخزن</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Storage;
