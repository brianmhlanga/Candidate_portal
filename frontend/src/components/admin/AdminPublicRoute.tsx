import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
    children: JSX.Element;
}

const AdminPublicRoute = ({ children }: PublicRouteProps) => {
    const adminToken = localStorage.getItem('adminToken');

    if (adminToken) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
};

export default AdminPublicRoute;
