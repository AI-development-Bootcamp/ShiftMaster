import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../supabase.js';
import { IBaseRepository } from '../types/repositories.js';
import { logDbError } from '../utils/logger.js';

export abstract class BaseRepository<T, NewT, UpdateT> implements IBaseRepository<T, NewT, UpdateT> {
    protected table: string;
    protected primaryKey: string;
    protected dbConnection: SupabaseClient;

    constructor(table: string, primaryKey: string = 'id', dbConnection: SupabaseClient = supabaseAdmin) {
        this.table = table;
        this.primaryKey = primaryKey;
        this.dbConnection = dbConnection;
    }

    async create(data: NewT): Promise<T> {
        const { data: created, error } = await this.dbConnection
            .from(this.table)
            .insert(data)
            .select()
            .single();

        if (error) {
            logDbError(`BaseRepository.create [${this.table}]`, error);
            throw error;
        }

        return created as T;
    }

    async findById(id: string): Promise<T | null> {
        const { data, error } = await this.dbConnection
            .from(this.table)
            .select('*')
            .eq(this.primaryKey, id)
            .single();

        if (error) {
            // Supabase returns an error for "not found" with code PGRST116
            if (error.code === 'PGRST116') return null;

            logDbError(`BaseRepository.findById [${this.table}]`, error);
            throw error;
        }

        return data as T;
    }

    async findAll(): Promise<T[]> {
        const { data, error } = await this.dbConnection
            .from(this.table)
            .select('*');

        if (error) {
            logDbError(`BaseRepository.findAll [${this.table}]`, error);
            throw error;
        }

        return data as T[];
    }

    async update(id: string, data: UpdateT): Promise<T> {
        const { data: updated, error } = await this.dbConnection
            .from(this.table)
            .update(data)
            .eq(this.primaryKey, id)
            .select()
            .single();

        if (error) {
            logDbError(`BaseRepository.update [${this.table}]`, error);
            throw error;
        }

        return updated as T;
    }

    async delete(id: string): Promise<boolean> {
        // Soft-delete for specific tables
        const softDeleteTables = ['users', 'clients', 'projects', 'tasks', 'admin_task_assignments'];

        if (softDeleteTables.includes(this.table)) {
            const { data, error } = await this.dbConnection
                .from(this.table)
                .update({ active: false })
                .eq(this.primaryKey, id)
                .select(this.primaryKey);

            if (error) {
                logDbError(`BaseRepository.delete (soft) [${this.table}]`, error);
                throw error;
            }

            return data !== null && data.length > 0;
        }

        // Hard-delete for other tables
        const { error, count } = await this.dbConnection
            .from(this.table)
            .delete({ count: 'exact' })
            .eq(this.primaryKey, id);

        if (error) {
            logDbError(`BaseRepository.delete [${this.table}]`, error);
            throw error;
        }

        return count !== null && count > 0;
    }
}
