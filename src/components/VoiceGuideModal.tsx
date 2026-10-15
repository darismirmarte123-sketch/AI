import React, { useState } from 'react';
import {
  Mic,
  Volume2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  MessageCircle,
  HelpCircle,
  Pill,
  Clock,
  Camera,
  Play,
} from 'lucide-react';
import { playSuccessChime, triggerHaptic } from '../utils/audioChime';

interface VoiceGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartVoice: () => void;
  onSpeakText: (text: string) => void;
}

export const VoiceGuideModal: React.FC<VoiceGuideModalProps> = ({
  isOpen,
  onClose,
  onStartVoice,
  onSpeakText,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const STEPS = [
    {
      stepNumber: 1,
      badge: 'Paso 1 de 4',
      title: 'Toca el botón redondo con el micrófono',
      subtitle: 'No tienes que escribir nada en el teclado.',
      illustration: 'mic',
      description:
        'Solo presiona una vez el círculo grande con el micrófono en la pantalla. Verás que cambia de color y comenzará a escucharte con atención.',
      voiceNarration:
        'Paso 1: Solo presiona una vez el círculo grande con el micrófono en la pantalla. Cuando cambie de color, ya puedes hablarme con tranquilidad.',
      tip: '💡 Consejo: Habla a una distancia normal, como si estuvieras hablando por teléfono.',
    },
    {
      stepNumber: 2,
      badge: 'Paso 2 de 4',
      title: 'Habla natural, como si fuera una persona',
      subtitle: 'Sin palabras raras ni técnicas.',
      illustration: 'speech',
      description:
        'Dime lo que necesitas con tus propias palabras. No tienes que preocuparte por equivocarte.',
      voiceNarration:
        'Paso 2: Háblame de forma natural, igual que si hablaras con un familiar o un amigo. Dime por ejemplo: recuérdame tomar la pastilla a las 8 de la noche.',
      examples: [
        '«Recuérdame tomar la pastilla a las 8 de la noche»',
        '«¿Qué día y qué hora es hoy?»',
        '«Anota que tengo que llamar a mi hermana»',
      ],
      tip: '💡 Puedes probar tocando cualquiera de los ejemplos para escucharlo.',
    },
    {
      stepNumber: 3,
      badge: 'Paso 3 de 4',
      title: 'Nova te responderá siempre en voz alta',
      subtitle: 'Escucha la respuesta directamente.',
      illustration: 'speaker',
      description:
        'El teléfono hablará de inmediato con una voz clara y pausada para explicarte todo lo que pediste.',
      voiceNarration:
        'Paso 3: Yo te responderé siempre en voz alta por el altavoz de tu teléfono. Y si no escuchaste bien, puedes tocar el botón Escuchar de nuevo para repetirlo.',
      tip: '💡 Si no entendiste o quieres que lo repita, toca el botón azul "Escuchar de nuevo".',
    },
    {
      stepNumber: 4,
      badge: 'Paso 4 de 4',
      title: 'Todo lo que puedes pedirle a Nova',
      subtitle: 'Ejemplos fáciles para todos los días.',
      illustration: 'tasks',
      description:
        'Usa tu voz para todo lo que necesites en el teléfono sin tocar botones difíciles.',
      voiceNarration:
        'Paso 4: Puedes pedirme que te recuerde tus medicinas, que guarde una nota, que te diga la hora o incluso que te lea una carta usando la cámara.',
      capabilities: [
        { icon: Pill, text: 'Tus medicinas y citas con el médico' },
        { icon: Clock, text: 'Qué cosas tienes que hacer hoy' },
        { icon: Camera, text: 'Leer cartas o prospectos con la cámara' },
      ],
      tip: '🎉 ¡Excelente! Ya estás listo para usar Nova con tu voz.',
    },
  ];

  if (!isOpen) return null;

  const current = STEPS[currentStep];

  const handleNext = () => {
    triggerHaptic(20);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      playSuccessChime();
      onClose();
      onStartVoice();
    }
  };

  const handlePrev = () => {
    triggerHaptic(20);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleHearStep = () => {
    triggerHaptic(20);
    onSpeakText(current.voiceNarration);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-[36px] bg-slate-900 border-2 border-cyan-500/50 shadow-2xl p-5 flex flex-col justify-between max-h-[92vh] overflow-y-auto relative">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
              {current.stepNumber}
            </span>
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              {current.badge}
            </span>
          </div>

          <button
            onClick={() => {
              triggerHaptic(20);
              onClose();
            }}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
            title="Cerrar guía"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body */}
        <div className="py-4 space-y-4">
          {/* Visual Illustration Header */}
          <div className="w-full py-4 rounded-3xl bg-gradient-to-b from-cyan-950/60 to-slate-850/80 border border-cyan-500/30 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            {current.illustration === 'mic' && (
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30 animate-pulse">
                  <Mic className="w-10 h-10" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-2 border-slate-900 flex items-center justify-center text-slate-950 font-bold text-xs">
                  ✓
                </div>
              </div>
            )}

            {current.illustration === 'speech' && (
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
                <MessageCircle className="w-10 h-10" />
              </div>
            )}

            {current.illustration === 'speaker' && (
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30">
                <Volume2 className="w-10 h-10" />
              </div>
            )}

            {current.illustration === 'tasks' && (
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/30">
                <Sparkles className="w-10 h-10" />
              </div>
            )}

            {/* Listen to this step audio button */}
            <button
              onClick={handleHearStep}
              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold shadow-sm transition active:scale-95"
            >
              <Volume2 className="w-3.5 h-3.5 animate-bounce" />
              <span>Escuchar este paso en voz alta</span>
            </button>
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5 text-center">
            <h3 className="text-base font-extrabold text-white leading-snug">
              {current.title}
            </h3>
            <p className="text-xs text-cyan-300 font-semibold">{current.subtitle}</p>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {current.description}
            </p>
          </div>

          {/* Interactive Examples or Capabilities */}
          {current.examples && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Prueba a decir cosas como:
              </p>
              {current.examples.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    triggerHaptic(20);
                    onSpeakText(ex);
                  }}
                  className="w-full p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-left text-xs text-slate-200 hover:text-cyan-200 transition flex items-center justify-between group"
                >
                  <span className="font-medium">{ex}</span>
                  <Play className="w-3.5 h-3.5 text-cyan-400 opacity-60 group-hover:opacity-100 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          )}

          {current.capabilities && (
            <div className="space-y-2 pt-1">
              {current.capabilities.map((cap, idx) => {
                const Icon = cap.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200"
                  >
                    <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{cap.text}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Friendly Tip box */}
          <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] text-cyan-300 text-center font-medium">
            {current.tip}
          </div>
        </div>

        {/* Bottom Navigation & Action */}
        <div className="pt-3 border-t border-slate-800 space-y-3">
          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${
                  currentStep === i ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Next / Prev / Finish buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center justify-center gap-1 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition active:scale-98 flex-[2]"
            >
              {currentStep < STEPS.length - 1 ? (
                <>
                  <span>Siguiente paso</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Empezar a hablar!</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
