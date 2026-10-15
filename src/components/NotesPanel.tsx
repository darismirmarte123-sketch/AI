import React, { useState } from 'react';
import { NoteItem } from '../types/assistant';
import { FileText, Plus, Trash2, Copy, Share2, Check, Sparkles } from 'lucide-react';
import { playSuccessChime, triggerHaptic } from '../utils/audioChime';

interface NotesPanelProps {
  notes: NoteItem[];
  onAddNote: (note: Omit<NoteItem, 'id' | 'createdAt'>) => void;
  onDeleteNote: (id: string) => void;
  onAskAIAboutNote: (note: NoteItem) => void;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({
  notes,
  onAddNote,
  onDeleteNote,
  onAskAIAboutNote,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Ideas');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    onAddNote({
      title: title.trim() || 'Nota rápida',
      content: content.trim(),
      category: category || 'Ideas',
    });

    playSuccessChime();
    triggerHaptic(30);
    setTitle('');
    setContent('');
    setShowAdd(false);
  };

  const copyNote = (note: NoteItem) => {
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopiedId(note.id);
    triggerHaptic(20);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareNote = async (note: NoteItem) => {
    triggerHaptic(20);
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: note.content,
        });
      } catch {
        copyNote(note);
      }
    } else {
      copyNote(note);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-cyan-400" />
          Bloc de Notas del Teléfono ({notes.length})
        </h3>
        <button
          onClick={() => {
            setShowAdd(!showAdd);
            triggerHaptic(20);
          }}
          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium px-2 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/40"
        >
          <Plus className="w-3.5 h-3.5" />
          {showAdd ? 'Cerrar' : 'Crear Nota'}
        </button>
      </div>

      {/* Add Note Form */}
      {showAdd && (
        <form
          onSubmit={handleCreate}
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-3 shadow-lg"
        >
          <input
            type="text"
            placeholder="Título de la nota..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            autoFocus
          />
          <textarea
            placeholder="Escribe o pega aquí el contenido de la nota..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
          />

          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-1.5">
              {['Ideas', 'Trabajo', 'Personal', 'Compras'].map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border ${
                    category === cat
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-semibold'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md shadow-cyan-600/30 transition"
            >
              Guardar Nota
            </button>
          </div>
        </form>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="py-8 text-center text-slate-500 space-y-2">
          <FileText className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-xs">No tienes notas guardadas.</p>
          <p className="text-[11px] text-slate-600">
            Dile al asistente por voz: <br />
            <span className="italic text-cyan-400/80">"Anota esta idea para un proyecto nuevo..."</span>
          </p>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 space-y-2 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                    {note.category}
                  </span>
                  <h4 className="text-xs font-semibold text-slate-100 mt-1">{note.title}</h4>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onAskAIAboutNote(note)}
                    title="Pedir a Nova que analice o resuma esta nota"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => copyNote(note)}
                    title="Copiar texto"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                  >
                    {copiedId === note.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => shareNote(note)}
                    title="Compartir (WhatsApp, email, etc.)"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic(20);
                      onDeleteNote(note.id);
                    }}
                    title="Eliminar"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-4">
                {note.content}
              </p>

              <div className="text-[10px] text-slate-500 pt-1">
                {new Date(note.createdAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
