import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Trash2, Award, Calendar, Clock, Sparkles, Star } from 'lucide-react';
import { LeaderboardData, DifficultyLevel } from '../types';

interface LeaderboardProps {
  leaderboard: LeaderboardData;
  onResetLeaderboard: () => void;
  theme: 'dark' | 'light';
  currentPlayerName?: string;
  difficulty: DifficultyLevel;
}

export default function Leaderboard({ leaderboard, onResetLeaderboard, theme, currentPlayerName, difficulty }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<DifficultyLevel>(difficulty);

  useEffect(() => {
    setActiveTab(difficulty);
  }, [difficulty]);

  const tabs: { key: DifficultyLevel; label: string }[] = [
    { key: 'easy', label: 'Easy (6 Pairs)' },
    { key: 'medium', label: 'Medium (8 Pairs)' },
    { key: 'hard', label: 'Hard (12 Pairs)' },
  ];

  const currentRecords = leaderboard[activeTab] || [];

  return (
    <div
      id="leaderboard-section"
      className={`rounded-3xl border p-5 md:p-6 shadow-2xl transition-all duration-300 backdrop-blur-md relative overflow-hidden ${
        theme === 'dark'
          ? 'bg-slate-900/60 border-white/5 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.3)]'
          : 'bg-white/80 border-slate-200/80 text-slate-800 shadow-xl shadow-slate-200/50'
      }`}
    >
      {/* Decorative vector matrix header line */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/10">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-display font-black text-xl tracking-tight">Leaderboard</h2>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Top 10 neural performers
            </p>
          </div>
        </div>

        {/* Reset Leaderboard Button */}
        {currentRecords.length > 0 && (
          <button
            onClick={onResetLeaderboard}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold font-sans transition-all duration-300 active:scale-95 cursor-pointer ${
              theme === 'dark'
                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-100'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Data
          </button>
        )}
      </div>

      {/* Difficulty Level Tabs */}
      <div className="flex p-1 rounded-2xl bg-slate-500/10 mb-5 w-full">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative flex-1 py-2.5 text-xs font-black rounded-xl transition-all duration-300 cursor-pointer ${
              activeTab === tab.key
                ? theme === 'dark'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-indigo-600 text-white shadow-md'
                : theme === 'dark'
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table / List */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-2 min-h-[260px] max-h-[460px] overflow-y-auto pr-1"
          >
            {currentRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 rounded-3xl bg-slate-500/5 mb-3 border border-slate-500/10">
                  <Award className="w-8 h-8 opacity-40 text-slate-400" />
                </div>
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Matrix database empty.
                </p>
                <p className="text-[11px] text-indigo-400 mt-1 font-bold tracking-wider uppercase">
                  Achieve victory to claim status!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentRecords.map((record, index) => {
                  const isTop3 = index < 3;
                  const medalStyles = [
                    'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)] font-black', // Gold
                    'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 text-slate-950 border-slate-100 shadow-[0_0_12px_rgba(203,213,225,0.3)] font-black',  // Silver
                    'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-white border-amber-600 shadow-[0_0_12px_rgba(180,83,9,0.3)] font-black',   // Bronze
                  ];

                  const isCurrentPlayerRecord = currentPlayerName && record.name.toLowerCase() === currentPlayerName.toLowerCase();

                  return (
                    <div
                      key={record.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                        isCurrentPlayerRecord
                          ? theme === 'dark'
                            ? 'bg-indigo-950/40 border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                            : 'bg-indigo-50 border-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.1)]'
                          : theme === 'dark'
                            ? 'bg-slate-900/30 border-white/5 hover:bg-slate-800/30'
                            : 'bg-slate-50/50 border-slate-100 hover:bg-slate-100/50 shadow-sm'
                      }`}
                    >
                      {/* Highlight bar for current player */}
                      {isCurrentPlayerRecord && (
                        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-indigo-500" />
                      )}

                      <div className="flex items-center gap-3">
                        {/* Position Badge with premium ranking gradients */}
                        {isTop3 ? (
                          <div
                            className={`flex items-center justify-center w-7 h-7 rounded-full text-[12px] border shadow-sm ${medalStyles[index]}`}
                          >
                            {index + 1}
                          </div>
                        ) : (
                          <div
                            className={`flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-mono font-bold border ${
                              theme === 'dark'
                                ? 'bg-slate-800/80 border-slate-700 text-slate-400'
                                : 'bg-slate-200/80 border-slate-300/50 text-slate-600'
                            }`}
                          >
                            {index + 1}
                          </div>
                        )}

                        <div>
                          <span className={`font-sans font-bold text-sm tracking-tight flex items-center gap-1.5 ${
                            isCurrentPlayerRecord ? 'text-indigo-500' : ''
                          }`}>
                            {record.name}
                            {index === 0 && <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                          </span>
                          <span
                            className={`flex items-center gap-1 text-[9px] font-mono mt-0.5 ${
                              theme === 'dark' ? 'text-slate-400/80' : 'text-slate-500'
                            }`}
                          >
                            <Calendar className="w-2.5 h-2.5" />
                            {record.date}
                          </span>
                        </div>
                      </div>

                      {/* Advanced Metrics Grid inside each list row */}
                      <div className="flex items-center gap-3 sm:gap-4 text-right">
                        <div>
                          <span
                            className={`block text-[8px] uppercase tracking-wider font-bold ${
                              theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                            }`}
                          >
                            Moves
                          </span>
                          <span className="font-mono text-[13px] font-bold text-indigo-500">
                            {record.moves}
                          </span>
                        </div>

                        <div>
                          <span
                            className={`block text-[8px] uppercase tracking-wider font-bold ${
                              theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                            }`}
                          >
                            Acc
                          </span>
                          <span className="font-mono text-[13px] font-bold text-emerald-500">
                            {record.accuracy}%
                          </span>
                        </div>

                        <div className="min-w-[50px]">
                          <span
                            className={`block text-[8px] uppercase tracking-wider font-bold ${
                              theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
                            }`}
                          >
                            Time
                          </span>
                          <span className="font-mono text-[13px] font-bold flex items-center justify-end gap-0.5 text-pink-500">
                            <Clock className="w-3 h-3 text-pink-400" />
                            {record.time}s
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
