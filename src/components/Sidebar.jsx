import React from 'react';
import { CalendarCheck, Boxes, Users, Bell, Settings, Power } from 'lucide-react';

const Sidebar = ({ currentTab, setTab, onLogout, notificationsCount, isMobileShow }) => {
    const menuItems = [
        { id: 'operations', label: 'العمليات', icon: CalendarCheck },
        { id: 'storage', label: 'المخزن', icon: Boxes },
        { id: 'customers', label: 'العملاء', icon: Users },
        { id: 'notifications', label: 'التنبيهات', icon: Bell, badge: notificationsCount },
        { id: 'settings', label: 'الإعدادات', icon: Settings },
    ];

    return (
        <aside className={`sidebar ${isMobileShow ? 'show' : ''}`}>
            <div className="brand">
                <i className="fa-solid fa-gears" style={{ fontSize: '2rem' }}></i>
                <h2>الميكانيكي</h2>
            </div>
            <nav>
                <ul className="nav-links">
                    {menuItems.map(item => (
                        <li
                            key={item.id}
                            className={currentTab === item.id ? 'active' : ''}
                            onClick={() => setTab(item.id)}
                        >
                            <div className="nav-item-group">
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </div>
                            {item.badge > 0 && <span className="badge">{item.badge}</span>}
                        </li>
                    ))}
                    <li className="nav-logout" onClick={onLogout}>
                        <div className="nav-item-group">
                            <Power size={20} />
                            <span>إغلاق اليومية</span>
                        </div>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
