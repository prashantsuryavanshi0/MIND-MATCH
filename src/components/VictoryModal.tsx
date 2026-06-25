import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Clock, Timer, Target, Zap, RefreshCw, RotateCcw, Medal, Sparkles } from 'lucide-react';
import { DifficultyLevel } from '../types';

interface VictoryModalProps {
  isOpen: boolean;
  moves: number;
  time: number;
  accuracy: number;
  bestStreak: number;
  difficulty: DifficultyLevel;
  theme: 'dark' | 'light';
  playerName: string;
  onRestart: () => void;
  isNewBest: boolean;
}

// Custom hook using requestAnimationFrame for buttery smooth counting
function useAnimatedCount(targetValue: number, duration: number = 1000, isOpen: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCount(0);
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const progressRatio = Math.min(progress / duration, 1);
      
      // Smooth easeOutQuad progress
      const easedRatio = progressRatio * (2 - progressRatio);
      const currentValue = Math.round(easedRatio * targetValue);

      setCount(currentValue);

      if (progress < duration) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(targetValue);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetValue, duration, isOpen]);

  return count;
}

export default function VictoryModal({
  isOpen,
  moves,
  time,
  accuracy,
  bestStreak,
  difficulty,
  theme,
  playerName,
  onRestart,
  isNewBest,
}: VictoryModalProps) {
  const [confetti, setConfetti] = useState<{
    id: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    color: string;
    size: number;
    shape: 'circle' | 'square' | 'triangle';
    delay: number;
    duration: number;
  }[]>([]);

  // Animate the scores beautifully
  const animatedMoves = useAnimatedCount(moves, 1100, isOpen);
  const animatedTime = useAnimatedCount(time, 1300, isOpen);
  const animatedAccuracy = useAnimatedCount(accuracy, 1500, isOpen);
  const animatedStreak = useAnimatedCount(bestStreak, 1100, isOpen);

  useEffect(() => {
    if (isOpen) {
      // Generate highly vibrant colorful particles for full-screen impact
      const shapes: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];
      const colors = [
        '#6366f1', '#a855f7', '#ec4899', '#f43f5e', 
        '#10b981', '#14b8a6', '#06b6d4', '#eab308'
      ];
      const generated = Array.from({ length: 160 }).map((_, i) => {
        const isLeftLaunch = i % 3 === 0;
        const isRightLaunch = i % 3 === 1;
        
        let startX = 50; // percentage
        let startY = 60; // percentage (around the trophy)
        let endX = (Math.random() - 0.5) * 400; // offset in px
        let endY = -200 - Math.random() * 300; // shoot upwards

        if (isLeftLaunch) {
          startX = 5;
          startY = 95;
          endX = Math.random() * 300 + 100; // travel right
          endY = -400 - Math.random() * 300; // shoot high up
        } else if (isRightLaunch) {
          startX = 95;
          startY = 95;
          endX = -Math.random() * 300 - 100; // travel left
          endY = -400 - Math.random() * 300; // shoot high up
        }

        return {
          id: i,
          startX,
          startY,
          endX,
          endY,
          color: colors[i % colors.length],
          size: Math.random() * 11 + 6,
          shape: shapes[i % shapes.length],
          delay: Math.random() * 0.4,
          duration: Math.random() * 2.2 + 2.0,
        };
      });
      setConfetti(generated);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 py-16 md:py-24 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        {/* Full Screen Ambient Sparkles / Confetti Burst */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {confetti.map((c) => {
            const borderRadius = c.shape === 'circle' ? '50%' : c.shape === 'square' ? '4px' : '0%';
            return (
              <motion.div
                key={c.id}
                className="absolute"
                style={{
                  width: c.size,
                  height: c.shape === 'triangle' ? 0 : c.size,
                  backgroundColor: c.shape === 'triangle' ? 'transparent' : c.color,
                  borderLeft: c.shape === 'triangle' ? `${c.size / 2}px solid transparent` : undefined,
                  borderRight: c.shape === 'triangle' ? `${c.size / 2}px solid transparent` : undefined,
                  borderBottom: c.shape === 'triangle' ? `${c.size}px solid ${c.color}` : undefined,
                  borderRadius,
                  left: `${c.startX}%`,
                  top: `${c.startY}%`,
                  zIndex: 40,
                }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                animate={{
                  x: [0, c.endX * 0.7, c.endX],
                  y: [0, c.endY, c.endY + 600], // goes up and then down due to gravity
                  scale: [0, 1.2, 1, 0.5, 0],
                  opacity: [1, 1, 1, 0.8, 0],
                  rotate: [0, Math.random() * 360, Math.random() * 720 + 360],
                }}
                transition={{
                  duration: c.duration,
                  delay: c.delay,
                  ease: 'easeOut',
                }}
              />
            );
          })}
        </div>

        {/* Modal Window Container */}
        <motion.div
          initial={{ scale: 0.85, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.85, y: 30, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 20 }}
          className={`relative w-full max-w-xl rounded-3xl border p-6 md:p-8 mt-8 md:mt-0 shadow-[0_20px_50px_rgba(99,102,241,0.4)] backdrop-blur-lg z-10 ${
            theme === 'dark'
              ? 'bg-slate-900/95 border-white/5 text-slate-100'
              : 'bg-white/95 border-slate-200 text-slate-800'
          }`}
        >
          {/* Radiant Aura background glow inside modal - constrained to rounded corners to prevent overflow leakage */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[-30%] left-[-10%] w-[200px] h-[200px] bg-indigo-500/10 blur-[50px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[180px] h-[180px] bg-pink-500/10 blur-[50px] rounded-full" />
          </div>

          {/* Glowing Trophy Badge floating at top center */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center justify-center w-24 h-24 rounded-[28px] bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-xl shadow-indigo-500/40 border border-white/10 z-20">
            <Trophy className="w-12 h-12 text-white animate-bounce" />
          </div>

          <div className="text-center mt-12 mb-6 relative z-10">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono tracking-[0.25em] text-pink-500 font-bold uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Evaluation Matrix Cleared
            </div>
            <h2 className="font-display font-black text-3xl md:text-4xl tracking-tight bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent flex items-center justify-center gap-2">
              🏆 VICTORY
            </h2>
            <p className={`text-xs mt-2 font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Player: <span className="text-indigo-400 font-black">{playerName}</span> • Difficulty:{' '}
              <span className="text-pink-400 font-black">{difficulty}</span>
            </p>
          </div>

          {/* New Best Highscore Ribbon */}
          {isNewBest && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: [1, 1.05, 1], opacity: 1 }}
              transition={{ repeat: Infinity, duration: 2.2 }}
              className="flex items-center justify-center gap-2 py-1.5 px-5 mb-6 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 text-xs font-black w-fit mx-auto shadow-inner shadow-amber-500/5"
            >
              <Medal className="w-4 h-4 text-amber-400 fill-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              NEW LEADERBOARD RECORD LOCKED!
            </motion.div>
          )}

          {/* Stats Bar Bento Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-8">
            
            {/* Moves card */}
            <div
              className={`p-4 rounded-2xl border text-center relative overflow-hidden transition-all duration-300 ${
                theme === 'dark' ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50 border-slate-100 shadow-inner'
              }`}
            >
              <div className="flex justify-center mb-1.5 text-indigo-500">
                <RefreshCw className="w-4.5 h-4.5" />
              </div>
              <span className={`block text-[10px] font-extrabold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                Moves
              </span>
              <span className="font-display font-black text-2xl tracking-tight text-indigo-400">
                {animatedMoves}
              </span>
            </div>

            {/* Time Taken card */}
            <div
              className={`p-4 rounded-2xl border text-center relative overflow-hidden transition-all duration-300 ${
                theme === 'dark' ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50 border-slate-100 shadow-inner'
              }`}
            >
              <div className="flex justify-center mb-1.5 text-pink-500">
                <Timer className="w-4.5 h-4.5" />
              </div>
              <span className={`block text-[10px] font-extrabold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                Time
              </span>
              <span className="font-mono font-black text-2xl tracking-tight text-pink-400">
                {animatedTime}s
              </span>
            </div>

            {/* Accuracy card */}
            <div
              className={`p-4 rounded-2xl border text-center relative overflow-hidden transition-all duration-300 ${
                theme === 'dark' ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50 border-slate-100 shadow-inner'
              }`}
            >
              <div className="flex justify-center mb-1.5 text-emerald-500">
                <Target className="w-4.5 h-4.5" />
              </div>
              <span className={`block text-[10px] font-extrabold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                Accuracy
              </span>
              <span className="font-mono font-black text-2xl tracking-tight text-emerald-400">
                {animatedAccuracy}%
              </span>
            </div>

            {/* Best Streak card */}
            <div
              className={`p-4 rounded-2xl border text-center relative overflow-hidden transition-all duration-300 ${
                theme === 'dark' ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50 border-slate-100 shadow-inner'
              }`}
            >
              <div className="flex justify-center mb-1.5 text-orange-500">
                <Zap className="w-4.5 h-4.5" />
              </div>
              <span className={`block text-[10px] font-extrabold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                Best Streak
              </span>
              <span className="font-mono font-black text-2xl tracking-tight text-orange-400">
                {animatedStreak}
              </span>
            </div>

          </div>

          {/* High Score Saved Success Alert Info */}
          <div
            className={`p-4 rounded-2xl text-xs font-semibold leading-relaxed border text-center mb-6 ${
              theme === 'dark'
                ? 'bg-slate-950/30 border-white/5 text-slate-400'
                : 'bg-slate-50 border-slate-150 text-slate-600'
            }`}
          >
            Your record is secured in the matrix database. Open the leaderboard sidebar to trace your standings.
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 border-t border-slate-500/10 pt-6">
            <button
              onClick={onRestart}
              className={`flex-1 py-3 px-5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 border transition-all duration-300 shadow-lg active:scale-95 cursor-pointer ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-none shadow-indigo-600/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-indigo-600/15'
              }`}
            >
              <RotateCcw className="w-4.5 h-4.5 animate-spin" style={{ animationDuration: '8s' }} />
              Play Next Matrix
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
