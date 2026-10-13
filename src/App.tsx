import React, { useState } from 'react';
import { 
  Smartphone, 
  Code2, 
  Columns, 
  Download, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  Calendar, 
  FileText, 
  CheckCircle2,
  ExternalLink,
  Github
} from 'lucide-react';
import { AndroidSimulator } from './components/AndroidSimulator';
import { AndroidCodeHub } from './components/AndroidCodeHub';
import { downloadAndroidProjectZip } from './utils/zipExporter';

export default function App() {
  const [viewMode, setViewMode] = useState<'simulator' | 'code' | 'split'>('split');
  const [simulatorScreen, setSimulatorScreen] = useState<'tutor' | 'notes' | 'quiz' | 'planner' | 'pdf'>('tutor');
  const [quizInitialTopic, setQuizInitialTopic] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadAndroidProjectZip();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Top Application Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 z-30">
        {/* Brand & Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white tracking-tight">Smart Study Buddy</span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Android (Java)
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400">
              AI Tutor • SQLite Notes • Quiz Generator • Planner • PDF Summarizer
            </p>
          </div>
        </div>

        {/* View Mode Toggle Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('simulator')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center space-x-1.5 ${
              viewMode === 'simulator'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Phone Simulator</span>
            <span className="sm:hidden">App</span>
          </button>

          <button
            onClick={() => setViewMode('split')}
            className={`hidden md:flex px-3 py-1.5 rounded-md font-medium transition-colors items-center space-x-1.5 ${
              viewMode === 'split'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>

          <button
            onClick={() => setViewMode('code')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center space-x-1.5 ${
              viewMode === 'code'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Android Studio &amp; Java Code</span>
            <span className="sm:hidden">Code</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors active:scale-95"
            title="Download full Android project ZIP"
          >
            {isDownloading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Download .ZIP</span>
          </button>
        </div>
      </header>

      {/* Main App Workspace */}
      <main className="flex-1 overflow-hidden relative flex">
        {/* VIEW 1: SIMULATOR ONLY */}
        {viewMode === 'simulator' && (
          <div className="flex-1 h-full overflow-y-auto bg-slate-950 flex items-center justify-center p-4">
            <AndroidSimulator
              activeScreen={simulatorScreen}
              setActiveScreen={setSimulatorScreen}
              quizInitialTopic={quizInitialTopic}
              setQuizInitialTopic={setQuizInitialTopic}
              onOpenCodeHub={() => setViewMode('code')}
            />
          </div>
        )}

        {/* VIEW 2: CODE & GUIDE ONLY */}
        {viewMode === 'code' && (
          <div className="flex-1 h-full overflow-hidden">
            <AndroidCodeHub />
          </div>
        )}

        {/* VIEW 3: SPLIT VIEW (Simulator on left, Code Explorer & Tutorial on right) */}
        {viewMode === 'split' && (
          <div className="flex-1 h-full flex flex-row overflow-hidden">
            {/* Left Panel: Android Phone Device */}
            <div className="w-[450px] shrink-0 border-r border-slate-800 bg-slate-950 overflow-y-auto flex items-center justify-center p-4">
              <AndroidSimulator
                activeScreen={simulatorScreen}
                setActiveScreen={setSimulatorScreen}
                quizInitialTopic={quizInitialTopic}
                setQuizInitialTopic={setQuizInitialTopic}
                onOpenCodeHub={() => setViewMode('code')}
              />
            </div>

            {/* Right Panel: Android Studio Code & Step-by-Step Guide */}
            <div className="flex-1 h-full overflow-hidden bg-slate-900">
              <AndroidCodeHub />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
