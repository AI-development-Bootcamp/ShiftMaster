import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginWelcomeCard } from '../../components/LoginWelcomeCard';
import '../../styles/LoginPage.css';

export function LoginPage() {
    const navigate = useNavigate();

    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (email: string, password?: string) => {
        try {
            setError(null);
            // TODO: Replace with actual auth service call
            // await authService.login(email, password);

            // Temporary simulation for dev
            if (email && password && password.length >= 6) {
                // Simulate success
                navigate('/assignment');
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (err) {
            // Log non-sensitive error details only
            console.error('Login failed:', err instanceof Error ? err.message : 'Unknown error');
            setError('התחברות נכשלה. אנא בדוק את הפרטים ונסה שוב.');
        }
    };

    return (
        <div className="login-page">
            <LoginWelcomeCard onLogin={handleLogin} error={error} />
        </div>
    );
}
