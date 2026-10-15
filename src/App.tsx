import React, { useState, useEffect, useRef } from 'react';
import {
  PersonaId,
  PersonaInfo,
  ChatMessage,
  ReminderItem,
  NoteItem,
  ActiveTimer,
  FileAttachment,
} from './types/assistant';
import { PhoneStatusBar } from './components/PhoneStatusBar';
import { VoiceVisualizer } from './components/VoiceVisualizer';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { FileUploadModal } from './components/FileUploadModal';
import { VoiceGuideModal } from './components/VoiceGuideModal';
import { EasyModeView } from './components/EasyModeView';
import { DashboardView } from './components/DashboardView';
import { RemindersPanel } from './components/RemindersPanel';
import { NotesPanel } from './components/NotesPanel';
import { SettingsModal } from './components/SettingsModal';
import { ChatView } from './components/ChatView';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { playSuccessChime, playAlarmSound, triggerHaptic } from './utils/audioChime';
import {
  LayoutDashboard,
  MessageSquare,
  Bell,
  FileText,
  Settings,
  Mic,
  MicOff,
  Send,
  Camera,
  Radio,
  Sparkles,
  Volume2,
  VolumeX,
  BookOpen,
  Paperclip,
} from 'lucide-react';

const PERSONAS: Record<PersonaId, PersonaInfo> = {
  nova: {
    id: 'nova',
    name: 'DarismirAI',
    tagline: 'Asistente personal inteligente y cálido',
    avatar: '✨',
    color: '#06b6d4',
    voice: 'Kore',
  },
  atlas: {
    id: 'atlas',
    name: 'Atlas',
    tagline: 'Ejecutivo, analítico y preciso',
    avatar: '⚡',
    color: '#3b82f6',
    voice: 'Puck',
  },
  aura: {
    id: 'aura',
    name: 'Aura',
    tagline: 'Bienestar, serenidad y empatía',
    avatar: '🌿',
    color: '#10b981',
    voice: 'Zephyr',
  },
  spark: {
    id: 'spark',
    name: 'Spark',
    tagline: 'Creativo, dinámico e ingenioso',
    avatar: '🚀',
    color: '#f59e0b',
    voice: 'Fenrir',
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'easy' | 'chat' | 'dashboard' | 'reminders' | 'notes'>('easy');
  const [largeText, setLargeText] = useState(() => {
    return localStorage.getItem('nova_large_text') === 'true';
  });
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('nova_chat_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    try {
      const saved = localStorage.getItem('nova_reminders');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: '1',
              title: 'Revisar agenda de hoy',
              time: '09:00',
              date: 'Hoy',
              completed: false,
              priority: 'normal',
              createdAt: Date.now(),
            },
          ];
    } catch {
      return [];
    }
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('nova_notes');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: '1',
              title: 'Bienvenido a Asistente DarismirAI',
              content:
                'Tu asistente personal en tu teléfono. Puedes dictar notas, pedirle recordatorios, activar la cámara para resolver preguntas, subir fotos, videos, audios o documentos y hablarle en lenguaje natural.',
              category: 'General',
              createdAt: Date.now(),
            },
          ];
    } catch {
      return [];
    }
  });

  const [timers, setTimers] = useState<ActiveTimer[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>(() => {
    return (localStorage.getItem('nova_persona') as PersonaId) || 'nova';
  });

  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'Charon'>(
    'Kore'
  );

  const [autoSpeak, setAutoSpeak] = useState(() => {
    return localStorage.getItem('nova_auto_speak') !== 'false';
  });

  const [oledMode, setOledMode] = useState(() => {
    return localStorage.getItem('nova_oled_mode') === 'true';
  });

  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [handsFreeMode, setHandsFreeMode] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<FileAttachment | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const { isPlaying: isPlayingVoice, speak, stop: stopVoice } = useAudioPlayer();

  // Speech Recognition hook
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    setTranscript,
  } = useSpeechRecognition({
    onFinalTranscript: (text) => {
      if (text.trim()) {
        setInputText(text.trim());
        if (handsFreeMode) {
          handleSendMessage(text.trim());
        }
      }
    },
    lang: 'es-ES',
  });

  // Sync transcript with input
  useEffect(() => {
    if (isListening && transcript) {
      setInputText(transcript);
    }
  }, [transcript, isListening]);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('nova_chat_history', JSON.stringify(messages.slice(-30)));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem('nova_reminders', JSON.stringify(reminders));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }, [reminders]);

  useEffect(() => {
    try {
      localStorage.setItem('nova_notes', JSON.stringify(notes));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('nova_persona', selectedPersona);
  }, [selectedPersona]);

  useEffect(() => {
    localStorage.setItem('nova_auto_speak', String(autoSpeak));
  }, [autoSpeak]);

  useEffect(() => {
    localStorage.setItem('nova_large_text', String(largeText));
  }, [largeText]);

  // Timer tick interval
  useEffect(() => {
    if (timers.length === 0) return;

    const interval = setInterval(() => {
      setTimers((prev) =>
        prev.map((t) => {
          if (!t.isRunning || t.remainingSeconds <= 0) return t;
          const next = t.remainingSeconds - 1;
          if (next === 0) {
            playAlarmSound();
            triggerHaptic(50);
          }
          return { ...t, remainingSeconds: next, isRunning: next > 0 };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [timers.length]);

  const persona = PERSONAS[selectedPersona] || PERSONAS.nova;

  // Send message to Gemini Assistant
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if ((!content && !selectedAttachment) || isProcessing) return;

    triggerHaptic(25);
    stopVoice();

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content || (selectedAttachment ? `Por favor analiza este archivo: ${selectedAttachment.name}` : ''),
      timestamp: Date.now(),
      attachment: selectedAttachment ? { ...selectedAttachment } : undefined,
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setTranscript('');
    setSelectedAttachment(null);
    setIsProcessing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
            attachment: m.attachment
              ? {
                  name: m.attachment.name,
                  type: m.attachment.type,
                  mimeType: m.attachment.mimeType,
                  data: m.attachment.data,
                }
              : undefined,
          })),
          persona: selectedPersona,
          attachment: userMessage.attachment,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al conectar con Nova');
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'Aquí tienes la respuesta.',
        timestamp: Date.now(),
        actions: data.actions || [],
        quickReplies: data.quickReplies || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
      playSuccessChime();

      // Automatically execute detected actions if clear
      if (data.actions && data.actions.length > 0) {
        for (const act of data.actions) {
          if (act.type === 'timer' && act.data?.minutes) {
            startNewTimer(act.data.minutes, act.data.label || 'Temporizador');
          }
        }
      }

      // Always speak response aloud automatically
      if (data.reply) {
        speak(data.reply, selectedVoice || persona.voice);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'Lo siento, ocurrió un inconveniente de conexión. Asegúrate de tener conexión y vuelve a intentar.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      speak('Lo siento, ocurrió un inconveniente. Vuelve a intentar en unos segundos.', selectedVoice || persona.voice);
    } finally {
      setIsProcessing(false);
    }
  };

  // Timers handler
  const startNewTimer = (minutes: number, label: string) => {
    const newTimer: ActiveTimer = {
      id: Date.now().toString(),
      minutes,
      remainingSeconds: minutes * 60,
      label,
      isRunning: true,
    };
    setTimers((prev) => [newTimer, ...prev]);
    triggerHaptic(30);
  };

  const handleToggleTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isRunning: !t.isRunning } : t))
    );
  };

  const handleResetTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, remainingSeconds: t.minutes * 60, isRunning: false } : t
      )
    );
  };

  const handleDeleteTimer = (id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id));
  };

  // Reminders handlers
  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddReminder = (item: Omit<ReminderItem, 'id' | 'createdAt'>) => {
    const newR: ReminderItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    setReminders((prev) => [newR, ...prev]);
  };

  // Notes handlers
  const handleAddNote = (item: Omit<NoteItem, 'id' | 'createdAt'>) => {
    const newN: NoteItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    setNotes((prev) => [newN, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleAskAIAboutNote = (note: NoteItem) => {
    setActiveTab('chat');
    handleSendMessage(`Analiza o amplía esta nota: "${note.title}: ${note.content}"`);
  };

  // Confirm smart action card
  const handleConfirmAction = (action: { type: string; data: any }) => {
    triggerHaptic(30);
    playSuccessChime();

    if (action.type === 'reminder') {
      handleAddReminder({
        title: action.data.title || 'Nuevo recordatorio',
        time: action.data.time || '18:00',
        date: action.data.date || 'Hoy',
        completed: false,
        priority: action.data.priority || 'normal',
      });
      setActiveTab('reminders');
    } else if (action.type === 'note') {
      handleAddNote({
        title: action.data.title || 'Nota',
        content: action.data.content || '',
        category: action.data.category || 'Ideas',
      });
      setActiveTab('notes');
    } else if (action.type === 'timer') {
      startNewTimer(action.data.minutes || 5, action.data.label || 'Temporizador');
      setActiveTab('reminders');
    }
  };

  // Clear Chat
  const handleClearHistory = () => {
    setMessages([]);
    stopVoice();
  };

  // Visualizer state
  const visualizerState = isListening
    ? 'listening'
    : isProcessing
    ? 'thinking'
    : isPlayingVoice
    ? 'speaking'
    : 'idle';

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        oledMode ? 'bg-black' : 'bg-slate-950'
      } text-slate-100 transition-colors p-0 sm:p-4`}
    >
      {/* Smartphone Frame Wrapper (Mockup on desktop or full-bleed on mobile) */}
      <div
        className={`w-full transition-all duration-300 flex flex-col ${
          largeText ? 'text-base [&_p]:text-sm [&_button]:text-sm' : ''
        } ${
          isPhoneFrame
            ? 'max-w-[430px] h-[100dvh] sm:h-[860px] sm:max-h-[92vh] sm:rounded-[48px] sm:border-[10px] sm:border-slate-800 sm:ring-1 sm:ring-slate-700/60 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]'
            : 'max-w-4xl h-[100dvh] sm:h-[92vh] sm:rounded-3xl sm:border sm:border-slate-800'
        } ${oledMode ? 'bg-black' : 'bg-slate-950'} overflow-hidden relative`}
      >
        {/* Smartphone Hardware Notch / Speaker Ear on Frame */}
        {isPhoneFrame && (
          <div className="hidden sm:block absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full z-40 border border-slate-800" />
        )}

        {/* Status Bar */}
        <PhoneStatusBar
          isPhoneFrame={isPhoneFrame}
          onToggleFrame={() => setIsPhoneFrame(!isPhoneFrame)}
          assistantStatusText={
            visualizerState === 'listening'
              ? 'Escuchando tu voz...'
              : visualizerState === 'thinking'
              ? 'Pensando...'
              : visualizerState === 'speaking'
              ? 'Hablando...'
              : `${persona.name} AI Activa`
          }
          isOnline={isOnline}
        />

        {/* PWA Install Banner */}
        <PWAInstallBanner />

        {/* Visualizer Hero Header */}
        <div className="px-4 py-2 border-b border-slate-900/80 bg-slate-950/40 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center p-1 shadow-lg overflow-hidden bg-slate-900 border border-cyan-500/40 shrink-0">
              <img src="/icon.svg" alt="Nova Orb Icon" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-white tracking-tight">{persona.name} AI</h1>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono">
                  v3.8
                </span>
              </div>
              <p className="text-[10px] text-slate-400">{persona.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Quick Voice Playback Stop button if speaking */}
            {isPlayingVoice && (
              <button
                onClick={stopVoice}
                className="px-2 py-1 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1 animate-pulse"
                title="Pausar voz"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span className="text-[10px]">Callar</span>
              </button>
            )}

            {/* Quick toggle to easy mode if on another tab */}
            {activeTab !== 'easy' && (
              <button
                onClick={() => {
                  triggerHaptic(20);
                  setActiveTab('easy');
                }}
                className="px-2 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1 hover:bg-cyan-500/30 transition"
              >
                <Mic className="w-3 h-3 text-cyan-400" />
                <span>Voz Fácil</span>
              </button>
            )}

            {/* Hands free mode toggle */}
            <button
              onClick={() => {
                triggerHaptic(20);
                const nextMode = !handsFreeMode;
                setHandsFreeMode(nextMode);
                if (nextMode && !isListening) {
                  startListening();
                } else if (!nextMode && isListening) {
                  stopListening();
                }
              }}
              title={
                handsFreeMode
                  ? 'Modo Manos Libres Activo (toca para desactivar)'
                  : 'Activar Modo Manos Libres (conversación continua)'
              }
              className={`p-2 rounded-xl transition flex items-center gap-1 text-xs ${
                handsFreeMode
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px] font-medium">Manos Libres</span>
            </button>

            {/* Guide Button */}
            <button
              onClick={() => {
                triggerHaptic(20);
                setIsGuideOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition flex items-center gap-1 text-xs font-bold"
              title="Guía fácil de cómo hablar con Nova"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Guía</span>
            </button>

            {/* Settings button */}
            <button
              onClick={() => {
                triggerHaptic(20);
                setIsSettingsOpen(true);
              }}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
              title="Ajustes del Asistente"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Glowing Orb Voice Visualizer (compact tap-to-talk orb) */}
        {activeTab === 'chat' && (
          <div className="px-4 py-1 flex items-center justify-center bg-gradient-to-b from-slate-950 to-transparent">
            <VoiceVisualizer
              state={visualizerState}
              personaColor={persona.color}
              onClick={() => {
                if (isListening) {
                  stopListening();
                } else {
                  startListening();
                }
              }}
            />
          </div>
        )}

        {/* Viewport Panels */}
        {activeTab === 'easy' && (
          <EasyModeView
            persona={persona}
            isListening={isListening}
            onStartListening={startListening}
            onStopListening={stopListening}
            isProcessing={isProcessing}
            isPlayingVoice={isPlayingVoice}
            lastAssistantMessage={messages.filter((m) => m.role === 'assistant').slice(-1)[0]}
            onQuickAsk={(prompt) => handleSendMessage(prompt)}
            onRepeatVoice={(text) => speak(text, selectedVoice || persona.voice)}
            onStopVoice={stopVoice}
            onOpenCamera={() => setIsCameraOpen(true)}
            onOpenFileUpload={() => setIsFileUploadOpen(true)}
            largeText={largeText}
            onToggleLargeText={() => setLargeText(!largeText)}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            messages={messages}
            reminders={reminders}
            notes={notes}
            timers={timers}
            persona={persona}
            onGoToChat={() => setActiveTab('chat')}
            onGoToReminders={() => setActiveTab('reminders')}
            onGoToNotes={() => setActiveTab('notes')}
            onAskAIInsight={(prompt) => {
              setActiveTab('chat');
              handleSendMessage(prompt);
            }}
          />
        )}

        {activeTab === 'chat' && (
          <ChatView
            messages={messages}
            persona={persona}
            isProcessing={isProcessing}
            isPlayingVoice={isPlayingVoice}
            onPlayVoice={(text) => speak(text, selectedVoice || persona.voice)}
            onStopVoice={stopVoice}
            onQuickAction={(actionText) => handleSendMessage(actionText)}
            onQuickReply={(replyText) => handleSendMessage(replyText)}
            onConfirmAction={handleConfirmAction}
            selectedAttachment={selectedAttachment}
            onClearSelectedAttachment={() => setSelectedAttachment(null)}
            onOpenFileUploadModal={() => setIsFileUploadOpen(true)}
            onGoToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersPanel
            reminders={reminders}
            timers={timers}
            onToggleReminder={handleToggleReminder}
            onDeleteReminder={handleDeleteReminder}
            onAddReminder={handleAddReminder}
            onToggleTimer={handleToggleTimer}
            onResetTimer={handleResetTimer}
            onDeleteTimer={handleDeleteTimer}
          />
        )}

        {activeTab === 'notes' && (
          <NotesPanel
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            onAskAIAboutNote={handleAskAIAboutNote}
          />
        )}

        {/* Bottom Interactive Input Bar (Chat mode) */}
        {activeTab === 'chat' && (
          <div className="p-3 bg-slate-950/90 border-t border-slate-900/80 backdrop-blur-md space-y-2">
            <div className="flex items-center gap-1.5">
              {/* Paperclip Multimodal Upload Trigger (Images, Videos, Audios, Documents) */}
              <button
                onClick={() => {
                  triggerHaptic(20);
                  setIsFileUploadOpen(true);
                }}
                className={`p-2.5 rounded-2xl transition border ${
                  selectedAttachment
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800 border-slate-800'
                }`}
                title="Cargar archivo (Foto, Video, Audio o Documento)"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Camera Trigger */}
              <button
                onClick={() => {
                  triggerHaptic(20);
                  setIsCameraOpen(true);
                }}
                className="p-2.5 rounded-2xl bg-slate-900 text-slate-400 hover:text-slate-100 hover:bg-slate-800 border border-slate-800 transition"
                title="Cámara en vivo"
              >
                <Camera className="w-5 h-5" />
              </button>

              {/* Text Input */}
              <div className="flex-1 relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={
                    isListening
                      ? 'Escuchando tu voz...'
                      : 'Escribe a Nova o pulsa el micrófono...'
                  }
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="w-full pl-3.5 pr-9 py-2.5 text-xs rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/80 shadow-inner"
                />

                {inputText.trim() && (
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isProcessing}
                    className="absolute right-1.5 p-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md active:scale-95 transition disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Big Voice Mic Button */}
              <button
                onClick={() => {
                  if (isListening) {
                    stopListening();
                  } else {
                    startListening();
                  }
                }}
                className={`p-2.5 rounded-2xl transition shadow-lg flex items-center justify-center ${
                  isListening
                    ? 'bg-red-500 text-white shadow-red-500/40 animate-bounce'
                    : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white hover:opacity-95 shadow-cyan-500/25 active:scale-95'
                }`}
                title={isListening ? 'Detener micrófono' : 'Hablar con Nova'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {/* Native Mobile Bottom Navigation Bar */}
        <div className="flex items-center justify-around py-2 px-2 bg-slate-900/95 border-t border-slate-800 select-none">
          <button
            onClick={() => {
              triggerHaptic(20);
              setActiveTab('easy');
            }}
            className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition ${
              activeTab === 'easy'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-5 h-5 text-cyan-400" />
            <span className="text-[10px] font-bold">Voz Fácil</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic(15);
              setActiveTab('chat');
            }}
            className={`flex flex-col items-center gap-1 py-1 px-1.5 transition ${
              activeTab === 'chat' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-[10px]">Chat</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic(15);
              setActiveTab('dashboard');
            }}
            className={`flex flex-col items-center gap-1 py-1 px-1.5 transition ${
              activeTab === 'dashboard'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[10px]">Gráficos</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic(15);
              setActiveTab('reminders');
            }}
            className={`flex flex-col items-center gap-1 py-1 px-1.5 relative transition ${
              activeTab === 'reminders'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span className="text-[10px]">Avisos</span>
            {reminders.filter((r) => !r.completed).length > 0 && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[8px] flex items-center justify-center">
                {reminders.filter((r) => !r.completed).length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              triggerHaptic(15);
              setActiveTab('notes');
            }}
            className={`flex flex-col items-center gap-1 py-1 px-1.5 transition ${
              activeTab === 'notes'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-[10px]">Notas</span>
          </button>
        </div>

        {/* Mobile Home Indicator Bar */}
        <div className="w-full flex justify-center py-1.5 bg-slate-900/90">
          <div className="w-32 h-1 bg-slate-700 rounded-full" />
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(img) => {
          setSelectedAttachment({
            name: 'Foto de cámara.jpg',
            type: 'image',
            mimeType: img.mimeType || 'image/jpeg',
            data: img.data,
            previewUrl: img.previewUrl,
          });
          setActiveTab('chat');
        }}
      />

      {/* Multimodal File Upload Modal (Images, Videos, Audios, Documents) */}
      <FileUploadModal
        isOpen={isFileUploadOpen}
        onClose={() => setIsFileUploadOpen(false)}
        onSelectAttachment={(attach) => {
          setSelectedAttachment(attach);
          setActiveTab('chat');
        }}
        onOpenLiveCamera={() => {
          setIsCameraOpen(true);
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedPersona={selectedPersona}
        onSelectPersona={setSelectedPersona}
        selectedVoice={selectedVoice}
        onSelectVoice={setSelectedVoice}
        autoSpeak={autoSpeak}
        onToggleAutoSpeak={() => setAutoSpeak(!autoSpeak)}
        oledMode={oledMode}
        onToggleOledMode={() => setOledMode(!oledMode)}
        onClearHistory={handleClearHistory}
        personas={PERSONAS}
      />

      {/* Voice Guide Modal */}
      <VoiceGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onStartVoice={() => {
          setActiveTab('easy');
          startListening();
        }}
        onSpeakText={(text) => speak(text, selectedVoice || persona.voice)}
      />
    </div>
  );
}
