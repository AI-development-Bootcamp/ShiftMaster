
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as clientsController from './clientsController';
import { AuthenticatedRequest } from '../types/express';
import { ClientsService } from '../services/clientsService.js';

// Mock the service module
vi.mock('../services/clientsService.js');

// We just mock the TYPE to satisfy TS, or simpler: use 'any' or partial mock
// But we can just create a plain object that matches the interface
const createMockService = () => ({
    listClients: vi.fn(),
    createClient: vi.fn(),
    updateClient: vi.fn(),
    deleteClient: vi.fn(),
} as unknown as ClientsService);

import { Response } from 'express';

const mockResponse = (): Partial<Response> & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> } => {
    const res: Partial<Response> & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> } = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };
    return res;
};

const mockUser = {
    user_id: 'user-123',
    role: 'admin',
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: '',
};

describe('ClientsController', () => {
    let mockService: ReturnType<typeof createMockService>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockService = createMockService();
        vi.mocked(ClientsService).mockImplementation(() => mockService);
    });

    describe('createClient', () => {
        it('should create a client successfully', async () => {
            const req = {
                body: { name: 'Test Client', contact_info: 'Contact' },
                user: mockUser
            } as unknown as AuthenticatedRequest;
            const res = mockResponse();

            const mockClient = { client_id: 'client-1', ...req.body, active: true };
            vi.mocked(mockService.createClient).mockResolvedValue(mockClient);

            // Pass mockService as injection
            await clientsController.createClient(req, res, undefined, mockService);

            expect(mockService.createClient).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }), req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: mockClient });
        });

        it('should return 400 if validation fails', async () => {
            const req = {
                body: { contact_info: 'Missing Name' },
                user: mockUser
            } as unknown as AuthenticatedRequest;
            const res = mockResponse();

            // Service not injected because function shouldn't reach creation
            await clientsController.createClient(req, res, undefined, mockService);

            expect(mockService.createClient).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('updateClient', () => {
        it('should update a client successfully', async () => {
            const req = {
                params: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
                body: { name: 'Updated Name' },
                user: mockUser
            } as unknown as AuthenticatedRequest;
            const res = mockResponse();

            const mockClient = { client_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Updated Name', active: true };
            vi.mocked(mockService.updateClient).mockResolvedValue(mockClient);

            await clientsController.updateClient(req, res, undefined, mockService);

            expect(mockService.updateClient).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', req.body);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: mockClient });
        });
    });

    describe('deleteClient', () => {
        it('should delete a client successfully', async () => {
            const req = {
                params: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
                user: mockUser
            } as unknown as AuthenticatedRequest;
            const res = mockResponse();

            vi.mocked(mockService.deleteClient).mockResolvedValue(undefined);

            await clientsController.deleteClient(req, res, undefined, mockService);

            expect(mockService.deleteClient).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: { message: expect.any(String) } });
        });
    });
});
