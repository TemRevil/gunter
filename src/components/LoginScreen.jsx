import React, { useState } from 'react';
import { Lock } from 'lucide-react';

const LoginScreen = ({ onLogin }) => {
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(password);
    };

    return (
        <div className="login-overlay">
            <div className="login-box card shadow-2xl">
                <h2><Lock size={24} /> الدخول للنظام</h2>
                <p>برجاء إدخال كلمة مرور النظام للمتابعة</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="كلمة المرور..."
                        required
                        autoFocus
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                        دخول
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginScreen;
