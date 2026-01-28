import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Welcome from './onboarding/Welcome';
import PhotoUpload from './onboarding/PhotoUpload';
import AudioRecording from './onboarding/AudioRecording';
import VideoRecording from './onboarding/VideoRecording';
import Questionnaire from './onboarding/Questionnaire';
import Completion from './onboarding/Completion';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<string>('welcome');

    // Step configuration with icons
    const steps = [
        { id: 'welcome', label: 'Welcome', icon: '💡', component: Welcome },
        { id: 'photo-upload', label: 'Photo Upload', icon: '📷', component: PhotoUpload },
        { id: 'audio-recording', label: 'Audio Recording', icon: '🎤', component: AudioRecording },
        { id: 'video-recording', label: 'Video Recording', icon: '🎥', component: VideoRecording },
        { id: 'questionnaire', label: 'Questionnaire', icon: '📝', component: Questionnaire },
        { id: 'completion', label: 'Completion', icon: '✓', component: Completion }
    ];

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Set current step from user's onboarding progress
        if (user.onboardingStep) {
            setCurrentStep(user.onboardingStep);
        }
    }, [user, navigate]);

    const handleStepComplete = (nextStep: string) => {
        setCurrentStep(nextStep);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Get current step index
    const currentStepIndex = steps.findIndex(s => s.id === currentStep);
    const CurrentStepComponent = steps[currentStepIndex]?.component || Welcome;

    return (
        <div className="user-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <img src="/assets/logo.png" alt="3% Generation" className="dashboard-logo" />
                    <button onClick={handleLogout} className="sign-out-btn">Sign Out</button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-navigation">
                <div className="tab-navigation-content">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`nav-tab ${index === currentStepIndex ? 'active' :
                                    index < currentStepIndex ? 'completed' :
                                        'pending'
                                }`}
                        >
                            <span className="tab-icon">{step.icon}</span>
                            <span className="tab-label">{step.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                <CurrentStepComponent
                    onComplete={handleStepComplete}
                    currentStep={currentStep}
                />
            </div>
        </div>
    );
};

export default Dashboard;
