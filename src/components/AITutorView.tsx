import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  BookmarkPlus, 
  BrainCircuit, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  CheckCircle2, 
  Lightbulb, 
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { Note } from '../types';

interface AITutorViewProps {
  onSaveToNotes: (note: Omit<Note, 'id' | 'date'>) => void;
  onJumpToQuiz: (topic: string) => void;
}

export const AITutorView: React.FC<AITutorViewProps> = ({ onSaveToNotes, onJumpToQuiz }) => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [mode, setMode] = useState<'eli5' | 'simple_student' | 'exam_master'>('simple_student');
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const sampleTopics = [
    { name: "Dijkstra's Shortest Path", subject: "Computer Science" },
    { name: "Cellular Respiration & ATP", subject: "Biology" },
    { name: "Gradient Descent in Machine Learning", subject: "Mathematics" },
    { name: "Supply & Demand Elasticity", subject: "Economics" },
    { name: "Schrodinger's Cat & Superposition", subject: "Physics" },
    { name: "Cognitive Dissonance", subject: "Psychology" },
  ];

  const handleAskTutor = async (customTopic?: string) => {
    const topicToQuery = customTopic || topic;
    if (!topicToQuery.trim()) return;

    setIsLoading(true);
    setExplanation(null);
    setSavedSuccess(false);

    try {
      const response = await fetch('/api/tutor/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToQuery,
          subject,
          mode,
          question: `Explain ${topicToQuery} clearly for a college student in ${subject}.`,
        }),
      });

      const data = await response.json();
      if (data.explanation) {
        setExplanation(data.explanation);
      } else {
        setExplanation(data.fallback || "Could not retrieve explanation. Try rephrasing your topic.");
      }
    } catch (err) {
      setExplanation(
        `### ${topicToQuery} - Simple Breakdown\n\n**The Big Idea:** Think of this concept like everyday problem-solving in college life.\n\n1. **Core Definition:** It is a structured mechanism to solve complex challenges step-by-step.\n2. **Why it Matters:** Allows systems to optimize resources without wasted time or energy.\n3. **Quick Example:** Like using GPS to find the fastest route to your lecture hall avoiding campus construction.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (explanation) {
      const utterance = new SpeechSynthesisUtterance(explanation.replace(/[#*`_]/g, ''));
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleSaveCurrentExplanation = () => {
    if (!explanation) return;
    onSaveToNotes({
      title: `AI Tutor: ${topic || 'Key Concept'}`,
      content: explanation,
      subject: subject,
      tags: ['AI Tutor', mode, 'Exam Prep'],
      color: '#3B82F6',
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-b-2xl shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">AI Simple Tutor</h2>
            <p className="text-xs text-blue-100">Difficult college concepts explained in plain English</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Explanation Mode Selector */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Explanation Style
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setMode('eli5')}
              className={`py-1.5 px-2 text-xs font-medium rounded-md transition-all ${
                mode === 'eli5'
                  ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🐣 ELI5 (Beginner)
            </button>
            <button
              onClick={() => setMode('simple_student')}
              className={`py-1.5 px-2 text-xs font-medium rounded-md transition-all ${
                mode === 'simple_student'
                  ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🎓 Clear Student
            </button>
            <button
              onClick={() => setMode('exam_master')}
              className={`py-1.5 px-2 text-xs font-medium rounded-md transition-all ${
                mode === 'exam_master'
                  ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🎯 Exam Master
            </button>
          </div>
        </div>

        {/* Topic Input Box */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">What do you want explained?</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="text-xs bg-slate-100 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-hidden"
            >
              <option>Computer Science</option>
              <option>Biology & Medicine</option>
              <option>Mathematics & Calc</option>
              <option>Physics & Chem</option>
              <option>Economics & Finance</option>
              <option>Psychology</option>
              <option>General College</option>
            </select>
          </div>

          <div className="relative">
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. How does Dijkstra's algorithm work? Or paste a confusing homework question..."
              rows={3}
              className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none text-slate-800"
            />
          </div>

          <button
            onClick={() => handleAskTutor()}
            disabled={isLoading || !topic.trim()}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-lg flex items-center justify-center space-x-2 shadow-2xs transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Smart Study Buddy is thinking...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Explain in Simple Language</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Sample Questions */}
        {!explanation && (
          <div>
            <span className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Try a popular college topic:
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {sampleTopics.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTopic(item.name);
                    setSubject(item.subject);
                    handleAskTutor(item.name);
                  }}
                  className="text-xs bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 py-1.5 px-2.5 rounded-full transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Explanation Output */}
        {explanation && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden animate-in fade-in duration-200">
            <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-700">Tutor Explanation</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleSpeak}
                  title={isSpeaking ? 'Stop voice' : 'Listen with voice'}
                  className="p-1.5 hover:bg-slate-200 rounded-md text-slate-600 transition-colors"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleAskTutor()}
                  title="Regenerate"
                  className="p-1.5 hover:bg-slate-200 rounded-md text-slate-600 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 text-sm text-slate-800 leading-relaxed whitespace-pre-line font-sans select-text">
              {explanation}
            </div>

            {/* Quick Action Footer */}
            <div className="bg-slate-50 p-3 border-t border-slate-200 flex flex-wrap gap-2">
              <button
                onClick={handleSaveCurrentExplanation}
                disabled={savedSuccess}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-colors ${
                  savedSuccess
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                }`}
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved to Notes!</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>Save to My Notes</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onJumpToQuiz(topic)}
                className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 shadow-2xs transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Generate Quiz on This</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
