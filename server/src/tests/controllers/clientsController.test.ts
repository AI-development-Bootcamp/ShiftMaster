/**
 * Unit tests for clients controller
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

// Mock dependencies before importing
vi.mock('../../db/supabase.js', () => ({
    supabaseAdmin: {
        from: vi.fn(),
    },
}));

// Mock the ClientsService class
vi.mock('../../services/clientsService.js', () => {
    const mockCreateClient = vi.fn();
    const mockListClients = vi.fn();
    const mockGetClientById = vi.fn();
    const mockUpdateClient = vi.fn();
    const mockDeleteClient = vi.fn();

    return {
        ClientsService: vi.fn().mockImplementation(() => ({
            createClient: mockCreateClient,
            listClients: mockListClients,
            getClientById: mockGetClientById,
            updateClient: mockUpdateClient,
            deleteClient: mockDeleteClient,
        })),
        ClientNotFoundError: class ClientNotFoundError extends Error {
            code = 'CLIENT_NOT_FOUND';
            constructor(clientId: string) {
                super(`Client with ID ${clientId} not found`);
            }
        },
        AuthorizationError: class AuthorizationError extends Error {
            code = 'FORBIDDEN';
            constructor(message: string = 'Access denied') {
                super(message);
            }
        },
        // Export mocks for testing
        __mocks: {
            mockCreateClient,
            mockListClients,
            mockGetClientById,
            mockUpdateClient,
            mockDeleteClient,
        },
    };
});

// Import after mocking
import {
    createClient,
    listClients,
    getClient,
    updateClient,
    deleteClient,
} from '../../controllers/clientsController.js';
import {
    ClientNotFoundError,
    AuthorizationError,
} from '../../services/clientsService.js';
import type { DecodedToken } from '../../utils/jwt.js';

interface AuthenticatedRequest extends Request {
    user?: Partial<DecodedToken>;
}

// Get mocks from the mocked module
const clientsServiceModule = await vi.importMock<
    typeof import('../../services/clientsService.js')
>('../../services/clientsService.js');
const {
    mockCreateClient,
    mockListClients,
    mockGetClientById,
    mockUpdateClient,
    mockDeleteClient,
} = (
    clientsServiceModule as unknown as {
        __mocks: Record<string, ReturnType<typeof vi.fn>>;
    }
).__mocks;

describe('ClientsController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let jsonMock: ReturnType<typeof vi.fn>;
    let statusMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();

        mockRequest = {
            body: {},
            params: {},
            query: {},
        };

        jsonMock = vi.fn();
        statusMock = vi.fn().mockReturnValue({ json: jsonMock });

        mockResponse = {
            status: statusMock,
            json: jsonMock,
        };

        // Set default user as admin for tests
        (mockRequest as AuthenticatedRequest).user = {
            userId: 'admin-id',
            role: 'admin',
            email: 'admin@example.com',
        };
    });

    describe('createClient', () => {
        it('should create client successfully', async () => {
            const mockClient = {
                client_id: '550e8400-e29b-41d4-a716-446655440000',
                name: 'Acme Corp',
                contact_info: 'contact@acme.com',
                active: true,
                created_at: '2024-01-01T00:00:00Z',
                last_modified_by: null,
            };

            mockRequest.body = {
                name: 'Acme Corp',
                contact_info: 'contact@acme.com',
            };

            mockCreateClient.mockResolvedValue(mockClient);

            await createClient(mockRequest as Request, mockResponse as Response);

            const actor = { role: 'admin' };
            expect(mockCreateClient).toHaveBeenCalledWith(
                expect.objectContaining(actor),
                expect.objectContaining({
                    name: 'Acme Corp',
                    contact_info: 'contact@acme.com',
                })
            );
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: {
                    client: mockClient,
                },
            });
        });

        it('should return 400 for validation errors', async () => {
            mockRequest.body = {
                // Missing name
                contact_info: 'contact@acme.com',
            };

            await createClient(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'VALIDATION_ERROR',
                    }),
                })
            );
        });

        it('should return 403 for authorization error', async () => {
            mockRequest.body = {
                name: 'Acme Corp',
            };

            const authError = new AuthorizationError();
            mockCreateClient.mockRejectedValue(authError);

            await createClient(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(403);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: authError.message,
                    code: 'FORBIDDEN',
                },
            });
        });

        it('should return 500 for unexpected errors', async () => {
            mockRequest.body = {
                name: 'Acme Corp',
            };

            mockCreateClient.mockRejectedValue(new Error('Unexpected error'));

            await createClient(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Internal server error',
                    code: 'INTERNAL_SERVER_ERROR',
                },
            });
        });
    });

    describe('listClients', () => {
        it('should list clients with default pagination', async () => {
            const mockResult = {
                clients: [
                    {
                        client_id: '550e8400-e29b-41d4-a716-446655440000',
                        name: 'Acme Corp',
                        contact_info: 'contact@acme.com',
                        active: true,
                        created_at: '2024-01-01T00:00:00Z',
                        last_modified_by: null,
                    },
                ],
                pagination: {
                    total: 1,
                    page: 1,
                    limit: 20,
                    totalPages: 1,
                },
            };

            mockRequest.query = {};
            mockListClients.mockResolvedValue(mockResult);

            await listClients(mockRequest as Request, mockResponse as Response);

            expect(mockListClients).toHaveBeenCalledWith(
                expect.objectContaining({ role: 'admin' }),
                1,
                20,
                undefined,
                'asc',
                false
            );
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: mockResult,
            });
        });

        it('should list clients with custom pagination and filters', async () => {
            const mockResult = {
                clients: [],
                pagination: {
                    total: 0,
                    page: 2,
                    limit: 10,
                    totalPages: 0,
                },
            };

            mockRequest.query = {
                page: '2',
                limit: '10',
                search: 'Acme',
                sort: 'desc',
                include_inactive: 'true'
            };
            mockListClients.mockResolvedValue(mockResult);

            await listClients(mockRequest as Request, mockResponse as Response);

            expect(mockListClients).toHaveBeenCalledWith(
                expect.objectContaining({ role: 'admin' }),
                2,
                10,
                'Acme',
                'desc',
                true
            );
            expect(statusMock).toHaveBeenCalledWith(200);
        });

        it('should return 400 for invalid pagination parameters', async () => {
            mockRequest.query = { page: 'invalid' };

            await listClients(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'VALIDATION_ERROR',
                    }),
                })
            );
        });
    });

    describe('getClient', () => {
        it('should get client by ID successfully', async () => {
            const mockClient = {
                client_id: '550e8400-e29b-41d4-a716-446655440000',
                name: 'Acme Corp',
                contact_info: 'contact@acme.com',
                active: true,
                created_at: '2024-01-01T00:00:00Z',
                last_modified_by: null,
            };

            mockRequest.params = { id: '550e8400-e29b-41d4-a716-446655440000' };
            mockGetClientById.mockResolvedValue(mockClient);

            await getClient(mockRequest as Request, mockResponse as Response);

            expect(mockGetClientById).toHaveBeenCalledWith(
                expect.objectContaining({ role: 'admin' }),
                '550e8400-e29b-41d4-a716-446655440000'
            );
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: {
                    client: mockClient,
                },
            });
        });

        it('should return 404 if client not found', async () => {
            const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
            mockRequest.params = { id: nonExistentId };

            const notFoundError = new ClientNotFoundError(nonExistentId);
            mockGetClientById.mockRejectedValue(notFoundError);

            await getClient(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: notFoundError.message,
                    code: 'CLIENT_NOT_FOUND',
                },
            });
        });

        it('should return 400 for invalid client ID', async () => {
            mockRequest.params = { id: 'invalid' };

            await getClient(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({
                        code: 'VALIDATION_ERROR',
                    }),
                })
            );
        });
    });

    describe('updateClient', () => {
        it('should update client successfully', async () => {
            const clientId = '550e8400-e29b-41d4-a716-446655440000';
            const mockClient = {
                client_id: clientId,
                name: 'Updated Name',
                contact_info: 'contact@acme.com',
                active: true,
                created_at: '2024-01-01T00:00:00Z',
                last_modified_by: null,
            };

            mockRequest.params = { id: clientId };
            mockRequest.body = {
                name: 'Updated Name',
            };

            mockUpdateClient.mockResolvedValue(mockClient);

            await updateClient(mockRequest as Request, mockResponse as Response);

            expect(mockUpdateClient).toHaveBeenCalledWith(
                expect.objectContaining({ role: 'admin' }),
                clientId,
                {
                    name: 'Updated Name',
                }
            );
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: {
                    client: mockClient,
                },
            });
        });

        it('should return 404 if client not found', async () => {
            const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
            mockRequest.params = { id: nonExistentId };
            mockRequest.body = { name: 'Updated Name' };

            const notFoundError = new ClientNotFoundError(nonExistentId);
            mockUpdateClient.mockRejectedValue(notFoundError);

            await updateClient(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: notFoundError.message,
                    code: 'CLIENT_NOT_FOUND',
                },
            });
        });

        it('should return 400 for validation errors', async () => {
            mockRequest.params = { id: 'invalid' };
            mockRequest.body = { name: 'Updated Name' };

            await updateClient(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
        });
    });

    describe('deleteClient', () => {
        it('should delete client successfully', async () => {
            const clientId = '550e8400-e29b-41d4-a716-446655440000';
            const mockResult = {
                success: true,
                message: `Client ${clientId} has been deactivated`,
            };

            mockRequest.params = { id: clientId };
            mockDeleteClient.mockResolvedValue(undefined); // deleteClient returns void in logic, or we check controller

            // Controller just calls await delete(actor, id)
            // and returns success json

            await deleteClient(mockRequest as Request, mockResponse as Response);

            expect(mockDeleteClient).toHaveBeenCalledWith(
                expect.objectContaining({ role: 'admin' }),
                clientId
            );
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: mockResult,
            });
        });

        it('should return 404 if client not found', async () => {
            const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
            mockRequest.params = { id: nonExistentId };

            const notFoundError = new ClientNotFoundError(nonExistentId);
            mockDeleteClient.mockRejectedValue(notFoundError);

            await deleteClient(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: notFoundError.message,
                    code: 'CLIENT_NOT_FOUND',
                },
            });
        });
    });
});
