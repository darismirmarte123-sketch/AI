import { useState, useRef, useCallback } from 'react';

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeakingText, setCurrentSpeakingText] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentSpeakingText('');
  }, []);

  const cleanTextForVoice = (raw: string): string => {
    return raw
      .replace(/https?:\/\/\S+/g, '') // remove urls
      .replace(/\[ACTION:[^\]]+\][\s\S]*?\[\/ACTION:[^\]]+\]/g, '') // remove action tags
      .replace(/\[QUICK_REPLIES\][\s\S]*?\[\/QUICK_REPLIES\]/g, '')
      .replace(/[`*#_~[\](){}|]/g, ' ') // remove markdown syntax
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // remove emojis
      .replace(/\s+/g, ' ')
      .trim();
  };

  const speak = useCallback(
    async (rawText: string, voiceName: string = 'Kore', useGeminiHD: boolean = false) => {
      stop();
      const text = cleanTextForVoice(rawText);
      if (!text) return;

      setIsPlaying(true);
      setCurrentSpeakingText(text);

      // If useGeminiHD is true, try server TTS endpoint
      if (useGeminiHD) {
        try {
          const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice: voiceName }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.audioBase64) {
              const audioUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
              const audio = new Audio(audioUrl);
              audioRef.current = audio;

              audio.onended = () => {
                setIsPlaying(false);
                setCurrentSpeakingText('');
              };

              audio.onerror = () => {
                playInstantSpeech(text);
              };

              await audio.play();
              return;
            }
          }
        } catch {
          // fallback to instant speech
        }
      }

      // Default: Ultra-fast instant voice (< 100ms latency, zero buffering)
      playInstantSpeech(text);
    },
    [stop]
  );

  function playInstantSpeech(cleanText: string) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      // Split into sentences if very long, or play directly
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'es-ES';
      utterance.rate = 1.0; // Clear, comfortable conversational cadence for all ages
      utterance.pitch = 1.0;

      // Select best natural sounding Spanish voice
      const selectVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const preferred =
          voices.find(
            (v) =>
              (v.lang.startsWith('es') || v.lang.includes('Spanish')) &&
              (v.name.includes('Natural') ||
                v.name.includes('Google') ||
                v.name.includes('Mónica') ||
                v.name.includes('Paulina') ||
                v.name.includes('Helena') ||
                v.name.includes('Jorge'))
          ) || voices.find((v) => v.lang.startsWith('es'));

        if (preferred) {
          utterance.voice = preferred;
        }
      };

      selectVoice();
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = selectVoice;
      }

      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentSpeakingText('');
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setCurrentSpeakingText('');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlaying(false);
      setCurrentSpeakingText('');
    }
  }

  return {
    isPlaying,
    currentSpeakingText,
    speak,
    stop,
  };
}
