import { describe, it, expect, vi, afterEach } from 'vitest';
import { logDbOperation, logDbError } from '../db/utils/logger.js';

describe('Logger', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should log operation to console.log', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
        logDbOperation('Test Operation');
        expect(consoleSpy).toHaveBeenCalled();
        expect(consoleSpy.mock.calls[0][0]).toContain('[DB]');
    });

    it('should log error to console.error', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        const error = new Error('Test Error');
        logDbError('Test Operation', error);
        expect(consoleSpy).toHaveBeenCalled();
        expect(consoleSpy.mock.calls[0][0]).toContain('[DB Error]');
    });
});
