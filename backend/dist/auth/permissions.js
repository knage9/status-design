"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPermission = exports.buildCurrentUser = exports.ROLE_PERMISSIONS = void 0;
exports.ROLE_PERMISSIONS = {
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
const buildCurrentUser = (user) => {
    const permissions = new Set(exports.ROLE_PERMISSIONS[user.role] || []);
    return { id: user.userId, role: user.role, permissions };
};
exports.buildCurrentUser = buildCurrentUser;
const hasPermission = (currentUser, permission) => currentUser.permissions.has(permission);
exports.hasPermission = hasPermission;
//# sourceMappingURL=permissions.js.map