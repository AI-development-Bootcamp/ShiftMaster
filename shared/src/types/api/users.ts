import { User, UserRole } from '../models';

// Request types
export interface CreateUserRequest {
  full_name: string;
  email: string;
  password: string;
  role: UserRole | 'admin' | 'regular';
  job_title?: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  password?: string;
  role?: UserRole | 'admin' | 'regular';
  job_title?: string;
  active?: boolean;
}

export interface UserListQueryParams {
  page?: number;
  limit?: number;
  active?: boolean;
  search?: string;
  role?: UserRole | 'admin' | 'regular';
}

// Response types
export interface UserListResponse {
  success: true;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface SingleUserResponse {
  success: true;
  data: {
    user: User;
  };
}

export interface DeleteUserResponse {
  success: true;
  data: {
    success: boolean;
    message: string;
  };
}

// Error codes
export const UserApiErrorCode = {
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  FORBIDDEN: 'FORBIDDEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

export type UserApiErrorCodeType = typeof UserApiErrorCode[keyof typeof UserApiErrorCode];
