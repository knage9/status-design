import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Result } from 'antd';
import { useAuth } from './AuthContext';

const PROFILES_STORAGE_KEY = 'admin_profiles';
const ACTIVE_PROFILE_ID_KEY = 'active_profile_id';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
}) => {
  const location = useLocation();
  const { user } = useAuth();

  // 1. Сначала смотрим localStorage — есть ли вообще активный профиль
  const savedProfiles = localStorage.getItem(PROFILES_STORAGE_KEY);
  const savedActiveId = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);

  if (!savedProfiles || !savedActiveId) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  let storageUserRole: string | null = null;

  try {
    const profiles = JSON.parse(savedProfiles);
    const activeId = parseInt(savedActiveId, 10);
    const activeProfile = profiles.find((p: any) => p.id === activeId);
    storageUserRole = activeProfile?.user?.role ?? null;
  } catch {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2. Определяем роль: из контекста, если уже прогрузился, иначе из localStorage
  const effectiveRole = user?.role ?? storageUserRole;

  if (!effectiveRole) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // requiredRole
  if (requiredRole && effectiveRole !== requiredRole) {
    return (
      <Result
        status="403"
        title="Нет доступа"
        subTitle="Для просмотра этой страницы нужна другая роль."
      />
    );
  }

  // allowedRoles
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(effectiveRole)) {
      return (
        <Result
          status="403"
          title="Нет доступа"
          subTitle="Для просмотра этой страницы нужна другая роль."
        />
      );
    }
  }

  return <>{children}</>;
};
