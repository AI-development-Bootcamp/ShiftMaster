import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import '../../styles/LogoutButton.css';
import { useTranslation } from 'react-i18next';

function LogoutButton() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      // Navigate to login after successful logout
      navigate('/login');
    } catch (error) {
      // Even if logout fails, redirect to login (already handled by onUnauthorized)
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  return (
    <button
      className="logout-btn"
      onClick={handleLogout}
      aria-label={t('home.logout')}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M13 14L17 10M17 10L13 6M17 10H7M7 3H5C3.89543 3 3 3.89543 3 5V15C3 16.1046 3.89543 17 5 17H7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default LogoutButton;
