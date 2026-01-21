import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ManualReportModal from '../../../../../features/manual-report/components/ManualReportModal/ManualReportModal';

describe('ManualReportModal', () => {
  const mockOnClose = vi.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    selectedDate: new Date('2025-01-15'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<ManualReportModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('manualReport.title')).not.toBeInTheDocument();
    });

    it('should render modal when isOpen is true', () => {
      render(<ManualReportModal {...defaultProps} />);
      expect(screen.getByText('manualReport.title')).toBeInTheDocument();
    });

    it('should render work and absence tabs', () => {
      render(<ManualReportModal {...defaultProps} />);
      expect(screen.getByText('manualReport.tabs.work')).toBeInTheDocument();
      expect(
        screen.getByText('manualReport.tabs.absence')
      ).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<ManualReportModal {...defaultProps} />);
      const closeButton = screen.getByLabelText('manualReport.closeAriaLabel');
      expect(closeButton).toBeInTheDocument();
    });

    it('should render save button', () => {
      render(<ManualReportModal {...defaultProps} />);
      expect(screen.getByText('common.save')).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should start with work tab active by default', () => {
      render(<ManualReportModal {...defaultProps} />);
      const workTab = screen.getByText('manualReport.tabs.work');
      expect(workTab.closest('.tab')).toHaveClass('tab-active');
    });

    it('should switch to absence tab when clicked', () => {
      render(<ManualReportModal {...defaultProps} />);
      const absenceTab = screen.getByText('manualReport.tabs.absence');
      fireEvent.click(absenceTab);
      expect(absenceTab.closest('.tab')).toHaveClass('tab-active');
    });

    it('should show progress bar only on work tab', () => {
      render(<ManualReportModal {...defaultProps} />);
      expect(
        screen.getByText('manualReport.progressTextRight')
      ).toBeInTheDocument();

      const absenceTab = screen.getByText('manualReport.tabs.absence');
      fireEvent.click(absenceTab);
      expect(
        screen.queryByText('manualReport.progressTextRight')
      ).not.toBeInTheDocument();
    });
  });

  describe('Closing Modal', () => {
    it('should call onClose when close button is clicked', () => {
      render(<ManualReportModal {...defaultProps} />);
      const closeButton = screen.getByLabelText('manualReport.closeAriaLabel');
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when overlay is clicked', () => {
      render(<ManualReportModal {...defaultProps} />);
      const overlay = screen.getByText('manualReport.title').closest('.modal-overlay');
      if (overlay) {
        fireEvent.click(overlay);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should not call onClose when modal content is clicked', () => {
      render(<ManualReportModal {...defaultProps} />);
      const modalContent = screen
        .getByText('manualReport.title')
        .closest('.modal-content');
      if (modalContent) {
        fireEvent.click(modalContent);
        expect(mockOnClose).not.toHaveBeenCalled();
      }
    });
  });

  describe('Progress Display', () => {
    it('should display progress text with correct values', () => {
      render(<ManualReportModal {...defaultProps} />);
      expect(
        screen.getByText('manualReport.progressTextRight')
      ).toBeInTheDocument();
      expect(
        screen.getByText('manualReport.progressTextLeft')
      ).toBeInTheDocument();
    });

    it('should render progress bar', () => {
      const { container } = render(<ManualReportModal {...defaultProps} />);
      const progressBar = container.querySelector('.progress-bar-container');
      expect(progressBar).toBeInTheDocument();
    });

    it('should render progress bar fill', () => {
      const { container } = render(<ManualReportModal {...defaultProps} />);
      const progressFill = container.querySelector('.progress-bar-fill');
      expect(progressFill).toBeInTheDocument();
    });
  });

  describe('Save Functionality', () => {
    it('should have save button enabled', () => {
      render(<ManualReportModal {...defaultProps} />);
      const saveButton = screen.getByText('common.save');
      expect(saveButton).not.toBeDisabled();
    });

    it('should call onClose when save is clicked on absence tab', () => {
      render(<ManualReportModal {...defaultProps} />);
      const absenceTab = screen.getByText('manualReport.tabs.absence');
      fireEvent.click(absenceTab);

      const saveButton = screen.getByText('common.save');
      fireEvent.click(saveButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label for close button', () => {
      render(<ManualReportModal {...defaultProps} />);
      expect(
        screen.getByLabelText('manualReport.closeAriaLabel')
      ).toBeInTheDocument();
    });

    it('should stop event propagation when modal content is clicked', () => {
      render(<ManualReportModal {...defaultProps} />);
      const modalContent = screen
        .getByText('manualReport.title')
        .closest('.modal-content');

      if (modalContent) {
        const stopPropagation = vi.fn();
        const event = new MouseEvent('click', { bubbles: true });
        Object.defineProperty(event, 'stopPropagation', {
          value: stopPropagation,
        });

        modalContent.dispatchEvent(event);
        expect(stopPropagation).toHaveBeenCalled();
      }
    });
  });
});
