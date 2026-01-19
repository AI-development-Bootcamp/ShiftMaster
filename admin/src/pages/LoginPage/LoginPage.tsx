import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginWelcomeCard } from '../../components/LoginWelcomeCard';
import '../../styles/LoginPage.css';

export function LoginPage() {
    const navigate = useNavigate();

    const [error, setError] = useState<string | null>(null);

    const handleLogin = (email: string, password?: string) => {
        // Visual-only flow requested by user:
        // Just navigate to the next page if fields are present.
        if (email && password) {
            navigate('/assignment');
        } else {
            setError('אנא הזן אימייל וסיסמה');
        }
    };

    return (
        <div className="login-page">
            <LoginWelcomeCard onLogin={handleLogin} error={error} />
        </div>
    );
}
