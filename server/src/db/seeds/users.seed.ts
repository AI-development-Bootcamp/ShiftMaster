import { NewUser } from '../types/entities.js';

// Note: password_hash is set dynamically in the seed script
type SeedUser = Omit<NewUser, 'password_hash'>;

export const users: SeedUser[] = [
    {
        email: 'admin@abrashiftmaster.com',
        full_name: 'Admin User',
        role: 'admin',
        job_title: 'System Administrator',
        active: true
    },
    {
        email: 'john.doe@abrashiftmaster.com',
        full_name: 'John Doe',
        role: 'regular',
        job_title: 'Senior Developer',
        active: true
    },
    {
        email: 'jane.smith@abrashiftmaster.com',
        full_name: 'Jane Smith',
        role: 'regular',
        job_title: 'Product Manager',
        active: true
    }
];
