import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './OnboardingSteps.css';

const Completion = () => {
    const navigate = useNavigate();

    const handleGoToDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div className="onboarding-step completion-step">
            <div className="completion-content">
                <div className="success-animation">
                    <div className="success-checkmark">
                        <div className="check-icon">
                            <span className="icon-line line-tip"></span>
                            <span className="icon-line line-long"></span>
                            <div className="icon-circle"></div>
                            <div className="icon-fix"></div>
                        </div>
                    </div>
                </div>

                <h1 className="completion-title">Congratulations! 🎉</h1>

                <p className="completion-message">
                    You've successfully completed your profile for 3% Generation Agency!
                </p>

                <div className="completion-details">
                    <div className="detail-card">
                        <div className="detail-icon">✅</div>
                        <h3>Profile Complete</h3>
                        <p>Your information has been submitted and saved</p>
                    </div>

                    <div className="detail-card">
                        <div className="detail-icon">👀</div>
                        <h3>Under Review</h3>
                        <p>Our team will review your profile shortly</p>
                    </div>

                    <div className="detail-card">
                        <div className="detail-icon">📧</div>
                        <h3>Stay Tuned</h3>
                        <p>We'll contact you via email with next steps</p>
                    </div>
                </div>

                <div className="next-steps-box">
                    <h3 className="next-steps-title">What happens next?</h3>
                    <ul className="next-steps-list">
                        <li>Our team reviews your profile, photos, audio, and video</li>
                        <li>We'll match you with suitable opportunities</li>
                        <li>You'll receive an email within 3-5 business days</li>
                        <li>Keep an eye on your inbox for updates!</li>
                    </ul>
                </div>

                <div className="completion-actions">
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleGoToDashboard}
                        className="btn-return"
                    >
                        Return to Dashboard
                    </Button>
                </div>

                <p className="thank-you-note">
                    Thank you for choosing 3% Generation Agency. We're excited to work with you!
                </p>
            </div>
        </div>
    );
};

export default Completion;
