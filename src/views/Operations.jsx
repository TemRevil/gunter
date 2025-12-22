import React, { useState, useContext, useEffect, useRef } from 'react';
import {
    CalendarCheck, Search, Plus, Trash2,
    Printer, Clock, User, Package, DollarSign
} from 'lucide-react';
import { StoreContext } from '../store/StoreContext';
import Modal from '../components/Modal';
import DropdownMenu from '../components/DropdownMenu';
import { printReceipt } from '../utils/printing';
import CustomerForm from '../components/CustomerForm';
import PartForm from '../components/PartForm';
import CustomDatePicker from '../components/CustomDatePicker';

const CustomAutocomplete = ({ label, items, value, onSelect, onAddNew, placeholder, icon: Icon, displaySubtext }) => {
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

    // Sync input when value prop changes externally
    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    return (
        <div className="form-group" ref={containerRef} style={{ position: 'relative' }}>
            <label>{label}</label>
            <div className="input-with-icon">
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
                {Icon && <Icon size={16} />}
            </div>
            {showList && (inputValue || filtered.length > 0) && (
                <div className="action-menu show" style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    width: 'auto', maxHeight: '200px', overflowY: 'auto'
                }}>
                    {filtered.map(item => (
                        <div
                            key={item.id || item.name}
                            className="action-menu-item"
                            onClick={() => {
                                setInputValue(item.name);
                                onSelect(item);
                                setShowList(false);
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span>{item.name}</span>
                                {displaySubtext && item.id && <small style={{ opacity: 0.6 }}>{displaySubtext(item)}</small>}
                            </div>
                        </div>
                    ))}
                    {onAddNew && inputValue.trim() && !filtered.some(i => i.name.toLowerCase() === inputValue.toLowerCase()) && (
                        <div
                            className="action-menu-item"
                            style={{ borderTop: '1px solid var(--border-color)', color: 'var(--accent-color)', fontWeight: 700 }}
                            onClick={() => {
                                onAddNew(inputValue);
                                setShowList(false);
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Plus size={14} />
                                <span>{(settings.language === 'ar' ? 'إضافة ' : 'Add ') + `"${inputValue}"` + (settings.language === 'ar' ? ' كجديد...' : ' as new...')}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const Operations = () => {
    const {
        operations, parts, customers,
        addOperation, deleteOperation, settings,
        addCustomer, addPart, t
    } = useContext(StoreContext);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showModal, setShowModal] = useState(false);

    // Quick Add States
    const [showQuickCust, setShowQuickCust] = useState(false);
    const [showQuickPart, setShowQuickPart] = useState(false);
    const [quickName, setQuickName] = useState('');

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

    const handleQuickCustSubmit = (data) => {
        const newCust = addCustomer(data);
        setFormData(prev => ({ ...prev, customerId: newCust.id, customerName: newCust.name }));
        setShowQuickCust(false);
        window.showToast?.('تم إضافة العميل بنجاح', 'success');
    };

    const handleQuickPartSubmit = (data) => {
        const newPart = addPart(data);
        setFormData(prev => ({
            ...prev,
            partId: newPart.id,
            partName: newPart.name,
            price: String(newPart.price * (parseInt(prev.quantity) || 1)),
            paidAmount: prev.paymentStatus === 'paid' ? String(newPart.price * (parseInt(prev.quantity) || 1)) : prev.paidAmount
        }));
        setShowQuickPart(false);
        window.showToast?.('تم إضافة القطعة للمخزن', 'success');
    };

    const filteredOps = operations.filter(op => {
        const opDate = op.timestamp.split('T')[0];
        const matchesSearch = op.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            op.partName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDate = !selectedDate || opDate === selectedDate;
        return matchesSearch && matchesDate;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

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

        // 1. Validate Part Selection (Must be from storage)
        if (!formData.partId) {
            window.showToast?.('يرجى اختيار قطعة موجودة في المخزن أولاً', 'danger');
            return;
        }

        // 2. Validate Customer (Name is required)
        if (!formData.customerName.trim()) {
            window.showToast?.('يرجى تحديد العميل', 'danger');
            return;
        }

        let finalCustomerId = formData.customerId;
        // Automatically add as a new customer if not selected from list (but has a name)
        if (!finalCustomerId) {
            const newCust = addCustomer({ name: formData.customerName.trim(), phone: '', address: '' });
            finalCustomerId = newCust.id;
        }

        const total = parseFloat(formData.price) || 0;
        const opData = {
            ...formData,
            customerId: finalCustomerId,
            customerName: formData.customerName.trim(),
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
                        <h1>{t('operations')}</h1>
                        <p>{settings.language === 'ar' ? 'سجل المبيعات والتعاملات الحالية' : 'Daily sales and current transactions log'}</p>
                    </div>
                </div>
                <div className="view-actions">
                    <CustomDatePicker
                        value={selectedDate}
                        onChange={(val) => setSelectedDate(val)}
                    />
                    <div className="search-box">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder={t('search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {selectedDate === new Date().toISOString().split('T')[0] && (
                        <button className="btn btn-primary" onClick={() => {
                            if (settings?.security?.authOnAddOperation) {
                                window.requestAdminAuth?.(() => setShowModal(true), settings.language === 'ar' ? 'تأكيد الهوية لإدراج عملية جديدة' : 'Identity confirmation to insert new operation');
                            } else {
                                setShowModal(true);
                            }
                        }}>
                            <Plus size={18} /> {t('newOperation')}
                        </button>
                    )}
                </div>
            </header>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '15%' }}>{t('time')}</th>
                            <th style={{ width: '20%' }}>{t('customer')}</th>
                            <th style={{ width: '20%' }}>{t('part')}</th>
                            <th style={{ width: '10%', textAlign: 'center' }}>{t('qty')}</th>
                            <th style={{ width: '15%', textAlign: 'center' }}>{t('total')}</th>
                            <th style={{ width: '10%', textAlign: 'center' }}>{t('status')}</th>
                            <th style={{ width: '10%', textAlign: 'center' }}>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOps.length > 0 ? (
                            filteredOps.map(op => (
                                <tr key={op.id}>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', opacity: 0.8 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                <Clock size={12} className="text-accent" />
                                                <span dir="ltr" style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                                                    {new Date(op.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <div className="settings-button-grid">
                                                <span dir="ltr" style={{ fontSize: 'var(--fs-xs)' }}>
                                                    {new Date(op.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="font-medium">{op.customerName}</td>
                                    <td>{op.partName}</td>
                                    <td style={{ textAlign: 'center' }}>{op.quantity}</td>
                                    <td className="font-medium" style={{ textAlign: 'center' }}>{op.price.toLocaleString()}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className={`badge ${op.paymentStatus === 'paid' ? 'success' : 'warning'}`}>
                                            {op.paymentStatus === 'paid' ? t('fullyPaid') : (op.paymentStatus === 'partial' ? t('partial') : t('debt'))}
                                        </span>
                                    </td>
                                    <td>
                                        <DropdownMenu options={[
                                            {
                                                label: t('preview'),
                                                icon: <Printer size={16} />,
                                                onClick: () => printReceipt(op, settings)
                                            },
                                            {
                                                label: t('delete'),
                                                icon: <Trash2 size={16} />,
                                                className: 'danger',
                                                onClick: () => {
                                                    const performDelete = () => {
                                                        window.customConfirm?.(t('delete'), settings.language === 'ar' ? 'هل أنت متأكد من حذف هذه العملية؟ سيتم استرجاع الكمية للمخزن وتعديل مديونية العميل.' : 'Are you sure you want to delete this operation? Stock quantity will be restored and customer debt will be adjusted.', () => {
                                                            deleteOperation(op.id);
                                                            window.showToast?.(t('delete'), 'success');
                                                        });
                                                    };

                                                    if (settings?.security?.authOnDeleteOperation) {
                                                        window.requestAdminAuth?.(performDelete, settings.language === 'ar' ? 'تأكيد الهوية لحذف العملية' : 'Identity confirmation to delete operation');
                                                    } else {
                                                        performDelete();
                                                    }
                                                }
                                            }
                                        ]} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                    {searchTerm || selectedDate ? (settings.language === 'ar' ? 'لا توجد نتائج تطابق بحثك و تاريخك بالتحديد' : 'No results matching your search and specific date') : t('noOperations')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                title={t('newOperation')}
            >
                <form onSubmit={handleSubmit}>
                    <CustomAutocomplete
                        label={t('customer')}
                        items={customers}
                        value={formData.customerName}
                        onSelect={handleCustomerSelect}
                        onAddNew={(val) => {
                            setQuickName(val);
                            setShowQuickCust(true);
                        }}
                        placeholder={settings.language === 'ar' ? 'اختر عميل أو اكتب اسم جديد...' : 'Choose customer or type new name...'}
                        icon={User}
                        displaySubtext={(c) => c.phone ? `${t('phone')}: ${c.phone}` : ''}
                    />

                    <CustomAutocomplete
                        label={t('part')}
                        items={parts.filter(p => p.quantity > 0)}
                        value={formData.partName}
                        onSelect={handlePartSelect}
                        onAddNew={(val) => {
                            setQuickName(val);
                            setShowQuickPart(true);
                        }}
                        placeholder={settings.language === 'ar' ? 'يجب اختيار قطعة مسجلة بالمخزن...' : 'Must choose a piece registered in stock...'}
                        icon={Package}
                        displaySubtext={(p) => `${settings.language === 'ar' ? 'متوفر' : 'Available'}: ${p.quantity} - ${t('price')}: ${p.price}`}
                    />

                    <div className="settings-button-grid">
                        <div className="form-group">
                            <label>{t('qty')}</label>
                            <input
                                type="text"
                                required
                                value={formData.quantity}
                                onChange={(e) => handleNumericInput('quantity', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>{settings.language === 'ar' ? 'إجمالي السعر' : 'Total Price'}</label>
                            <div className="input-with-icon">
                                <input
                                    type="text"
                                    required
                                    readOnly
                                    value={formData.price}
                                    style={{ background: 'var(--bg-input)' }}
                                />
                                <DollarSign size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t('paymentStatus')}</label>
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
                            <option value="paid">{t('fullyPaid')}</option>
                            <option value="partial">{t('partial')}</option>
                            <option value="unpaid">{t('unpaid')}</option>
                        </select>
                    </div>

                    {formData.paymentStatus === 'partial' && (
                        <div className="form-group">
                            <label>{t('paidAmount')}</label>
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
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t('cancel')}</button>
                        <button type="submit" className="btn btn-primary">{settings.language === 'ar' ? 'حفظ العملية' : 'Save Operation'}</button>
                    </div>
                </form>
            </Modal>

            {/* Quick Add Customer Modal */}
            <Modal
                show={showQuickCust}
                onClose={() => setShowQuickCust(false)}
                title={settings.language === 'ar' ? 'إضافة عميل جديد بسرعة' : 'Quick Add New Customer'}
            >
                <CustomerForm
                    initialData={{ name: quickName }}
                    onSubmit={handleQuickCustSubmit}
                    onCancel={() => setShowQuickCust(false)}
                />
            </Modal>

            {/* Quick Add Part Modal */}
            <Modal
                show={showQuickPart}
                onClose={() => setShowQuickPart(false)}
                title={t('addPart')}
            >
                <PartForm
                    initialData={{ name: quickName }}
                    onSubmit={handleQuickPartSubmit}
                    onCancel={() => setShowQuickPart(false)}
                />
            </Modal>
        </div>
    );
};

export default Operations;
