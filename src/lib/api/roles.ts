// src/lib/api/roles.ts
import { apiClient } from './client';

export type RoleName = 'ADMIN' | 'STUDENT';

export interface AssignRoleDto {
    userId: string;
    roleName: RoleName;
}

export interface Role {
    id: string;
    name: RoleName;
}

export interface UserWithRoles {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
    roles: Role[];
}

export const rolesApi = {
    // Asignar rol a usuario
    assignRole: async (data: AssignRoleDto): Promise<any> => {
        return apiClient.post<any>('/roles/assign', data);
    },

    // Obtener roles de un usuario
    getUserRoles: async (userId: string): Promise<Role[]> => {
        return apiClient.get<Role[]>(`/roles/user/${userId}`);
    },

    // Obtener todos los estudiantes
    getStudents: async (): Promise<UserWithRoles[]> => {
        return apiClient.get<UserWithRoles[]>('/roles/type/students');
    },

    // Obtener todos los admins
    getAdmins: async (): Promise<UserWithRoles[]> => {
        return apiClient.get<UserWithRoles[]>('/roles/type/admins');
    },

    // Remover rol de usuario
    removeRole: async (userId: string, roleId: string): Promise<void> => {
        return apiClient.delete<void>(`/roles/user/${userId}/role/${roleId}`);
    },
};