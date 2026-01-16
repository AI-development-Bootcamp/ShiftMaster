import { useNavigate } from 'react-router-dom';
import { LoginWelcomeCard } from '../../components/LoginWelcomeCard';
import './LoginPage.css';

export function LoginPage() {
    const navigate = useNavigate();

    const handleLogin = async (email: string) => {
        // TODO: Implement actual login logic
        console.log('Login attempt:', email);
        navigate('/assignment');
    };

    return (
        <div className="login-page">
            <LoginWelcomeCard onLogin={handleLogin} />
        </div>
    );
}
