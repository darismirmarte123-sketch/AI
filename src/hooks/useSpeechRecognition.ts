import { useState, useEffect, useRef, useCallback } from 'react';
import { triggerHaptic } from '../utils/audioChime';

interface UseSpeechRecognitionOptions {
  onFinalTranscript?: (text: string) => void;
  lang?: string;
}

export function useSpeechRecognition({ onFinalTranscript, lang = 'es-ES' }: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Web Speech API not available natively, will use MediaRecorder fallback
      setIsSupported(true); // We support voice via server-side fallback
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        triggerHaptic(30);
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);

        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          if (onFinalTranscript) {
            onFinalTranscript(currentText);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Could not initialize SpeechRecognition:', e);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [lang, onFinalTranscript]);

  const startListening = useCallback(async () => {
    setTranscript('');

    // If native speech recognition works
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = lang;
        recognitionRef.current.start();
        return;
      } catch (err) {
        console.warn('Native speech recognition start failed, falling back to MediaRecorder:', err);
      }
    }

    // Fallback: Use MediaRecorder + Server Transcribe
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsProcessingAudio(true);

        try {
          // Convert blob to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            const response = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioData: base64Audio, mimeType: 'audio/webm' }),
            });
            const data = await response.json();
            if (data.text) {
              setTranscript(data.text);
              if (onFinalTranscript) {
                onFinalTranscript(data.text);
              }
            }
            setIsProcessingAudio(false);
          };
        } catch (e) {
          console.error('Audio transcription fallback failed:', e);
          setIsProcessingAudio(false);
        }

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
      triggerHaptic(30);
    } catch (micError) {
      console.error('Microphone access denied:', micError);
      setIsListening(false);
    }
  }, [lang, onFinalTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
    triggerHaptic(20);
  }, [isListening]);

  return {
    isListening,
    transcript,
    isSupported,
    isProcessingAudio,
    startListening,
    stopListening,
    setTranscript,
  };
}
