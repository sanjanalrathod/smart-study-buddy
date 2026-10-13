import React, { useState } from 'react';
import { 
  Wifi, 
  Battery, 
  BrainCircuit, 
  BookOpen, 
  HelpCircle, 
  Calendar, 
  FileText, 
  Home, 
  Sparkles, 
  Smartphone, 
  Code2, 
  Download,
  Columns
} from 'lucide-react';
import { AITutorView } from './AITutorView';
import { NotesView } from './NotesView';
import { QuizView } from './QuizView';
import { PlannerView } from './PlannerView';
import { PdfSummarizerView } from './PdfSummarizerView';
import { Note } from '../types';

interface AndroidSimulatorProps {
  onOpenCodeHub?: () => void;
  activeScreen: 'tutor' | 'notes' | 'quiz' | 'planner' | 'pdf';
  setActiveScreen: (screen: 'tutor' | 'notes' | 'quiz' | 'planner' | 'pdf') => void;
  quizInitialTopic: string;
  setQuizInitialTopic: (topic: string) => void;
}

export const AndroidSimulator: React.FC<AndroidSimulatorProps> = ({
  onOpenCodeHub,
  activeScreen,
  setActiveScreen,
  quizInitialTopic,
  setQuizInitialTopic,
}) => {
  // Shared Notes state (persisted in memory for student session)
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 'note-1',
      title: 'Operating Systems: Semaphores & Mutexes',
      content: 'A Semaphore is an integer synchronization primitive with wait() and signal() atomic operations. Dijkstra introduced counting and binary semaphores to prevent race conditions in critical sections.',
      subject: 'Computer Science',
      tags: ['OS', 'Concurrency', 'Exam Prep'],
      color: '#3B82F6',
      date: 'Today',
      isPinned: true,
    },
    {
      id: 'note-2',
      title: 'Biology: Glycolysis & ATP Net Yield',
      content: 'Glycolysis breaks 1 glucose (6C) into 2 pyruvates (3C) in the cytoplasm without oxygen. Produces 4 gross ATP, uses 2 ATP, yielding a net 2 ATP and 2 NADH.',
      subject: 'Biology',
      tags: ['Cellular Respiration', 'Bio 101'],
      color: '#10B981',
      date: 'Yesterday',
    },
    {
      id: 'note-3',
      title: 'Calculus: Integration by Parts Formula',
      content: 'Formula: ∫ u dv = uv - ∫ v du. Choose u using LIATE rule: Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential.',
      subject: 'Mathematics',
      tags: ['Calc II', 'Formulas'],
      color: '#8B5CF6',
      date: '2 days ago',
    },
  ]);

  const handleAddNote = (newNoteData: Omit<Note, 'id' | 'date'>) => {
    const newNote: Note = {
      ...newNoteData,
      id: String(Date.now()),
      date: 'Just now',
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const handleJumpToQuiz = (topic: string) => {
    setQuizInitialTopic(topic);
    setActiveScreen('quiz');
  };

  const handleAskTutorWithNote = (content: string, title: string) => {
    setQuizInitialTopic(title);
    setActiveScreen('tutor');
  };

  const handleGenerateQuizFromNote = (note: Note) => {
    setQuizInitialTopic(note.title);
    setActiveScreen('quiz');
  };

  const handleSummarizeNote = (note: Note) => {
    setActiveScreen('pdf');
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Device Frame */}
      <div className="w-full max-w-[410px] h-[780px] bg-slate-900 rounded-[44px] p-3 shadow-2xl shadow-slate-950/50 border-[6px] border-slate-800 relative flex flex-col overflow-hidden">
        {/* Android Punch-hole Camera */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full z-40 border border-slate-800" />

        {/* Android Screen Container */}
        <div className="w-full h-full bg-slate-50 rounded-[34px] overflow-hidden flex flex-col relative shadow-inner">
          {/* Android Status Bar */}
          <div className="h-7 bg-white px-5 flex items-center justify-between text-[11px] font-semibold text-slate-700 z-30 select-none border-b border-slate-100">
            <span>9:41</span>
            <div className="flex items-center space-x-1.5 text-slate-700">
              <span className="text-[10px] font-bold">5G</span>
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center">
                <span className="text-[9px] mr-0.5">98%</span>
                <Battery className="w-4 h-4 fill-current text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Active Screen View */}
          <div className="flex-1 overflow-hidden relative">
            {activeScreen === 'tutor' && (
              <AITutorView
                onSaveToNotes={handleAddNote}
                onJumpToQuiz={handleJumpToQuiz}
              />
            )}
            {activeScreen === 'notes' && (
              <NotesView
                notes={notes}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
                onTogglePin={handleTogglePin}
                onAskTutorWithNote={handleAskTutorWithNote}
                onGenerateQuizFromNote={handleGenerateQuizFromNote}
                onSummarizeNote={handleSummarizeNote}
              />
            )}
            {activeScreen === 'quiz' && (
              <QuizView
                initialTopic={quizInitialTopic}
                savedNotes={notes}
              />
            )}
            {activeScreen === 'planner' && <PlannerView />}
            {activeScreen === 'pdf' && (
              <PdfSummarizerView
                onSaveToNotes={handleAddNote}
                onJumpToQuiz={handleJumpToQuiz}
              />
            )}
          </div>

          {/* Android Bottom Navigation Bar (Material 3 Tabs) */}
          <div className="h-16 bg-white border-t border-slate-200 px-2 flex items-center justify-around z-30 shadow-xs">
            <button
              onClick={() => setActiveScreen('tutor')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                activeScreen === 'tutor' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1 rounded-full ${activeScreen === 'tutor' ? 'bg-blue-50' : ''}`}>
                <BrainCircuit className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">Tutor</span>
            </button>

            <button
              onClick={() => setActiveScreen('notes')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                activeScreen === 'notes' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1 rounded-full ${activeScreen === 'notes' ? 'bg-emerald-50' : ''}`}>
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">Notes</span>
            </button>

            <button
              onClick={() => setActiveScreen('quiz')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                activeScreen === 'quiz' ? 'text-purple-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1 rounded-full ${activeScreen === 'quiz' ? 'bg-purple-50' : ''}`}>
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">Quiz</span>
            </button>

            <button
              onClick={() => setActiveScreen('planner')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                activeScreen === 'planner' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1 rounded-full ${activeScreen === 'planner' ? 'bg-amber-50' : ''}`}>
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">Planner</span>
            </button>

            <button
              onClick={() => setActiveScreen('pdf')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                activeScreen === 'pdf' ? 'text-rose-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1 rounded-full ${activeScreen === 'pdf' ? 'bg-rose-50' : ''}`}>
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">PDF</span>
            </button>
          </div>

          {/* Android Home Navigation Bar Pill */}
          <div className="h-4 bg-white flex items-center justify-center pb-1">
            <div className="w-24 h-1 bg-slate-300 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};
