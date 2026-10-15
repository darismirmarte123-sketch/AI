import React, { useRef } from 'react';
import {
  Image,
  Video,
  Music,
  FileText,
  Camera,
  X,
  Upload,
} from 'lucide-react';
import { FileAttachment } from '../types/assistant';
import { triggerHaptic } from '../utils/audioChime';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAttachment: (attachment: FileAttachment) => void;
  onOpenLiveCamera: () => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onSelectAttachment,
  onOpenLiveCamera,
}) => {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'image' | 'video' | 'audio' | 'document'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic(30);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(',')[1];
      const mimeType = file.type || (type === 'document' ? 'application/pdf' : 'application/octet-stream');

      onSelectAttachment({
        name: file.name,
        type,
        mimeType,
        data: base64Data,
        previewUrl: dataUrl,
        size: file.size,
      });

      onClose();
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-[32px] bg-slate-900 border-2 border-cyan-500/40 p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Cargar Archivo a Nova</h3>
              <p className="text-[10px] text-slate-400">Imágenes, videos, audios o documentos</p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic(20);
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Options Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Option 1: Live Camera */}
          <button
            onClick={() => {
              triggerHaptic(25);
              onClose();
              onOpenLiveCamera();
            }}
            className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-left transition flex flex-col justify-between group active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Cámara en Vivo</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Tomar foto ahora</p>
            </div>
          </button>

          {/* Option 2: Image from Gallery */}
          <button
            onClick={() => {
              triggerHaptic(25);
              imageInputRef.current?.click();
            }}
            className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-left transition flex flex-col justify-between group active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Foto o Imagen</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Galería o archivos</p>
            </div>
          </button>

          {/* Option 3: Video */}
          <button
            onClick={() => {
              triggerHaptic(25);
              videoInputRef.current?.click();
            }}
            className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 text-left transition flex flex-col justify-between group active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Video</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">MP4, WebM, MOV</p>
            </div>
          </button>

          {/* Option 4: Audio */}
          <button
            onClick={() => {
              triggerHaptic(25);
              audioInputRef.current?.click();
            }}
            className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-left transition flex flex-col justify-between group active:scale-95"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Audio o Nota</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">MP3, WAV, grabaciones</p>
            </div>
          </button>
        </div>

        {/* Option 5: Document / PDF */}
        <button
          onClick={() => {
            triggerHaptic(25);
            docInputRef.current?.click();
          }}
          className="w-full p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-left flex items-center gap-3 transition active:scale-98"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Documento o PDF</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Para resumir cartas, contratos o textos</p>
          </div>
        </button>

        {/* Hidden inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, 'image')}
          className="hidden"
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => handleFileChange(e, 'video')}
          className="hidden"
        />
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          onChange={(e) => handleFileChange(e, 'audio')}
          className="hidden"
        />
        <input
          ref={docInputRef}
          type="file"
          accept=".pdf,.txt,.doc,.docx,application/pdf,text/plain"
          onChange={(e) => handleFileChange(e, 'document')}
          className="hidden"
        />
      </div>
    </div>
  );
};
