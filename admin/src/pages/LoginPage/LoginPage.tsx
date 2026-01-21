import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginWelcomeCard } from '../../components/LoginWelcomeCard';
import { useAppSelector } from '../../store';
import '../../styles/LoginPage.css';

export function LoginPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/assignment');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="login-page">
            <LoginWelcomeCard />
        </div>
    );
}
