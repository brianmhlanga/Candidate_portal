import { useState, useRef, useEffect } from 'react';
import { Button, Alert, Spinner } from 'react-bootstrap';
import api from '../../services/api';
import './OnboardingSteps.css';

interface AudioRecordingProps {
    onComplete: (nextStep: string) => void;
}

const AudioRecording = ({ onComplete }: AudioRecordingProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioURL, setAudioURL] = useState('');
    const [duration, setDuration] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioURL(URL.createObjectURL(blob));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setDuration(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
            setError('Failed to access microphone. Please grant permission and try again.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    const handleReRecord = () => {
        setAudioBlob(null);
        setAudioURL('');
        setDuration(0);
        setError('');
    };

    const handleUpload = async () => {
        if (!audioBlob) {
            setError('Please record audio first');
            return;
        }

        if (duration < 30 || duration > 45) {
            setError('Audio must be between 30 and 45 seconds');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const arrayBuffer = await audioBlob.arrayBuffer();

            await api.post(`/uploads/direct-audio?duration=${duration}`, arrayBuffer, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'audio/webm'
                }
            });

            onComplete('video-recording');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload audio. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="onboarding-step audio-recording-step">
            <div className="step-header">
                <div className="step-icon-badge">🎤</div>
                <h2>Record Your Audio Introduction</h2>
                <p className="step-description">
                    Introduce yourself in 30-45 seconds. Tell us about your experience and goals.
                </p>
            </div>

            {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                    {error}
                </Alert>
            )}

            <div className="recording-container">
                <div className="recording-display">
                    {isRecording ? (
                        <div className="recording-active">
                            <div className="pulse-circle"></div>
                            <div className="recording-time">{formatTime(duration)}</div>
                            <p className="recording-label">Recording...</p>
                        </div>
                    ) : audioBlob ? (
                        <div className="recording-complete">
                            <div className="audio-player">
                                <audio src={audioURL} controls className="audio-control" />
                            </div>
                            <div className="recording-info">
                                <p>Duration: {formatTime(duration)}</p>
                                {(duration < 30 || duration > 45) && (
                                    <Alert variant="warning" className="mt-2">
                                        Audio must be between 30-45 seconds
                                    </Alert>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="recording-ready">
                            <div className="mic-icon">🎙️</div>
                            <p className="ready-text">Ready to record</p>
                        </div>
                    )}
                </div>

                <div className="recording-controls">
                    {!isRecording && !audioBlob && (
                        <Button
                            variant="danger"
                            size="lg"
                            onClick={startRecording}
                            className="btn-record"
                        >
                            <span className="button-icon">⏺</span> Start Recording
                        </Button>
                    )}

                    {isRecording && (
                        <Button
                            variant="warning"
                            size="lg"
                            onClick={stopRecording}
                            className="btn-stop"
                        >
                            <span className="button-icon">⏹</span> Stop Recording
                        </Button>
                    )}

                    {audioBlob && !isRecording && (
                        <div className="action-buttons">
                            <Button
                                variant="outline-secondary"
                                onClick={handleReRecord}
                                disabled={uploading}
                            >
                                🔄 Re-record
                            </Button>
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleUpload}
                                disabled={uploading || duration < 30 || duration > 45}
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
                    )}
                </div>
            </div>

            <div className="step-tips">
                <h4>Recording Tips:</h4>
                <ul>
                    <li>Find a quiet location with minimal background noise</li>
                    <li>Speak clearly and at a moderate pace</li>
                    <li>Mention your name, experience, and career goals</li>
                    <li>Keep it between 30-45 seconds</li>
                </ul>
            </div>
        </div>
    );
};

export default AudioRecording;
