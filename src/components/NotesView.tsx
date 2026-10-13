import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  BookOpen, 
  Sparkles, 
  HelpCircle, 
  Tag, 
  Folder,
  Calendar,
  X,
  FileText
} from 'lucide-react';
import { Note } from '../types';

interface NotesViewProps {
  notes: Note[];
  onAddNote: (note: Omit<Note, 'id' | 'date'>) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  onAskTutorWithNote: (content: string, title: string) => void;
  onGenerateQuizFromNote: (note: Note) => void;
  onSummarizeNote: (note: Note) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onAddNote,
  onDeleteNote,
  onTogglePin,
  onAskTutorWithNote,
  onGenerateQuizFromNote,
  onSummarizeNote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // New Note State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSubject, setNewSubject] = useState('Computer Science');
  const [newTags, setNewTags] = useState('Exam, Lecture');
  const [newColor, setNewColor] = useState('#3B82F6');

  const subjects = ['All', 'Computer Science', 'Biology', 'Mathematics', 'Economics', 'Psychology'];

  const filteredNotes = notes.filter((n) => {
    const matchesSubject = selectedSubject === 'All' || n.subject === selectedSubject;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSubject && matchesSearch;
  });

  // Sort pinned first
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const handleSaveNewNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onAddNote({
      title: newTitle.trim(),
      content: newContent.trim(),
      subject: newSubject,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      color: newColor,
    });

    setNewTitle('');
    setNewContent('');
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-20">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-b-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">My Study Notes</h2>
              <p className="text-xs text-emerald-100">
                {notes.length} notes saved • SQLite offline ready
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1 text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search notes, topics, or formulas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>

        {/* Subject Filter Pills */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${
                selectedSubject === sub
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Notes Grid / List */}
        {sortedNotes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-slate-700">No notes found</p>
              <p className="text-xs text-slate-400">Add a note or save explanations from the AI Tutor.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="py-2 px-4 bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-emerald-700"
            >
              Create First Note
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-xs transition-shadow cursor-pointer relative group"
              >
                {/* Accent border strip */}
                <div
                  className="absolute left-0 top-3 bottom-3 w-1 rounded-r-md"
                  style={{ backgroundColor: note.color || '#10B981' }}
                />

                <div className="flex items-start justify-between pl-2">
                  <div className="flex-1 pr-2">
                    <div className="flex items-center space-x-1.5 mb-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {note.subject}
                      </span>
                      {note.isPinned && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 flex items-center gap-0.5">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-1">{note.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {note.content}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onTogglePin(note.id)}
                      className={`p-1.5 rounded-md hover:bg-slate-100 ${
                        note.isPinned ? 'text-amber-500' : 'text-slate-400'
                      }`}
                      title="Pin note"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Footer tags & date */}
                <div className="flex items-center justify-between pl-2 pt-2.5 mt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <div className="flex items-center space-x-1 overflow-hidden">
                    {note.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded-xs text-[10px]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span>{note.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  {selectedNote.subject}
                </span>
                <h3 className="text-base font-bold text-slate-800 mt-1">{selectedNote.title}</h3>
              </div>
              <button
                onClick={() => setSelectedNote(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto text-sm text-slate-700 leading-relaxed whitespace-pre-line flex-1">
              {selectedNote.content}
            </div>

            {/* AI Assistant actions for this note */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onAskTutorWithNote(selectedNote.content, selectedNote.title);
                  setSelectedNote(null);
                }}
                className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explain with Tutor</span>
              </button>
              <button
                onClick={() => {
                  onGenerateQuizFromNote(selectedNote);
                  setSelectedNote(null);
                }}
                className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 shadow-2xs"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Generate Quiz</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <form
            onSubmit={handleSaveNewNote}
            className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">New Study Note</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Note Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mitosis vs Meiosis Differences"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option>Computer Science</option>
                    <option>Biology</option>
                    <option>Mathematics</option>
                    <option>Economics</option>
                    <option>Psychology</option>
                    <option>General</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Tags</label>
                  <input
                    type="text"
                    placeholder="e.g. Midterm, Formulas"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Content / Notes</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Type notes, lecture summary, key definitions..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex space-x-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-2xs"
              >
                Save Note
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
