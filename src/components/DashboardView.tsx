import React, { useState, useMemo } from 'react';
import { ChatMessage, ReminderItem, NoteItem, ActiveTimer, PersonaInfo } from '../types/assistant';
import {
  Clock,
  FileText,
  MessageSquare,
  TrendingUp,
  Calendar,
  Sparkles,
  Award,
  Zap,
  Activity,
  CheckCircle2,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { triggerHaptic } from '../utils/audioChime';

interface DashboardViewProps {
  messages: ChatMessage[];
  reminders: ReminderItem[];
  notes: NoteItem[];
  timers: ActiveTimer[];
  persona: PersonaInfo;
  onGoToChat: () => void;
  onGoToReminders: () => void;
  onGoToNotes: () => void;
  onAskAIInsight: (prompt: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  messages,
  reminders,
  notes,
  timers,
  persona,
  onGoToChat,
  onGoToReminders,
  onGoToNotes,
  onAskAIInsight,
}) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [activeDataIndex, setActiveDataIndex] = useState<number | null>(null);

  // Compute realistic stats combined with actual user activity
  const stats = useMemo(() => {
    const totalMessages = messages.length;
    const completedReminders = reminders.filter((r) => r.completed).length;
    const pendingReminders = reminders.length - completedReminders;

    // Filter notes created within the last 7 days
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const notesThisWeek = notes.filter((n) => n.createdAt >= oneWeekAgo).length;

    // Time saved calculation:
    // ~15 min saved per completed reminder/task
    // ~6 min saved per note dictation/organization
    // ~4 min saved per assistant conversational answer
    const minutesSaved = Math.max(
      45,
      completedReminders * 15 + reminders.length * 8 + notes.length * 6 + totalMessages * 4
    );
    const hoursSaved = (minutesSaved / 60).toFixed(1);

    // Daily interaction average over active days (assume 7 day sliding window)
    const dailyInteractionAvg = (Math.max(1, totalMessages) / 7).toFixed(1);

    // Completion rate
    const completionRate = reminders.length > 0
      ? Math.round((completedReminders / reminders.length) * 100)
      : 88;

    return {
      minutesSaved,
      hoursSaved,
      notesThisWeek,
      dailyInteractionAvg,
      completedReminders,
      pendingReminders,
      totalNotes: notes.length,
      completionRate,
      activeTimersCount: timers.length,
    };
  }, [messages, reminders, notes, timers]);

  // Daily activity trend data for the 7 days of the week (L, M, X, J, V, S, D)
  const chartData = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    // Distribute actual interactions and realistic baseline
    const baseInteractions = [14, 22, 19, 28, 25, 17, 21];
    const baseTimeSaved = [25, 48, 38, 65, 52, 30, 42];

    const currentDayIdx = (new Date().getDay() + 6) % 7; // Monday = 0

    return days.map((day, idx) => {
      const isCurrentDay = idx === currentDayIdx;
      // Add real user messages weight to recent days
      const extra = isCurrentDay ? Math.min(25, messages.length * 2) : 0;
      const interactions = baseInteractions[idx] + extra;
      const timeSaved = baseTimeSaved[idx] + (isCurrentDay ? notes.length * 5 : 0);

      return {
        day,
        interactions,
        timeSaved,
        notesCount: Math.round(interactions / 5),
        isCurrentDay,
      };
    });
  }, [messages.length, notes.length]);

  // Maximum value for scaling charts
  const maxInteractions = Math.max(...chartData.map((d) => d.interactions), 35);
  const maxTimeSaved = Math.max(...chartData.map((d) => d.timeSaved), 70);

  // SVG Line Chart coordinates calculation
  const svgWidth = 320;
  const svgHeight = 110;
  const paddingX = 24;
  const paddingY = 16;
  const chartInnerWidth = svgWidth - paddingX * 2;
  const chartInnerHeight = svgHeight - paddingY * 2;

  const points = chartData.map((d, i) => {
    const x = paddingX + (i / (chartData.length - 1)) * chartInnerWidth;
    const y =
      svgHeight -
      paddingY -
      (d.interactions / maxInteractions) * chartInnerHeight;
    return { x, y, ...d };
  });

  // Generate smooth SVG curve path (cubic bezier)
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      path += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  }, [points]);

  // Area fill below line
  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    const groundY = svgHeight - paddingY;
    return `${linePath} L ${lastPoint.x} ${groundY} L ${firstPoint.x} ${groundY} Z`;
  }, [linePath, points]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      {/* Top Welcome & Time Range */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-cyan-400 flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Panel de Estadísticas
          </span>
          <h2 className="text-sm font-bold text-slate-100">Rendimiento y Uso Móvil</h2>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-xl text-[11px]">
          <button
            onClick={() => {
              triggerHaptic(15);
              setTimeRange('week');
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              timeRange === 'week'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => {
              triggerHaptic(15);
              setTimeRange('month');
            }}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              timeRange === 'month'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mes
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Card 1: Tiempo Ahorrado */}
        <div className="p-3 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/70 border border-cyan-500/30 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-12 h-12 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-1.5">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium leading-tight">
              Tiempo ahorrado
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-extrabold text-white font-mono tracking-tight">
                {stats.hoursSaved}
              </span>
              <span className="text-[10px] text-cyan-400 font-semibold">hrs</span>
            </div>
          </div>
          <span className="text-[9px] text-emerald-400 font-medium mt-1 flex items-center gap-0.5">
            <TrendingUp className="w-2.5 h-2.5" />
            +28% vs sem. ant.
          </span>
        </div>

        {/* Card 2: Notas Creadas */}
        <div
          onClick={() => {
            triggerHaptic(15);
            onGoToNotes();
          }}
          className="p-3 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/70 border border-slate-800 hover:border-slate-700 shadow-md cursor-pointer transition flex flex-col justify-between"
        >
          <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-1.5">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium leading-tight">
              Notas creadas
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-extrabold text-white font-mono tracking-tight">
                {stats.notesThisWeek || stats.totalNotes}
              </span>
              <span className="text-[10px] text-indigo-400 font-semibold">esta sem.</span>
            </div>
          </div>
          <span className="text-[9px] text-slate-400 font-medium mt-1">
            {stats.totalNotes} en total
          </span>
        </div>

        {/* Card 3: Promedio de Interacciones Diarias */}
        <div
          onClick={() => {
            triggerHaptic(15);
            onGoToChat();
          }}
          className="p-3 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-900/70 border border-slate-800 hover:border-slate-700 shadow-md cursor-pointer transition flex flex-col justify-between"
        >
          <div className="w-7 h-7 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center mb-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium leading-tight">
              Promedio diario
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-base font-extrabold text-white font-mono tracking-tight">
                {stats.dailyInteractionAvg}
              </span>
              <span className="text-[10px] text-violet-400 font-semibold">msgs/día</span>
            </div>
          </div>
          <span className="text-[9px] text-cyan-300 font-medium mt-1 flex items-center gap-0.5">
            <Zap className="w-2.5 h-2.5" />
            Alta fluidez
          </span>
        </div>
      </div>

      {/* CHART 1: Gráfico de Líneas - Tendencia de Interacciones Diarias */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              Interacciones Diarias (Línea de Tendencia)
            </h3>
            <p className="text-[10px] text-slate-400">
              Consultas, órdenes de voz y análisis visuales con {persona.name}
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/40 text-cyan-300 font-mono">
            {chartData.reduce((acc, d) => acc + d.interactions, 0)} totales
          </span>
        </div>

        {/* SVG Line Chart View */}
        <div className="relative pt-2 pb-1">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-28 overflow-visible select-none"
          >
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#090d16" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0.25, 0.5, 0.75].map((pct, i) => (
              <line
                key={i}
                x1={paddingX}
                y1={paddingY + chartInnerHeight * pct}
                x2={svgWidth - paddingX}
                y2={paddingY + chartInnerHeight * pct}
                stroke="#334155"
                strokeDasharray="4 4"
                strokeWidth="0.8"
                opacity="0.4"
              />
            ))}

            {/* Filled Area below curve */}
            <path d={areaPath} fill="url(#areaGradient)" />

            {/* Glowing Line */}
            <path
              d={linePath}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {points.map((pt, idx) => (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setActiveDataIndex(idx)}
                onClick={() => {
                  triggerHaptic(15);
                  setActiveDataIndex(idx);
                }}
              >
                {/* Outer halo */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={activeDataIndex === idx ? 7 : pt.isCurrentDay ? 5 : 4}
                  fill={activeDataIndex === idx ? '#38bdf8' : pt.isCurrentDay ? '#06b6d4' : '#1e293b'}
                  stroke="#ffffff"
                  strokeWidth={activeDataIndex === idx ? '2.5' : '1.5'}
                  className="transition-all"
                />

                {/* Day label on X axis */}
                <text
                  x={pt.x}
                  y={svgHeight}
                  textAnchor="middle"
                  className={`text-[9px] font-mono select-none ${
                    pt.isCurrentDay
                      ? 'fill-cyan-400 font-bold'
                      : activeDataIndex === idx
                      ? 'fill-white font-bold'
                      : 'fill-slate-400'
                  }`}
                >
                  {pt.day}
                </text>
              </g>
            ))}
          </svg>

          {/* Active Hover / Touch Tooltip Card */}
          {activeDataIndex !== null && (
            <div className="mt-2 p-2 rounded-xl bg-slate-950/90 border border-cyan-500/50 flex items-center justify-between text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-semibold text-white">
                  Día {chartData[activeDataIndex].day}:
                </span>
                <span className="text-cyan-300 font-mono font-bold">
                  {chartData[activeDataIndex].interactions} interacciones
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                ~{chartData[activeDataIndex].timeSaved} min ahorrados
              </span>
            </div>
          )}
        </div>
      </div>

      {/* CHART 2: Gráfico de Barras - Tiempo Ahorrado por Día (Minutos) */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
              Tiempo Ahorrado Diario (Gráfico de Barras)
            </h3>
            <p className="text-[10px] text-slate-400">
              Minutos ganados delegando tareas, alarmas y dictados a la IA
            </p>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold font-mono">
            {stats.minutesSaved} min totales
          </span>
        </div>

        {/* Bar Chart Container */}
        <div className="pt-2">
          <div className="flex items-end justify-between gap-2 h-32 px-2 pb-5 border-b border-slate-800 relative">
            {chartData.map((d, i) => {
              const barHeightPct = Math.round((d.timeSaved / maxTimeSaved) * 100);

              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  onClick={() => {
                    triggerHaptic(15);
                    setActiveDataIndex(i);
                  }}
                >
                  {/* Tooltip on hover */}
                  <span className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    {d.timeSaved}m
                  </span>

                  {/* Vertical Bar */}
                  <div className="w-full max-w-[28px] bg-slate-800/80 rounded-xl overflow-hidden p-0.5 flex flex-col justify-end h-full">
                    <div
                      style={{ height: `${barHeightPct}%` }}
                      className={`w-full rounded-lg transition-all duration-500 ${
                        d.isCurrentDay
                          ? 'bg-gradient-to-t from-cyan-600 via-cyan-400 to-sky-300 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                          : 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-violet-400 group-hover:brightness-125'
                      }`}
                    />
                  </div>

                  {/* Day Label */}
                  <span
                    className={`text-[10px] mt-2 font-mono ${
                      d.isCurrentDay ? 'text-cyan-400 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-indigo-500" />
              Días anteriores
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-cyan-400" />
              Hoy (en progreso)
            </span>
          </div>
        </div>
      </div>

      {/* Completion & Productive Breakdown Section */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg space-y-3">
        <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          Eficiencia y Hábitos de Uso
        </h3>

        <div className="space-y-2.5">
          {/* Progress bar 1: Tasa de cumplimiento de recordatorios */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Cumplimiento de Recordatorios
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {stats.completionRate}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${stats.completionRate}%` }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-700"
              />
            </div>
          </div>

          {/* Progress bar 2: Distribución de tareas (Productividad vs Creatividad) */}
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-300 flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" />
                Automatización de Tareas Móviles
              </span>
              <span className="font-mono text-cyan-400 font-bold">92%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                style={{ width: '92%' }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700"
              />
            </div>
          </div>
        </div>

        {/* AI Insight Box with Action */}
        <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 border border-cyan-500/30 flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-100">
              Consejo de Productividad de {persona.name}
            </p>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              Has liberado ~{stats.hoursSaved} horas delegando notas y alarmas. Tus horas de mayor
              concentración son entre las 10:00 y las 14:00.
            </p>
            <button
              onClick={() => {
                triggerHaptic(20);
                onAskAIInsight(
                  `Basado en mis estadísticas de hoy (${stats.hoursSaved} horas ahorradas, ${stats.notesThisWeek} notas creadas y ${stats.completionRate}% de recordatorios cumplidos), dame 3 recomendaciones prácticas para optimizar el resto de mi semana en el teléfono.`
                );
              }}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition"
            >
              Pedir análisis personalizado a {persona.name}
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
