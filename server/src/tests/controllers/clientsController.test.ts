import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

// Create mock functions before mocking the module
const mockListClients = vi.fn();
const mockCreateClient = vi.fn();
const mockUpdateClient = vi.fn();
const mockDeleteClient = vi.fn();

// Mock the service module
vi.mock('../../services/clientsService.js', () => ({
  ClientsService: vi.fn().mockImplementation(() => ({
    listClients: mockListClients,
    createClient: mockCreateClient,
    updateClient: mockUpdateClient,
    deleteClient: mockDeleteClient,
  })),
}));

// Import after mocking
import * as clientsController from '../../controllers/clientsController.js';

interface AuthenticatedRequest extends Request {
  user?: {
    user_id: string;
    role: string;
    aud: string;
    app_metadata: Record<string, unknown>;
    user_metadata: Record<string, unknown>;
    created_at: string;
  };
}

const mockResponse = (): Partial<Response> & {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
} => {
  const res: Partial<Response> & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  } = {
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createClient', () => {
    it('should create a client successfully', async () => {
      const req = {
        body: { name: 'Test Client', contact_info: 'Contact' },
        user: mockUser,
      } as unknown as AuthenticatedRequest;
      const res = mockResponse();

      const mockClient = { client_id: 'client-1', ...req.body, active: true };
      mockCreateClient.mockResolvedValue(mockClient);

      await clientsController.createClient(req as Request, res as Response);

      expect(mockCreateClient).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'admin' }),
        req.body
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockClient,
      });
    });

    it('should return 400 if validation fails', async () => {
      const req = {
        body: { contact_info: 'Missing Name' },
        user: mockUser,
      } as unknown as AuthenticatedRequest;
      const res = mockResponse();

      await clientsController.createClient(req as Request, res as Response);

      expect(mockCreateClient).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateClient', () => {
    it('should update a client successfully', async () => {
      const req = {
        params: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
        body: { name: 'Updated Name' },
        user: mockUser,
      } as unknown as AuthenticatedRequest;
      const res = mockResponse();

      const mockClient = {
        client_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'Updated Name',
        active: true,
      };
      mockUpdateClient.mockResolvedValue(mockClient);

      await clientsController.updateClient(req as Request, res as Response);

      expect(mockUpdateClient).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'admin' }),
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        req.body
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockClient,
      });
    });
  });

  describe('deleteClient', () => {
    it('should delete a client successfully', async () => {
      const req = {
        params: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
        user: mockUser,
      } as unknown as AuthenticatedRequest;
      const res = mockResponse();

      mockDeleteClient.mockResolvedValue(undefined);

      await clientsController.deleteClient(req as Request, res as Response);

      expect(mockDeleteClient).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'admin' }),
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { message: expect.any(String) },
      });
    });
  });
});
