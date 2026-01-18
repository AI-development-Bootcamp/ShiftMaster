import { NewUser } from '../types/entities.js';

export const users: NewUser[] = [
    {
        email: 'admin@abrashiftmaster.com',
        password_hash: '$2b$10$YourHashedPasswordHere', // We will use a proper hash in the seed script
        full_name: 'Admin User',
        role: 'admin',
        job_title: 'System Administrator',
        active: true
    },
    {
        email: 'john.doe@abrashiftmaster.com',
        password_hash: '$2b$10$YourHashedPasswordHere',
        full_name: 'John Doe',
        role: 'regular',
        job_title: 'Senior Developer',
        active: true
    },
    {
        email: 'jane.smith@abrashiftmaster.com',
        password_hash: '$2b$10$YourHashedPasswordHere',
        full_name: 'Jane Smith',
        role: 'regular',
        job_title: 'Product Manager',
        active: true
    }
];
