import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StepIndicator from '../components/StepIndicator';
import Welcome from './onboarding/Welcome';
import PhotoUpload from './onboarding/PhotoUpload';
import AudioRecording from './onboarding/AudioRecording';
import VideoRecording from './onboarding/VideoRecording';
import Completion from './onboarding/Completion';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<string>('welcome');
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);

    // Step configuration
    const steps = [
        { id: 'welcome', component: Welcome },
        { id: 'id-assessment', component: Welcome }, // Placeholder
        { id: 'photo-upload', component: PhotoUpload },
        { id: 'audio-recording', component: AudioRecording },
        { id: 'video-recording', component: VideoRecording }, // Includes tabs for summary + recording
        { id: 'completion', component: Completion } // Includes tabs for summary + questionnaire
    ];

    useEffect(() => {
        if (loading || !user) return;

        // Set current step from user's onboarding progress
        if (user.onboardingStep) {
            // Handle legacy 'questionnaire' step (now part of completion)
            if (user.onboardingStep === 'questionnaire') {
                console.log('Legacy questionnaire step detected, redirecting to completion');
                setCurrentStep('completion');
            } else {
                setCurrentStep(user.onboardingStep);
            }
        }
    }, [user, loading, navigate]);

    const handleStepComplete = (nextStep: string) => {
        // Mark current step as completed
        if (!completedSteps.includes(currentStep)) {
            setCompletedSteps([...completedSteps, currentStep]);
        }
        setCurrentStep(nextStep);
    };

    const handleStepClick = (stepId: string) => {
        // Allow navigation to clicked step if it's completed or current
        setCurrentStep(stepId);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Get current step component
    const currentStepIndex = steps.findIndex(s => s.id === currentStep);
    const currentStepData = steps[currentStepIndex];

    // Debug logging
    useEffect(() => {
        console.log('Dashboard Debug:', {
            currentStep,
            currentStepIndex,
            hasStepData: !!currentStepData,
            userStep: user?.onboardingStep,
            availableSteps: steps.map(s => s.id)
        });

        // If step is invalid, reset to welcome
        if (currentStepIndex === -1 && currentStep !== 'welcome') {
            console.warn('Invalid step detected, resetting to welcome');
            setCurrentStep('welcome');
        }
    }, [currentStep, currentStepIndex, currentStepData, user]);

    // Render appropriate component with props
    const renderStepComponent = () => {
        if (!currentStepData) {
            console.error('No step data for:', currentStep);
            return (
                <div style={{ color: 'white', padding: '20px' }}>
                    <h3>Error: Invalid step "{currentStep}"</h3>
                    <button onClick={() => setCurrentStep('welcome')}>Return to Welcome</button>
                </div>
            );
        }

        const Component = currentStepData.component;
        const commonProps = {
            onComplete: handleStepComplete,
            currentStep: currentStep
        };

        return <Component {...commonProps} />;
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-gold">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="user-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <img src="/assets/logo.png" alt="3% Generation" className="dashboard-logo" />
                    <button onClick={handleLogout} className="sign-out-btn">Sign Out</button>
                </div>
            </div>

            {/* Step Indicator */}
            <StepIndicator
                currentStep={currentStep}
                completedSteps={completedSteps}
                onStepClick={handleStepClick}
            />

            {/* Main Content */}
            <div className="dashboard-content">
                {renderStepComponent()}
            </div>
        </div>
    );
};

export default Dashboard;
