import React, { useState } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Trophy, 
  Clock, 
  ChevronRight,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Quiz, QuizQuestion, Note } from '../types';

interface QuizViewProps {
  initialTopic?: string;
  savedNotes: Note[];
}

export const QuizView: React.FC<QuizViewProps> = ({ initialTopic = '', savedNotes }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [selectedNoteId, setSelectedNoteId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: number]: number }>({});
  const [isFinished, setIsFinished] = useState(false);

  // Pre-built fallback quiz if offline/error
  const sampleQuizData: Quiz = {
    id: 'sample-1',
    title: 'Computer Science: Algorithms & Memory',
    topic: 'Data Structures & Algorithms',
    difficulty: 'Medium',
    dateCreated: 'Today',
    questions: [
      {
        id: 1,
        question: "What is the average time complexity of searching an element in a balanced Binary Search Tree (BST)?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctIndex: 1,
        explanation: "In a balanced BST, each comparison cuts the search space in half, resulting in O(log n) time complexity. O(1) is for hash tables, and O(n) is for unbalanced trees or linear search."
      },
      {
        id: 2,
        question: "Which data structure follows the Last-In, First-Out (LIFO) order?",
        options: ["Queue", "Stack", "Priority Queue", "Linked List"],
        correctIndex: 1,
        explanation: "A Stack operates on LIFO (Last-In First-Out) principle, just like a stack of plates. A Queue operates on FIFO (First-In First-Out)."
      },
      {
        id: 3,
        question: "In relational databases and SQLite, what does ACID stand for?",
        options: [
          "Atomicity, Consistency, Isolation, Durability",
          "Accuracy, Completeness, Integrity, Dependability",
          "Asynchronous, Concurrent, Indexed, Distributed",
          "Automated, Clustered, Integrated, Dynamic"
        ],
        correctIndex: 0,
        explanation: "ACID represents Atomicity (all or nothing), Consistency (valid state transitions), Isolation (independent transactions), and Durability (persisted once committed)."
      }
    ]
  };

  const handleGenerateQuiz = async () => {
    let sourceText = '';
    let finalTopic = topic;

    if (selectedNoteId) {
      const foundNote = savedNotes.find((n) => n.id === selectedNoteId);
      if (foundNote) {
        sourceText = foundNote.content;
        if (!finalTopic) finalTopic = foundNote.title;
      }
    }

    if (!finalTopic.trim()) {
      finalTopic = 'General College Biology & Computer Science';
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: finalTopic,
          numQuestions,
          difficulty,
          notesText: sourceText,
        }),
      });

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        startQuiz({
          id: String(Date.now()),
          title: data.title || `${finalTopic} Practice Quiz`,
          topic: data.topic || finalTopic,
          difficulty,
          questions: data.questions,
          dateCreated: 'Today',
        });
      } else {
        startQuiz(sampleQuizData);
      }
    } catch (err) {
      startQuiz(sampleQuizData);
    } finally {
      setIsLoading(false);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setUserAnswers({});
    setIsFinished(false);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !activeQuiz) return;

    const currentQ = activeQuiz.questions[currentIdx];
    const isCorrect = selectedOption === currentQ.correctIndex;

    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: selectedOption }));
    if (isCorrect) {
      setScore((s) => s + 1);
    }
    setIsAnswerSubmitted(true);
  };

  const handleNext = () => {
    if (!activeQuiz) return;
    if (currentIdx < activeQuiz.questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsFinished(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const currentQuestion: QuizQuestion | undefined = activeQuiz?.questions[currentIdx];

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto pb-20">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-b-2xl shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Practice Quiz Generator</h2>
            <p className="text-xs text-purple-100">AI-generated multiple choice questions with instant explanations</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Quiz Creator Form (when not active) */}
        {!activeQuiz ? (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">Quiz Topic or Exam Subject</label>
              <input
                type="text"
                placeholder="e.g. Organic Chemistry Reactions, Operating System Deadlocks..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />

              {/* Generate from saved notes */}
              {savedNotes.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Or base quiz directly on one of your saved notes:
                  </label>
                  <select
                    value={selectedNoteId}
                    onChange={(e) => setSelectedNoteId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden"
                  >
                    <option value="">-- Choose from My Notes (Optional) --</option>
                    {savedNotes.map((note) => (
                      <option key={note.id} value={note.id}>
                        [{note.subject}] {note.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Difficulty & Count Settings */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Difficulty</label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-[11px]">
                    {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficulty(diff)}
                        className={`py-1 rounded-md font-semibold transition-all ${
                          difficulty === diff
                            ? 'bg-white text-purple-700 shadow-2xs'
                            : 'text-slate-600'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Questions</label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-[11px]">
                    {[3, 5, 8].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNumQuestions(num)}
                        className={`py-1 rounded-md font-semibold transition-all ${
                          numQuestions === num
                            ? 'bg-white text-purple-700 shadow-2xs'
                            : 'text-slate-600'
                        }`}
                      >
                        {num} Qs
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateQuiz}
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow-xs flex items-center justify-center space-x-2 transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating Custom Exam Questions...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Practice Quiz</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Starter Quizzes */}
            <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-3.5 space-y-2">
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-purple-700" />
                Popular Student Practice Sets:
              </span>
              <div className="space-y-1.5">
                {[
                  "Computer Science: Algorithms & Memory",
                  "Human Anatomy & Organ Systems",
                  "Microeconomics: Market Equilibrium"
                ].map((name, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setTopic(name);
                      startQuiz(sampleQuizData);
                    }}
                    className="w-full text-left text-xs bg-white hover:bg-purple-50/80 p-2.5 rounded-lg border border-purple-200/60 text-slate-700 flex items-center justify-between transition-colors shadow-2xs"
                  >
                    <span>{name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-purple-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : isFinished ? (
          /* Finished Score Card */
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-4 shadow-sm animate-in zoom-in-95">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Quiz Completed</span>
              <h3 className="text-xl font-black text-slate-800 mt-1">
                {score === activeQuiz.questions.length
                  ? 'Perfect Score! 🌟'
                  : score >= activeQuiz.questions.length * 0.7
                  ? 'Great Job! 🚀'
                  : 'Keep Practicing! 💪'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                You scored <span className="font-bold text-purple-600 text-sm">{score}</span> out of{' '}
                <span className="font-bold text-slate-700">{activeQuiz.questions.length}</span> (
                {Math.round((score / activeQuiz.questions.length) * 100)}%)
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 text-left border border-slate-100">
              <p className="font-semibold text-slate-700 mb-1">💡 Memory Retention Fact:</p>
              <p>Self-quizzing with explanations builds strong synaptic connections, preventing exam anxiety and forgetting curves.</p>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => startQuiz(activeQuiz)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center justify-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Quiz</span>
              </button>
              <button
                onClick={() => setActiveQuiz(null)}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-2xs"
              >
                New Topic
              </button>
            </div>
          </div>
        ) : (
          /* Active Question Play */
          <div className="space-y-3">
            {/* Progress Header */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>
                Question {currentIdx + 1} of {activeQuiz.questions.length}
              </span>
              <div className="flex items-center space-x-1 text-purple-600 font-semibold">
                <span>Score: {score}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-300 rounded-full"
                style={{
                  width: `${((currentIdx + 1) / activeQuiz.questions.length) * 100}%`,
                }}
              />
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 leading-snug">
                {currentQuestion?.question}
              </h3>

              {/* Options */}
              <div className="space-y-2">
                {currentQuestion?.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.correctIndex;

                  let optionStyle =
                    'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-500';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'border-rose-500 bg-rose-50 text-rose-900 line-through';
                    } else {
                      optionStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                    }
                  } else if (isSelected) {
                    optionStyle = 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-600 font-semibold';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswerSubmitted}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${optionStyle}`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-5 h-5 rounded-md bg-white border border-slate-300 flex items-center justify-center font-bold text-[10px] text-slate-700 shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="leading-snug">{option}</span>
                      </div>

                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Card */}
              {isAnswerSubmitted && (
                <div className="p-3 bg-purple-50/80 rounded-lg border border-purple-200/80 text-xs space-y-1 animate-in fade-in">
                  <span className="font-bold text-purple-900 block">Explanation:</span>
                  <p className="text-slate-700 leading-relaxed">{currentQuestion?.explanation}</p>
                </div>
              )}

              {/* Bottom Buttons */}
              <div className="pt-2">
                {!isAnswerSubmitted ? (
                  <button
                    disabled={selectedOption === null}
                    onClick={handleSubmitAnswer}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-2xs flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <span>
                      {currentIdx < activeQuiz.questions.length - 1 ? 'Next Question' : 'View Final Score'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
