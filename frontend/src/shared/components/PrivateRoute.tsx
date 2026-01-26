import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../modules/users/contexts/AuthContext';

export function PrivateRoute() {
    const { user } = useAuth();

    return user ? <Outlet /> : <Navigate to="/login" />;
}
