import { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Trash2 } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import ConfirmationModal from '../../components/admin/ConfirmationModal';
import api from '../../services/api';
import '../admin/AdminDashboard.css';
import '../admin/AdminCandidates.css';

interface Questionnaire {
    id: number;
    userId: number;
    personalInfo?: any;
    submittedAt: string;
    completed: boolean;
    // UI fields populated during fetch
    title?: string;
    candidateName?: string;
    candidate_name?: string;
    status?: string;
    createdAt?: string;
    created_at?: string;
    User?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        candidateNumber?: string;
    };
}

const AdminQuestionnaires = () => {
    const navigate = useNavigate();
    const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);

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

            const payload = Array.isArray(response.data)
                ? response.data
                : Array.isArray(response.data?.questionnaires)
                    ? response.data.questionnaires
                    : [];

            // Map response to match interface expectations
            const data = payload.map((q: any) => ({
                ...q,
                title: q.title || `Questionnaire #${q.id}`,
                candidateName: q.User
                    ? `${q.User.firstName} ${q.User.lastName}`
                    : (q.user ? `${q.user.firstName || ''} ${q.user.lastName || ''}`.trim() : (q.candidateName || 'Unknown')),
                status: q.status ? String(q.status) : (q.completed ? 'Completed' : 'Pending')
            }));

            setQuestionnaires(data);
        } catch (error) {
            console.error('Failed to fetch questionnaires:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (q: Questionnaire) => {
        const targetId = q.userId;
        navigate(`/admin/candidates/${targetId}?tab=questionnaire`);
    };

    const handleDeleteClick = (q: Questionnaire) => {
        setSelectedQuestionnaire(q);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedQuestionnaire) return;

        try {
            const token = localStorage.getItem('adminToken');
            await api.delete(`/admin/questionnaires/${selectedQuestionnaire.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowDeleteModal(false);
            setSelectedQuestionnaire(null);
            fetchQuestionnaires();
        } catch (error) {
            console.error('Failed to delete questionnaire:', error);
            alert('Failed to delete questionnaire');
        }
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB');
    };

    return (
        <div className="admin-dashboard">
            <AdminSidebar />
            <div className="admin-content">
                <Container fluid className="admin-questionnaires-container">
                    <div className="page-header">
                        <div>
                            <h1 className="page-title">
                                <FileText size={32} color="#c9a227" />
                                Questionnaires
                            </h1>
                            <p className="page-subtitle">View and manage all candidate questionnaires</p>
                        </div>
                        <div className="total-badge">
                            {questionnaires.length} TOTAL
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center text-white py-5">
                            <div className="spinner-border text-gold" role="status"></div>
                        </div>
                    ) : (
                        <div className="table-card">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Candidate</th>
                                        <th>Status</th>
                                        <th>Created Date</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {questionnaires.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center py-5 text-muted">
                                                No questionnaires found
                                            </td>
                                        </tr>
                                    ) : (
                                        questionnaires.map((q) => (
                                            <tr key={q.id}>
                                                <td data-label="Title" className="col-title">
                                                    {q.title}
                                                </td>
                                                <td data-label="Candidate" className="col-candidate">
                                                    {q.candidateName}
                                                </td>
                                                <td data-label="Status">
                                                    <span className={`status-badge ${q.status?.toLowerCase()}`}>
                                                        {q.status}
                                                    </span>
                                                </td>
                                                <td data-label="Created Date" className="col-date">
                                                    {formatDate(q.submittedAt || q.created_at || q.createdAt)}
                                                </td>
                                                <td data-label="Actions" className="col-actions">
                                                    <div className="action-btn-group">
                                                        <button
                                                            className="action-btn view"
                                                            onClick={() => handleView(q)}
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} /> View
                                                        </button>
                                                        <button
                                                            className="action-btn delete"
                                                            onClick={() => handleDeleteClick(q)}
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Container>
            </div>

            <ConfirmationModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Questionnaire"
                message={`Are you sure you want to delete the questionnaire for ${selectedQuestionnaire?.candidateName}?`}
                confirmText="Delete"
                confirmVariant="danger"
            />
        </div>
    );
};

export default AdminQuestionnaires;
