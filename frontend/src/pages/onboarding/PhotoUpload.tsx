import { useState, type ChangeEvent } from 'react';
import { Button, Alert, Spinner } from 'react-bootstrap';
import api from '../../services/api';
import './OnboardingSteps.css';

interface PhotoUploadProps {
    onComplete: (nextStep: string) => void;
}

const PhotoUpload = ({ onComplete }: PhotoUploadProps) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file (JPG, PNG, etc.)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setSelectedFile(file);
        setError('');

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a photo first');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const arrayBuffer = await selectedFile.arrayBuffer();

            const response = await api.post('/uploads/direct-photo', arrayBuffer, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': selectedFile.type
                }
            });

            if (response.data) {
                // Success - move to next step
                onComplete('audio-recording');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload photo. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="onboarding-step photo-upload-step">
            <div className="step-header">
                <div className="step-icon-badge">📸</div>
                <h2>Upload Your Professional Photo</h2>
                <p className="step-description">
                    Please upload a clear, professional headshot. This will be your profile picture.
                </p>
            </div>

            {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                    {error}
                </Alert>
            )}

            <div className="upload-container">
                {preview ? (
                    <div className="photo-preview-container">
                        <img src={preview} alt="Preview" className="photo-preview" />
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => {
                                setSelectedFile(null);
                                setPreview('');
                            }}
                            className="change-photo-btn"
                        >
                            Change Photo
                        </Button>
                    </div>
                ) : (
                    <div className="upload-dropzone">
                        <div className="dropzone-content">
                            <div className="upload-icon">📷</div>
                            <p className="upload-text">Click to select a photo</p>
                            <p className="upload-hint">JPG, PNG • Max 5MB</p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="file-input"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="step-actions">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="btn-submit"
                >
                    {uploading ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <span className="button-icon">✓</span> Continue
                        </>
                    )}
                </Button>
            </div>

            <div className="step-tips">
                <h4>Tips for a great photo:</h4>
                <ul>
                    <li>Use good lighting - natural light works best</li>
                    <li>Plain background preferred</li>
                    <li>Clear front-facing shot</li>
                    <li>Professional attire recommended</li>
                </ul>
            </div>
        </div>
    );
};

export default PhotoUpload;
