export type Permission = 'REQUESTS_VIEW_ALL' | 'REQUESTS_PROCESS' | 'WORK_ORDERS_VIEW_ALL' | 'WORK_ORDERS_VIEW_OWN' | 'WORK_ORDERS_EDIT_ALL' | 'WORK_ORDERS_EDIT_ASSIGNED' | 'WORK_ORDERS_VIEW_FINANCE' | 'WORK_ORDERS_CHANGE_STATUS';
export type Role = 'ADMIN' | 'MANAGER' | 'MASTER' | 'EXECUTOR' | string;
export interface CurrentUser {
    id: number;
    role: Role;
    permissions: Set<Permission>;
}
export declare const ROLE_PERMISSIONS: Record<Role, Permission[]>;
export declare const buildCurrentUser: (user: {
    userId: number;
    role: Role;
}) => CurrentUser;
export declare const hasPermission: (currentUser: CurrentUser, permission: Permission) => boolean;
