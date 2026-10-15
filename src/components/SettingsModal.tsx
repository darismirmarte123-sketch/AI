import React from 'react';
import { PersonaId, PersonaInfo } from '../types/assistant';
import { X, Volume2, Moon, Trash2, Mic, Bot, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/audioChime';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPersona: PersonaId;
  onSelectPersona: (id: PersonaId) => void;
  selectedVoice: 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'Charon';
  onSelectVoice: (voice: 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'Charon') => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  oledMode: boolean;
  onToggleOledMode: () => void;
  onClearHistory: () => void;
  personas: Record<PersonaId, PersonaInfo>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  selectedPersona,
  onSelectPersona,
  selectedVoice,
  onSelectVoice,
  autoSpeak,
  onToggleAutoSpeak,
  oledMode,
  onToggleOledMode,
  onClearHistory,
  personas,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white text-sm">Ajustes del Asistente</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Personalidad del Asistente
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(personas).map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  triggerHaptic(20);
                  onSelectPersona(p.id);
                  onSelectVoice(p.voice);
                }}
                className={`p-3 rounded-2xl border text-left transition ${
                  selectedPersona === p.id
                    ? 'bg-cyan-950/70 border-cyan-500 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">{p.avatar}</span>
                  {selectedPersona === p.id && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  )}
                </div>
                <p className="text-xs font-bold text-white">{p.name}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{p.tagline}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Voice Selector */}
        <div className="space-y-2 pt-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            Voz para respuestas (Gemini TTS)
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: 'Kore', label: 'Kore (Cálida / F)' },
              { id: 'Puck', label: 'Puck (Ágil / M)' },
              { id: 'Zephyr', label: 'Zephyr (Serena / F)' },
              { id: 'Fenrir', label: 'Fenrir (Profunda / M)' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  triggerHaptic(20);
                  onSelectVoice(v.id as any);
                }}
                className={`py-2 px-3 rounded-xl border text-left font-medium transition ${
                  selectedVoice === v.id
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Switches */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          {/* Auto Speak Responses */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-cyan-400" />
              <div>
                <p className="text-xs font-semibold text-slate-200">Lectura por voz automática</p>
                <p className="text-[10px] text-slate-400">El asistente hablará en voz alta sus respuestas</p>
              </div>
            </div>
            <button
              onClick={() => {
                triggerHaptic(20);
                onToggleAutoSpeak();
              }}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                autoSpeak ? 'bg-cyan-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                  autoSpeak ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* AMOLED battery saver mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-xs font-semibold text-slate-200">Modo Ahorro Batería AMOLED</p>
                <p className="text-[10px] text-slate-400">Fondo negro puro para pantallas OLED de teléfono</p>
              </div>
            </div>
            <button
              onClick={() => {
                triggerHaptic(20);
                onToggleOledMode();
              }}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                oledMode ? 'bg-cyan-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                  oledMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Danger zone / Clear History */}
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              triggerHaptic(30);
              onClearHistory();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-medium transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Borrar conversación actual
          </button>
        </div>
      </div>
    </div>
  );
};
