import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, X, Smartphone, PlusSquare } from 'lucide-react';
import { triggerHaptic } from '../utils/audioChime';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already running as an installed PWA on the phone, don't show
  if (isInstalled || dismissed) {
    return null;
  }

  // Android / Chromium / Desktop flow
  if (isInstallable) {
    return (
      <div className="mx-4 my-2 p-2.5 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-blue-950/80 border border-cyan-500/40 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-100">Instalar en tu teléfono</p>
            <p className="text-[10px] text-slate-400">Acceso rápido y pantalla completa sin barras</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              triggerHaptic(20);
              install();
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md transition"
          >
            <Download className="w-3.5 h-3.5" />
            Instalar
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-slate-400 hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <div className="mx-4 my-2 p-2.5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/80 border border-indigo-500/30 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-100">Instalar en tu iPhone</p>
              <p className="text-[10px] text-slate-400">Guárdalo como app en tu pantalla de inicio</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                triggerHaptic(20);
                setShowIOSGuide(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition"
            >
              <Share className="w-3 h-3" />
              Instalar
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Guided iOS Sheet */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  Instalar Asistente DarismirAI en iPhone
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    1
                  </div>
                  <p>
                    Toca el botón <strong className="text-white">Compartir</strong> en la barra inferior de Safari.
                  </p>
                  <Share className="w-4 h-4 text-cyan-400 ml-auto shrink-0" />
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    2
                  </div>
                  <p>
                    Desliza hacia abajo y elige <strong className="text-white">Añadir a pantalla de inicio</strong>.
                  </p>
                  <PlusSquare className="w-4 h-4 text-cyan-400 ml-auto shrink-0" />
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    3
                  </div>
                  <p>
                    Toca <strong className="text-white">Añadir</strong> en la esquina superior derecha. ¡Listo!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg transition"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
