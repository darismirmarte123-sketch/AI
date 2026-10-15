import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { triggerHaptic } from '../utils/audioChime';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: { data: string; mimeType: string; previewUrl: string }) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setCameraError(null);
      return;
    }

    startCamera(facingMode);

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async (mode: 'environment' | 'user') => {
    stopCamera();
    setCameraError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        'No se pudo acceder a la cámara en vivo. Puedes subir una foto desde tu galería o archivos.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    triggerHaptic(20);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    triggerHaptic(40);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCapturedImage(result);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const confirmPhoto = () => {
    if (!capturedImage) return;
    triggerHaptic(30);

    const base64Data = capturedImage.split(',')[1];
    const mimeType = capturedImage.split(';')[0].replace('data:', '') || 'image/jpeg';

    onCapture({
      data: base64Data,
      mimeType,
      previewUrl: capturedImage,
    });

    onClose();
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
    triggerHaptic(20);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-slate-100 text-sm">Cámara del Asistente</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewfinder or Preview */}
        <div className="relative flex-1 bg-black min-h-[320px] max-h-[460px] flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            <img src={capturedImage} alt="Captura" className="w-full h-full object-contain" />
          ) : cameraError ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-slate-300">
              <AlertCircle className="w-12 h-12 text-amber-400 mb-2" />
              <p className="text-xs text-slate-400 mb-4">{cameraError}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition"
              >
                <ImageIcon className="w-4 h-4" />
                Seleccionar foto de galería
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Phone Viewfinder grid */}
              <div className="absolute inset-8 pointer-events-none border border-white/20 rounded-2xl flex items-center justify-center">
                <span className="w-6 h-6 border-t-2 border-l-2 border-cyan-400 absolute top-0 left-0" />
                <span className="w-6 h-6 border-t-2 border-r-2 border-cyan-400 absolute top-0 right-0" />
                <span className="w-6 h-6 border-b-2 border-l-2 border-cyan-400 absolute bottom-0 left-0" />
                <span className="w-6 h-6 border-b-2 border-r-2 border-cyan-400 absolute bottom-0 right-0" />
              </div>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Controls footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-around">
          {capturedImage ? (
            <>
              <button
                onClick={retake}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
              >
                <RefreshCw className="w-4 h-4" />
                Repetir
              </button>
              <button
                onClick={confirmPhoto}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/25 transition"
              >
                <Check className="w-4 h-4" />
                Usar esta foto
              </button>
            </>
          ) : (
            <>
              {/* Gallery button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Elegir foto de galería"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              {/* Shutter button */}
              <button
                onClick={takePhoto}
                disabled={!!cameraError}
                className="w-16 h-16 rounded-full border-4 border-slate-900 bg-white hover:bg-slate-100 flex items-center justify-center shadow-xl active:scale-95 transition disabled:opacity-40"
              >
                <div className="w-12 h-12 rounded-full border-2 border-slate-800 bg-white" />
              </button>

              {/* Flip camera */}
              <button
                onClick={toggleFacingMode}
                className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Cambiar cámara frontal/trasera"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
