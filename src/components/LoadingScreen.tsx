import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing matrix...');

  useEffect(() => {
    const statuses = [
      'Synchronizing neural transmitters...',
      'Shuffling card multidimensional vectors...',
      'Constructing spatial gameboard dimensions...',
      'Calibrating audio visual synthesizer...',
      'Readying matrix... enjoy!'
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 800);
          return 100;
        }
        
        // Dynamic increments for realistic loading
        const step = Math.floor(Math.random() * 15) + 5;
        const next = Math.min(prev + step, 100);

        // Update status text based on progress thresholds
        const index = Math.min(Math.floor((next / 101) * statuses.length), statuses.length - 1);
        setStatusText(statuses[index]);

        return next;
      });
    }, 180);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden select-none">
      {/* Background ambient glowing spheres */}
      <div className="absolute top-[20%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/10 blur-[100px] animate-pulse" />
      <div className="absolute bottom-[20%] right-[30%] w-[35vw] h-[35vw] rounded-full bg-pink-500/10 blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center px-6 max-w-md w-full text-center"
      >
        {/* Pulsing Cybernetic Logo Icon */}
        <div className="relative mb-8">
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              boxShadow: [
                '0 0 20px rgba(99, 102, 241, 0.2)',
                '0 0 40px rgba(99, 102, 241, 0.6)',
                '0 0 20px rgba(99, 102, 241, 0.2)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white relative z-10 border border-white/10"
          >
            <Brain className="w-12 h-12" />
          </motion.div>
          <div className="absolute inset-[-6px] rounded-[30px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-30 blur-md animate-pulse" />
        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
            MIND MATCH
          </h1>
          <div className="flex items-center justify-center gap-1 text-[10px] font-mono tracking-[0.2em] uppercase text-indigo-400/80 mb-8">
            <Sparkles className="w-3 h-3 text-pink-400 animate-spin" style={{ animationDuration: '6s' }} />
            NEURAL RECOGNITION MATRIX
          </div>
        </motion.div>

        {/* Progress Bar Container */}
        <div className="w-full relative px-6">
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.2 }}
            />
          </div>
          
          {/* Progress Percentage */}
          <div className="mt-4 flex items-center justify-between text-[11px] font-mono font-medium">
            <AnimatePresence mode="wait">
              <motion.span
                key={statusText}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 0.6, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="text-slate-400 max-w-[240px] truncate text-left"
              >
                {statusText}
              </motion.span>
            </AnimatePresence>
            <span className="text-indigo-400 font-bold">{progress}%</span>
          </div>
        </div>

        {/* Brand Signoff */}
        <div className="absolute bottom-[-160px] text-[10px] font-mono opacity-25 tracking-widest uppercase">
          Awwwards Series Edition 2026
        </div>
      </motion.div>
    </div>
  );
}
