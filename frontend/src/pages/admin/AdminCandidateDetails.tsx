import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import api from '../../services/api';
import '../admin/AdminDashboard.css';
import './AdminMedia.css';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    onboardingStep: string;
    onboardingCompleted: boolean;
    createdAt: string;
    approvalStatus?: string;
    rejectionReason?: string;
    uploads?: any[];
    questionnaire?: any;
}

const AdminCandidateDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Modal States
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchCandidateDetails();
    }, [id]);

    const fetchCandidateDetails = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await api.get(`/admin/candidates/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCandidate(response.data.candidate);
        } catch (error) {
            console.error('Failed to fetch candidate details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        setProcessing(true);
        try {
            const token = localStorage.getItem('adminToken');
            await api.put(`/admin/candidates/${id}/approve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchCandidateDetails();
            setShowApproveModal(false);
        } catch (error) {
            console.error('Failed to approve candidate:', error);
            alert('Failed to approve candidate. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason) return alert('Please provide a reason for rejection');

        setProcessing(true);
        try {
            const token = localStorage.getItem('adminToken');
            await api.put(`/admin/candidates/${id}/reject`, { reason: rejectionReason }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowRejectModal(false);
            setRejectionReason('');
            await fetchCandidateDetails();
        } catch (error) {
            console.error('Failed to reject candidate:', error);
            alert('Failed to reject candidate. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const getApprovalBadge = (status: string) => {
        const badges: { [key: string]: { variant: string; text: string } } = {
            'pending': { variant: 'warning', text: 'Pending' },
            'approved': { variant: 'success', text: 'Approved' },
            'rejected': { variant: 'danger', text: 'Rejected' }
        };
        const badge = badges[status] || { variant: 'secondary', text: 'Unknown' };
        return <Badge bg={badge.variant}>{badge.text}</Badge>;
    };

    const getMediaUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `http://localhost:5000${path}`;
    };

    if (loading) return <div className="text-center text-white p-5">Loading candidate details...</div>;
    if (!candidate) return <div className="text-center text-white p-5">Candidate not found</div>;

    const photo = candidate.uploads?.find(u => u.type === 'photo');
    const audio = candidate.uploads?.find(u => u.type === 'audio');
    const video = candidate.uploads?.find(u => u.type === 'video');

    return (
        <div className="admin-dashboard">
            <AdminSidebar />
            <div className="admin-content">
                <Container fluid>
                    <div className="mb-4">
                        <Button className="btn-outline-gold" size="sm" onClick={() => navigate('/admin/candidates')}>
                            ← Back to List
                        </Button>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="text-white">
                            {candidate.firstName} {candidate.lastName}
                            <span className="ms-3 h5">{getApprovalBadge(candidate.approvalStatus || 'pending')}</span>
                            {candidate.approvalStatus === 'rejected' && (
                                <div className="text-danger mt-2 h6">Reason: {candidate.rejectionReason}</div>
                            )}
                        </h2>
                        <div className="d-flex gap-2">
                            {candidate.approvalStatus !== 'approved' && (
                                <Button
                                    className="btn-gold"
                                    onClick={() => setShowApproveModal(true)}
                                    disabled={processing}
                                >
                                    ✓ Approve Candidate
                                </Button>
                            )}
                            {candidate.approvalStatus !== 'rejected' && (
                                <Button
                                    variant="danger"
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={processing}
                                >
                                    ✗ Reject
                                </Button>
                            )}
                        </div>
                    </div>

                    <Row>
                        {/* Profile & Contact */}
                        <Col md={4} className="mb-4">
                            <Card bg="dark" text="white" className="h-100 border-secondary">
                                <Card.Header className="border-secondary">Candidate Profile</Card.Header>
                                <Card.Body>
                                    <div className="text-center mb-3">
                                        {photo ? (
                                            <div style={{ width: '150px', height: '150px', margin: '0 auto', overflow: 'hidden', borderRadius: '50%', border: '3px solid #d4af37' }}>
                                                <img
                                                    src={getMediaUrl(photo.url)}
                                                    alt="Profile"
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="d-flex align-items-center justify-content-center bg-secondary rounded-circle text-white mx-auto" style={{ width: '150px', height: '150px' }}>
                                                <span className="h1">{candidate.firstName[0]}{candidate.lastName[0]}</span>
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="text-center mb-1">{candidate.firstName} {candidate.lastName}</h4>
                                    <p className="text-center text-muted mb-4">{candidate.email}</p>

                                    <div className="border-top border-secondary pt-3">
                                        <p><strong>Phone:</strong> {candidate.phone || 'N/A'}</p>
                                        <p><strong>Joined:</strong> {new Date(candidate.createdAt).toLocaleDateString()}</p>
                                        <p><strong>Progress:</strong> {candidate.onboardingStep}</p>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Media Submissions */}
                        <Col md={8} className="mb-4">
                            <Card bg="dark" text="white" className="h-100 border-secondary">
                                <Card.Header className="border-secondary">Media Submissions</Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={6} className="mb-3">
                                            <h5>🎤 Audio Introduction</h5>
                                            {audio ? (
                                                <div className="p-3 bg-black rounded border border-secondary">
                                                    <audio controls src={getMediaUrl(audio.url)} className="w-100" />
                                                </div>
                                            ) : (
                                                <div className="text-muted p-3 border border-secondary rounded text-center">Not uploaded yet</div>
                                            )}
                                        </Col>
                                        <Col md={6} className="mb-3">
                                            <h5>🎥 Video Presentation</h5>
                                            {video ? (
                                                <div className="p-2 bg-black rounded border border-secondary">
                                                    <video controls src={getMediaUrl(video.url)} className="w-100 rounded" style={{ maxHeight: '250px' }} />
                                                </div>
                                            ) : (
                                                <div className="text-muted p-3 border border-secondary rounded text-center">Not uploaded yet</div>
                                            )}
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Questionnaire */}
                        <Col md={12}>
                            <Card bg="dark" text="white" className="border-secondary">
                                <Card.Header className="border-secondary">Questionnaire Responses</Card.Header>
                                <Card.Body>
                                    {candidate.questionnaire ? (
                                        <div>
                                            <Row>
                                                <Col md={6}>
                                                    <h5 className="text-gold mt-3 text-uppercase border-bottom border-dark pb-2">Work Experience</h5>
                                                    <p><strong>Occupation:</strong> {candidate.questionnaire.workExperience?.occupation}</p>
                                                    <p><strong>Years Experience:</strong> {candidate.questionnaire.workExperience?.yearsExperience}</p>
                                                    <p><strong>Skills:</strong> {candidate.questionnaire.workExperience?.skills}</p>
                                                    <p><strong>Education:</strong> {candidate.questionnaire.workExperience?.education}</p>
                                                </Col>
                                                <Col md={6}>
                                                    <h5 className="text-gold mt-3 text-uppercase border-bottom border-dark pb-2">About</h5>
                                                    <p><strong>Bio:</strong> {candidate.questionnaire.workExperience?.bio}</p>
                                                    <p><strong>Career Goals:</strong> {candidate.questionnaire.additionalInfo?.careerGoals}</p>
                                                    <p><strong>Availability:</strong> {candidate.questionnaire.additionalInfo?.availability}</p>
                                                </Col>
                                            </Row>

                                            <div className="mt-4">
                                                <h5 className="text-gold mt-3 text-uppercase border-bottom border-dark pb-2">Social & Links</h5>
                                                <Row>
                                                    <Col md={6}>
                                                        <p><strong>Social Media:</strong> {candidate.questionnaire.additionalInfo?.socialMedia || 'Not provided'}</p>
                                                    </Col>
                                                    <Col md={6}>
                                                        <p><strong>Website:</strong> {candidate.questionnaire.additionalInfo?.website ? (
                                                            <a href={candidate.questionnaire.additionalInfo?.website} target="_blank" rel="noreferrer" className="text-info">{candidate.questionnaire.additionalInfo?.website}</a>
                                                        ) : 'Not provided'}</p>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-muted text-center p-4">Questionnaire not completed yet</div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Approve Modal */}
            <ConfirmationModal
                show={showApproveModal}
                onHide={() => setShowApproveModal(false)}
                onConfirm={handleApprove}
                title="Approve Candidate"
                message={`Are you sure you want to approve ${candidate.firstName} ${candidate.lastName}? This will grant them access to the platform.`}
                confirmText="Approve Candidate"
                confirmVariant="success"
            />

            {/* Reject Modal */}
            <ConfirmationModal
                show={showRejectModal}
                onHide={() => setShowRejectModal(false)}
                onConfirm={handleReject}
                title="Reject Candidate"
                message={`Please provide a reason for rejecting ${candidate.firstName} ${candidate.lastName}'s application.`}
                confirmText="Reject Application"
                confirmVariant="danger"
                showReasonInput={true}
                reason={rejectionReason}
                onReasonChange={setRejectionReason}
            />
        </div>
    );
};

export default AdminCandidateDetails;
