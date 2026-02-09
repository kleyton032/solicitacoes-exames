import type { ReactNode } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../modules/users/contexts/AuthContext';

interface AdminRouteProps {
    children?: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const isAdmin = user.roles && user.roles.includes('ADMIN');

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
}
