import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmationDialog from '../../../../../features/manual-report/components/dialogs/ConfirmationDialog';

describe('ConfirmationDialog', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    isOpen: true,
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
    title: 'Test Title',
    message: 'Test Message',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<ConfirmationDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<ConfirmationDialog {...defaultProps} />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should display title', () => {
      render(<ConfirmationDialog {...defaultProps} />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should display message', () => {
      render(<ConfirmationDialog {...defaultProps} />);
      expect(screen.getByText('Test Message')).toBeInTheDocument();
    });

    it('should display warning icon', () => {
      const { container } = render(<ConfirmationDialog {...defaultProps} />);
      const iconWrapper = container.querySelector('.confirmation-icon-wrapper');
      expect(iconWrapper).toBeInTheDocument();
    });

    it('should render confirm button with custom text', () => {
      render(<ConfirmationDialog {...defaultProps} />);
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    it('should render cancel button with custom text', () => {
      render(<ConfirmationDialog {...defaultProps} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should use default confirm text when not provided', () => {
      const { confirmText, ...propsWithoutConfirmText } = defaultProps;
      render(<ConfirmationDialog {...propsWithoutConfirmText} />);
      expect(screen.getByText('מחק את הפרויקט')).toBeInTheDocument();
    });

    it('should use default cancel text when not provided', () => {
      const { cancelText, ...propsWithoutCancelText } = defaultProps;
      render(<ConfirmationDialog {...propsWithoutCancelText} />);
      expect(screen.getByText('מעדיף שלא למחוק')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onConfirm when confirm button is clicked', () => {
      render(<ConfirmationDialog {...defaultProps} />);
      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnCancel).not.toHaveBeenCalled();
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(<ConfirmationDialog {...defaultProps} />);
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('should call onCancel when overlay is clicked', () => {
      const { container } = render(<ConfirmationDialog {...defaultProps} />);
      const overlay = container.querySelector('.confirmation-overlay');
      if (overlay) {
        fireEvent.click(overlay);
        expect(mockOnCancel).toHaveBeenCalledTimes(1);
      }
    });

    it('should not close when dialog content is clicked', () => {
      const { container } = render(<ConfirmationDialog {...defaultProps} />);
      const dialog = container.querySelector('.confirmation-dialog');
      if (dialog) {
        fireEvent.click(dialog);
        expect(mockOnCancel).not.toHaveBeenCalled();
        expect(mockOnConfirm).not.toHaveBeenCalled();
      }
    });
  });

  describe('Button Types', () => {
    it('should have type="button" on confirm button', () => {
      render(<ConfirmationDialog {...defaultProps} />);
      const confirmButton = screen.getByText('Confirm');
      expect(confirmButton).toHaveAttribute('type', 'button');
    });

    it('should have type="button" on cancel button', () => {
      render(<ConfirmationDialog {...defaultProps} />);
      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toHaveAttribute('type', 'button');
    });
  });

  describe('CSS Classes', () => {
    it('should apply correct classes to main message', () => {
      render(<ConfirmationDialog {...defaultProps} />);
      const title = screen.getByText('Test Title');
      expect(title).toHaveClass('confirmation-main-message');
    });

    it('should apply correct classes to sub message', () => {
      render(<ConfirmationDialog {...defaultProps} />);
      const message = screen.getByText('Test Message');
      expect(message).toHaveClass('confirmation-sub-message');
    });

    it('should apply correct classes to cancel button', () => {
      render(<ConfirmationDialog {...defaultProps} />);
      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toHaveClass('confirmation-link-btn');
    });

    it('should apply correct classes to confirm button', () => {
      render(<ConfirmationDialog {...defaultProps} />);
      const confirmButton = screen.getByText('Confirm');
      expect(confirmButton).toHaveClass('confirmation-primary-btn');
    });
  });
});
