import { useState, useRef, useEffect } from 'react';
import { Button, Alert, Spinner } from 'react-bootstrap';
import api from '../../services/api';
import './OnboardingSteps.css';

interface VideoRecordingProps {
    onComplete: (nextStep: string) => void;
}

const VideoRecording = ({ onComplete }: VideoRecordingProps) => {
    const [isRecording, setIsRecording] = useState(false);
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
    const [videoURL, setVideoURL] = useState('');
    const [duration, setDuration] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [stream, setStream] = useState<MediaStream | null>(null);

    const videoPreviewRef = useRef<HTMLVideoElement>(null);
    const videoPlaybackRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 },
                audio: true
            });
            setStream(mediaStream);
            if (videoPreviewRef.current) {
                videoPreviewRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setError('Failed to access camera. Please grant permission and try again.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const startRecording = () => {
        if (!stream) return;

        chunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp8,opus'
        });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunksRef.current.push(e.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            setVideoBlob(blob);
            setVideoURL(URL.createObjectURL(blob));
            stopCamera();
        };

        mediaRecorder.start();
        setIsRecording(true);
        setDuration(0);

        timerRef.current = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);
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

    const handleReRecord = async () => {
        setVideoBlob(null);
        setVideoURL('');
        setDuration(0);
        setError('');
        await startCamera();
    };

    const handleUpload = async () => {
        if (!videoBlob) {
            setError('Please record a video first');
            return;
        }

        if (duration < 60 || duration > 90) {
            setError('Video must be between 60 and 90 seconds');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const arrayBuffer = await videoBlob.arrayBuffer();

            await api.post('/uploads/direct-video', arrayBuffer, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'video/webm',
                    'X-Video-Duration': duration.toString()
                }
            });

            onComplete('questionnaire');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload video. Please try again.');
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
        <div className="onboarding-step video-recording-step">
            <div className="step-header">
                <div className="step-icon-badge">🎥</div>
                <h2>Record Your Video Presentation</h2>
                <p className="step-description">
                    Record a 60-90 second video introducing yourself and showcasing your personality.
                </p>
            </div>

            {error && (
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                    {error}
                </Alert>
            )}

            <div className="video-recording-container">
                <div className="video-display">
                    {!videoBlob ? (
                        <video
                            ref={videoPreviewRef}
                            autoPlay
                            muted
                            playsInline
                            className="video-preview"
                        />
                    ) : (
                        <video
                            ref={videoPlaybackRef}
                            src={videoURL}
                            controls
                            className="video-playback"
                        />
                    )}

                    <div className="video-overlay">
                        {isRecording && (
                            <div className="recording-indicator">
                                <span className="recording-dot"></span>
                                <span className="recording-time">{formatTime(duration)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {videoBlob && (duration < 60 || duration > 90) && (
                    <Alert variant="warning" className="mt-3">
                        Video must be between 60-90 seconds. Current: {formatTime(duration)}
                    </Alert>
                )}

                <div className="recording-controls">
                    {!isRecording && !videoBlob && (
                        <Button
                            variant="danger"
                            size="lg"
                            onClick={startRecording}
                            disabled={!stream}
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

                    {videoBlob && !isRecording && (
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
                                disabled={uploading || duration < 60 || duration > 90}
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
                    <li>Ensure good lighting - face the light source</li>
                    <li>Choose a clean, professional background</li>
                    <li>Look directly at the camera</li>
                    <li>Speak confidently about your experience and goals</li>
                    <li>Duration should be 60-90 seconds</li>
                </ul>
            </div>
        </div>
    );
};

export default VideoRecording;
