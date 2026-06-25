import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageCircle, Volume2, Bot, X } from 'lucide-react';
import { playHoverSound, playFlipSound } from '../utils/audio';

interface CompanionProps {
  text: string;
  emotion: 'neutral' | 'happy' | 'sad' | 'excited' | 'victory';
  isSpeaking: boolean;
  theme: 'dark' | 'light';
  onInteractiveClick: () => void;
  layoutMode?: 'inline' | 'fixed';
}

export default function Companion({
  text,
  emotion,
  isSpeaking,
  theme,
  onInteractiveClick,
  layoutMode = 'fixed',
}: CompanionProps) {
  const [wiggle, setWiggle] = useState(false);
  const [blink, setBlink] = useState(false);
  
  // Track responsiveness
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [showBubble, setShowBubble] = useState(false);
  const [mobileBubbleOpen, setMobileBubbleOpen] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;

  // Manage speech bubble visibility timer (auto-hide after 3 seconds)
  useEffect(() => {
    if (text) {
      setShowBubble(true);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => {
        setShowBubble(false);
      }, 3000);
    } else {
      setShowBubble(false);
    }
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [text]);

  // Random eye blinking interval
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  // Map emotions to colors and eye scales
  const getEmotionSettings = () => {
    switch (emotion) {
      case 'happy':
        return {
          glow: 'shadow-[0_0_25px_rgba(34,197,94,0.5)]',
          color: 'from-emerald-400 to-teal-500',
          eyeScaleY: 1,
          eyeRotate: 0,
          moodLabel: 'Happy',
        };
      case 'sad':
        return {
          glow: 'shadow-[0_0_25px_rgba(239,68,68,0.45)]',
          color: 'from-rose-400 to-pink-500',
          eyeScaleY: 0.45,
          eyeRotate: 15,
          moodLabel: 'Puzzled',
        };
      case 'excited':
        return {
          glow: 'shadow-[0_0_30px_rgba(249,115,22,0.65)]',
          color: 'from-amber-400 to-orange-500',
          eyeScaleY: 1.15,
          eyeRotate: -10,
          moodLabel: 'Pumped!',
        };
      case 'victory':
        return {
          glow: 'shadow-[0_0_35px_rgba(168,85,247,0.7)]',
          color: 'from-indigo-400 via-purple-500 to-pink-500',
          eyeScaleY: 1.25,
          eyeRotate: 0,
          moodLabel: 'Legendary',
        };
      case 'neutral':
      default:
        return {
          glow: 'shadow-[0_0_20px_rgba(99,102,241,0.4)]',
          color: 'from-indigo-400 to-purple-500',
          eyeScaleY: 0.9,
          eyeRotate: 0,
          moodLabel: 'Analyzing',
        };
    }
  };

  const currentEmotion = getEmotionSettings();

  const handleSelfClick = () => {
    setWiggle(true);
    setTimeout(() => setWiggle(false), 600);
    playFlipSound();
    onInteractiveClick();

    if (isMobile && layoutMode === 'fixed') {
      setMobileBubbleOpen(true);
      // Auto-hide mobile bubble after 3 seconds
      setTimeout(() => {
        setMobileBubbleOpen(false);
      }, 3000);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({ x: x / 10, y: -y / 10 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Decide visibility of the speech bubble
  const isBubbleVisible = isMobile && layoutMode === 'fixed' ? mobileBubbleOpen : showBubble;

  // Render Mobile Floating Circular Button
  if (isMobile && layoutMode === 'fixed') {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none select-none">
        {/* Speech Bubble */}
        <AnimatePresence>
          {isBubbleVisible && text && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 5 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className={`absolute bottom-[125%] right-0 w-[75vw] max-w-[250px] p-3.5 rounded-2xl border text-xs font-bold shadow-2xl backdrop-blur-md pointer-events-auto flex flex-col gap-1.5 ${
                theme === 'dark'
                  ? 'bg-slate-900/95 border-white/10 text-slate-100 shadow-[0_12px_30px_rgba(0,0,0,0.5)]'
                  : 'bg-white/95 border-slate-250 text-slate-800 shadow-[0_10px_25px_rgba(0,0,0,0.1)]'
              }`}
            >
              <div
                className={`absolute bottom-[-6px] right-6 w-3 h-3 rotate-45 border-r border-b ${
                  theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-250'
                }`}
              />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-mono tracking-widest text-[8px] uppercase text-indigo-500 font-black">
                  <MessageCircle className="w-2.5 h-2.5 text-pink-500 animate-pulse" />
                  🧠 Memory Buddy
                </span>
                <span className={`text-[8px] font-mono uppercase px-1 rounded-md font-bold ${
                  theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {currentEmotion.moodLabel}
                </span>
              </div>
              <p className="font-sans leading-relaxed tracking-wide text-[11px]">
                {text}
              </p>
              {isSpeaking && (
                <div className="flex items-center gap-0.5 mt-1 h-2">
                  <div className="w-0.5 h-full rounded-full bg-indigo-500 animate-[bounce_0.6s_infinite_alternate]" style={{ animationDelay: '0.1s' }} />
                  <div className="w-0.5 h-full rounded-full bg-purple-500 animate-[bounce_0.6s_infinite_alternate]" style={{ animationDelay: '0.2s' }} />
                  <div className="w-0.5 h-full rounded-full bg-pink-500 animate-[bounce_0.6s_infinite_alternate]" style={{ animationDelay: '0.3s' }} />
                  <span className="text-[8px] font-mono opacity-50 ml-1">Speaking...</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Small avatar container */}
        <motion.div
          animate={{
            y: isSpeaking ? [-2, 2, -2] : [-4, 4, -4],
            scale: isSpeaking ? [1, 1.05, 1] : 1,
          }}
          transition={{
            y: { repeat: Infinity, duration: isSpeaking ? 1.2 : 2, ease: 'easeInOut' },
            scale: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' },
          }}
          onClick={handleSelfClick}
          className="w-14 h-14 rounded-full p-[2.5px] bg-gradient-to-tr from-indigo-400 via-purple-500 to-pink-500 shadow-xl pointer-events-auto cursor-pointer flex items-center justify-center relative active:scale-90 transition-transform"
        >
          {/* Avatar Screen */}
          <div className="w-full h-full rounded-full bg-slate-950 border border-white/10 flex flex-col items-center justify-center overflow-hidden relative">
            <div className="absolute top-[-25%] left-[-15%] w-[130%] h-[130%] bg-gradient-to-br from-white/10 to-transparent rotate-12 pointer-events-none" />
            
            {/* Eyes */}
            <div className="flex gap-2 items-center justify-center relative z-20">
              <motion.div
                animate={{ scaleY: blink ? 0.05 : currentEmotion.eyeScaleY }}
                transition={{ scaleY: { duration: 0.1 } }}
                className="w-2.5 h-4 rounded-full bg-cyan-300 shadow-[0_0_6px_rgba(103,232,249,0.9)] flex items-center justify-center"
              >
                <div className="w-0.5 h-1.5 rounded-full bg-white opacity-80" />
              </motion.div>
              <motion.div
                animate={{ scaleY: blink ? 0.05 : currentEmotion.eyeScaleY }}
                transition={{ scaleY: { duration: 0.1 } }}
                className="w-2.5 h-4 rounded-full bg-cyan-300 shadow-[0_0_6px_rgba(103,232,249,0.9)] flex items-center justify-center"
              >
                <div className="w-0.5 h-1.5 rounded-full bg-white opacity-80" />
              </motion.div>
            </div>

            {/* Mouth */}
            <div className="relative mt-1.5 flex justify-center items-center h-2 w-8 z-20">
              {isSpeaking ? (
                <div className="w-3 h-1 bg-cyan-300 rounded-full animate-pulse shadow-[0_0_4px_rgba(103,232,249,0.85)]" />
              ) : emotion === 'happy' || emotion === 'victory' ? (
                <div className="w-4 h-2 border-b-2 border-cyan-300 rounded-b-full shadow-[0_1px_2px_rgba(103,232,249,0.5)]" />
              ) : emotion === 'sad' ? (
                <div className="w-4 h-1.5 border-t-2 border-cyan-300 rounded-t-full mt-1" />
              ) : (
                <div className="w-3.5 h-[1.5px] bg-cyan-300 rounded-full" />
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render Tablet/Inline Mode & Desktop Fixed Mode
  const isFixed = layoutMode === 'fixed';

  return (
    <div
      ref={containerRef}
      style={isFixed ? {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 50,
      } : undefined}
      className={`${
        isFixed 
          ? 'w-24 h-24 flex items-center justify-center select-none pointer-events-none'
          : 'relative w-full flex flex-col items-center select-none py-4 bg-slate-900/5 dark:bg-slate-900/20 rounded-3xl border border-dashed border-indigo-500/10'
      }`}
    >
      {/* Speech Bubble */}
      <AnimatePresence mode="wait">
        {isBubbleVisible && text && (
          <motion.div
            key={text}
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -10 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className={`p-4 rounded-2xl border text-xs leading-relaxed font-bold shadow-xl backdrop-blur-md flex flex-col gap-1.5 pointer-events-auto ${
              isFixed 
                ? 'absolute bottom-[115%] right-2 w-64 max-w-[250px]' 
                : 'absolute bottom-[105%] max-w-xs'
            } ${
              theme === 'dark'
                ? 'bg-slate-900/95 border-white/10 text-slate-100 shadow-[0_12px_30px_rgba(0,0,0,0.5)]'
                : 'bg-white/95 border-slate-250 text-slate-800 shadow-[0_10px_25px_rgba(0,0,0,0.08)]'
            }`}
          >
            {/* Tiny speech pointer indicator */}
            <div
              className={`absolute bottom-[-6px] w-3 h-3 rotate-45 border-r border-b ${
                isFixed ? 'right-8' : 'left-1/2 -translate-x-1/2'
              } ${
                theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-250'
              }`}
            />

            {/* Glowing Tag */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-mono tracking-widest text-[9px] uppercase text-indigo-500 font-extrabold">
                <MessageCircle className="w-3 h-3 text-pink-500 animate-pulse" />
                🧠 Memory Buddy
              </span>
              <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-md font-bold tracking-wider ${
                theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
              }`}>
                {currentEmotion.moodLabel}
              </span>
            </div>

            {/* Speaking Content */}
            <p className="font-sans leading-relaxed tracking-wide text-xs">
              {text}
            </p>

            {/* Micro Audio Waveform Anim when speaking */}
            {isSpeaking && (
              <div className="flex items-center gap-0.5 mt-1.5 h-3">
                <div className="w-0.5 h-full rounded-full bg-indigo-500 animate-[bounce_0.6s_infinite_alternate]" style={{ animationDelay: '0.1s' }} />
                <div className="w-0.5 h-full rounded-full bg-purple-500 animate-[bounce_0.6s_infinite_alternate]" style={{ animationDelay: '0.25s' }} />
                <div className="w-0.5 h-full rounded-full bg-pink-500 animate-[bounce_0.6s_infinite_alternate]" style={{ animationDelay: '0.4s' }} />
                <div className="w-0.5 h-full rounded-full bg-violet-500 animate-[bounce_0.6s_infinite_alternate]" style={{ animationDelay: '0.15s' }} />
                <span className="text-[9px] font-mono opacity-50 ml-1.5">Speaking...</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating 3D Robot Container */}
      <motion.div
        animate={{
          y: emotion === 'victory' 
            ? [-14, 10, -14, 10, -14] 
            : isSpeaking 
              ? [-4, 4, -4] 
              : [-6, 6, -6],
          rotate: wiggle 
            ? [0, -10, 15, -15, 10, 0] 
            : emotion === 'victory' 
              ? [-12, 12, -12, 12, -12] 
              : isSpeaking 
                ? [-1, 1, -1] 
                : [0, 0.5, -0.5, 0],
          scale: emotion === 'victory' 
            ? [1, 1.15, 0.9, 1.15, 1] 
            : isSpeaking 
              ? [1, 1.04, 1] 
              : 1,
          rotateX: tilt.y,
          rotateY: tilt.x,
        }}
        transition={{
          y: { repeat: Infinity, duration: emotion === 'victory' ? 0.6 : isSpeaking ? 1.5 : 2.5, ease: 'easeInOut' },
          rotate: wiggle ? { duration: 0.6 } : { repeat: Infinity, duration: emotion === 'victory' ? 0.6 : 4, ease: 'easeInOut' },
          scale: { repeat: Infinity, duration: emotion === 'victory' ? 0.6 : 1.2, ease: 'easeInOut' },
          rotateX: { duration: 0.1, ease: 'easeOut' },
          rotateY: { duration: 0.1, ease: 'easeOut' },
        }}
        onClick={handleSelfClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => playHoverSound()}
        className={`group relative w-24 h-24 flex items-center justify-center cursor-pointer pointer-events-auto`}
      >
        {/* Soft shadow below robot that responds to floating height */}
        <div className="absolute bottom-[-14px] w-12 h-2.5 bg-black/25 dark:bg-black/45 rounded-full blur-[4px] scale-x-75 animate-[pulse_2.5s_infinite_alternate]" />

        {/* Outer glass glow circle */}
        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${currentEmotion.glow} ${
          isSpeaking ? 'scale-110' : 'scale-100 group-hover:scale-105'
        }`} />

        {/* 3D Glassmorphic Body Chassis */}
        <div className={`relative w-full h-full rounded-full p-[3px] bg-gradient-to-tr ${currentEmotion.color} shadow-lg overflow-hidden flex items-center justify-center`}>
          {/* Inner dark screen face */}
          <div className="relative w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden border border-white/10">
            {/* Reflection glass shine overlay */}
            <div className="absolute top-[-30%] left-[-20%] w-[150%] h-[150%] bg-gradient-to-br from-white/20 via-white/0 to-transparent rotate-12 pointer-events-none z-10" />

            {/* Glowing Circuitry Lines (SVG Overlay) */}
            <div className="absolute inset-0 opacity-20 group-hover:opacity-35 transition-opacity pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="0.5" className="text-indigo-400 stroke-dasharray-[4_8]" />
                <path d="M50,10 L50,22 M50,78 L50,90 M10,50 L22,50 M78,50 L90,50" stroke="currentColor" strokeWidth="1" className="text-purple-400" />
              </svg>
            </div>

            {/* Pixar-inspired Big Digital LED Eyes (Vector Built) */}
            <div className="flex gap-4 items-center justify-center relative z-20 mt-[-4px]">
              {/* Left Eye */}
              <motion.div
                animate={{
                  scaleY: blink ? 0.05 : currentEmotion.eyeScaleY,
                  rotate: currentEmotion.eyeRotate,
                  y: isSpeaking ? [0, -1.5, 0] : 0,
                }}
                transition={{
                  scaleY: { duration: 0.12 },
                  y: { repeat: Infinity, duration: 0.3, ease: 'easeInOut' },
                }}
                className={`w-4 h-6 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)] flex items-center justify-center`}
              >
                {/* Dilated pupil pupil glow */}
                <div className="w-1.5 h-2.5 rounded-full bg-white opacity-80" />
              </motion.div>

              {/* Right Eye */}
              <motion.div
                animate={{
                  scaleY: blink ? 0.05 : currentEmotion.eyeScaleY,
                  rotate: -currentEmotion.eyeRotate,
                  y: isSpeaking ? [0, -1.5, 0] : 0,
                }}
                transition={{
                  scaleY: { duration: 0.12 },
                  y: { repeat: Infinity, duration: 0.3, ease: 'easeInOut' },
                }}
                className={`w-4 h-6 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)] flex items-center justify-center`}
              >
                {/* Dilated pupil pupil glow */}
                <div className="w-1.5 h-2.5 rounded-full bg-white opacity-80" />
              </motion.div>
            </div>

            {/* Glowing animated LED Mouth wave */}
            <div className="relative mt-2.5 flex justify-center items-center h-4 w-12 z-20">
              {isSpeaking ? (
                // Speaking: Pulsing dynamic audio-wave style line
                <motion.div
                  animate={{
                    height: [2, 6, 2, 8, 2],
                    width: [12, 16, 12, 18, 12],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.5,
                  }}
                  className="rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.85)]"
                />
              ) : emotion === 'happy' || emotion === 'victory' ? (
                // Smiling crescent line
                <div className="w-6 h-3.5 border-b-[2.5px] border-cyan-300 shadow-[0_2px_4px_rgba(103,232,249,0.5)] rounded-b-full" />
              ) : emotion === 'sad' ? (
                // Sad pout
                <div className="w-6 h-3 border-t-[2.5px] border-cyan-300 shadow-[0_-2px_4px_rgba(103,232,249,0.5)] rounded-t-full mt-2" />
              ) : (
                // Neutral: simple horizontal capsule line
                <div className="w-5 h-[2.5px] bg-cyan-300 shadow-[0_0_6px_rgba(103,232,249,0.85)] rounded-full" />
              )}
            </div>

            {/* Digital power indicator ring */}
            <div className="absolute bottom-2 font-mono text-[7px] tracking-widest text-indigo-400 font-extrabold opacity-60 flex items-center gap-0.5">
              <Bot className="w-2.5 h-2.5" />
              E-01
            </div>
          </div>
        </div>

        {/* Cute bouncy antenna vector elements at top of robot */}
        <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 flex gap-4 w-full justify-between px-6 pointer-events-none z-0">
          <motion.div
            animate={{ rotate: isSpeaking ? [-5, 5, -5] : [0, 2, -2, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1.5 h-4 bg-indigo-500 rounded-full origin-bottom rotate-[-12deg]"
          />
          <motion.div
            animate={{ rotate: isSpeaking ? [5, -5, 5] : [0, -2, 2, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1.5 h-4 bg-purple-500 rounded-full origin-bottom rotate-[12deg]"
          />
        </div>
      </motion.div>
    </div>
  );
}
