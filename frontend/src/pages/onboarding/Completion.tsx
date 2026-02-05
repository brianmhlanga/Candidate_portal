import { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Questionnaire from './Questionnaire';
import './OnboardingSteps.css';
import './Completion.css';

interface CompletionProps {
    onComplete?: (nextStep: string) => void;
}

const Completion = ({ onComplete }: CompletionProps) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'summary' | 'questionnaire'>('summary');
    const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch questionnaire status on mount
    useEffect(() => {
        const checkQuestionnaireStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await api.get('/questionnaire/status', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setQuestionnaireCompleted(response.data.completed || false);
            } catch (error) {
                console.error('Failed to fetch questionnaire status:', error);
                setQuestionnaireCompleted(false);
            } finally {
                setLoading(false);
            }
        };

        checkQuestionnaireStatus();
    }, []);

    const handleSignOut = () => {
        logout();
        navigate('/login');
    };

    const handleQuestionnaireComplete = () => {
        // Refresh status and show congratulations
        setQuestionnaireCompleted(true);
        setActiveTab('summary');
        // Signal dashboard that everything is finished
        if (onComplete) {
            onComplete('finished');
        }
    };

    // Calculate progress based on requirement: 87% before questionnaire, 100% after
    const progress = questionnaireCompleted ? 100 : 87;

    if (loading) {
        return <div className="completion-page" style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>Loading...</div>;
    }

    return (
        <div className="completion-page">
            {/* Congratulations Header (shown only on summary tab) */}
            {activeTab === 'summary' && (
                <div className="completion-header">
                    <div className="success-icon-large">
                        <div className="checkmark-circle">✓</div>
                    </div>
                    <h1 className="completion-title">
                        {questionnaireCompleted ? 'Congratulations!' : 'Almost There!'}
                    </h1>
                    <p className="completion-subtitle">
                        {questionnaireCompleted
                            ? "You've completed the 3% Generation onboarding process"
                            : "You've completed the media uploads"}
                    </p>
                    {!questionnaireCompleted && (
                        <p className="completion-notice">
                            Please complete the final application questionnaire to finish your candidacy.
                        </p>
                    )}
                </div>
            )}

            {/* Tab Navigation */}
            <div className="completion-tabs">
                <button
                    className={`completion-tab ${activeTab === 'summary' ? 'active' : ''}`}
                    onClick={() => setActiveTab('summary')}
                >
                    📊 Onboarding Summary
                </button>
                <button
                    className={`completion-tab ${activeTab === 'questionnaire' ? 'active' : ''}`}
                    onClick={() => setActiveTab('questionnaire')}
                >
                    📝 Application Questionnaire
                    {!questionnaireCompleted && <span className="required-badge">REQUIRED</span>}
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-panel">
                {activeTab === 'summary' ? (
                    /* Onboarding Summary Tab */
                    <div className="summary-panel">
                        {/* Progress Section */}
                        <div className="progress-section">
                            <div className="progress-header">
                                <h3>Onboarding Progress</h3>
                                <span className="progress-percent">{progress}% Complete</span>
                            </div>
                            <div className="progress-bar-container">
                                <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                            </div>

                            <div className="progress-cards">
                                <div className="progress-card completed">
                                    <div className="card-icon">📋</div>
                                    <div className="card-content">
                                        <h4>ID Assessment</h4>
                                        <span className="status-badge completed">Completed</span>
                                    </div>
                                </div>

                                <div className="progress-card completed">
                                    <div className="card-icon">📸</div>
                                    <div className="card-content">
                                        <h4>Profile Photo</h4>
                                        <span className="status-badge completed">Completed</span>
                                    </div>
                                </div>

                                <div className="progress-card completed">
                                    <div className="card-icon">🎤</div>
                                    <div className="card-content">
                                        <h4>Audio Recording</h4>
                                        <span className="status-badge completed">Completed</span>
                                    </div>
                                </div>

                                <div className="progress-card completed">
                                    <div className="card-icon">🎥</div>
                                    <div className="card-content">
                                        <h4>Video Recording</h4>
                                        <span className="status-badge completed">Completed</span>
                                    </div>
                                </div>

                                <div className={`progress-card ${questionnaireCompleted ? 'completed' : 'incomplete'}`}>
                                    <div className="card-icon">📋</div>
                                    <div className="card-content">
                                        <h4>Application Questionnaire</h4>
                                        <span className={`status-badge ${questionnaireCompleted ? 'completed' : 'incomplete'}`}>
                                            {questionnaireCompleted ? 'Completed' : 'Incomplete'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Application Status */}
                        {!questionnaireCompleted ? (
                            <div className="application-status">
                                <h3>Application Status</h3>
                                <div className="status-alert">
                                    <div className="alert-content">
                                        <span className="alert-icon">⚠️</span>
                                        <p>Please complete the application questionnaire to finalize your candidacy.</p>
                                    </div>
                                    <Button
                                        className="complete-now-btn"
                                        onClick={() => setActiveTab('questionnaire')}
                                    >
                                        Complete Now →
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="application-status">
                                <h3>Application Status</h3>
                                <div className="status-alert" style={{ borderColor: '#4caf50' }}>
                                    <div className="alert-content">
                                        <span className="alert-icon">✅</span>
                                        <p>Your application is complete! Our team will review it within 3-5 business days.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* What Happens Next */}
                        <div className="next-steps-section">
                            <h3>What Happens Next?</h3>
                            <div className="next-steps-list">
                                <div className="next-step-item">
                                    <div className="step-number">1</div>
                                    <div className="step-content">
                                        <h4>Application Review</h4>
                                        <p>Our team will review your onboarding materials within 3-5 business days.</p>
                                    </div>
                                </div>

                                <div className="next-step-item">
                                    <div className="step-number">2</div>
                                    <div className="step-content">
                                        <h4>Feedback</h4>
                                        <p>You will receive feedback on your application via email.</p>
                                    </div>
                                </div>

                                <div className="next-step-item">
                                    <div className="step-number">3</div>
                                    <div className="step-content">
                                        <h4>Interview</h4>
                                        <p>If your application meets our requirements, you will be invited for a virtual interview.</p>
                                    </div>
                                </div>

                                <div className="next-step-item">
                                    <div className="step-number">4</div>
                                    <div className="step-content">
                                        <h4>Final Decision</h4>
                                        <p>Following the interview, a final decision will be made regarding your candidacy.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sign Out Button */}
                        <div className="sign-out-section">
                            <Button variant="outline-light" onClick={handleSignOut} className="sign-out-button">
                                🚪 Sign Out
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* Application Questionnaire Tab */
                    <div className="questionnaire-panel">
                        <Questionnaire onComplete={handleQuestionnaireComplete} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Completion;
