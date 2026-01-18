import { BaseRepository } from './BaseRepository.js';
import { IUserRepository } from '../types/repositories.js';
import { User, NewUser, UpdateUser } from '../types/entities.js';
import { logDbError } from '../utils/logger.js';

export class UserRepository extends BaseRepository<User, NewUser, UpdateUser> implements IUserRepository {
    constructor() {
        super('users', 'user_id');
    }

    async findByEmail(email: string): Promise<User | null> {
        const { data, error } = await this.client
            .from(this.table)
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            logDbError('UserRepository.findByEmail', error);
            throw error;
        }

        return data as User;
    }
}
