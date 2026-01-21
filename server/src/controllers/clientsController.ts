/**
 * Clients controller for handling client management requests
 */

import { Request, Response } from 'express';
import {
    createClientSchema,
    updateClientSchema,
    getClientSchema,
    listClientsSchema,
    CreateClientInput,
    UpdateClientInput,
    GetClientParams,
    ListClientsQuery
} from '../validations/clientValidation.js';
import {
    ClientsService,
    AuthorizationError,
    ClientNotFoundError,
    type Actor,
} from '../services/clientsService.js';
import { supabaseAdmin } from '../db/supabase.js';

/**
 * Handle POST /api/v1/clients - Create new client
 * @admin_only
 */
export async function createClient(req: Request, res: Response): Promise<void> {
    try {
        const validationResult = createClientSchema.safeParse(req.body);

        if (!validationResult.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation error',
                    code: 'VALIDATION_ERROR',
                    details: validationResult.error.flatten().fieldErrors,
                },
            });
            return;
        }

        const actor: Actor = { role: req.user!.role };
        const clientsService = new ClientsService(supabaseAdmin);

        const client = await clientsService.createClient(
            actor,
            validationResult.data as CreateClientInput
        );

        res.status(201).json({
            success: true,
            data: { client },
        });
    } catch (error) {
        if (error instanceof AuthorizationError) {
            res.status(403).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                },
            });
            return;
        }

        console.error('Create client error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
}

/**
 * Handle GET /api/v1/clients - List clients
 * @admin_only
 */
export async function listClients(req: Request, res: Response): Promise<void> {
    try {
        const validationResult = listClientsSchema.safeParse(req.query);

        if (!validationResult.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation error',
                    code: 'VALIDATION_ERROR',
                    details: validationResult.error.flatten().fieldErrors,
                },
            });
            return;
        }

        const { page, limit, search, sort, include_inactive } = validationResult.data as ListClientsQuery;
        const actor: Actor = { role: req.user!.role };
        const clientsService = new ClientsService(supabaseAdmin);

        const result = await clientsService.listClients(
            actor,
            page,
            limit,
            search,
            sort,
            include_inactive
        );

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        if (error instanceof AuthorizationError) {
            res.status(403).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                },
            });
            return;
        }

        console.error('List clients error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
}

/**
 * Handle GET /api/v1/clients/:id - Get client
 * @admin_only
 */
export async function getClient(req: Request, res: Response): Promise<void> {
    try {
        const validationResult = getClientSchema.safeParse({ id: req.params.id });

        if (!validationResult.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation error',
                    code: 'VALIDATION_ERROR',
                    details: validationResult.error.flatten().fieldErrors,
                },
            });
            return;
        }

        const { id } = validationResult.data as GetClientParams;
        const actor: Actor = { role: req.user!.role };
        const clientsService = new ClientsService(supabaseAdmin);

        const client = await clientsService.getClientById(actor, id);

        res.status(200).json({
            success: true,
            data: { client },
        });
    } catch (error) {
        if (error instanceof ClientNotFoundError) {
            res.status(404).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                },
            });
            return;
        }
        if (error instanceof AuthorizationError) {
            res.status(403).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                },
            });
            return;
        }

        console.error('Get client error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
}

/**
 * Handle PATCH /api/v1/clients/:id - Update client
 * @admin_only
 */
export async function updateClient(req: Request, res: Response): Promise<void> {
    try {
        const paramValidation = getClientSchema.safeParse({ id: req.params.id });
        if (!paramValidation.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation error',
                    code: 'VALIDATION_ERROR',
                    details: paramValidation.error.flatten().fieldErrors,
                },
            });
            return;
        }

        const bodyValidation = updateClientSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation error',
                    code: 'VALIDATION_ERROR',
                    details: bodyValidation.error.flatten().fieldErrors,
                },
            });
            return;
        }

        const { id } = paramValidation.data as GetClientParams;
        const updates = bodyValidation.data as UpdateClientInput;
        const actor: Actor = { role: req.user!.role };
        const clientsService = new ClientsService(supabaseAdmin);

        const client = await clientsService.updateClient(actor, id, updates);

        res.status(200).json({
            success: true,
            data: { client },
        });
    } catch (error) {
        if (error instanceof ClientNotFoundError) {
            res.status(404).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                },
            });
            return;
        }
        if (error instanceof AuthorizationError) {
            res.status(403).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                },
            });
            return;
        }

        console.error('Update client error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
}

/**
 * Handle DELETE /api/v1/clients/:id - Soft delete client
 * @admin_only
 */
export async function deleteClient(req: Request, res: Response): Promise<void> {
    try {
        const validationResult = getClientSchema.safeParse({ id: req.params.id });

        if (!validationResult.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation error',
                    code: 'VALIDATION_ERROR',
                    details: validationResult.error.flatten().fieldErrors,
                },
            });
            return;
        }

        const { id } = validationResult.data as GetClientParams;
        const actor: Actor = { role: req.user!.role };
        const clientsService = new ClientsService(supabaseAdmin);

        await clientsService.deleteClient(actor, id);

        res.status(200).json({
            success: true,
            data: {
                success: true,
                message: `Client ${id} has been deactivated`,
            },
        });
    } catch (error) {
        if (error instanceof ClientNotFoundError) {
            res.status(404).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                },
            });
            return;
        }
        if (error instanceof AuthorizationError) {
            res.status(403).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                },
            });
            return;
        }

        console.error('Delete client error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
}
