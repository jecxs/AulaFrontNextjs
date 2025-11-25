// src/app/(admin)/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { rolesApi, UserWithRoles } from '@/lib/api/roles';
import { useUsers } from '@/hooks/use-users';
import CreateStudentForm from '@/components/admin/CreateStudentForm';
import {
    Users,
    Plus,
    Search,
    UserX,
    UserCheck,
    Mail,
    Phone,
    Calendar,
    MoreVertical,
    Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import LoadingSpinner from '@/components/ui/loading-spinner';

export default function AdminUsersPage() {
    const [students, setStudents] = useState<UserWithRoles[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const { suspendUser, activateUser, deleteUser } = useUsers();

    // Cargar estudiantes
    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const data = await rolesApi.getStudents();
            setStudents(data);
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // Filtrar estudiantes por búsqueda
    const filteredStudents = students.filter((student) => {
        const query = searchQuery.toLowerCase();
        return (
            student.firstName.toLowerCase().includes(query) ||
            student.lastName.toLowerCase().includes(query) ||
            student.email.toLowerCase().includes(query)
        );
    });

    const handleCreateSuccess = () => {
        setShowCreateForm(false);
        fetchStudents();
    };

    const handleSuspend = async (userId: string) => {
        try {
            await suspendUser(userId);
            fetchStudents();
        } catch (error) {
            console.error('Error al suspender usuario:', error);
        }
        setActiveDropdown(null);
    };

    const handleActivate = async (userId: string) => {
        try {
            await activateUser(userId);
            fetchStudents();
        } catch (error) {
            console.error('Error al activar usuario:', error);
        }
        setActiveDropdown(null);
    };

    const handleDelete = async (userId: string) => {
        if (
            !confirm(
                '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.'
            )
        ) {
            return;
        }

        try {
            await deleteUser(userId);
            fetchStudents();
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
        }
        setActiveDropdown(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Gestión de Usuarios
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        {students.length} estudiante(s) registrado(s)
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Crear Estudiante
                </button>
            </div>

            {/* Formulario de Creación (Modal/Drawer) */}
            {showCreateForm && (
                <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-blue-500">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Crear Nuevo Estudiante
                        </h2>
                        <button
                            onClick={() => setShowCreateForm(false)}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <span className="sr-only">Cerrar</span>
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                    <CreateStudentForm
                        onSuccess={handleCreateSuccess}
                        onCancel={() => setShowCreateForm(false)}
                    />
                </div>
            )}

            {/* Barra de búsqueda */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido o email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Lista de Estudiantes */}
            {filteredStudents.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                        {searchQuery
                            ? 'No se encontraron estudiantes'
                            : 'No hay estudiantes registrados'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchQuery
                            ? 'Intenta con otro término de búsqueda'
                            : 'Comienza creando un nuevo estudiante'}
                    </p>
                </div>
            ) : (
                <div className="bg-white shadow sm:rounded-lg">
                    <ul className="divide-y divide-gray-200">
                        {filteredStudents.map((student) => (
                            <li key={student.id} className="hover:bg-gray-50">
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3">
                                                {/* Avatar */}
                                                <div className="flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {student.firstName.charAt(0)}
                                {student.lastName.charAt(0)}
                            </span>
                                                    </div>
                                                </div>

                                                {/* Info del usuario */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {student.firstName} {student.lastName}
                                                    </p>
                                                    <div className="flex items-center space-x-4 mt-1">
                            <span className="flex items-center text-sm text-gray-500">
                              <Mail className="h-4 w-4 mr-1" />
                                {student.email}
                            </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Estado y acciones */}
                                        <div className="flex items-center space-x-4">
                                            {/* Badge de estado */}
                                            <span
                                                className={cn(
                                                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                                    student.status === 'ACTIVE'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                )}
                                            >
                        {student.status === 'ACTIVE' ? (
                            <>
                                <UserCheck className="h-3 w-3 mr-1" />
                                Activo
                            </>
                        ) : (
                            <>
                                <UserX className="h-3 w-3 mr-1" />
                                Suspendido
                            </>
                        )}
                      </span>

                                            {/* Menú de acciones */}
                                            <div className="relative">
                                                <button
                                                    onClick={() =>
                                                        setActiveDropdown(
                                                            activeDropdown === student.id ? null : student.id
                                                        )
                                                    }
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    <MoreVertical className="h-5 w-5" />
                                                </button>

                                                {activeDropdown === student.id && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                                                        {student.status === 'ACTIVE' ? (
                                                            <button
                                                                onClick={() => handleSuspend(student.id)}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                            >
                                                                <UserX className="h-4 w-4 mr-2" />
                                                                Suspender Usuario
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleActivate(student.id)}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                                            >
                                                                <UserCheck className="h-4 w-4 mr-2" />
                                                                Activar Usuario
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(student.id)}
                                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Eliminar Usuario
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}