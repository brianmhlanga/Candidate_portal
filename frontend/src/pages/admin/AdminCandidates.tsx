import { useState, useEffect } from 'react';
import { Container, Button, Form, Badge, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import api from '../../services/api';
import '../admin/AdminDashboard.css';
import './AdminMedia.css';

interface Candidate {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    onboardingStep: string;
    onboardingCompleted: boolean;
    createdAt: string;
    approvalStatus?: string;
}

const AdminCandidates = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            navigate('/admin/login');
            return;
        }

        fetchCandidates();
    }, [navigate]);

    const fetchCandidates = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await api.get('/admin/candidates', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCandidates(response.data.candidates || []);
        } catch (error) {
            console.error('Failed to fetch candidates:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStepBadge = (step: string) => {
        const badges: { [key: string]: { variant: string; text: string } } = {
            'welcome': { variant: 'info', text: 'Welcome' },
            'photo-upload': { variant: 'primary', text: 'Photo' },
            'audio-recording': { variant: 'warning', text: 'Audio' },
            'video-recording': { variant: 'warning', text: 'Video' },
            'questionnaire': { variant: 'secondary', text: 'Questionnaire' },
            'completion': { variant: 'success', text: 'Completed' }
        };

        const badge = badges[step] || { variant: 'secondary', text: step };
        return <Badge bg={badge.variant}>{badge.text}</Badge>;
    };

    const getApprovalBadge = (status: string) => {
        const badges: { [key: string]: { variant: string; text: string } } = {
            'pending': { variant: 'warning', text: 'Pending' },
            'approved': { variant: 'success', text: 'Approved' },
            'rejected': { variant: 'danger', text: 'Rejected' }
        };

        const badge = badges[status] || { variant: 'secondary', text: status || 'Pending' };
        return <Badge bg={badge.variant}>{badge.text}</Badge>;
    };

    const filteredCandidates = candidates.filter(candidate => {
        const matchesSearch = `${candidate.firstName} ${candidate.lastName} ${candidate.email}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'pending' && (!candidate.approvalStatus || candidate.approvalStatus === 'pending')) ||
            candidate.approvalStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="admin-dashboard">
            <AdminSidebar />
            <div className="admin-content">
                <Container fluid>
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                        <h2 className="text-white mb-2 mb-md-0">Candidates</h2>
                        <span className="text-white-50">{filteredCandidates.length} found</span>
                    </div>

                    <Card className="bg-dark border-secondary mb-4 p-3">
                        <div className="d-flex flex-wrap gap-3">
                            <Form.Control
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input bg-black text-white border-secondary"
                                style={{
                                    maxWidth: '300px',
                                    color: '#fff'
                                }}
                            />
                            <Form.Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-black text-white border-secondary"
                                style={{
                                    maxWidth: '200px',
                                    color: '#fff'
                                }}
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending Review</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </Form.Select>
                        </div>
                    </Card>

                    {loading ? (
                        <div className="text-center text-white py-5">
                            <div className="spinner-border text-gold" role="status"></div>
                        </div>
                    ) : (
                        <Row>
                            {filteredCandidates.length === 0 ? (
                                <Col xs={12}>
                                    <div className="text-center text-muted py-5 border border-secondary rounded bg-dark">
                                        No candidates found matching your criteria.
                                    </div>
                                </Col>
                            ) : (
                                filteredCandidates.map((candidate) => (
                                    <Col key={candidate.id} lg={6} xl={4} className="mb-4">
                                        <Card className="h-100 bg-dark border-secondary candidate-card">
                                            <Card.Body className="d-flex flex-column">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div className="d-flex align-items-center">
                                                        <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white me-3" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                                                            {candidate.firstName[0]}{candidate.lastName[0]}
                                                        </div>
                                                        <div>
                                                            <h5 className="card-title text-white mb-0">{candidate.firstName} {candidate.lastName}</h5>
                                                            <div className="card-subtitle text-muted small">{candidate.email}</div>
                                                        </div>
                                                    </div>
                                                    {getApprovalBadge(candidate.approvalStatus || 'pending')}
                                                </div>

                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between mb-1">
                                                        <span className="text-white-50 small">Onboarding</span>
                                                        <span className="text-white small">{getStepBadge(candidate.onboardingStep)}</span>
                                                    </div>
                                                    <div className="d-flex justify-content-between">
                                                        <span className="text-white-50 small">Joined</span>
                                                        <span className="text-white small">{new Date(candidate.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="outline-gold"
                                                    className="w-100 mt-auto"
                                                    onClick={() => navigate(`/admin/candidates/${candidate.id}`)}
                                                >
                                                    Review Application
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))
                            )}
                        </Row>
                    )}
                </Container>
            </div>
        </div>
    );
};

export default AdminCandidates;
