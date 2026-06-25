import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';

interface Particle {
  id: number;
  size: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
  color: string;
}

export default function BackgroundParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate particles on client mount to avoid SSR mismatch issues
    const colors = [
      'rgba(99, 102, 241, 0.15)',  // Indigo
      'rgba(168, 85, 247, 0.15)',  // Purple
      'rgba(236, 72, 153, 0.15)',  // Pink
      'rgba(20, 184, 166, 0.15)',  // Teal
    ];

    const generated: Particle[] = Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      size: Math.random() * 20 + 8, // 8px to 28px
      left: Math.random() * 100, // percentage
      top: Math.random() * 100, // percentage
      duration: Math.random() * 25 + 20, // 20s to 45s
      delay: Math.random() * -30, // negative delay so they start animated
      color: colors[i % colors.length],
    }));

    setParticles(generated);

    // High performance mouse-follow light effect utilizing CSS variables
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        containerRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
        containerRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      style={{
        // Default cursor values if mouse hasn't moved yet
        ['--mouse-x' as any]: '50%',
        ['--mouse-y' as any]: '50%',
      }}
    >
      {/* Interactive spotlight follower (GPU Accelerated) */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none opacity-30 sm:opacity-40 transition-opacity duration-500 blur-[130px] hidden sm:block"
        style={{
          left: 'calc(var(--mouse-x) - 300px)',
          top: 'calc(var(--mouse-y) - 300px)',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(236, 72, 153, 0.1) 40%, transparent 70%)',
          willChange: 'left, top',
        }}
      />

      {/* Multilayered Aurora Animated Background Glows */}
      <div className="absolute top-[-15%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-transparent blur-[140px] animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-transparent blur-[140px] animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="absolute top-[35%] right-[15%] w-[45vw] h-[45vw] rounded-full bg-teal-500/5 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[20%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/5 blur-[130px] animate-pulse" style={{ animationDuration: '14s' }} />

      {/* Drifting glowing particle bubbles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: `${p.top}%`,
            backgroundColor: p.color,
            boxShadow: `0 0 12px ${p.color}`,
            opacity: 0.4,
          }}
          animate={{
            y: [-30, -180, -30],
            x: [0, 50, 0],
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
