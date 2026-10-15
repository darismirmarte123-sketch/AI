import React, { useRef, useEffect } from 'react';
import { ChatMessage, PersonaInfo, FileAttachment } from '../types/assistant';
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  Calendar,
  FileText,
  Clock,
  Sparkles,
  CornerDownLeft,
  X,
  Paperclip,
  Video,
  Music,
  Image as ImageIcon,
} from 'lucide-react';
import { triggerHaptic } from '../utils/audioChime';

interface ChatViewProps {
  messages: ChatMessage[];
  persona: PersonaInfo;
  isProcessing: boolean;
  isPlayingVoice: boolean;
  onPlayVoice: (text: string) => void;
  onStopVoice: () => void;
  onQuickAction: (actionText: string) => void;
  onQuickReply: (text: string) => void;
  onConfirmAction: (action: { type: string; data: any }) => void;
  selectedAttachment: FileAttachment | null;
  onClearSelectedAttachment: () => void;
  onOpenFileUploadModal?: () => void;
  onGoToDashboard?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  persona,
  isProcessing,
  isPlayingVoice,
  onPlayVoice,
  onStopVoice,
  onQuickAction,
  onQuickReply,
  onConfirmAction,
  selectedAttachment,
  onClearSelectedAttachment,
  onOpenFileUploadModal,
  onGoToDashboard,
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    triggerHaptic(20);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const QUICK_SUGGESTIONS = [
    { label: '⏰ Recordatorio', prompt: 'Recuérdame revisar mis tareas a las 6:00 PM' },
    { label: '📝 Nota rápida', prompt: 'Guarda una nota: Ideas clave para la reunión de mañana' },
    { label: '💬 WhatsApp', prompt: 'Escribe un mensaje cortés para avisar que llegaré 10 minutos tarde' },
    { label: '🌍 Traducir', prompt: 'Traduce al inglés y francés: "¿Dónde está la estación de tren más cercana?"' },
    { label: '🍳 Receta rápida', prompt: 'Dame una idea de cena rápida y saludable con ingredientes comunes' },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      {/* Welcome hero if no messages */}
      {messages.length === 0 && (
        <div className="py-6 flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 border-2 border-cyan-500/50 flex items-center justify-center p-2 shadow-xl shadow-cyan-500/25">
              <img src="/icon.svg" alt="Nova Orb" className="w-full h-full object-contain" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-bold">
              ✓
            </span>
          </div>

          <div className="space-y-1 max-w-[280px]">
            <h2 className="text-base font-bold text-white tracking-tight">
              Hola, soy {persona.name}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tu asistente de inteligencia artificial para el teléfono. Háblame por voz, adjunta fotos, videos, audios o documentos.
            </p>
          </div>

          {/* Attach files prompt badge */}
          {onOpenFileUploadModal && (
            <button
              onClick={() => {
                triggerHaptic(20);
                onOpenFileUploadModal();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 transition shadow-sm text-xs font-semibold"
            >
              <Paperclip className="w-4 h-4 text-cyan-400" />
              <span>Cargar foto, video, audio o documento</span>
            </button>
          )}

          {/* Quick action chips */}
          <div className="w-full pt-2">
            <div className="flex items-center justify-between mb-2 px-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Acciones Rápidas
              </p>
              {onGoToDashboard && (
                <button
                  onClick={() => {
                    triggerHaptic(15);
                    onGoToDashboard();
                  }}
                  className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
                >
                  <span>📊 Panel de Uso</span>
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {QUICK_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    triggerHaptic(20);
                    onQuickAction(item.prompt);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 text-xs text-slate-300 hover:text-cyan-300 transition shadow-sm"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Attachment Preview before sending */}
      {selectedAttachment && (
        <div className="p-3 rounded-2xl bg-slate-900 border-2 border-cyan-500/50 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3 overflow-hidden">
            {selectedAttachment.type === 'image' && (
              <img
                src={selectedAttachment.previewUrl}
                alt="Adjunto"
                className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
              />
            )}
            {selectedAttachment.type === 'video' && (
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center shrink-0">
                <Video className="w-6 h-6" />
              </div>
            )}
            {selectedAttachment.type === 'audio' && (
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <Music className="w-6 h-6" />
              </div>
            )}
            {selectedAttachment.type === 'document' && (
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
            )}

            <div className="text-left truncate">
              <p className="text-xs font-bold text-cyan-300 truncate">
                {selectedAttachment.name || 'Archivo adjunto'}
              </p>
              <p className="text-[10px] text-slate-400 capitalize">
                {selectedAttachment.type === 'image'
                  ? 'Imagen lista para analizar'
                  : selectedAttachment.type === 'video'
                  ? 'Video listo para analizar'
                  : selectedAttachment.type === 'audio'
                  ? 'Audio listo para escuchar y resumir'
                  : 'Documento listo para analizar'}
              </p>
            </div>
          </div>

          <button
            onClick={onClearSelectedAttachment}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Message List */}
      {messages.map((m) => {
        const isUser = m.role === 'user';
        const attach = m.attachment || (m.image ? { type: 'image' as const, name: 'Imagen', ...m.image } : null);

        return (
          <div
            key={m.id}
            className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
          >
            {/* Sender tag */}
            <div className="flex items-center gap-1.5 px-1 text-[11px] text-slate-400">
              {!isUser && (
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full overflow-hidden">
                    <img src="/icon.svg" alt="Nova" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-semibold text-cyan-400">{persona.name}</span>
                </div>
              )}
              <span className="text-[10px] text-slate-500 font-mono">
                {new Date(m.timestamp).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {/* Bubble */}
            <div
              className={`relative max-w-[85%] rounded-3xl px-4 py-3 text-xs leading-relaxed transition-all shadow-sm ${
                isUser
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
              }`}
            >
              {/* Optional Attached Media inside message */}
              {attach && (
                <div className="mb-2.5 rounded-2xl overflow-hidden border border-white/10">
                  {attach.type === 'image' && attach.previewUrl && (
                    <img
                      src={attach.previewUrl}
                      alt="Imagen adjunta"
                      className="w-full max-h-56 object-cover"
                    />
                  )}

                  {attach.type === 'video' && attach.previewUrl && (
                    <video
                      src={attach.previewUrl}
                      controls
                      playsInline
                      className="w-full max-h-52 bg-black rounded-xl"
                    />
                  )}

                  {attach.type === 'audio' && attach.previewUrl && (
                    <div className="p-2 bg-slate-950/80 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-300 font-bold">
                        <Music className="w-3.5 h-3.5" />
                        <span>{attach.name || 'Audio adjunto'}</span>
                      </div>
                      <audio src={attach.previewUrl} controls className="w-full h-8" />
                    </div>
                  )}

                  {attach.type === 'document' && (
                    <div className="p-3 bg-slate-950/80 rounded-xl flex items-center gap-2.5 text-slate-200">
                      <FileText className="w-6 h-6 text-amber-400 shrink-0" />
                      <div className="truncate text-left">
                        <p className="font-bold text-xs truncate">{attach.name || 'Documento'}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-mono">
                          {attach.mimeType || 'PDF / Texto'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Message text */}
              <div className="whitespace-pre-wrap">{m.content}</div>

              {/* Assistant Message Actions Toolbar */}
              {!isUser && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/80 text-slate-400">
                  <button
                    onClick={() => {
                      if (isPlayingVoice) {
                        onStopVoice();
                      } else {
                        onPlayVoice(m.content);
                      }
                    }}
                    title="Escuchar respuesta con voz de Gemini"
                    className="p-1 rounded-md hover:text-cyan-300 hover:bg-slate-800 transition flex items-center gap-1 text-[10px]"
                  >
                    {isPlayingVoice ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-cyan-400">Detener</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Escuchar</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => copyText(m.id, m.content)}
                    title="Copiar texto"
                    className="p-1 rounded-md hover:text-slate-200 hover:bg-slate-800 transition flex items-center gap-1 text-[10px]"
                  >
                    {copiedId === m.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Smart Phone Action Cards triggered by Assistant */}
            {m.actions && m.actions.length > 0 && (
              <div className="w-full max-w-[85%] space-y-1.5 pt-1">
                {m.actions.map((act, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-950/60 border border-cyan-500/40 shadow-md flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      {act.type === 'reminder' && (
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                          <Calendar className="w-4 h-4" />
                        </div>
                      )}
                      {act.type === 'note' && (
                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      {act.type === 'timer' && (
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                          <Clock className="w-4 h-4" />
                        </div>
                      )}

                      <div className="text-left">
                        <p className="text-[11px] font-bold text-slate-100">
                          {act.type === 'reminder'
                            ? `Recordatorio: ${act.data.title}`
                            : act.type === 'note'
                            ? `Nota: ${act.data.title}`
                            : `Temporizador: ${act.data.label || act.data.minutes + ' min'}`}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {act.type === 'reminder'
                            ? `Hora: ${act.data.time || 'Pronto'} (${act.data.date || 'Hoy'})`
                            : act.type === 'note'
                            ? `${act.data.content?.slice(0, 45)}...`
                            : `${act.data.minutes} minutos`}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onConfirmAction(act)}
                      className="px-2.5 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-semibold shadow-sm transition"
                    >
                      Guardar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick follow-up chips */}
            {m.quickReplies && m.quickReplies.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1 max-w-[90%]">
                {m.quickReplies.map((qr, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      triggerHaptic(20);
                      onQuickReply(qr);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/50 text-[11px] text-cyan-300 hover:text-white transition flex items-center gap-1"
                  >
                    <span>{qr}</span>
                    <CornerDownLeft className="w-2.5 h-2.5 opacity-60" />
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 max-w-[200px] animate-pulse">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{persona.name} está pensando...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
