import { useState, useRef, useEffect, MouseEvent } from 'react';
import { motion } from 'motion/react';
import { Card, DifficultyLevel } from '../types';

interface CardGridProps {
  cards: Card[];
  onCardClick: (cardId: string) => void;
  difficulty: DifficultyLevel;
  theme: 'dark' | 'light';
}

export default function CardGrid({ cards, onCardClick, difficulty, theme }: CardGridProps) {
  // Grid columns based on difficulty
  const gridLayouts = {
    easy: 'grid-cols-3 md:grid-cols-4 gap-4 max-w-md md:max-w-2xl',
    medium: 'grid-cols-4 gap-4 max-w-md md:max-w-2xl',
    hard: 'grid-cols-4 md:grid-cols-6 gap-3.5 max-w-md md:max-w-4xl',
  };

  // Animation variants for container (staggered entry)
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const cardItemVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.8 },
    show: { 
      y: 0, 
      opacity: 1, 
      scale: 1, 
      transition: { type: 'spring', stiffness: 180, damping: 18 } 
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      key={`${difficulty}-${cards.map((c) => c.id).join('_')}`} // re-run staggered animation on reset
      className={`grid mx-auto w-full px-2 ${gridLayouts[difficulty]}`}
    >
      {cards.map((card) => (
        <motion.div key={card.id} variants={cardItemVariants}>
          <InteractiveCard
            card={card}
            onCardClick={onCardClick}
            theme={theme}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

/* Individual Interactive Card with 3D Tilt Vector Tracking */
interface InteractiveCardProps {
  card: Card;
  onCardClick: (cardId: string) => void;
  theme: 'dark' | 'light';
}

function InteractiveCard({ card, onCardClick, theme }: InteractiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const isFlipped = card.isFlipped || card.isMatched;

  // Track cursor coordinates relative to card center for 3D perspective tilt
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || card.isMatched || card.isFlipped) return;

    const el = cardRef.current;
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Mouse coordinates relative to card element
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Percentage coordinates (-0.5 to 0.5)
    const px = (mouseX / width) - 0.5;
    const py = (mouseY / height) - 0.5;

    // Rotation bounds (max 18 degrees tilt)
    const rotateX = -py * 24;
    const rotateY = px * 24;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => !card.isMatched && !card.isFlipped && onCardClick(card.id)}
      className={`relative aspect-square w-full select-none cursor-pointer perspective-1000 active:scale-95 transition-transform duration-150 ${
        card.hasFailed ? 'shake-animation' : ''
      } ${card.isMatched ? 'success-pulse' : ''}`}
      style={{
        // Inject dynamic rotational styles and dynamic card shadow movement based on tilt state
        transform: isHovered && !isFlipped ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.05)` : 'scale(1)',
        boxShadow: isHovered && !isFlipped 
          ? `${-tilt.y * 0.75}px ${tilt.x * 0.75}px 22px rgba(99, 102, 241, 0.25)` 
          : 'none',
        transition: isHovered ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease',
      }}
    >
      {/* 3D Flip Inner Card */}
      <div
        className={`relative w-full h-full duration-600 preserve-3d transition-transform ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT FACE (Displays Emoji Symbol) */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center text-4xl sm:text-5xl shadow-xl border backface-hidden rotate-y-180 rounded-2xl transition-all duration-300 ${
            card.isMatched
              ? theme === 'dark'
                ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.25)] text-emerald-400'
                : 'bg-emerald-50/90 border-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)] text-emerald-600'
              : theme === 'dark'
                ? 'bg-slate-900/90 border-indigo-500/30 text-white backdrop-blur-md'
                : 'bg-white border-indigo-100 text-slate-800 shadow-md'
          }`}
        >
          {/* Neon matched glow circle */}
          {card.isMatched && (
            <div className="absolute inset-1 rounded-xl border border-dashed border-emerald-400/30 animate-pulse pointer-events-none" />
          )}

          {/* Sparkly reflection overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 rounded-2xl pointer-events-none" />

          <span className="relative z-10 filter drop-shadow-md transform transition-transform duration-300">
            {card.symbol}
          </span>
        </div>

        {/* BACK FACE (Mystery Side) */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center border backface-hidden rounded-2xl transition-all duration-300 ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-slate-900/95 border-indigo-500/40 hover:border-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] text-indigo-400'
              : 'bg-gradient-to-br from-slate-50 via-white to-slate-100 border-slate-200 hover:border-indigo-400/70 hover:shadow-lg text-slate-400 hover:text-indigo-500 shadow-sm'
          }`}
        >
          {/* Glassmorphic border pattern */}
          <div className="absolute inset-2 rounded-xl border border-dashed border-indigo-500/10 pointer-events-none" />

          {/* Intricate digital tech center pattern */}
          <div className="relative flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-indigo-500/5 transition-transform duration-300 hover:scale-110">
            <span className="font-display font-bold text-xl sm:text-2xl tracking-tighter opacity-80 select-none">
              ?
            </span>
            <div className="absolute inset-0 rounded-full border border-indigo-500/10 animate-ping opacity-20" style={{ animationDuration: '3s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
