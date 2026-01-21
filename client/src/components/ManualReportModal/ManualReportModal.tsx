// This file has been refactored into a feature-based structure
// Old path: client/src/components/ManualReportModal/ManualReportModal.tsx
// New path: client/src/features/manual-report/
// This re-export maintains backward compatibility

export { ManualReportModal, default } from '../../features/manual-report';
export type { ManualReportModalProps } from '../../features/manual-report/types/manualReport';
