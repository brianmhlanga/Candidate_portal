import { Button } from 'react-bootstrap';
import './OnboardingSteps.css';

interface WelcomeProps {
    onComplete: (nextStep: string) => void;
    currentStep?: string;
}

const Welcome = ({ onComplete }: WelcomeProps) => {
    const handleGetStarted = () => {
        onComplete('photo-upload');
    };

    return (
        <div className="onboarding-step welcome-step">
            <div className="welcome-content">
                {/* Yellow Welcome Badge */}
                <div className="welcome-badge">WELCOME</div>

                {/* Main Heading */}
                <h1 className="welcome-heading">
                    Unlock Your Potential: Begin Your Journey with<br />3% Generation
                </h1>

                {/* Subtitle */}
                <p className="welcome-subtitle">
                    This is more than an onboarding process; it's your first step towards a transformative career. Join an elite network of top-tier talent and access exclusive opportunities tailored to your skills.
                </p>

                {/* Get Started Button */}
                <div className="welcome-actions">
                    <Button
                        className="btn-get-started"
                        size="lg"
                        onClick={handleGetStarted}
                    >
                        Get Started
                    </Button>
                </div>

                {/* Additional Info */}
                <div className="welcome-info-box">
                    <h3 className="info-title">What You'll Complete:</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-icon">📷</span>
                            <span className="info-text">Professional Photo</span>
                        </div>
                        <div className="info-item">
                            <span className="info-icon">🎤</span>
                            <span className="info-text">Audio Introduction</span>
                        </div>
                        <div className="info-item">
                            <span className="info-icon">🎥</span>
                            <span className="info-text">Video Presentation</span>
                        </div>
                        <div className="info-item">
                            <span className="info-icon">📝</span>
                            <span className="info-text">Profile Questionnaire</span>
                        </div>
                    </div>
                    <p className="info-note">⏱️ Estimated time: 15-20 minutes</p>
                </div>
            </div>
        </div>
    );
};

export default Welcome;
