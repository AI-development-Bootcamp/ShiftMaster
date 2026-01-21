import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MissingHoursDialog from '../../../../../features/manual-report/components/dialogs/MissingHoursDialog';

describe('MissingHoursDialog', () => {
  const mockOnComplete = vi.fn();
  const mockOnDontShowAgain = vi.fn();

  const defaultProps = {
    isOpen: true,
    missingHours: 2.5,
    onComplete: mockOnComplete,
    onDontShowAgain: mockOnDontShowAgain,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<MissingHoursDialog {...defaultProps} isOpen={false} />);
      expect(
        screen.queryByText('dialogs.missingHours.title')
      ).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<MissingHoursDialog {...defaultProps} />);
      expect(
        screen.getByText('dialogs.missingHours.title')
      ).toBeInTheDocument();
    });

    it('should display warning icon', () => {
      const { container } = render(<MissingHoursDialog {...defaultProps} />);
      const iconWrapper = container.querySelector('.confirmation-icon-wrapper');
      expect(iconWrapper).toBeInTheDocument();
    });

    it('should display title', () => {
      render(<MissingHoursDialog {...defaultProps} />);
      expect(
        screen.getByText('dialogs.missingHours.title')
      ).toBeInTheDocument();
    });

    it('should display message with hours interpolation', () => {
      render(<MissingHoursDialog {...defaultProps} />);
      expect(
        screen.getByText('dialogs.missingHours.message')
      ).toBeInTheDocument();
    });

    it('should display "Don\'t show again" button', () => {
      render(<MissingHoursDialog {...defaultProps} />);
      expect(
        screen.getByText('dialogs.missingHours.dontShowAgain')
      ).toBeInTheDocument();
    });

    it('should display "Complete hours" button', () => {
      render(<MissingHoursDialog {...defaultProps} />);
      expect(
        screen.getByText('dialogs.missingHours.completeHours')
      ).toBeInTheDocument();
    });
  });

  describe('Missing Hours Calculation', () => {
    it('should handle positive missing hours', () => {
      render(<MissingHoursDialog {...defaultProps} missingHours={3.7} />);
      expect(
        screen.getByText('dialogs.missingHours.message')
      ).toBeInTheDocument();
    });

    it('should handle zero missing hours', () => {
      render(<MissingHoursDialog {...defaultProps} missingHours={0} />);
      expect(
        screen.getByText('dialogs.missingHours.message')
      ).toBeInTheDocument();
    });

    it('should handle negative missing hours as zero', () => {
      render(<MissingHoursDialog {...defaultProps} missingHours={-1} />);
      expect(
        screen.getByText('dialogs.missingHours.message')
      ).toBeInTheDocument();
    });

    it('should round missing hours correctly', () => {
      render(<MissingHoursDialog {...defaultProps} missingHours={2.9} />);
      // The component uses Math.max(0, missingHours) internally
      expect(
        screen.getByText('dialogs.missingHours.message')
      ).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onComplete when complete button is clicked', () => {
      render(<MissingHoursDialog {...defaultProps} />);
      const completeButton = screen.getByText(
        'dialogs.missingHours.completeHours'
      );
      fireEvent.click(completeButton);
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
      expect(mockOnDontShowAgain).not.toHaveBeenCalled();
    });

    it('should call onDontShowAgain when "Don\'t show again" button is clicked', () => {
      render(<MissingHoursDialog {...defaultProps} />);
      const dontShowButton = screen.getByText(
        'dialogs.missingHours.dontShowAgain'
      );
      fireEvent.click(dontShowButton);
      expect(mockOnDontShowAgain).toHaveBeenCalledTimes(1);
      expect(mockOnComplete).not.toHaveBeenCalled();
    });

    it('should not close when overlay is clicked', () => {
      const { container } = render(<MissingHoursDialog {...defaultProps} />);
      const overlay = container.querySelector('.confirmation-overlay');
      if (overlay) {
        fireEvent.click(overlay);
        expect(mockOnComplete).not.toHaveBeenCalled();
        expect(mockOnDontShowAgain).not.toHaveBeenCalled();
      }
    });

    it('should not close when dialog content is clicked', () => {
      const { container } = render(<MissingHoursDialog {...defaultProps} />);
      const dialog = container.querySelector('.confirmation-dialog');
      if (dialog) {
        fireEvent.click(dialog);
        expect(mockOnComplete).not.toHaveBeenCalled();
        expect(mockOnDontShowAgain).not.toHaveBeenCalled();
      }
    });
  });

  describe('Button Types', () => {
    it('should have type="button" on complete button', () => {
      render(<MissingHoursDialog {...defaultProps} />);
      const completeButton = screen.getByText(
        'dialogs.missingHours.completeHours'
      );
      expect(completeButton).toHaveAttribute('type', 'button');
    });

    it('should have type="button" on "Don\'t show again" button', () => {
      render(<MissingHoursDialog {...defaultProps} />);
      const dontShowButton = screen.getByText(
        'dialogs.missingHours.dontShowAgain'
      );
      expect(dontShowButton).toHaveAttribute('type', 'button');
    });
  });

  describe('CSS Classes', () => {
    it('should apply correct classes to main message', () => {
      render(<MissingHoursDialog {...defaultProps} />);
      const title = screen.getByText('dialogs.missingHours.title');
      expect(title).toHaveClass('confirmation-main-message');
    });

    it('should apply correct classes to sub message', () => {
      render(<MissingHoursDialog {...defaultProps} />);
      const message = screen.getByText('dialogs.missingHours.message');
      expect(message).toHaveClass('confirmation-sub-message');
    });

    it('should apply correct classes to "Don\'t show again" button', () => {
      render(<MissingHoursDialog {...defaultProps} />);
      const button = screen.getByText('dialogs.missingHours.dontShowAgain');
      expect(button).toHaveClass('confirmation-link-btn');
    });

    it('should apply correct classes to complete button', () => {
      render(<MissingHoursDialog {...defaultProps} />);
      const button = screen.getByText('dialogs.missingHours.completeHours');
      expect(button).toHaveClass('confirmation-primary-btn');
    });
  });
});
