import React from 'react';
import { motion } from 'motion/react';

interface VoiceVisualizerProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking';
  onClick?: () => void;
  personaColor?: string;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  state,
  onClick,
  personaColor = '#06b6d4',
}) => {
  const isListening = state === 'listening';
  const isThinking = state === 'thinking';
  const isSpeaking = state === 'speaking';

  return (
    <div className="relative flex items-center justify-center cursor-pointer select-none py-2" onClick={onClick}>
      {/* Outer ambient glow */}
      <motion.div
        animate={{
          scale: isListening ? [1, 1.45, 1.1] : isSpeaking ? [1, 1.3, 1.15] : isThinking ? [1, 1.25, 1] : 1,
          opacity: isListening ? [0.4, 0.8, 0.5] : isSpeaking ? [0.4, 0.75, 0.4] : isThinking ? [0.3, 0.7, 0.3] : 0.25,
        }}
        transition={{
          repeat: Infinity,
          duration: isListening ? 1.4 : isSpeaking ? 1.8 : 2.5,
          ease: 'easeInOut',
        }}
        className="absolute w-36 h-36 rounded-full blur-2xl pointer-events-none"
        style={{
          background: isListening
            ? 'radial-gradient(circle, rgba(239, 68, 68, 0.6) 0%, rgba(249, 115, 22, 0.3) 50%, transparent 70%)'
            : isSpeaking
            ? 'radial-gradient(circle, rgba(6, 182, 212, 0.6) 0%, rgba(139, 92, 246, 0.4) 60%, transparent 70%)'
            : isThinking
            ? 'radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, rgba(59, 130, 246, 0.4) 60%, transparent 70%)'
            : 'radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, rgba(99, 102, 241, 0.15) 60%, transparent 70%)',
        }}
      />

      {/* Orbiting particles / Waveform rings */}
      {(isListening || isSpeaking || isThinking) && (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: isThinking ? 3 : 8, ease: 'linear' }}
            className="absolute w-28 h-28 rounded-full border border-dashed border-cyan-400/40 pointer-events-none"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: isThinking ? 4 : 10, ease: 'linear' }}
            className="absolute w-32 h-32 rounded-full border border-dotted border-violet-400/30 pointer-events-none"
          />
        </>
      )}

      {/* Core Orb */}
      <motion.div
        animate={{
          scale: isListening ? [1, 1.15, 1.05] : isSpeaking ? [1, 1.1, 1] : 1,
        }}
        transition={{
          repeat: isListening || isSpeaking ? Infinity : 0,
          duration: 1,
          ease: 'easeInOut',
        }}
        className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all overflow-hidden"
        style={{
          background: 'radial-gradient(circle, #0e1628 0%, #060912 100%)',
          boxShadow: isListening
            ? '0 0 30px rgba(239, 68, 68, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.3)'
            : isSpeaking
            ? '0 0 30px rgba(6, 182, 212, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.3)'
            : '0 0 20px rgba(56, 189, 248, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
          border: '2px solid rgba(56, 189, 248, 0.4)',
        }}
      >
        <img src="/icon.svg" alt="Nova Orb" className="w-full h-full object-contain pointer-events-none p-1" />

        {/* Dynamic Equalizer Bars when listening or speaking */}
        {(isListening || isSpeaking) && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center gap-1">
            {[0.4, 0.8, 1, 0.6, 0.3].map((height, i) => (
              <motion.span
                key={i}
                animate={{
                  scaleY: isListening
                    ? [0.3, 1.2 * height + 0.3, 0.4]
                    : isSpeaking
                    ? [0.4, 1.1 * height + 0.2, 0.3]
                    : [0.2, 0.4, 0.2],
                }}
                transition={{
                  repeat: Infinity,
                  duration: isListening ? 0.4 + i * 0.1 : 0.5 + i * 0.12,
                  repeatType: 'reverse',
                  delay: i * 0.08,
                }}
                className="w-1.5 h-6 rounded-full bg-cyan-300 shadow-sm"
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
