import { useState, useEffect } from 'react';
import { Container, Badge, Button, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import api from '../../services/api';
import '../admin/AdminDashboard.css';
import './AdminMedia.css';

interface Questionnaire {
    id: string;
    title: string;
    candidateName: string;
    candidate_name: string;
    status: string;
    created_at: string;
    createdAt: string;
    submittedAt: string;
    userId: string;
}

const AdminQuestionnaires = () => {
    const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (!adminToken) {
            navigate('/admin/login');
            return;
        }

        fetchQuestionnaires();
    }, [navigate]);

    const fetchQuestionnaires = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await api.get('/admin/questionnaires', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuestionnaires(response.data.questionnaires || []);
        } catch (error) {
            console.error('Failed to fetch questionnaires:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveClick = (id: string) => {
        setSelectedId(id);
        setShowApproveModal(true);
    };

    const handleRejectClick = (id: string) => {
        setSelectedId(id);
        setShowRejectModal(true);
    };

    const handleApprove = async () => {
        if (!selectedId) return;
        try {
            const token = localStorage.getItem('adminToken');
            await api.put(`/admin/questionnaires/${selectedId}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchQuestionnaires();
            setShowApproveModal(false);
        } catch (error) {
            console.error('Failed to approve questionnaire:', error);
            alert('Failed to approve questionnaire');
        }
    };

    const handleReject = async () => {
        if (!selectedId || !rejectionReason) return;

        try {
            const token = localStorage.getItem('adminToken');
            await api.put(`/admin/questionnaires/${selectedId}/reject`, { reason: rejectionReason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchQuestionnaires();
            setShowRejectModal(false);
            setRejectionReason('');
        } catch (error) {
            console.error('Failed to reject questionnaire:', error);
            alert('Failed to reject questionnaire');
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: { [key: string]: string } = {
            'pending': 'warning',
            'approved': 'success',
            'rejected': 'danger'
        };
        return <Badge bg={variants[status] || 'secondary'} className="px-2 py-1">{status}</Badge>;
    };

    return (
        <div className="admin-dashboard">
            <AdminSidebar />
            <div className="admin-content">
                <Container fluid>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="text-white mb-0">Questionnaire Submissions</h2>
                        <span className="text-white-50">{questionnaires.length} items</span>
                    </div>

                    {loading ? (
                        <div className="text-center text-white py-5">
                            <div className="spinner-border text-gold" role="status"></div>
                        </div>
                    ) : (
                        <Row>
                            {questionnaires.length === 0 ? (
                                <Col xs={12}>
                                    <div className="text-center text-muted py-5 border border-secondary rounded bg-dark">
                                        No questionnaires found
                                    </div>
                                </Col>
                            ) : (
                                questionnaires.map((q) => (
                                    <Col key={q.id} md={6} xl={4} className="mb-4">
                                        <Card className="h-100 bg-dark border-secondary">
                                            <Card.Body>
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div>
                                                        <h5 className="text-white mb-1">{q.candidateName || q.candidate_name}</h5>
                                                        <div className="text-white-50 small">
                                                            Submitted: {new Date(q.submittedAt || q.created_at || q.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(q.status)}
                                                </div>

                                                <div className="d-flex gap-2 mt-4">
                                                    <Button
                                                        className="btn-outline-gold flex-grow-1"
                                                        size="sm"
                                                        onClick={() => navigate(`/admin/candidates/${q.userId}`)}
                                                    >
                                                        Review Answers
                                                    </Button>
                                                </div>

                                                {q.status === 'pending' && (
                                                    <div className="d-flex gap-2 mt-2">
                                                        <Button
                                                            className="btn-gold flex-grow-1"
                                                            size="sm"
                                                            onClick={() => handleApproveClick(q.id)}
                                                        >
                                                            ✓ Approve
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            className="flex-grow-1"
                                                            onClick={() => handleRejectClick(q.id)}
                                                        >
                                                            ✗ Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))
                            )}
                        </Row>
                    )}
                </Container>
            </div>

            {/* Confirmation Modals */}
            <ConfirmationModal
                show={showApproveModal}
                onHide={() => setShowApproveModal(false)}
                onConfirm={handleApprove}
                title="Approve Questionnaire"
                message="Are you sure you want to approve this questionnaire response?"
                confirmVariant="success"
                confirmText="Approve"
            />

            <ConfirmationModal
                show={showRejectModal}
                onHide={() => setShowRejectModal(false)}
                onConfirm={handleReject}
                title="Reject Questionnaire"
                message="Please provide a reason for rejecting this questionnaire."
                confirmVariant="danger"
                confirmText="Reject"
                showReasonInput={true}
                reason={rejectionReason}
                onReasonChange={setRejectionReason}
            />
        </div>
    );
};

export default AdminQuestionnaires;
