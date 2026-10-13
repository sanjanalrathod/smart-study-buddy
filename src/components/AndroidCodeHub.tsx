import React, { useState } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  FolderTree, 
  Cpu, 
  BookOpen, 
  Smartphone, 
  ExternalLink, 
  Layers, 
  CheckCircle2, 
  Code2, 
  FileCode2,
  AlertCircle
} from 'lucide-react';
import { ANDROID_FILES, STEP_BY_STEP_GUIDE, FREE_TOOLS_RECOMMENDATION } from '../data/androidProjectCode';
import { downloadAndroidProjectZip } from '../utils/zipExporter';

export const AndroidCodeHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'code' | 'guide' | 'free_tools'>('guide');
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const selectedFile = ANDROID_FILES[selectedFileIdx];

  const handleCopyCode = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      await downloadAndroidProjectZip();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-slate-950 border-b border-slate-800 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-white">Smart Study Buddy — Android Studio Hub</h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Java + Material 3
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete beginner tutorial, copy-pasteable Java codebase, and 100% free tool recommendations.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-950 flex items-center space-x-2 transition-all active:scale-95"
            >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Download Android Studio Project (.ZIP)</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto flex space-x-2 mt-5">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'guide'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Step-by-Step Beginner Guide</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'code'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Java Code &amp; XML Layouts ({ANDROID_FILES.length} files)</span>
          </button>
          <button
            onClick={() => setActiveTab('free_tools')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'free_tools'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Recommended Free Tools</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto w-full p-4 sm:p-6 flex-1 pb-16">
        {/* TAB 1: BEGINNER GUIDE */}
        {activeTab === 'guide' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Beginner Welcome Card */}
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5">
              <div className="flex items-start space-x-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 shrink-0">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">How This Android App Works for Beginners</h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    This Android application is engineered in <strong>Java</strong> using Android Studio&apos;s standard Architecture.
                    It uses <strong>SQLite</strong> for 100% free local data persistence (notes and tasks), <strong>OkHttp</strong> to connect to Google Gemini for the AI tutor and quiz generator, and <strong>Material Design</strong> components for smooth, professional card layouts.
                  </p>
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-4">
              {STEP_BY_STEP_GUIDE.map((stepItem) => (
                <div
                  key={stepItem.step}
                  className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 sm:p-5 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                        {stepItem.step}
                      </span>
                      <h3 className="text-sm font-bold text-white">{stepItem.title}</h3>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-700">
                      ⏱ {stepItem.time}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 ml-8.5 mb-3">{stepItem.description}</p>

                  <ul className="ml-8.5 space-y-2 text-xs text-slate-300">
                    {stepItem.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Ready to Download CTA */}
            <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-800/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">Want the whole project pre-assembled?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Download the ZIP, extract it, and open directly in Android Studio.
                </p>
              </div>
              <button
                onClick={handleDownloadZip}
                disabled={isDownloading}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center space-x-2 shrink-0 shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>Download Android Project (.ZIP)</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: CODE EXPLORER */}
        {activeTab === 'code' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 animate-in fade-in">
            {/* File List Sidebar */}
            <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 block mb-2">
                Project Files
              </span>

              {ANDROID_FILES.map((file, idx) => (
                <button
                  key={file.filename}
                  onClick={() => setSelectedFileIdx(idx)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedFileIdx === idx
                      ? 'bg-slate-800 text-emerald-400 font-semibold border border-slate-700'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileCode2 className="w-4 h-4 shrink-0 text-slate-400" />
                    <span className="truncate">{file.filename}</span>
                  </div>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-xs bg-slate-800 text-slate-400 shrink-0 font-mono">
                    {file.language}
                  </span>
                </button>
              ))}
            </div>

            {/* Code Viewer Panel */}
            <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                <div className="truncate mr-2">
                  <span className="text-xs font-mono font-bold text-white block truncate">
                    {selectedFile.path}
                  </span>
                  <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                    {selectedFile.description}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-md border border-slate-700 flex items-center space-x-1.5 shrink-0 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code text container */}
              <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed bg-[#0B0F19] selection:bg-emerald-900">
                <pre>
                  <code>{selectedFile.code}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RECOMMENDED FREE TOOLS */}
        {activeTab === 'free_tools' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-white">100% Free Tools for College Student Developers</h2>
              <p className="text-xs text-slate-300 mt-1">
                You do not need paid servers, subscription cloud databases, or paid IDE licenses. Everything recommended below is either open source or provides a generous free tier for students.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FREE_TOOLS_RECOMMENDATION.map((tool, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-2 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {tool.badge}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">{tool.cost}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{tool.name}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{tool.description}</p>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Provider: {tool.provider}</span>
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-semibold"
                    >
                      <span>Visit Site</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
