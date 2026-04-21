import { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import QuestionnaireView from '../../components/admin/QuestionnaireView';
import api from '../../services/api';
import '../admin/AdminDashboard.css';
import './AdminCandidateDetails.css'; // Reuse existing styles

const AdminQuestionnaireDetails = () => {
    // Note: 'id' here will be the CANDIDATE ID since our current structure fetches questionnaire via candidate
    const { id } = useParams();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCandidateDetails();
    }, [id]);

    const fetchCandidateDetails = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            // Fetch the candidate who owns this questionnaire
            const response = await api.get(`/admin/candidates/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCandidate(response.data.candidate);
        } catch (error) {
            console.error('Failed to fetch details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center text-white p-5">Loading...</div>;
    if (!candidate) return <div className="text-center text-white p-5">Record not found</div>;

    return (
        <div className="admin-dashboard">
            <AdminSidebar />
            <div className="admin-content">
                <Container fluid className="candidate-details-container">
                    {/* Header with Back Button */}
                    <div className="mb-4 d-flex align-items-center justify-content-between">
                        <Button
                            className="btn-outline-gold"
                            size="sm"
                            onClick={() => navigate('/admin/questionnaires')}
                        >
                            ← Back to Questionnaires
                        </Button>
                    </div>

                    <div className="candidate-header mb-4">
                        <div className="d-flex align-items-center gap-3">
                            <div>
                                <h1 className="candidate-name mb-1">
                                    {candidate.questionnaire?.personalInfo?.firstName
                                        ?? candidate.questionnaire?.firstName
                                        || candidate.firstName}{' '}
                                    {candidate.questionnaire?.personalInfo?.lastName
                                        ?? candidate.questionnaire?.lastName
                                        || candidate.lastName}
                                </h1>
                                <p className="text-white-50 mb-0">Questionnaire Details</p>
                            </div>
                        </div>
                    </div>

                    {/* Dedicated Questionnaire View */}
                    <QuestionnaireView data={candidate.questionnaire} />

                </Container>
            </div>
        </div>
    );
};

export default AdminQuestionnaireDetails;
