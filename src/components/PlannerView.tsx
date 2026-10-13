import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckSquare, 
  Square, 
  Sparkles, 
  Flame, 
  Target, 
  Volume2, 
  VolumeX,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { StudyPlan, StudyPlanMilestone } from '../types';

export const PlannerView: React.FC = () => {
  // Timer State
  const [timerMode, setTimerMode] = useState<'study' | 'shortBreak' | 'longBreak'>('study');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 mins
  const [isRunning, setIsRunning] = useState(false);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'focus'>('none');

  // Study Plan Generator State
  const [examName, setExamName] = useState('Final Semester Exams');
  const [examDate, setExamDate] = useState('2026-10-25');
  const [availableHours, setAvailableHours] = useState(3);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [activePlan, setActivePlan] = useState<StudyPlan>({
    id: 'plan-default',
    examName: 'Midterm & Finals Prep',
    examDate: 'In 12 Days',
    availableHours: 3,
    strategyOverview: 'Spaced Repetition & High-Yield Active Recall Schedule designed to maximize retention with zero all-nighters.',
    recommendedPomodoroFormat: '4x 25-minute focus intervals with 5-minute cognitive resets.',
    milestones: [
      {
        dayOrWeek: 'Day 1 - 3',
        focusTopic: 'Core Concept Mapping & Weak Spot Diagnosis',
        tasks: [
          'Review textbook chapter summaries and identify 3 difficult topics',
          'Use AI Tutor to explain complex theorems in plain English',
          'Create formula and definition cheat sheets'
        ],
        completed: true,
        estimatedMinutes: 90
      },
      {
        dayOrWeek: 'Day 4 - 7',
        focusTopic: 'Active Retrieval & Practice Quizzing',
        tasks: [
          'Generate 5 practice quizzes and score above 80%',
          'Teach key concepts aloud to verify understanding (Feynman technique)',
          'Solve past paper problems under untimed conditions'
        ],
        completed: false,
        estimatedMinutes: 120
      },
      {
        dayOrWeek: 'Day 8 - 11',
        focusTopic: 'Timed Mock Exam & Spaced Review',
        tasks: [
          'Complete 1 full timed mock exam with no notes',
          'Review incorrect questions and review explanations',
          'Re-read high-yield bullet summaries from PDF summarizer'
        ],
        completed: false,
        estimatedMinutes: 120
      },
      {
        dayOrWeek: 'Day 12 (Exam Eve)',
        focusTopic: 'Low-Stress Final Consolidation',
        tasks: [
          'Light 30-minute review of summary notes',
          'Pack student ID, calculator, pens, and get 8 hours of sleep'
        ],
        completed: false,
        estimatedMinutes: 45
      }
    ],
    proStudyTips: [
      'Avoid passive re-reading; testing yourself builds 50% stronger recall.',
      'Sleep is when your brain physically cements neural connections. Protect it!'
    ]
  });

  // Audio Context Ref for Synthesizer Sound
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playDingSound();
      if (timerMode === 'study') {
        setTimerMode('shortBreak');
        setTimeLeft(5 * 60);
      } else {
        setTimerMode('study');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerMode]);

  // Play gentle synth chime when timer ends
  const playDingSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      // Audio not permitted yet
    }
  };

  const handleModeSwitch = (mode: 'study' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setTimerMode(mode);
    if (mode === 'study') setTimeLeft(25 * 60);
    if (mode === 'shortBreak') setTimeLeft(5 * 60);
    if (mode === 'longBreak') setTimeLeft(15 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTaskCompleted = (milestoneIdx: number, taskIdx: number) => {
    setActivePlan((prev) => {
      const copy = { ...prev };
      const milestone = { ...copy.milestones[milestoneIdx] };
      // toggle completed
      milestone.completed = !milestone.completed;
      copy.milestones[milestoneIdx] = milestone;
      return copy;
    });
  };

  const handleGenerateRoadmap = async () => {
    setIsLoadingPlan(true);
    try {
      const res = await fetch('/api/planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examName,
          examDate,
          availableHours,
          topics: ['Key Units', 'Formulas', 'Past Papers'],
        }),
      });

      const data = await res.json();
      if (data.milestones) {
        setActivePlan({
          id: String(Date.now()),
          examName,
          examDate,
          availableHours,
          strategyOverview: data.strategyOverview || 'High-performance study plan.',
          recommendedPomodoroFormat: data.recommendedPomodoroFormat || '25 min study / 5 min break',
          milestones: data.milestones,
          proStudyTips: data.proStudyTips || ['Study consistently every day.'],
        });
      }
    } catch (e) {
      console.log('Using default plan roadmap');
    } finally {
      setIsLoadingPlan(false);
    }
  };

  // Calculate days remaining to exam
  const calculateDaysLeft = () => {
    try {
      const target = new Date(examDate).getTime();
      const now = new Date().getTime();
      const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
      return isNaN(diffDays) || diffDays < 0 ? 7 : diffDays;
    } catch {
      return 7;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-20">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-4 rounded-b-2xl shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Study Planner & Focus</h2>
            <p className="text-xs text-amber-100">Exam countdown, daily milestones & Pomodoro timer</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Countdown Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 text-white shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-xs text-amber-100 font-semibold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-yellow-300" />
              <span>Target Milestone</span>
            </div>
            <h3 className="text-base font-bold mt-0.5">{examName}</h3>
            <p className="text-xs text-amber-100">Exam date: {examDate}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-xl p-2.5 text-center min-w-[70px] border border-white/20">
            <span className="text-2xl font-black block leading-none">{calculateDaysLeft()}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-100">Days Left</span>
          </div>
        </div>

        {/* Pomodoro Focus Timer Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs text-center space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Pomodoro Focus Timer</span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {timerMode === 'study' ? '🧠 Study Interval' : '☕ Rest Interval'}
            </span>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              onClick={() => handleModeSwitch('study')}
              className={`py-1.5 rounded-md font-semibold transition-all ${
                timerMode === 'study' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              25m Focus
            </button>
            <button
              onClick={() => handleModeSwitch('shortBreak')}
              className={`py-1.5 rounded-md font-semibold transition-all ${
                timerMode === 'shortBreak' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              5m Break
            </button>
            <button
              onClick={() => handleModeSwitch('longBreak')}
              className={`py-1.5 rounded-md font-semibold transition-all ${
                timerMode === 'longBreak' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              15m Long
            </button>
          </div>

          {/* Big Countdown Digits */}
          <div className="py-2">
            <span className="text-4xl font-mono font-black text-slate-800 tracking-wider">
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Controls */}
          <div className="flex space-x-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 shadow-2xs transition-colors ${
                isRunning
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Focus Session</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setIsRunning(false);
                handleModeSwitch(timerMode);
              }}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs"
              title="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AI Study Roadmap Generator Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
            <Target className="w-4 h-4 text-orange-600" />
            <span>Generate Custom AI Study Roadmap</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Exam / Course</label>
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g. Calculus II Midterm"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Exam Date</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateRoadmap}
            disabled={isLoadingPlan}
            className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow-2xs flex items-center justify-center space-x-1.5 transition-colors"
          >
            {isLoadingPlan ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Designing Study Schedule...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create Exam Roadmap</span>
              </>
            )}
          </button>
        </div>

        {/* Milestones Checklist */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            Strategic Study Milestones:
          </span>

          {activePlan.milestones.map((milestone, mIdx) => (
            <div
              key={mIdx}
              className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                  {milestone.dayOrWeek}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  ~{milestone.estimatedMinutes || 90} mins
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-800">{milestone.focusTopic}</h4>

              <div className="space-y-1.5 pt-1">
                {milestone.tasks.map((task, tIdx) => (
                  <div
                    key={tIdx}
                    onClick={() => toggleTaskCompleted(mIdx, tIdx)}
                    className="flex items-start space-x-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900 group"
                  >
                    <div className="mt-0.5 text-amber-600 shrink-0">
                      {milestone.completed ? (
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
                      )}
                    </div>
                    <span className={milestone.completed ? 'line-through text-slate-400' : ''}>
                      {task}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
