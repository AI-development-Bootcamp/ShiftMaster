import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { logoutUser } from '../../store/slices/authSlice';
import { LogoutIcon } from '../../constants/icons';

interface LogoutButtonProps {
  className?: string;
  showIcon?: boolean;
  showLabel?: boolean;
  label?: string;
  onLogoutStart?: () => void;
  onLogoutSuccess?: () => void;
  onLogoutError?: (error: unknown) => void;
}

export function LogoutButton({
  className = 'nav-item logout-button',
  showIcon = true,
  showLabel = true,
  label = 'התנתקות',
  onLogoutStart,
  onLogoutSuccess,
  onLogoutError,
}: LogoutButtonProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      // Call optional callback before logout
      onLogoutStart?.();

      // Dispatch logout thunk
      await dispatch(logoutUser()).unwrap();

      // Call optional success callback
      onLogoutSuccess?.();

      // Navigate to root after successful logout
      navigate('/');
    } catch (error) {
      // Call optional error callback
      onLogoutError?.(error);

      // Even if logout fails, redirect to login (already handled by onUnauthorized)
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={className}
      aria-label={label}
    >
      {/* Spacer to align with NavItems */}
      <span className="nav-item-indicator" aria-hidden="true" />
      {showIcon && (
        <span className="nav-item-icon" aria-hidden="true">
          <LogoutIcon />
        </span>
      )}
      {showLabel && <span className="nav-item-label">{label}</span>}
    </button>
  );
}
