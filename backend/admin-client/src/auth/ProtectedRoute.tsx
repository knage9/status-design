import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Spin } from 'antd';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
    allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, allowedRoles }) => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check requiredRole (backward compatibility)
    if (requiredRole && user?.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    // Check allowedRoles array
    if (allowedRoles && allowedRoles.length > 0) {
        if (!user?.role || !allowedRoles.includes(user.role)) {
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
};
