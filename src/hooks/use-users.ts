// src/hooks/use-users.ts
import { useState } from 'react';
import { CreateUserDto, User } from '@/types/user';
import { usersApi} from '@/lib/api/users';
import { rolesApi, RoleName } from '@/lib/api/roles';
import { enrollmentsApi, CreateEnrollmentDto } from '@/lib/api/enrollments';
import { toast } from 'react-hot-toast';

export interface CreateStudentDto extends CreateUserDto {
    courseIds?: string[]; // Cursos a los que se inscribirá el estudiante
}

export function useUsers() {
    const [isLoading, setIsLoading] = useState(false);

    const createStudent = async (data: CreateStudentDto, adminId: string) => {
        setIsLoading(true);
        try {
            // 1. Crear el usuario
            const user = await usersApi.create({
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                status: data.status || 'ACTIVE',
            });

            // 2. Asignar el rol de STUDENT
            await rolesApi.assignRole({
                userId: user.id,
                roleName: 'STUDENT',
            });

            // 3. Si se proporcionaron cursos, inscribir al estudiante
            if (data.courseIds && data.courseIds.length > 0) {
                const enrollmentPromises = data.courseIds.map((courseId) =>
                    enrollmentsApi.create({
                        userId: user.id,
                        courseId: courseId,
                        enrolledById: adminId,
                    })
                );
                await Promise.all(enrollmentPromises);
            }

            toast.success('Estudiante creado exitosamente');
            return user;
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || 'Error al crear estudiante';
            toast.error(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const updateUser = async (id: string, data: Partial<CreateUserDto>) => {
        setIsLoading(true);
        try {
            const user = await usersApi.update(id, data);
            toast.success('Usuario actualizado exitosamente');
            return user;
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message || 'Error al actualizar usuario';
            toast.error(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const suspendUser = async (id: string) => {
        setIsLoading(true);
        try {
            const user = await usersApi.suspend(id);
            toast.success('Usuario suspendido');
            return user;
        } catch (error: any) {
            toast.error('Error al suspender usuario');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const activateUser = async (id: string) => {
        setIsLoading(true);
        try {
            const user = await usersApi.activate(id);
            toast.success('Usuario activado');
            return user;
        } catch (error: any) {
            toast.error('Error al activar usuario');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteUser = async (id: string) => {
        setIsLoading(true);
        try {
            await usersApi.delete(id);
            toast.success('Usuario eliminado');
        } catch (error: any) {
            toast.error('Error al eliminar usuario');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        createStudent,
        updateUser,
        suspendUser,
        activateUser,
        deleteUser,
    };
}