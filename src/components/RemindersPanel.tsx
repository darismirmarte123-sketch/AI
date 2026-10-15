import React, { useState } from 'react';
import { ReminderItem, ActiveTimer } from '../types/assistant';
import { Bell, Clock, Plus, Trash2, CheckCircle2, Circle, AlertTriangle, Play, Pause, RotateCcw } from 'lucide-react';
import { playSuccessChime, triggerHaptic } from '../utils/audioChime';

interface RemindersPanelProps {
  reminders: ReminderItem[];
  timers: ActiveTimer[];
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onAddReminder: (reminder: Omit<ReminderItem, 'id' | 'createdAt'>) => void;
  onToggleTimer: (id: string) => void;
  onResetTimer: (id: string) => void;
  onDeleteTimer: (id: string) => void;
}

export const RemindersPanel: React.FC<RemindersPanelProps> = ({
  reminders,
  timers,
  onToggleReminder,
  onDeleteReminder,
  onAddReminder,
  onToggleTimer,
  onResetTimer,
  onDeleteTimer,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDate, setNewDate] = useState('Hoy');
  const [newPriority, setNewPriority] = useState<'normal' | 'high'>('normal');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddReminder({
      title: newTitle.trim(),
      time: newTime || 'Pronto',
      date: newDate || 'Hoy',
      completed: false,
      priority: newPriority,
    });

    playSuccessChime();
    triggerHaptic(30);
    setNewTitle('');
    setNewTime('');
    setShowAddForm(false);
  };

  const formatTimerSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      {/* Active Timers Section */}
      {timers.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-cyan-400 tracking-wider uppercase flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Temporizadores activos
          </h3>

          <div className="grid gap-2">
            {timers.map((timer) => (
              <div
                key={timer.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-cyan-500/30 shadow-md"
              >
                <div>
                  <p className="text-xs font-medium text-slate-300">{timer.label}</p>
                  <p className="text-2xl font-bold font-mono text-cyan-300 tracking-tight">
                    {formatTimerSeconds(timer.remainingSeconds)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      triggerHaptic(20);
                      onToggleTimer(timer.id);
                    }}
                    className={`p-2.5 rounded-xl ${
                      timer.isRunning
                        ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                    } transition`}
                  >
                    {timer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      triggerHaptic(20);
                      onResetTimer(timer.id);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      triggerHaptic(20);
                      onDeleteTimer(timer.id);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 text-rose-400 hover:bg-rose-500/20 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reminders Header & Add Button */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-cyan-400" />
          Recordatorios y Alarmas ({reminders.length})
        </h3>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            triggerHaptic(20);
          }}
          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium px-2 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/40"
        >
          <Plus className="w-3.5 h-3.5" />
          {showAddForm ? 'Cancelar' : 'Nuevo'}
        </button>
      </div>

      {/* Add Reminder Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreate}
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-3 shadow-lg"
        >
          <div>
            <input
              type="text"
              placeholder="¿Qué deseas recordar? Ej: Llamar al médico..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Hora (ej. 15:30)"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <input
              type="text"
              placeholder="Fecha (ej. Hoy, Mañana)"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setNewPriority(newPriority === 'normal' ? 'high' : 'normal')}
              className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                newPriority === 'high'
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              {newPriority === 'high' ? 'Alta prioridad' : 'Normal'}
            </button>

            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md shadow-cyan-600/30 transition"
            >
              Guardar
            </button>
          </div>
        </form>
      )}

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <div className="py-8 text-center text-slate-500 space-y-2">
          <Bell className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-xs">No tienes recordatorios pendientes.</p>
          <p className="text-[11px] text-slate-600">
            Dile al asistente: <br />
            <span className="italic text-cyan-400/80">"Recuérdame revisar el correo a las 4pm"</span>
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {reminders.map((r) => (
            <div
              key={r.id}
              className={`flex items-start justify-between p-3 rounded-2xl border transition-all ${
                r.completed
                  ? 'bg-slate-900/40 border-slate-800/40 opacity-60'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <button
                  onClick={() => {
                    triggerHaptic(20);
                    onToggleReminder(r.id);
                  }}
                  className="mt-0.5 text-slate-400 hover:text-cyan-400 transition"
                >
                  {r.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </button>

                <div>
                  <p
                    className={`text-xs font-medium ${
                      r.completed ? 'line-through text-slate-500' : 'text-slate-100'
                    }`}
                  >
                    {r.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-cyan-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {r.time} ({r.date})
                    </span>
                    {r.priority === 'high' && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-medium">
                        Urgente
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  triggerHaptic(20);
                  onDeleteReminder(r.id);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
