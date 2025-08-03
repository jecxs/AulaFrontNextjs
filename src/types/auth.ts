// src/types/auth.ts
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    roles: Role[];
}

export interface Role {
    id: string;
    name: RoleName;
    description: string;
}

export enum RoleName {
    ADMIN = 'ADMIN',
    STUDENT = 'STUDENT',
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

// ✅ CORREGIDO: login ahora retorna Promise<AuthResponse>
export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (credentials: LoginCredentials) => Promise<AuthResponse>;
    logout: () => void;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isStudent: boolean;
}