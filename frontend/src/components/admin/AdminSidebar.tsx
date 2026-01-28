import { NavLink, useNavigate } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import './AdminSidebar.css';
import '../../pages/admin/AdminMedia.css';

const AdminSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin/login');
    };

    return (
        <div className="admin-sidebar">
            <div className="sidebar-header">
                <h3 className="gold-text">3% GENERATION</h3>
                <p className="text-white-50">Admin Panel</p>
            </div>

            <Nav className="flex-column sidebar-nav">
                <NavLink to="/admin/dashboard" className="sidebar-link">
                    <span className="sidebar-icon">📊</span>
                    Dashboard
                </NavLink>

                <NavLink to="/admin/candidates" className="sidebar-link">
                    <span className="sidebar-icon">👥</span>
                    Candidates
                </NavLink>

                <NavLink to="/admin/questionnaires" className="sidebar-link">
                    <span className="sidebar-icon">📝</span>
                    Questionnaires
                </NavLink>

                <NavLink to="/admin/videos" className="sidebar-link">
                    <span className="sidebar-icon">🎥</span>
                    Videos
                </NavLink>

                <NavLink to="/admin/photos" className="sidebar-link">
                    <span className="sidebar-icon">📷</span>
                    Photos
                </NavLink>

                <NavLink to="/admin/audio" className="sidebar-link">
                    <span className="sidebar-icon">🎵</span>
                    Audio
                </NavLink>
            </Nav>

            <div className="sidebar-footer">
                <button className="btn btn-outline-gold w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleLogout}>
                    <span className="sidebar-icon">🚪</span>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
