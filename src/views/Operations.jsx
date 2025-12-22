import React, { useState, useContext, useEffect, useRef } from 'react';
import {
    CalendarCheck, Search, Plus, Trash2,
    Printer, Clock, User, Package, DollarSign
} from 'lucide-react';
import { StoreContext } from '../store/StoreContext';
import Modal from '../components/Modal';
import DropdownMenu from '../components/DropdownMenu';
import { printReceipt } from '../utils/printing';

const CustomAutocomplete = ({ label, items, value, onSelect, placeholder, icon: Icon, displaySubtext }) => {
    const [inputValue, setInputValue] = useState(value || '');
    const [showList, setShowList] = useState(false);
    const containerRef = useRef(null);

    const filtered = items.filter(item =>
        item.name.toLowerCase().includes(inputValue.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setShowList(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="form-group" ref={containerRef} style={{ position: 'relative' }}>
            <label>{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowList(true);
                        onSelect({ name: e.target.value, id: '' });
                    }}
                    onFocus={() => setShowList(true)}
                    placeholder={placeholder}
                    required
                />
                {Icon && <Icon size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />}
            </div>
            {showList && filtered.length > 0 && (
                <div className="action-menu show" style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    width: 'auto', maxHeight: '200px', overflowY: 'auto'
                }}>
                    {filtered.map(item => (
                        <div
                            key={item.id}
                            className="action-menu-item"
                            onClick={() => {
                                setInputValue(item.name);
                                onSelect(item);
                                setShowList(false);
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span>{item.name}</span>
                                {displaySubtext && <small style={{ opacity: 0.6 }}>{displaySubtext(item)}</small>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const Operations = () => {
    const {
        operations, parts, customers,
        addOperation, deleteOperation, settings,
        addCustomer
    } = useContext(StoreContext);

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        customerId: '',
        customerName: '',
        partId: '',
        partName: '',
        quantity: '1',
        price: '0',
        paidAmount: '0',
        paymentStatus: 'paid'
    });

    const filteredOps = operations.filter(op =>
        op.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.partName.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const handlePartSelect = (part) => {
        if (part.id) {
            const qty = parseInt(formData.quantity) || 0;
            const newPrice = part.price * qty;
            setFormData(prev => ({
                ...prev,
                partId: part.id,
                partName: part.name,
                price: String(newPrice),
                paidAmount: prev.paymentStatus === 'paid' ? String(newPrice) : prev.paidAmount
            }));
        } else {
            setFormData(prev => ({ ...prev, partName: part.name, partId: '' }));
        }
    };

    const handleNumericInput = (field, value, isFloat = false) => {
        const regex = isFloat ? /[^0-9.]/g : /[^0-9]/g;
        const cleaned = value.replace(regex, '');
        // For price calculation update if field is quantity
        setFormData(prev => {
            let next = { ...prev, [field]: cleaned };
            if (field === 'quantity') {
                const part = parts.find(p => p.id === formData.partId);
                const qtyVal = parseInt(cleaned) || 0;
                const newPrice = part ? part.price * qtyVal : prev.price;
                next.price = String(newPrice);
                if (prev.paymentStatus === 'paid') next.paidAmount = String(newPrice);
            }
            return next;
        });
    };

    const handleCustomerSelect = (cust) => {
        setFormData(prev => ({
            ...prev,
            customerId: cust.id || '',
            customerName: cust.name
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let finalCustomerId = formData.customerId;
        if (!finalCustomerId) {
            const newCust = addCustomer({ name: formData.customerName, phone: '', address: '' });
            finalCustomerId = newCust.id;
        }

        const total = parseFloat(formData.price) || 0;
        const opData = {
            ...formData,
            customerId: finalCustomerId,
            quantity: parseInt(formData.quantity) || 1,
            price: total,
            paidAmount: formData.paymentStatus === 'paid' ? total : (formData.paymentStatus === 'unpaid' ? 0 : parseFloat(formData.paidAmount || 0))
        };

        const newOp = addOperation(opData);
        setShowModal(false);
        setFormData({ customerId: '', customerName: '', partId: '', partName: '', quantity: '1', price: '0', paidAmount: '0', paymentStatus: 'paid' });

        if (window.customConfirm) {
            window.customConfirm('عملية بيع ناجحة', 'هل تريد طباعة الفاتورة الآن؟', () => {
                printReceipt(newOp, settings);
            });
        }
    };

    return (
        <div className="view-container">
            <header className="view-header">
                <div className="view-title">
                    <div className="view-icon">
                        <CalendarCheck size={24} />
                    </div>
                    <div>
                        <h1>العمليات اليومية</h1>
                        <p>سجل المبيعات والتعاملات الحالية</p>
                    </div>
                </div>
                <div className="view-actions">
                    <div className="search-box">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="بحث في العمليات..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={18} /> عملية جديدة
                    </button>
                </div>
            </header>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '15%' }}>الوقت</th>
                            <th style={{ width: '20%' }}>العميل</th>
                            <th style={{ width: '20%' }}>القطعة</th>
                            <th style={{ width: '10%' }}>الكمية</th>
                            <th style={{ width: '15%' }}>الإجمالي</th>
                            <th style={{ width: '10%' }}>الحالة</th>
                            <th style={{ width: '10%', textAlign: 'center' }}>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOps.length > 0 ? (
                            filteredOps.map(op => (
                                <tr key={op.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.7 }}>
                                            <Clock size={14} />
                                            <span dir="ltr">{new Date(op.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="font-medium">{op.customerName}</td>
                                    <td>{op.partName}</td>
                                    <td style={{ textAlign: 'center' }}>{op.quantity}</td>
                                    <td className="font-medium">{op.price.toLocaleString()}</td>
                                    <td>
                                        <span className={`badge ${op.paymentStatus === 'paid' ? 'success' : 'warning'}`}>
                                            {op.paymentStatus === 'paid' ? 'مدفوع' : (op.paymentStatus === 'partial' ? 'جزئي' : 'دين')}
                                        </span>
                                    </td>
                                    <td>
                                        <DropdownMenu options={[
                                            {
                                                label: 'طباعة الفاتورة',
                                                icon: <Printer size={16} />,
                                                onClick: () => printReceipt(op, settings)
                                            },
                                            {
                                                label: 'حذف العملية',
                                                icon: <Trash2 size={16} />,
                                                className: 'danger',
                                                onClick: () => {
                                                    window.customConfirm?.('تأكيد الحذف', 'هل أنت متأكد من حذف هذه العملية؟ سيتم استرجاع الكمية للمخزن وتعديل مديونية العميل.', () => {
                                                        deleteOperation(op.id);
                                                        window.showToast?.('تم حذف العملية', 'success');
                                                    });
                                                }
                                            }
                                        ]} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                    {searchTerm ? 'لا توجد نتائج تطابق بحثك' : 'لا توجد عمليات مسجلة اليوم'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                title="إضافة عملية بيع جديدة"
            >
                <form onSubmit={handleSubmit}>
                    <CustomAutocomplete
                        label="العميل"
                        items={customers}
                        value={formData.customerName}
                        onSelect={handleCustomerSelect}
                        placeholder="اختر عميل أو اكتب اسم جديد..."
                        icon={User}
                        displaySubtext={(c) => c.phone ? `هاتف: ${c.phone}` : ''}
                    />

                    <CustomAutocomplete
                        label="القطعة"
                        items={parts.filter(p => p.quantity > 0)}
                        value={formData.partName}
                        onSelect={handlePartSelect}
                        placeholder="اختر قطعة من المخزن..."
                        icon={Package}
                        displaySubtext={(p) => `متوفر: ${p.quantity} - السعر: ${p.price}`}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>الكمية</label>
                            <input
                                type="text"
                                required
                                value={formData.quantity}
                                onChange={(e) => handleNumericInput('quantity', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>إجمالي السعر</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    required
                                    readOnly
                                    value={formData.price}
                                    style={{ background: 'var(--bg-input)' }}
                                />
                                <DollarSign size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>نوع الدفع</label>
                        <select
                            value={formData.paymentStatus}
                            onChange={(e) => {
                                const status = e.target.value;
                                setFormData(prev => ({
                                    ...prev,
                                    paymentStatus: status,
                                    paidAmount: status === 'paid' ? prev.price : (status === 'unpaid' ? '0' : prev.paidAmount)
                                }));
                            }}
                        >
                            <option value="paid">مدفوع بالكامل</option>
                            <option value="partial">دفع جزئي</option>
                            <option value="unpaid">آجل (دين)</option>
                        </select>
                    </div>

                    {formData.paymentStatus === 'partial' && (
                        <div className="form-group">
                            <label>المبلغ المدفوع</label>
                            <input
                                type="text"
                                required
                                placeholder="0"
                                value={formData.paidAmount}
                                onChange={(e) => handleNumericInput('paidAmount', e.target.value, true)}
                            />
                        </div>
                    )}

                    <div className="modal-footer" style={{ border: 'none', padding: 0, marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>إلغاء</button>
                        <button type="submit" className="btn btn-primary">حفظ العملية</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Operations;
