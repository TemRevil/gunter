import React, { useState, useContext } from 'react';
import {
    Users, Search, Plus, Phone, MapPin,
    UserPlus, Clock, Printer, Trash2, PenTool
} from 'lucide-react';
import { StoreContext } from '../store/StoreContext';
import Modal from '../components/Modal';
import DropdownMenu from '../components/DropdownMenu';

const Customers = () => {
    const {
        customers, operations, deleteCustomer,
        addCustomer, updateCustomer
    } = useContext(StoreContext);

    const [searchTerm, setSearchTerm] = useState('');
    const [showFormModal, setShowFormModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerForm, setCustomerForm] = useState({ id: '', name: '', phone: '', address: '' });

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
    );

    const handleNumericInput = (val) => {
        const cleaned = val.replace(/[^0-9]/g, '');
        setCustomerForm(prev => ({ ...prev, phone: cleaned }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (isEditMode) {
            updateCustomer(customerForm.id, {
                name: customerForm.name,
                phone: customerForm.phone,
                address: customerForm.address
            });
            window.showToast?.('تم تحديث بيانات العميل', 'success');
        } else {
            addCustomer(customerForm);
            window.showToast?.('تم إضافة العميل بنجاح', 'success');
        }
        setCustomerForm({ id: '', name: '', phone: '', address: '' });
        setShowFormModal(false);
    };

    const openAdd = () => {
        setIsEditMode(false);
        setCustomerForm({ id: '', name: '', phone: '', address: '' });
        setShowFormModal(true);
    };

    const openEdit = (customer) => {
        setIsEditMode(true);
        setCustomerForm({
            id: customer.id,
            name: customer.name,
            phone: customer.phone || '',
            address: customer.address || ''
        });
        setShowFormModal(true);
    };

    const openHistory = (customer) => {
        setSelectedCustomer(customer);
        setShowHistoryModal(true);
    };

    const customerOps = selectedCustomer
        ? operations.filter(op => op.customerId === selectedCustomer.id)
        : [];

    return (
        <div className="view-container">
            <header className="view-header">
                <div className="view-title">
                    <div className="view-icon">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1>العملاء</h1>
                        <p>إدارة بيانات العملاء والتعاملات</p>
                    </div>
                </div>
                <div className="view-actions">
                    <div className="search-box">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="بحث عن عميل..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={openAdd}>
                        <UserPlus size={18} /> عميل جديد
                    </button>
                </div>
            </header>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '25%' }}>الاسم</th>
                            <th style={{ width: '20%' }}>رقم الهاتف</th>
                            <th style={{ width: '30%' }}>العنوان</th>
                            <th style={{ width: '15%' }}>الرصيد/الدين</th>
                            <th style={{ width: '10%', textAlign: 'center' }}>العمليات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map(customer => (
                                <tr key={customer.id}>
                                    <td
                                        className="font-medium cursor-pointer hover-underline text-accent"
                                        onClick={() => openHistory(customer)}
                                    >
                                        {customer.name}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Phone size={14} className="text-secondary" />
                                            <span style={{ fontFamily: 'monospace' }}>{customer.phone || '-'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <MapPin size={14} className="text-secondary" />
                                            <span style={{ fontSize: '0.9rem' }}>{customer.address || '-'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${(customer.balance || 0) > 0 ? 'danger' : 'success'}`}>
                                            {(customer.balance || 0).toLocaleString()} {(customer.balance || 0) > 0 ? '(دين)' : ''}
                                        </span>
                                    </td>
                                    <td>
                                        <DropdownMenu options={[
                                            {
                                                label: 'السجل والديون',
                                                icon: <Clock size={16} />,
                                                onClick: () => openHistory(customer)
                                            },
                                            {
                                                label: 'تعديل البيانات',
                                                icon: <PenTool size={16} />,
                                                onClick: () => openEdit(customer)
                                            },
                                            {
                                                label: 'حذف العميل',
                                                icon: <Trash2 size={16} />,
                                                className: 'danger',
                                                onClick: () => {
                                                    window.customConfirm?.('تأكيد الحذف', `هل أنت متأكد من حذف العميل "${customer.name}"؟ سيتم حذف جميع تعاملاته أيضاً.`, () => {
                                                        deleteCustomer(customer.id);
                                                        window.showToast?.('تم حذف العميل', 'success');
                                                    });
                                                }
                                            }
                                        ]} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                    لا يوجد عملاء مطابقين للبحث
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Customer Form Modal */}
            <Modal
                show={showFormModal}
                onClose={() => setShowFormModal(false)}
                title={isEditMode ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
            >
                <form onSubmit={handleFormSubmit}>
                    <div className="form-group">
                        <label>اسم العميل</label>
                        <input
                            type="text"
                            required
                            value={customerForm.name}
                            onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                            placeholder="أدخل اسم العميل"
                        />
                    </div>
                    <div className="form-group">
                        <label>رقم الهاتف</label>
                        <input
                            type="text"
                            value={customerForm.phone}
                            onChange={(e) => handleNumericInput(e.target.value)}
                            placeholder="01xxxxxxxxx"
                        />
                    </div>
                    <div className="form-group">
                        <label>العنوان</label>
                        <textarea
                            value={customerForm.address}
                            onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                            placeholder="أدخل العنوان بالتفصيل"
                            style={{
                                width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)', background: 'var(--bg-input)',
                                color: 'var(--text-primary)', minHeight: '100px', fontFamily: 'inherit'
                            }}
                        />
                    </div>
                    <div className="modal-footer" style={{ border: 'none', padding: 0, marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowFormModal(false)}>إلغاء</button>
                        <button type="submit" className="btn btn-primary">{isEditMode ? "حفظ التعديلات" : "حفظ العميل"}</button>
                    </div>
                </form>
            </Modal>

            {/* History Modal */}
            <Modal
                show={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                title={`سجل تعاملات: ${selectedCustomer?.name}`}
            >
                <div className="summary-box" style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>إجمالي المديونية الحالية:</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: (selectedCustomer?.balance || 0) > 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
                            {(selectedCustomer?.balance || 0).toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="table-container" style={{ maxHeight: '400px' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>البيان</th>
                                <th>المبلغ</th>
                                <th>المدفوع</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customerOps.length > 0 ? customerOps.map(op => (
                                <tr key={op.id}>
                                    <td style={{ fontSize: '0.8rem', opacity: 0.7 }}>{new Date(op.timestamp).toLocaleDateString('ar-EG')}</td>
                                    <td className="font-medium">{op.partName} x {op.quantity}</td>
                                    <td>{op.price.toLocaleString()}</td>
                                    <td className="text-success font-medium">{op.paidAmount.toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>لا توجد تعاملات مسجلة لهذا العميل</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Modal>
        </div>
    );
};

export default Customers;
