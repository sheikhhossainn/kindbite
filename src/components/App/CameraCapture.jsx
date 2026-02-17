import { useState, useRef, useEffect, useCallback } from 'react';

export default function CameraCapture({ onCapture, onClose }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [error, setError] = useState(null);

    // Start camera
    useEffect(() => {
        let mounted = true;

        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'environment', // Rear camera
                        width: { ideal: 1280 },
                        height: { ideal: 1280 }
                    },
                    audio: false
                });

                if (!mounted) {
                    stream.getTracks().forEach(t => t.stop());
                    return;
                }

                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play();
                        setCameraReady(true);
                    };
                }
            } catch (err) {
                console.error('Camera error:', err);
                setError('Could not access camera. Please allow camera permissions.');
            }
        }

        startCamera();

        return () => {
            mounted = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    // Capture photo
    const handleCapture = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Calculate square crop from center of video
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        const size = Math.min(vw, vh);
        const sx = (vw - size) / 2;
        const sy = (vh - size) / 2;

        // Output: 800x800 compressed
        canvas.width = 800;
        canvas.height = 800;
        ctx.drawImage(video, sx, sy, size, size, 0, 0, 800, 800);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setCapturedImage(dataUrl);

        // Stop camera while previewing
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
        }
    }, []);

    // Retake
    const handleRetake = useCallback(async () => {
        setCapturedImage(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 1280 } },
                audio: false
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (err) {
            setError('Could not restart camera.');
        }
    }, []);

    // Confirm & send blob
    const handleConfirm = useCallback(() => {
        if (!canvasRef.current) return;
        canvasRef.current.toBlob(
            (blob) => {
                if (blob) onCapture(blob);
            },
            'image/jpeg',
            0.7
        );
    }, [onCapture]);

    // Error screen
    if (error) {
        return (
            <div className="fixed inset-0 z-[3000] bg-black flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl p-6 max-w-sm text-center">
                    <div className="text-4xl mb-4">📷</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Camera Error</h3>
                    <p className="text-sm text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[3000] bg-black flex flex-col">
            {/* Hidden canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4 pt-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => {
                            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
                            onClose();
                        }}
                        className="text-white/80 hover:text-white p-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <span className="text-white font-bold text-sm">📸 Take Food Photo</span>
                    <div className="w-10"></div>
                </div>
            </div>

            {/* Camera / Preview */}
            {capturedImage ? (
                /* Preview captured image */
                <div className="flex-1 flex items-center justify-center bg-black p-4">
                    <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden border-4 border-white/20">
                        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                    </div>
                </div>
            ) : (
                /* Live camera with square viewfinder */
                <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Square viewfinder overlay */}
                    {/* Top dark bar */}
                    <div className="absolute top-0 left-0 right-0 bg-black/50" style={{ height: 'calc((100% - min(80vw, 80vh)) / 2)' }} />
                    {/* Bottom dark bar */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50" style={{ height: 'calc((100% - min(80vw, 80vh)) / 2)' }} />
                    {/* Left dark bar */}
                    <div className="absolute left-0 bg-black/50" style={{ top: 'calc((100% - min(80vw, 80vh)) / 2)', bottom: 'calc((100% - min(80vw, 80vh)) / 2)', width: 'calc((100% - min(80vw, 80vh)) / 2)' }} />
                    {/* Right dark bar */}
                    <div className="absolute right-0 bg-black/50" style={{ top: 'calc((100% - min(80vw, 80vh)) / 2)', bottom: 'calc((100% - min(80vw, 80vh)) / 2)', width: 'calc((100% - min(80vw, 80vh)) / 2)' }} />

                    {/* Square border with corners */}
                    <div className="relative z-10" style={{ width: 'min(80vw, 80vh)', height: 'min(80vw, 80vh)' }}>
                        <div className="absolute inset-0 border-2 border-white/40 rounded-lg"></div>
                        {/* Corner accents */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-md"></div>
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-md"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-md"></div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-md"></div>
                        {/* Label */}
                        <div className="absolute -bottom-8 left-0 right-0 text-center">
                            <span className="text-white/70 text-xs font-medium">Capture the food only</span>
                        </div>
                    </div>

                    {!cameraReady && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
                            <div className="text-white text-center">
                                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-3"></div>
                                <p className="text-sm">Starting camera...</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Bottom Controls */}
            <div className="bg-gradient-to-t from-black/90 to-transparent p-6 pb-8">
                {capturedImage ? (
                    <div className="flex gap-4 max-w-sm mx-auto">
                        <button
                            onClick={handleRetake}
                            className="flex-1 py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-bold text-sm backdrop-blur-sm"
                        >
                            🔄 Retake
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-green-500/30"
                        >
                            ✅ Confirm & Upload
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <button
                            onClick={handleCapture}
                            disabled={!cameraReady}
                            className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30 border-4 border-white/50"
                        >
                            <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-300"></div>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
