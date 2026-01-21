import { Request, Response } from 'express';
import { supabaseAdmin } from '../db/supabase.js';
import { ClientsService } from '../services/clientsService.js';

export async function listClients(_req: Request, res: Response): Promise<void> {
    try {
        const clientsService = new ClientsService(supabaseAdmin);
        const clients = await clientsService.listClients();
        res.status(200).json({
            success: true,
            data: clients,
        });
    } catch (error) {
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
