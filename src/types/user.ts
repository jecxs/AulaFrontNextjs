
export interface CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    status?: 'ACTIVE' | 'SUSPENDED';
}

export interface UpdateUserDto {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    status?: 'ACTIVE' | 'SUSPENDED';
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    status: 'ACTIVE' | 'SUSPENDED';
    createdAt: string;
}

export interface UserStats {
    total: number;
    active: number;
    suspended: number;
    students: number;
    admins: number;
}
