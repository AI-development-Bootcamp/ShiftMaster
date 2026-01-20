/**
 * Integration tests for clients routes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock dependencies
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

// Mock JWT utilities
vi.mock('../../utils/jwt.js', () => ({
    verifyToken: vi.fn(),
}));

import clientsRouter from '../../routes/clients.js';
import { ClientNotFoundError } from '../../services/clientsService.js';
import * as jwtUtil from '../../utils/jwt.js';

// Get mocks from the mocked module
const clientsServiceModule = await vi.importMock<typeof import('../../services/clientsService.js')>('../../services/clientsService.js');
const {
    mockCreateClient: serviceCreateClient,
    mockListClients: serviceListClients,
    mockGetClientById: serviceGetClientById,
    mockUpdateClient: serviceUpdateClient,
    mockDeleteClient: serviceDeleteClient,
} = (clientsServiceModule as unknown as { __mocks: Record<string, ReturnType<typeof vi.fn>> }).__mocks;

// Create test app
const app = express();
app.use(express.json());
app.use('/api/v1/clients', clientsRouter);

// Test constants
const VALID_ADMIN_TOKEN = 'valid.admin.token';
const VALID_USER_TOKEN = 'valid.user.token';

const mockAdminUser = {
    userId: '550e8400-e29b-41d4-a716-446655440000',
    email: 'admin@example.com',
    role: 'admin' as const,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
};

const mockRegularUser = {
    userId: '550e8400-e29b-41d4-a716-446655440001',
    email: 'user@example.com',
    role: 'regular' as const,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
};

describe('Clients Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /clients', () => {
        it('should create client when authenticated as admin', async () => {
            const mockClient = {
                client_id: '550e8400-e29b-41d4-a716-446655440002',
                name: 'Acme Corp',
                contact_info: 'contact@acme.com',
                active: true,
                created_at: '2024-01-01T00:00:00Z',
                last_modified_by: null
            };

            vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
            serviceCreateClient.mockResolvedValue(mockClient);

            const response = await request(app)
                .post('/api/v1/clients')
                .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`)
                .send({
                    name: 'Acme Corp',
                    contact_info: 'contact@acme.com'
                });

            expect(response.status).toBe(201);
            expect(response.body).toEqual({
                success: true,
                data: {
                    client: mockClient
                }
            });
        });

        it('should return 401 when not authenticated', async () => {
            const response = await request(app)
                .post('/api/v1/clients')
                .send({
                    name: 'Acme Corp'
                });

            expect(response.status).toBe(401);
        });

        it('should return 403 when authenticated as regular user', async () => {
            vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockRegularUser);

            const response = await request(app)
                .post('/api/v1/clients')
                .set('Authorization', `Bearer ${VALID_USER_TOKEN}`)
                .send({
                    name: 'Acme Corp'
                });

            expect(response.status).toBe(403);
        });
    });

    describe('GET /clients', () => {
        it('should list clients when admin', async () => {
            const mockResult = {
                clients: [],
                pagination: {
                    total: 0,
                    page: 1,
                    limit: 20,
                    totalPages: 0,
                }
            };

            vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
            serviceListClients.mockResolvedValue(mockResult);

            const response = await request(app)
                .get('/api/v1/clients')
                .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                data: mockResult
            });
            expect(serviceListClients).toHaveBeenCalledWith(
                expect.objectContaining({ role: 'admin' }),
                1, // default page
                20, // default limit
                undefined,
                'asc', // default sort
                false // default includeInactive
            );
        });
    });

    describe('GET /clients/:id', () => {
        const testClientId = '550e8400-e29b-41d4-a716-446655440003';

        it('should get client by ID when admin', async () => {
            const mockClient = {
                client_id: testClientId,
                name: 'Test Client',
                contact_info: 'test@example.com',
                active: true,
                created_at: '2024-01-01T00:00:00Z',
                last_modified_by: null
            };

            vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
            serviceGetClientById.mockResolvedValue(mockClient);

            const response = await request(app)
                .get(`/api/v1/clients/${testClientId}`)
                .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`);

            expect(response.status).toBe(200);
            expect(response.body.data.client).toEqual(mockClient);
        });

        it('should return 404 when client not found', async () => {
            const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
            vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
            serviceGetClientById.mockRejectedValue(new ClientNotFoundError(nonExistentId));

            const response = await request(app)
                .get(`/api/v1/clients/${nonExistentId}`)
                .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`);

            expect(response.status).toBe(404);
        });
    });

    describe('PATCH /clients/:id', () => {
        const testClientId = '550e8400-e29b-41d4-a716-446655440004';

        it('should update client when admin', async () => {
            const mockClient = {
                client_id: testClientId,
                name: 'Updated Name',
                contact_info: 'updated@example.com',
                active: true,
                created_at: '2024-01-01T00:00:00Z',
                last_modified_by: null
            };

            vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
            serviceUpdateClient.mockResolvedValue(mockClient);

            const response = await request(app)
                .patch(`/api/v1/clients/${testClientId}`)
                .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`)
                .send({
                    name: 'Updated Name'
                });

            expect(response.status).toBe(200);
            expect(response.body.data.client.name).toBe('Updated Name');
        });
    });

    describe('DELETE /clients/:id', () => {
        const testClientId = '550e8400-e29b-41d4-a716-446655440005';

        it('should delete client when admin', async () => {
            vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
            serviceDeleteClient.mockResolvedValue(undefined);

            const response = await request(app)
                .delete(`/api/v1/clients/${testClientId}`)
                .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`);

            expect(response.status).toBe(200);
        });
    });
});
