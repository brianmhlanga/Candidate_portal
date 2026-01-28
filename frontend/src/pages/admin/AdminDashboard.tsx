import { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import './AdminDashboard.css';

interface DashboardStats {
    totalCandidates: number;
    completedOnboarding: number;
    submittedQuestionnaires: number;
    recentCandidates: number;
    pendingApprovals: number;
    approvedUsers: number;
}

const AdminDashboard = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalCandidates: 0,
        completedOnboarding: 0,
        submittedQuestionnaires: 0,
        recentCandidates: 0,
        pendingApprovals: 0,
        approvedUsers: 0
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            navigate('/admin/login');
            return;
        }

        fetchDashboardStats();
    }, [navigate]);

    const fetchDashboardStats = async () => {
        try {
            // Use admin token for requests
            const token = localStorage.getItem('adminToken');
            const response = await api.get('/admin/dashboard/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-dashboard">
            <AdminSidebar />
            <div className="admin-content">
                <Container fluid>
                    <h2 className="mb-4 text-white">Dashboard</h2>

                    {loading ? (
                        <div className="text-center text-white">Loading...</div>
                    ) : (
                        <Row>
                            <Col md={6} lg={4} className="mb-4">
                                <Card className="stat-card">
                                    <Card.Body>
                                        <div className="stat-icon">👥</div>
                                        <h3 className="stat-number gold-text">{stats.totalCandidates}</h3>
                                        <p className="stat-label">Total Candidates</p>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={6} lg={4} className="mb-4">
                                <Card className="stat-card">
                                    <Card.Body>
                                        <div className="stat-icon">✅</div>
                                        <h3 className="stat-number text-success">{stats.approvedUsers}</h3>
                                        <p className="stat-label">Approved Candidates</p>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={6} lg={4} className="mb-4">
                                <Card className="stat-card">
                                    <Card.Body>
                                        <div className="stat-icon">⏳</div>
                                        <h3 className="stat-number text-warning">{stats.pendingApprovals}</h3>
                                        <p className="stat-label">Pending Reviews</p>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={6} lg={4} className="mb-4">
                                <Card className="stat-card">
                                    <Card.Body>
                                        <div className="stat-icon">✓</div>
                                        <h3 className="stat-number" style={{ color: '#4caf50' }}>{stats.completedOnboarding}</h3>
                                        <p className="stat-label">Completed Onboarding</p>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={6} lg={4} className="mb-4">
                                <Card className="stat-card">
                                    <Card.Body>
                                        <div className="stat-icon">📝</div>
                                        <h3 className="stat-number" style={{ color: '#2196f3' }}>{stats.submittedQuestionnaires}</h3>
                                        <p className="stat-label">Questionnaires</p>
                                    </Card.Body>
                                </Card>
                            </Col>

                            <Col md={6} lg={4} className="mb-4">
                                <Card className="stat-card">
                                    <Card.Body>
                                        <div className="stat-icon">🆕</div>
                                        <h3 className="stat-number gold-text">{stats.recentCandidates}</h3>
                                        <p className="stat-label">Recent (7d)</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )}
                </Container>
            </div>
        </div>
    );
};

export default AdminDashboard;
