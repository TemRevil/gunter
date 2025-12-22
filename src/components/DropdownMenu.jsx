import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical } from 'lucide-react';

const DropdownMenu = ({ options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="action-cell" ref={menuRef}>
            <button className="btn-icon" onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
            }}>
                <MoreVertical size={18} />
            </button>
            <div className={`action-menu ${isOpen ? 'show' : ''}`} onClick={e => e.stopPropagation()}>
                {options.map((opt, i) => (
                    <div
                        key={i}
                        className={`action-menu-item ${opt.className || ''}`}
                        onClick={() => {
                            opt.onClick();
                            setIsOpen(false);
                        }}
                    >
                        {opt.icon}
                        <span>{opt.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DropdownMenu;
