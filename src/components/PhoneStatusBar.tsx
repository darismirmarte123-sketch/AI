import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Sparkles, Smartphone, Monitor } from 'lucide-react';

interface PhoneStatusBarProps {
  isPhoneFrame: boolean;
  onToggleFrame: () => void;
  assistantStatusText?: string;
  isOnline: boolean;
}

export const PhoneStatusBar: React.FC<PhoneStatusBarProps> = ({
  isPhoneFrame,
  onToggleFrame,
  assistantStatusText = 'Nova AI Conectada',
  isOnline,
}) => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full select-none">
      {/* Mobile Status Bar */}
      <div className="flex items-center justify-between px-5 pt-3 pb-2 text-xs font-semibold text-slate-300">
        {/* Left: Time & Assistant badge */}
        <div className="flex items-center gap-2">
          <span className="tracking-tight text-white font-mono">{time || '09:41'}</span>
          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[10px] text-cyan-300">
            <Sparkles className="w-2.5 h-2.5 animate-pulse text-cyan-400" />
            5G
          </span>
        </div>

        {/* Center: Dynamic Island style pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/60 shadow-inner">
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'
            }`}
          />
          <span className="text-[11px] font-medium text-slate-300 truncate max-w-[130px]">
            {assistantStatusText}
          </span>
        </div>

        {/* Right: Icons & Viewport Toggle */}
        <div className="flex items-center gap-2 text-slate-300">
          <Wifi className="w-3.5 h-3.5 text-slate-200" />
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-mono">98%</span>
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>

          {/* Desktop switcher between phone frame mockup and fullscreen view */}
          <button
            onClick={onToggleFrame}
            title={isPhoneFrame ? 'Cambiar a Pantalla Completa' : 'Ver en Formato Smartphone'}
            className="hidden md:flex ml-1 p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition"
          >
            {isPhoneFrame ? (
              <Monitor className="w-3.5 h-3.5" />
            ) : (
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
