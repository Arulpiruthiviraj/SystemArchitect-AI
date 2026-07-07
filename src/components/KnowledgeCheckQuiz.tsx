import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, ArrowRight, RotateCcw, Award, CheckSquare, ChevronRight, BookOpen, ThumbsUp } from 'lucide-react';
import { getQuizForLesson, QuizQuestion } from '../data/lesson-quizzes';

interface KnowledgeCheckQuizProps {
  lessonId: string;
  lessonTitle: string;
  onComplete: (score: number, total: number) => void;
  onCancel: () => void;
}

export default function KnowledgeCheckQuiz({ lessonId, lessonTitle, onComplete, onCancel }: KnowledgeCheckQuizProps) {
  const questions = getQuizForLesson(lessonId);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answersState, setAnswersState] = useState<Array<{ questionIndex: number; selectedIndex: number; isCorrect: boolean }>>([]);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = questions[currentIdx];
  const isCorrect = selectedAnswer === currentQuestion?.answerIndex;

  const handleAnswerClick = (index: number) => {
    if (selectedAnswer !== null) return; // Allow single answer per question
    setSelectedAnswer(index);
    setAnswersState(prev => [
      ...prev,
      {
        questionIndex: currentIdx,
        selectedIndex: index,
        isCorrect: index === currentQuestion.answerIndex
      }
    ]);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setSelectedAnswer(null);
      setCurrentIdx(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setAnswersState([]);
    setQuizFinished(false);
  };

  const correctAnswersCount = answersState.filter(a => a.isCorrect).length;
  const scorePercent = Math.round((correctAnswersCount / questions.length) * 100);

  // Performance feedback based on score
  const getPerformanceFeedback = () => {
    if (scorePercent === 100) {
      return {
        title: "Perfect Score!",
        subtitle: "You have fully mastered these system architecture concepts.",
        badge: "Systems Architect Expert",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      };
    } else if (scorePercent >= 60) {
      return {
        title: "Well Done!",
        subtitle: "Strong understanding of the core concepts of this lesson.",
        badge: "Intermediate Architect",
        color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30"
      };
    } else {
      return {
        title: "Keep Learning!",
        subtitle: "A great attempt, but we recommend reviewing this topic again.",
        badge: "Systems Apprentice",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/30"
      };
    }
  };

  const feedback = getPerformanceFeedback();

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0A0B] overflow-y-auto custom-scrollbar">
      {/* Header Panel */}
      <div className="h-16 border-b border-[#1F1F22] bg-[#111113] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 bg-indigo-500/10 rounded border border-indigo-500/20 text-xs font-mono font-semibold text-indigo-400">
            KNOWLEDGE CHECK
          </div>
          <span className="text-sm font-medium text-gray-300 truncate max-w-xs md:max-w-md">
            {lessonTitle}
          </span>
        </div>
        <button 
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-1.5"
        >
          Back to Lesson
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl bg-[#111113] border border-[#1F1F22] rounded-2xl shadow-2xl overflow-hidden">
          
          <AnimatePresence mode="wait">
            {!quizFinished ? (
              <motion.div
                key="quiz-body"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="p-6 md:p-8 space-y-6"
              >
                {/* Progress Indicators */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                    <span>QUESTION {currentIdx + 1} OF {questions.length}</span>
                    <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}% COMPLETE</span>
                  </div>
                  <div className="h-2 bg-[#1A1A1D] rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Question */}
                <h2 className="text-lg md:text-xl font-semibold text-white leading-relaxed">
                  {currentQuestion.question}
                </h2>

                {/* Option list */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, i) => {
                    const isSelected = selectedAnswer === i;
                    const isCorrectOption = i === currentQuestion.answerIndex;
                    const hasAnswered = selectedAnswer !== null;

                    let optionStyle = "border-[#1F1F22] bg-[#0A0A0B] text-gray-300 hover:border-indigo-500/50 hover:bg-[#151518]";
                    if (hasAnswered) {
                      if (isCorrectOption) {
                        optionStyle = "border-emerald-500/50 bg-emerald-500/5 text-emerald-300 font-medium";
                      } else if (isSelected) {
                        optionStyle = "border-rose-500/50 bg-rose-500/5 text-rose-300";
                      } else {
                        optionStyle = "border-[#1F1F22] bg-[#0A0A0B] text-gray-500 opacity-60";
                      }
                    }

                    return (
                      <motion.button
                        key={i}
                        disabled={hasAnswered}
                        onClick={() => handleAnswerClick(i)}
                        whileHover={!hasAnswered ? { scale: 1.005 } : {}}
                        whileTap={!hasAnswered ? { scale: 0.995 } : {}}
                        className={`w-full text-left p-4 rounded-xl border text-sm md:text-base leading-relaxed transition-all flex items-start gap-3 ${optionStyle}`}
                      >
                        <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-mono text-xs shrink-0 mt-0.5 opacity-85">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{option}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanations block */}
                <AnimatePresence>
                  {selectedAnswer !== null && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden"
                    >
                      <div className={`p-5 rounded-xl border leading-relaxed space-y-2 mt-4 text-sm ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-200' : 'bg-rose-500/5 border-rose-500/20 text-rose-200'}`}>
                        <div className="flex items-center gap-2 font-semibold">
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              <span>Correct Choice!</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-5 h-5 text-rose-400" />
                              <span>Incorrect Choice</span>
                            </>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed font-normal">
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-[#1F1F22] flex justify-end">
                  <button
                    disabled={selectedAnswer === null}
                    onClick={handleNext}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg hover:shadow-indigo-500/20 flex items-center gap-2"
                  >
                    {currentIdx === questions.length - 1 ? "View Results" : "Next Question"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="quiz-results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="p-6 md:p-8 space-y-8"
              >
                {/* Result Hero Banner */}
                <div className="text-center space-y-4 py-4">
                  <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-400 mb-2">
                    <Award className="w-12 h-12" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                      {feedback.title}
                    </h2>
                    <p className="text-gray-400 text-sm max-w-md mx-auto">
                      {feedback.subtitle}
                    </p>
                  </div>
                  <div className="inline-block px-4 py-1.5 rounded-full text-xs font-mono font-semibold border uppercase tracking-wider mt-2 shadow-sm uppercase leading-none border-indigo-500/20 text-indigo-400 bg-indigo-500/10">
                    {feedback.badge}
                  </div>
                </div>

                {/* Score Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0A0A0B] border border-[#1F1F22] rounded-xl p-5 text-center">
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">SCORE</div>
                    <div className="text-3xl md:text-4xl font-extrabold text-white">
                      {correctAnswersCount} <span className="text-gray-500 font-medium text-lg">/ {questions.length}</span>
                    </div>
                  </div>
                  <div className="bg-[#0A0A0B] border border-[#1F1F22] rounded-xl p-5 text-center">
                    <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">ACCURACY</div>
                    <div className="text-3xl md:text-4xl font-extrabold text-white">
                      {scorePercent}%
                    </div>
                  </div>
                </div>

                {/* Quick study review details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-gray-400">Concept Review</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                    {questions.map((q, qidx) => {
                      const userState = answersState.find(a => a.questionIndex === qidx);
                      const isUserCorrect = userState?.isCorrect ?? false;

                      return (
                        <div key={qidx} className="bg-[#0A0A0B] border border-[#1F1F22] rounded-xl p-4 space-y-3 text-sm">
                          <div className="flex items-start justify-between gap-3">
                            <span className="font-semibold text-gray-200 pr-2">
                              {qidx + 1}. {q.question}
                            </span>
                            <span className={`shrink-0 text-xs font-mono font-bold px-2 py-0.5 rounded border uppercase leading-none ${isUserCorrect ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
                              {isUserCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 flex flex-col gap-1.5 border-t border-[#1F1F22] pt-2">
                            <div>
                              <span className="font-medium text-gray-300">Answer:</span> {q.options[q.answerIndex]}
                            </div>
                            <div className="text-gray-400 italic">
                              {q.explanation}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Final Control Block */}
                <div className="pt-6 border-t border-[#1F1F22] flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleRestart}
                    className="flex-1 py-3 bg-[#1A1A1D] hover:bg-[#27272A] text-white border border-[#1F1F22] rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <RotateCcw className="w-4 h-4" /> Retry Quiz
                  </button>
                  <button
                    onClick={() => onComplete(correctAnswersCount, questions.length)}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2 text-sm"
                  >
                    Complete Lesson <CheckCircle2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
