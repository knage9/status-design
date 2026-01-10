export type Permission =
    | 'REQUESTS_VIEW_ALL'
    | 'REQUESTS_PROCESS'
    | 'WORK_ORDERS_VIEW_ALL'
    | 'WORK_ORDERS_VIEW_OWN'
    | 'WORK_ORDERS_EDIT_ALL'
    | 'WORK_ORDERS_EDIT_ASSIGNED'
    | 'WORK_ORDERS_VIEW_FINANCE'
    | 'WORK_ORDERS_CHANGE_STATUS';

export type Role = 'ADMIN' | 'MANAGER' | 'MASTER' | 'EXECUTOR' | string;

export interface CurrentUser {
    id: number;
    role: Role;
    permissions: Set<Permission>;
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    ADMIN: [
        'REQUESTS_VIEW_ALL',
        'REQUESTS_PROCESS',
        'WORK_ORDERS_VIEW_ALL',
        'WORK_ORDERS_EDIT_ALL',
        'WORK_ORDERS_VIEW_FINANCE',
        'WORK_ORDERS_CHANGE_STATUS',
    ],
    MANAGER: [
        'REQUESTS_VIEW_ALL',
        'REQUESTS_PROCESS',
        'WORK_ORDERS_VIEW_ALL',
        'WORK_ORDERS_EDIT_ALL',
        'WORK_ORDERS_VIEW_FINANCE',
        'WORK_ORDERS_CHANGE_STATUS',
    ],
    MASTER: [
        'WORK_ORDERS_VIEW_OWN',
        'WORK_ORDERS_EDIT_ASSIGNED',
        'WORK_ORDERS_CHANGE_STATUS',
    ],
    EXECUTOR: [
        'WORK_ORDERS_VIEW_OWN',
        'WORK_ORDERS_EDIT_ASSIGNED',
        'WORK_ORDERS_CHANGE_STATUS',
    ],
};

export const buildCurrentUser = (user: { userId: number; role: Role }): CurrentUser => {
    const permissions = new Set<Permission>(ROLE_PERMISSIONS[user.role] || []);
    return { id: user.userId, role: user.role, permissions };
};

export const hasPermission = (currentUser: CurrentUser, permission: Permission): boolean =>
    currentUser.permissions.has(permission);

