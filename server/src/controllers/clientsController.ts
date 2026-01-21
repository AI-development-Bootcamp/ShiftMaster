import { Request, Response } from 'express';
import { supabaseAdmin } from '../db/supabase.js';
import { ClientsService, ClientNotFoundError } from '../services/clientsService.js';
import { Actor, AuthorizationError } from '../services/usersService.js';
import { createClientSchema, updateClientSchema, getClientSchema } from '../validations/clientValidation.js';

export async function listClients(req: Request, res: Response): Promise<void> {
    try {
        const includeInactive = req.query.active === 'false';
        const actor: Actor = { role: req.user!.role };
        const clientsService = new ClientsService(supabaseAdmin);
        const clients = await clientsService.listClients(actor, includeInactive);
        res.status(200).json({
            success: true,
            data: clients,
        });
    } catch (error) {
        console.error('List clients error:', error);

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

        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
}

export async function createClient(req: Request, res: Response): Promise<void> {
    try {
        const validation = createClientSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    details: validation.error.errors,
                },
            });
            return;
        }

        const actor: Actor = { role: req.user!.role };
        const clientsService = new ClientsService(supabaseAdmin);

        const newClient = await clientsService.createClient(actor, validation.data);

        res.status(201).json({
            success: true,
            data: newClient,
        });
    } catch (error) {
        console.error('Create client error:', error);

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

        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
}

export async function updateClient(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const idValidation = getClientSchema.safeParse({ id });

        if (!idValidation.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Invalid client ID',
                    code: 'VALIDATION_ERROR',
                },
            });
            return;
        }

        const validation = updateClientSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    details: validation.error.errors,
                },
            });
            return;
        }

        const actor: Actor = { role: req.user!.role };
        const clientsService = new ClientsService(supabaseAdmin);

        const updatedClient = await clientsService.updateClient(actor, id, validation.data);

        res.status(200).json({
            success: true,
            data: updatedClient,
        });

    } catch (error) {
        console.error('Update client error:', error);

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

        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
}

export async function deleteClient(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const idValidation = getClientSchema.safeParse({ id });

        if (!idValidation.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Invalid client ID',
                    code: 'VALIDATION_ERROR',
                },
            });
            return;
        }

        const actor: Actor = { role: req.user!.role };
        const clientsService = new ClientsService(supabaseAdmin);

        await clientsService.deleteClient(actor, id);

        res.status(200).json({
            success: true,
            data: {
                message: `Client ${id} has been deactivated`
            }
        });

    } catch (error) {
        console.error('Delete client error:', error);

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

        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
}
