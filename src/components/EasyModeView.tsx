import React from 'react';
import { PersonaInfo, ChatMessage } from '../types/assistant';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Camera,
  Heart,
  Pill,
  Clock,
  FileText,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Upload,
} from 'lucide-react';
import { triggerHaptic } from '../utils/audioChime';

interface EasyModeViewProps {
  persona: PersonaInfo;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  isProcessing: boolean;
  isPlayingVoice: boolean;
  currentSpeakingText?: string;
  lastAssistantMessage?: ChatMessage;
  onQuickAsk: (prompt: string) => void;
  onRepeatVoice: (text: string) => void;
  onStopVoice: () => void;
  onOpenCamera: () => void;
  onOpenFileUpload?: () => void;
  onOpenGuide: () => void;
  largeText: boolean;
  onToggleLargeText: () => void;
}

export const EasyModeView: React.FC<EasyModeViewProps> = ({
  persona,
  isListening,
  onStartListening,
  onStopListening,
  isProcessing,
  isPlayingVoice,
  lastAssistantMessage,
  onQuickAsk,
  onRepeatVoice,
  onStopVoice,
  onOpenCamera,
  onOpenFileUpload,
  onOpenGuide,
  largeText,
  onToggleLargeText,
}) => {
  // Common accessible quick voice actions
  const EASY_BUTTONS = [
    {
      title: 'Recordar medicina',
      desc: 'Avísame a una hora exacta',
      icon: Pill,
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      prompt: 'Por favor, ayúdame a crear un recordatorio para tomar mi medicina.',
    },
    {
      title: '¿Qué tengo hoy?',
      desc: 'Léeme mis tareas pendientes',
      icon: Clock,
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      prompt: '¿Cuáles son mis recordatorios y cosas pendientes para hoy? Léemelas con voz clara.',
    },
    {
      title: 'Guardar un recado',
      desc: 'Anotar algo sin escribir',
      icon: FileText,
      color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      prompt: 'Quiero que anotes un recado para que no se me olvide.',
    },
    {
      title: '¿Qué hora y fecha es?',
      desc: 'Día, hora y estado del día',
      icon: Heart,
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      prompt: 'Dime en voz alta la fecha completa de hoy, el día de la semana y la hora actual.',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      {/* Friendly top banner with Large Text Toggle */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-blue-950/80 border border-cyan-500/40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xl">
            {persona.avatar}
          </div>
          <div>
            <h2 className={`font-bold text-white ${largeText ? 'text-base' : 'text-sm'}`}>
              Modo Fácil (Por Voz)
            </h2>
            <p className="text-[11px] text-cyan-300">
              Solo toca el botón del centro y habla normal.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            triggerHaptic(20);
            onToggleLargeText();
          }}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
            largeText
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
              : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
          }`}
        >
          {largeText ? 'Letra Normal' : 'Letra Grande'}
        </button>
      </div>

      {/* Interactive Voice Guide Launcher Card */}
      <button
        onClick={() => {
          triggerHaptic(25);
          onOpenGuide();
        }}
        className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-cyan-500/15 border-2 border-amber-500/40 hover:border-amber-400 text-left flex items-center justify-between transition shadow-md group active:scale-98"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center text-xl shadow-sm">
            📖
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className={`font-bold text-white ${largeText ? 'text-sm' : 'text-xs'}`}>
                Guía con Tarjetas: Cómo usar la voz
              </h3>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Fácil
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Toca aquí para ver 4 pasos sencillos con dibujos y voz
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-amber-300 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 group-hover:bg-amber-500/30 transition shrink-0 ml-2">
          Abrir Guía
        </span>
      </button>

      {/* GIANT CENTRAL MICROPHONE BUTTON */}
      <div className="py-2 flex flex-col items-center justify-center text-center space-y-3">
        <div className="relative">
          {/* Animated wave rings when listening */}
          {isListening && (
            <>
              <div className="absolute -inset-4 rounded-full bg-red-500/30 animate-ping pointer-events-none" />
              <div className="absolute -inset-8 rounded-full bg-red-500/15 animate-pulse pointer-events-none" />
            </>
          )}

          {/* Animated wave rings when speaking */}
          {isPlayingVoice && !isListening && (
            <div className="absolute -inset-4 rounded-full bg-cyan-500/30 animate-pulse pointer-events-none" />
          )}

          <button
            onClick={() => {
              triggerHaptic(40);
              if (isListening) {
                onStopListening();
              } else {
                onStartListening();
              }
            }}
            className={`w-32 h-32 rounded-full shadow-2xl flex flex-col items-center justify-center transition-all transform active:scale-95 border-4 ${
              isListening
                ? 'bg-gradient-to-tr from-red-600 to-rose-500 border-white text-white shadow-red-500/50 scale-105'
                : isProcessing
                ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 border-purple-400 text-white animate-pulse'
                : isPlayingVoice
                ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 border-white text-white shadow-cyan-500/40'
                : 'bg-gradient-to-tr from-cyan-500 via-sky-500 to-blue-600 border-cyan-300 text-white shadow-cyan-500/30 hover:scale-102'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-10 h-10 animate-pulse mb-1" />
                <span className="text-[11px] font-black uppercase tracking-wider">Listo</span>
              </>
            ) : isProcessing ? (
              <>
                <Sparkles className="w-10 h-10 animate-spin mb-1 text-cyan-200" />
                <span className="text-[11px] font-black uppercase tracking-wider">Pensando</span>
              </>
            ) : isPlayingVoice ? (
              <>
                <Volume2 className="w-10 h-10 animate-bounce mb-1" />
                <span className="text-[11px] font-black uppercase tracking-wider">Hablando</span>
              </>
            ) : (
              <>
                <Mic className="w-11 h-11 mb-1" />
                <span className="text-[11px] font-black uppercase tracking-wider">Toca y Habla</span>
              </>
            )}
          </button>
        </div>

        {/* State prompt message */}
        <div className="max-w-[300px]">
          <p
            className={`font-bold transition-all ${
              largeText ? 'text-base' : 'text-sm'
            } ${
              isListening
                ? 'text-rose-400 animate-pulse'
                : isProcessing
                ? 'text-purple-300'
                : isPlayingVoice
                ? 'text-cyan-300'
                : 'text-white'
            }`}
          >
            {isListening
              ? 'Te estoy escuchando... Habla ahora con tranquilidad.'
              : isProcessing
              ? 'Entendido. Dame un segundo...'
              : isPlayingVoice
              ? `${persona.name} te está respondiendo en voz alta:`
              : 'Toca el micrófono grande y dime lo que necesitas.'}
          </p>
        </div>
      </div>

      {/* LAST ASSISTANT RESPONSE WITH REPLAY BUTTON */}
      {lastAssistantMessage && (
        <div className="p-4 rounded-3xl bg-slate-900 border-2 border-cyan-500/50 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Última respuesta de {persona.name}:
            </span>

            <div className="flex items-center gap-1.5">
              {isPlayingVoice ? (
                <button
                  onClick={onStopVoice}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold transition"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  Callar
                </button>
              ) : (
                <button
                  onClick={() => onRepeatVoice(lastAssistantMessage.content)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Escuchar de nuevo
                </button>
              )}
            </div>
          </div>

          <p
            className={`text-slate-100 font-medium leading-relaxed ${
              largeText ? 'text-base' : 'text-sm'
            }`}
          >
            {lastAssistantMessage.content}
          </p>
        </div>
      )}

      {/* QUICK 1-TAP ACTION BUTTONS FOR BEGINNERS */}
      <div className="space-y-2 pt-1">
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          O toca una de estas opciones fáciles:
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          {EASY_BUTTONS.map((btn, i) => {
            const Icon = btn.icon;
            return (
              <button
                key={i}
                onClick={() => {
                  triggerHaptic(30);
                  onQuickAsk(btn.prompt);
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-95 shadow-md ${btn.color} hover:brightness-110`}
              >
                <div className="w-8 h-8 rounded-xl bg-black/25 flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`font-bold text-white ${largeText ? 'text-sm' : 'text-xs'}`}>
                    {btn.title}
                  </h4>
                  <p className="text-[10px] text-slate-300 mt-0.5 opacity-90">{btn.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* BIG CAMERA SCANNER BUTTON */}
      <button
        onClick={() => {
          triggerHaptic(30);
          onOpenCamera();
        }}
        className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-700 hover:border-cyan-500/60 shadow-md flex items-center gap-3 transition active:scale-98"
      >
        <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
          <Camera className="w-5 h-5" />
        </div>
        <div className="text-left flex-1">
          <h4 className={`font-bold text-white ${largeText ? 'text-sm' : 'text-xs'}`}>
            📸 Leer o explicar algo con la cámara
          </h4>
          <p className="text-[11px] text-slate-400">
            Apunta a una carta, receta o medicamento y Nova te lo explicará en voz alta
          </p>
        </div>
      </button>

      {/* BIG FILE UPLOAD BUTTON */}
      {onOpenFileUpload && (
        <button
          onClick={() => {
            triggerHaptic(30);
            onOpenFileUpload();
          }}
          className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-slate-700 hover:border-indigo-500/60 shadow-md flex items-center gap-3 transition active:scale-98"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-left flex-1">
            <h4 className={`font-bold text-white ${largeText ? 'text-sm' : 'text-xs'}`}>
              📁 Cargar fotos, videos, audios o documentos
            </h4>
            <p className="text-[11px] text-slate-400">
              Sube cualquier archivo de tu teléfono y Nova te lo explicará y resumirá
            </p>
          </div>
        </button>
      )}
    </div>
  );
};
