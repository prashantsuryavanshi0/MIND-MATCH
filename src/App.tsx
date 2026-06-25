import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  RotateCcw,
  Clock,
  Zap,
  Award,
  Trophy,
  Play,
  HelpCircle,
  Sparkles,
  Percent,
  Flame,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Sliders,
  Mic
} from 'lucide-react';

import { Card, DifficultyLevel, LeaderboardData, GameRecord } from './types';
import CardGrid from './components/CardGrid';
import Leaderboard from './components/Leaderboard';
import VictoryModal from './components/VictoryModal';
import BackgroundParticles from './components/BackgroundParticles';
import LoadingScreen from './components/LoadingScreen';
import ConfirmationDialog from './components/ConfirmationDialog';
import Companion from './components/Companion';
import {
  playFlipSound,
  playMatchSound,
  playWrongSound,
  playVictorySound,
  playTrophySound,
  playComboSound,
  playHoverSound,
  playBoingSound,
  playOopsSound,
  playFailSound,
  playSparkleSound,
  playChimeSound,
  playBellSound,
  playTrophyCelebrationSound,
  playFireworksSound,
  playCrowdCheerSound,
  speakVoice,
  cancelSpeech,
  getMuteState,
  setMuteState,
  getEffectsEnabled,
  setEffectsEnabled,
  getVoiceEnabled,
  setVoiceEnabled,
  getGlobalVolume,
  setGlobalVolume,
} from './utils/audio';

// Emojis for matching cards (easy: 6 pairs, medium: 8 pairs, hard: 12 pairs)
const EMOJIS = ['🚀', '🎮', '🎯', '🎨', '🎵', '⚡', '🔥', '🌟', '🔮', '🍕', '🛸', '💎'];

export default function App() {
  // Application Phase States
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  // Player Profile Information
  const [playerInput, setPlayerInput] = useState('');
  const [playerName, setPlayerName] = useState('Operator');

  // Theme & Mute preferences
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMuted, setIsMuted] = useState(false);

  // Difficulty & Card State
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [isBoardLocked, setIsBoardLocked] = useState(false);

  // Advanced Game Statistics
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // High Scores & Leaderboard
  const [bestScores, setBestScores] = useState<Record<DifficultyLevel, { moves: number; time: number; accuracy: number } | null>>({
    easy: null,
    medium: null,
    hard: null,
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardData>({
    easy: [],
    medium: [],
    hard: [],
  });
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);

  // Sound and Voice Settings States
  const [isEffectsEnabled, setIsEffectsEnabledState] = useState(true);
  const [isVoiceEnabled, setIsVoiceEnabledState] = useState(true);
  const [globalVolume, setGlobalVolumeState] = useState(0.6);
  const [wrongMatchCount, setWrongMatchCount] = useState(0);

  // Animated Pixar Companion States & Phrase Databases
  const [companionText, setCompanionText] = useState('Hello there! Ready for some matching fun? Let\'s do this! 🚀');
  const [companionEmotion, setCompanionEmotion] = useState<'neutral' | 'happy' | 'sad' | 'excited' | 'victory'>('neutral');
  const [isCompanionSpeaking, setIsCompanionSpeaking] = useState(false);

  // Phrase tracker to ensure "Never repeat the same phrase twice in a row."
  const lastCompanionPhraseRef = useRef<string>('');

  const getNonRepeatingPhrase = (phrases: string[]): string => {
    if (phrases.length === 0) return '';
    if (phrases.length === 1) return phrases[0];
    let chosen = phrases[Math.floor(Math.random() * phrases.length)];
    let attempts = 0;
    while (chosen === lastCompanionPhraseRef.current && attempts < 15) {
      chosen = phrases[Math.floor(Math.random() * phrases.length)];
      attempts++;
    }
    lastCompanionPhraseRef.current = chosen;
    return chosen;
  };

  const wrongPhrasesByMistake = [
    '😢 "Aww nooo!"',
    '🥺 "Oopsie... let\'s try again!"',
    '🤔 "Hmm... not that one!"',
    '😅 "So close!"',
    '💪 "You can do this!"',
  ];

  const endlessWrongPhrases = [
    '"Never give up!"',
    '"Keep going!"',
    '"Believe in yourself!"',
    '"I\'m with you!"',
    '"Let\'s find the match!"',
  ];

  const matchPhrases = [
    '😊 "Nice!"',
    '🤩 "Excellent!"',
    '🎉 "Amazing!"',
    '✨ "Perfect!"',
    '🔥 "Awesome!"',
    '🏆 "Brilliant!"',
  ];

  const victoryPhrases = [
    '🥳 "Congratulations!"',
    '🏆 "You did it!"',
    '👑 "Champion!"',
    '🎉 "Memory Matrix Complete!"',
  ];

  const companionInteractiveLines = [
    'My digital whiskers are tingling with brain energy! ⚡',
    "Let's get that new record! I believe in you! 🌟",
    'Combos power up my core! Can you get three in a row? 🚀',
    'Analyzing grid coordinates... Yes! There is a match somewhere! 🔮',
    'Hooray! You are doing awesome! 🎉',
  ];

  const triggerCompanionSpeech = (text: string, emotion: 'neutral' | 'happy' | 'sad' | 'excited' | 'victory' = 'neutral') => {
    cancelSpeech();
    setCompanionText(text);
    setCompanionEmotion(emotion);
    setIsCompanionSpeaking(true);

    // Dynamic duration fallback based on word count to stop speech mouth animation nicely
    const estimatedDuration = text.length * 68 + 1200;
    let timerId = setTimeout(() => {
      setIsCompanionSpeaking(false);
    }, estimatedDuration);

    speakVoice(
      text,
      () => {
        setIsCompanionSpeaking(true);
      },
      () => {
        clearTimeout(timerId);
        setIsCompanionSpeaking(false);
      }
    );
  };

  const handleCompanionInteractiveClick = () => {
    const line = getNonRepeatingPhrase(companionInteractiveLines);
    triggerCompanionSpeech(line, 'happy');
  };

  // Custom Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Load: Read player name, theme, mute, best scores, and leaderboard from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Player name
      const savedPlayer = localStorage.getItem('memory_game_player_name');
      if (savedPlayer) {
        setPlayerName(savedPlayer);
        setPlayerInput(savedPlayer);
        setIsRegistered(true);
      }

      // Theme
      const savedTheme = localStorage.getItem('memory_game_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      }

      // Mute state
      setIsMuted(getMuteState());

      // Effects, Voice, Volume settings
      setIsEffectsEnabledState(getEffectsEnabled());
      setIsVoiceEnabledState(getVoiceEnabled());
      setGlobalVolumeState(getGlobalVolume());

      // Leaderboard
      const savedLeaderboard = localStorage.getItem('memory_game_leaderboard');
      if (savedLeaderboard) {
        try {
          setLeaderboard(JSON.parse(savedLeaderboard));
        } catch (e) {
          console.error('Error parsing leaderboard data', e);
        }
      }

      // Best Scores
      const savedBestScores = localStorage.getItem('memory_game_best_scores');
      if (savedBestScores) {
        try {
          setBestScores(JSON.parse(savedBestScores));
        } catch (e) {
          console.error('Error parsing best scores', e);
        }
      }
    }
  }, []);

  // 2. Initialize / Reset Game whenever difficulty changes or registration is completed
  useEffect(() => {
    if (isRegistered) {
      initGame();
    }
    return () => stopTimer();
  }, [difficulty, isRegistered]);

  // 3. Real-time Timer Tick
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [isTimerRunning]);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Helper: Shuffle an array using Fisher-Yates
  const shuffleCards = (array: string[]): Card[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.map((symbol, index) => ({
      id: `${symbol}-${index}-${Math.random()}`,
      symbol,
      isFlipped: false,
      isMatched: false,
      hasFailed: false,
    }));
  };

  const initGame = () => {
    stopTimer();
    setElapsedTime(0);
    setIsTimerRunning(false);
    setMoves(0);
    setMatches(0);
    setCurrentStreak(0);
    setBestStreak(0);
    setIsWon(false);
    setHasStarted(false);
    setSelectedCards([]);
    setIsBoardLocked(false);
    setIsNewPersonalBest(false);
    setWrongMatchCount(0);

    // Get emojis based on difficulty level
    let pairCount = 8; // default medium
    if (difficulty === 'easy') pairCount = 6;
    if (difficulty === 'hard') pairCount = 12;

    const gameSymbols = EMOJIS.slice(0, pairCount);
    const duplicatedSymbols = [...gameSymbols, ...gameSymbols];
    setCards(shuffleCards(duplicatedSymbols));

    // Voice assistant greeting on game initialize
    cancelSpeech();
    setTimeout(() => {
      triggerCompanionSpeech("Good luck! Let's match them all! 🚀", 'neutral');
    }, 150);
  };

  // Handle Card Click
  const handleCardClick = (cardId: string) => {
    if (isBoardLocked || isWon) return;

    // Start timer on first card click
    if (!hasStarted) {
      setHasStarted(true);
      setIsTimerRunning(true);
    }

    const clickedCard = cards.find((c) => c.id === cardId);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    // Flip the card and play sound
    playFlipSound();
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );

    const updatedSelected = [...selectedCards, cardId];
    setSelectedCards(updatedSelected);

    // If we have flipped 2 cards, check for a match
    if (updatedSelected.length === 2) {
      setIsBoardLocked(true);
      setMoves((prev) => prev + 1);

      const [id1, id2] = updatedSelected;
      const card1 = cards.find((c) => c.id === id1)!;
      const card2 = cards.find((c) => c.id === id2)!;

      if (card1.symbol === card2.symbol) {
        // MATCH SUCCESS
        setTimeout(() => {
          playMatchSound();
          
          // Compute matching update
          setCards((prev) =>
            prev.map((c) =>
              c.id === id1 || c.id === id2 ? { ...c, isMatched: true, isFlipped: false } : c
            )
          );
          
          // Streak updating logic
          const nextStreak = currentStreak + 1;
          setCurrentStreak(nextStreak);
          if (nextStreak > bestStreak) {
            setBestStreak(nextStreak);
          }

          setMatches((prev) => prev + 1);
          setSelectedCards([]);
          setIsBoardLocked(false);

          // Check Win Condition
          const allMatched = cards.every((c) =>
            c.id === id1 || c.id === id2 ? true : c.isMatched
          );
          
          if (allMatched) {
            handleWin();
          } else {
            // Speak combo or general praise only if not won, to avoid overlap
            if (nextStreak === 2) {
              triggerCompanionSpeech('😎 "Combo!"', 'excited');
              playComboSound(2);
            } else if (nextStreak === 3) {
              triggerCompanionSpeech('🚀 "Awesome Streak!"', 'excited');
              playComboSound(3);
            } else if (nextStreak === 4) {
              triggerCompanionSpeech('🔥 "You\'re on fire!"', 'excited');
              playComboSound(4);
            } else if (nextStreak === 5) {
              triggerCompanionSpeech('👑 "Memory Master!"', 'victory');
              playComboSound(5);
            } else if (nextStreak >= 6) {
              triggerCompanionSpeech('👑 "Memory Master!"', 'victory');
              playComboSound(6);
            } else {
              // General match: Sparkle, Magic chime, Success bell
              const soundIndex = Math.floor(Math.random() * 3);
              if (soundIndex === 0) playSparkleSound();
              else if (soundIndex === 1) playChimeSound();
              else playBellSound();

              const phrase = getNonRepeatingPhrase(matchPhrases);
              triggerCompanionSpeech(phrase, 'happy');
            }
          }
        }, 300);
      } else {
        // MATCH FAIL: Trigger shake and reset streaks, then flip back
        const nextWrongMatchCount = wrongMatchCount + 1;
        setWrongMatchCount(nextWrongMatchCount);

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === id1 || c.id === id2 ? { ...c, hasFailed: true } : c
            )
          );

          // Custom cute sounds based on mistake step
          if (nextWrongMatchCount === 1) {
            playBoingSound();
            triggerCompanionSpeech(wrongPhrasesByMistake[0], 'sad');
          } else if (nextWrongMatchCount === 2) {
            playOopsSound();
            triggerCompanionSpeech(wrongPhrasesByMistake[1], 'sad');
          } else if (nextWrongMatchCount === 3) {
            playFailSound();
            triggerCompanionSpeech(wrongPhrasesByMistake[2], 'sad');
          } else if (nextWrongMatchCount === 4) {
            playBoingSound();
            triggerCompanionSpeech(wrongPhrasesByMistake[3], 'sad');
          } else if (nextWrongMatchCount === 5) {
            playOopsSound();
            triggerCompanionSpeech(wrongPhrasesByMistake[4], 'sad');
          } else {
            const soundIndex = Math.floor(Math.random() * 3);
            if (soundIndex === 0) playBoingSound();
            else if (soundIndex === 1) playOopsSound();
            else playFailSound();

            const phrase = getNonRepeatingPhrase(endlessWrongPhrases);
            triggerCompanionSpeech(phrase, 'sad');
          }

          setCurrentStreak(0); // broken combo!
        }, 300);

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === id1 || c.id === id2
                ? { ...c, isFlipped: false, hasFailed: false }
                : c
            )
          );
          setSelectedCards([]);
          setIsBoardLocked(false);
        }, 1100);
      }
    }
  };

  // Real-time calculated accuracy percentage
  const liveAccuracy = moves === 0 ? 100 : Math.round((matches / moves) * 100);

  // Handle game win
  const handleWin = () => {
    setIsTimerRunning(false);
    setIsWon(true);
    
    // Play the grand procedural victory sounds sequence!
    playTrophyCelebrationSound();
    setTimeout(() => {
      playFireworksSound();
    }, 400);
    setTimeout(() => {
      playCrowdCheerSound();
    }, 1000);

    // Accuracy computation
    const finalAccuracy = liveAccuracy;

    // Check for Personal Best
    const currentBest = bestScores[difficulty];
    let isNewBest = false;

    if (!currentBest) {
      isNewBest = true;
    } else if (moves < currentBest.moves) {
      isNewBest = true;
    } else if (moves === currentBest.moves && elapsedTime < currentBest.time) {
      isNewBest = true;
    }

    if (isNewBest) {
      setIsNewPersonalBest(true);
      const updatedBests = {
        ...bestScores,
        [difficulty]: { moves: moves, time: elapsedTime, accuracy: finalAccuracy },
      };
      setBestScores(updatedBests);
      localStorage.setItem('memory_game_best_scores', JSON.stringify(updatedBests));
      
      // Additional golden reward sparkle!
      setTimeout(() => {
        playSparkleSound();
      }, 1500);
    }

    // Voice rule on game win
    setTimeout(() => {
      cancelSpeech();
      const randomCongrats = getNonRepeatingPhrase(victoryPhrases);
      const announcement = `${randomCongrats} Final Time: ${elapsedTime} seconds. Total moves: ${moves}. Accuracy: ${finalAccuracy} percent. Best streak: ${bestStreak} matches.`;
      triggerCompanionSpeech(announcement, 'victory');
    }, 400);

    // Auto append to leaderboard records with top 10 rankings!
    setTimeout(() => {
      saveLeaderboardRecordDirectly(playerName, moves, elapsedTime, finalAccuracy, bestStreak);
    }, 600);
  };

  // Auto-save leaderboard record once won
  const saveLeaderboardRecordDirectly = (
    name: string,
    finalMoves: number,
    finalTime: number,
    finalAccuracy: number,
    maxStreak: number
  ) => {
    const newRecord: GameRecord = {
      id: `${Date.now()}-${Math.random()}`,
      name: name.trim() || 'Operator',
      moves: finalMoves,
      time: finalTime,
      accuracy: finalAccuracy,
      bestStreak: maxStreak,
      difficulty,
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    setLeaderboard((prevLeaderboard) => {
      const updatedDifficultyRecords = [...(prevLeaderboard[difficulty] || []), newRecord]
        // Sort primarily by moves (fewer is better), secondarily by time (less is better), thirdly by higher accuracy
        .sort((a, b) => {
          if (a.moves !== b.moves) return a.moves - b.moves;
          if (a.time !== b.time) return a.time - b.time;
          return b.accuracy - a.accuracy;
        })
        // Keep Top 10 scores!
        .slice(0, 10);

      const updatedLeaderboard = {
        ...prevLeaderboard,
        [difficulty]: updatedDifficultyRecords,
      };

      localStorage.setItem('memory_game_leaderboard', JSON.stringify(updatedLeaderboard));
      return updatedLeaderboard;
    });
  };

  // Reset highscores
  const resetLeaderboard = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset High Scores?',
      message: 'Are you sure you want to erase the high scores? This action cannot be undone and will clear the local matrix database.',
      confirmText: 'Erase All',
      onConfirm: () => {
        const cleared: LeaderboardData = { easy: [], medium: [], hard: [] };
        setLeaderboard(cleared);
        localStorage.setItem('memory_game_leaderboard', JSON.stringify(cleared));

        const clearedBest = { easy: null, medium: null, hard: null };
        setBestScores(clearedBest);
        localStorage.removeItem('memory_game_best_scores');
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Onboarding registration submit
  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    const finalName = playerInput.trim() || 'Operator';
    setPlayerName(finalName);
    localStorage.setItem('memory_game_player_name', finalName);
    playMatchSound();
    setIsRegistered(true);
  };

  // Logout / profile change options
  const handleLogout = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Change Operator?',
      message: 'Erase current game session and change your operator identity profile?',
      confirmText: 'Change Identity',
      onConfirm: () => {
        stopTimer();
        localStorage.removeItem('memory_game_player_name');
        setIsRegistered(false);
        setPlayerInput('');
        setPlayerName('Operator');
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Theme & Sound triggers
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('memory_game_theme', nextTheme);
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    setMuteState(nextMute);
  };

  const handleToggleEffects = () => {
    const nextVal = !isEffectsEnabled;
    setIsEffectsEnabledState(nextVal);
    setEffectsEnabled(nextVal);
    if (nextVal) {
      setTimeout(() => playFlipSound(), 50);
    }
  };

  const handleToggleVoice = () => {
    const nextVal = !isVoiceEnabled;
    setIsVoiceEnabledState(nextVal);
    setVoiceEnabled(nextVal);
    if (nextVal) {
      setTimeout(() => speakVoice('Voice active.'), 50);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setGlobalVolumeState(newVol);
    setGlobalVolume(newVol);
  };

  // Transition out of Loading Screen
  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div
        className={`min-h-screen relative overflow-x-hidden font-sans transition-colors duration-500 pb-36 sm:pb-24 z-10 ${
          theme === 'dark'
            ? 'bg-slate-950 text-slate-100 selection:bg-indigo-500/30'
            : 'bg-slate-50 text-slate-800 selection:bg-indigo-500/10'
        }`}
      >
        {/* Glowing Interactive Starfield Background */}
        <BackgroundParticles />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 sm:pr-32">
          
          {/* HERO HEADER */}
          <header className="flex items-center justify-between py-4 sm:py-6 mb-4 border-b border-slate-500/10 gap-2">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-1.5 sm:gap-3 shrink min-w-0"
            >
              <div className="p-2 sm:p-3 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 text-indigo-500 border border-indigo-500/10 shadow-inner shrink-0">
                <Brain className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-display font-black text-base sm:text-2xl tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent truncate">
                    MIND MATCH
                  </h1>
                </div>
                <p className={`text-[8px] sm:text-[9px] font-mono tracking-[0.1em] sm:tracking-[0.18em] uppercase truncate ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Neural Memory Matrix
                </p>
              </div>
            </motion.div>

            {/* Utility Toggles */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-1 sm:gap-2 shrink-0"
            >
              {isRegistered && (
                <div className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-2xl border border-dashed border-indigo-500/20 bg-indigo-500/5 text-[10px] sm:text-xs font-semibold mr-0.5 sm:mr-1 max-w-[120px] sm:max-w-none shrink-0">
                  <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400 shrink-0" />
                  <span className={`truncate ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span className="hidden sm:inline opacity-75">Operator: </span>
                    <span className="text-indigo-400 font-bold truncate inline-block align-middle max-w-[45px] sm:max-w-none" title={playerName}>
                      {playerName}
                    </span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-0.5 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                    title="Change operator name"
                  >
                    <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              )}

              {/* Sound Toggle */}
              <button
                onClick={toggleMute}
                onMouseEnter={() => playHoverSound()}
                className={`p-2.5 rounded-2xl border transition-all duration-300 active:scale-95 cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-900/60 hover:bg-slate-800 border-white/5 text-slate-300 hover:text-indigo-400'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-indigo-600 shadow-sm'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                onMouseEnter={() => playHoverSound()}
                className={`p-2.5 rounded-2xl border transition-all duration-300 active:scale-95 cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-900/60 hover:bg-slate-800 border-white/5 text-slate-300 hover:text-indigo-400'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-indigo-600 shadow-sm'
                }`}
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </motion.div>
          </header>

          <AnimatePresence mode="wait">
            {!isRegistered ? (
              /* ONBOARDING REGISTRATION SCREEN BEFORE GAME */
              <motion.div
                key="onboarding"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-xl mx-auto mt-10"
              >
                <div
                  className={`rounded-3xl border p-6 md:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden ${
                    theme === 'dark'
                      ? 'bg-slate-900/60 border-white/5 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.4)]'
                      : 'bg-white/95 border-slate-200 text-slate-800 shadow-xl'
                  }`}
                >
                  {/* Glowing header bar */}
                  <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                  <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4 border border-indigo-500/15">
                      <Brain className="w-9 h-9 animate-pulse" />
                    </div>
                    <h2 className="font-display font-black text-2xl md:text-3xl tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      ACCESS PROTOCOL
                    </h2>
                    <p className={`text-xs mt-1.5 font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Register operator credentials to initialize matrix
                    </p>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-6">
                    {/* Input name */}
                    <div>
                      <label
                        htmlFor="operator-name"
                        className={`block text-[11px] font-black uppercase tracking-wider mb-2.5 ${
                          theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        Operator Identity Nickname:
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-slate-400">
                          <User className="w-5 h-5 text-indigo-500" />
                        </span>
                        <input
                          id="operator-name"
                          type="text"
                          required
                          placeholder="E.g., Neo, Trinity, Alpha..."
                          value={playerInput}
                          onChange={(e) => setPlayerInput(e.target.value.slice(0, 15))}
                          maxLength={15}
                          className={`w-full py-3.5 pl-12 pr-4 rounded-2xl text-sm font-bold border outline-none transition-all duration-300 ${
                            theme === 'dark'
                              ? 'bg-slate-950/80 border-white/5 focus:border-indigo-500 text-white placeholder-slate-600 focus:shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                              : 'bg-slate-50 border-slate-200 focus:border-indigo-500 text-slate-800 placeholder-slate-400 focus:bg-white focus:shadow-md'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Choose Starting Difficulty */}
                    <div>
                      <label
                        className={`block text-[11px] font-black uppercase tracking-wider mb-2.5 ${
                          theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        Choose Starting Grid Dimensions:
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {([
                          { key: 'easy', pairs: 6, label: 'Easy', size: '12 cards' },
                          { key: 'medium', pairs: 8, label: 'Medium', size: '16 cards' },
                          { key: 'hard', pairs: 12, label: 'Hard', size: '24 cards' },
                        ].map((d) => (
                          <button
                            key={d.key}
                            type="button"
                            onClick={() => setDifficulty(d.key as DifficultyLevel)}
                            onMouseEnter={() => playHoverSound()}
                            className={`p-3.5 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
                              difficulty === d.key
                                ? theme === 'dark'
                                  ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                  : 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                                : theme === 'dark'
                                  ? 'bg-slate-950/40 border-white/5 hover:bg-slate-900/30 text-slate-400 hover:text-slate-200'
                                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            <span className="font-display font-black text-xs sm:text-sm capitalize">
                              {d.label}
                            </span>
                            <span className="text-[10px] font-mono opacity-60 mt-1">
                              {d.size}
                            </span>
                          </button>
                        )))}
                      </div>
                    </div>

                    {/* Submit Register */}
                    <button
                      type="submit"
                      onMouseEnter={() => playHoverSound()}
                      className="w-full py-4 px-6 rounded-2xl font-black text-xs sm:text-sm tracking-widest uppercase text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-400 active:scale-98 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                    >
                      <ShieldCheck className="w-5 h-5 animate-pulse" />
                      Initialize Mind Matrix
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </form>
                </div>
              </motion.div>
            ) : (
              /* ACTIVE GAME SCREEN */
              <motion.div
                key="game-matrix"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6"
              >
                {/* LEFT COLUMN: Controls & Game Board */}
                <main className="lg:col-span-8 flex flex-col gap-6">
                  
                  {/* BENTO STATS BAR */}
                  <motion.div
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className={`grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-3xl border backdrop-blur-md companion-avoid ${
                      theme === 'dark'
                        ? 'bg-slate-900/40 border-white/5 shadow-xl'
                        : 'bg-white/70 border-slate-200 shadow-sm'
                    }`}
                  >
                    {/* Moves Stat */}
                    <div className="flex flex-col items-center justify-center py-1 sm:border-r border-slate-500/10">
                      <div className="flex items-center gap-1.5 text-indigo-500 mb-0.5">
                        <Zap className="w-4 h-4 animate-bounce" />
                        <span className="text-[9px] uppercase font-bold tracking-wider">Moves</span>
                      </div>
                      <span className="font-display font-black text-xl sm:text-2xl leading-none">
                        {moves}
                      </span>
                    </div>

                    {/* Timer Stat */}
                    <div className="flex flex-col items-center justify-center py-1 border-r sm:border-r border-slate-500/10">
                      <div className="flex items-center gap-1.5 text-pink-500 mb-0.5">
                        <Clock className="w-4 h-4 animate-pulse" />
                        <span className="text-[9px] uppercase font-bold tracking-wider">Timer</span>
                      </div>
                      <span className="font-mono font-black text-xl sm:text-2xl leading-none">
                        {elapsedTime}s
                      </span>
                    </div>

                    {/* Accuracy Stat */}
                    <div className="flex flex-col items-center justify-center py-1 border-r border-slate-500/10">
                      <div className="flex items-center gap-1.5 text-emerald-500 mb-0.5">
                        <Percent className="w-4 h-4" />
                        <span className="text-[9px] uppercase font-bold tracking-wider">Accuracy</span>
                      </div>
                      <span className="font-mono font-black text-xl sm:text-2xl leading-none text-emerald-500">
                        {liveAccuracy}%
                      </span>
                    </div>

                    {/* Combo Streak Stat */}
                    <div className="flex flex-col items-center justify-center py-1 sm:border-r border-slate-500/10">
                      <div className="flex items-center gap-1.5 text-orange-500 mb-0.5">
                        <Flame className="w-4 h-4 animate-bounce" style={{ animationDuration: '1.2s' }} />
                        <span className="text-[9px] uppercase font-bold tracking-wider">Streak</span>
                      </div>
                      <span className="font-display font-black text-xl sm:text-2xl leading-none text-orange-500">
                        {currentStreak}{' '}
                        <span className="text-[9px] font-sans opacity-50 uppercase font-semibold">
                          Max {bestStreak}
                        </span>
                      </span>
                    </div>

                    {/* Best Score Stat */}
                    <div className="flex flex-col items-center justify-center py-1 col-span-2 sm:col-span-1">
                      <div className="flex items-center gap-1.5 text-amber-500 mb-0.5">
                        <Award className="w-4 h-4" />
                        <span className="text-[9px] uppercase font-bold tracking-wider">Best Score</span>
                      </div>
                      <span className="font-sans font-bold text-xs leading-none text-center">
                        {bestScores[difficulty] ? (
                          <span className="font-mono text-xs text-amber-500 font-bold">
                            {bestScores[difficulty]?.moves}m / {bestScores[difficulty]?.time}s
                          </span>
                        ) : (
                          <span className="opacity-40 font-semibold italic text-xs">None</span>
                        )}
                      </span>
                    </div>
                  </motion.div>

                  {/* CONTROLS BAR: Difficulty & Reset */}
                  <motion.div
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 companion-avoid"
                  >
                    {/* Difficulty Selector */}
                    <div className="flex p-1 rounded-2xl bg-slate-500/10 max-w-sm sm:w-auto flex-1">
                      {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => (
                        <button
                          key={level}
                          onClick={() => setDifficulty(level)}
                          onMouseEnter={() => playHoverSound()}
                          className={`flex-1 py-2.5 px-3.5 text-xs font-black rounded-xl capitalize transition-all duration-300 cursor-pointer ${
                            difficulty === level
                              ? theme === 'dark'
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                : 'bg-indigo-500 text-white shadow-md'
                              : theme === 'dark'
                                ? 'text-slate-400 hover:text-slate-200'
                                : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>

                    {/* Reset Game Button */}
                    <button
                      onClick={initGame}
                      onMouseEnter={() => playHoverSound()}
                      className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 border shadow-md active:scale-95 cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-indigo-600/15'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-indigo-600 hover:text-indigo-700'
                      }`}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Restart Game
                    </button>
                  </motion.div>

                  {/* GAME BOARD CONTAINER */}
                  <div className="relative py-4 min-h-[380px] flex flex-col items-center justify-center companion-avoid">
                    {/* Visual guideline when game hasn't started ticking */}
                    {!hasStarted && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-500 pointer-events-none mb-4"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                        Flip any card to start the timer
                      </motion.div>
                    )}

                    <CardGrid
                      cards={cards}
                      onCardClick={handleCardClick}
                      difficulty={difficulty}
                      theme={theme}
                    />
                  </div>

                </main>

                {/* RIGHT COLUMN: Leaderboard & Hints */}
                <aside className="lg:col-span-4 flex flex-col gap-6">
                  
                  {/* Leaderboard panel wrapped in companion-avoid */}
                  <div className="companion-avoid">
                    <Leaderboard
                      leaderboard={leaderboard}
                      onResetLeaderboard={resetLeaderboard}
                      theme={theme}
                      currentPlayerName={playerName}
                      difficulty={difficulty}
                    />
                  </div>



                  {/* Audio & Neural Settings Panel with companion-avoid */}
                  <div
                    className={`p-5 rounded-3xl border backdrop-blur-md transition-all duration-300 companion-avoid ${
                      theme === 'dark'
                        ? 'bg-slate-900/45 border-white/5 text-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.2)]'
                        : 'bg-white border-slate-200 text-slate-800 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Sliders className="w-4.5 h-4.5 text-indigo-500" />
                      <span className={`text-xs font-extrabold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                        Audio Configuration
                      </span>
                    </div>

                    <div className="space-y-4 text-xs">
                      {/* Master Volume Slider */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between opacity-80">
                          <span className="font-semibold uppercase tracking-wider text-[10px]">Master Volume</span>
                          <span className="font-mono font-bold text-indigo-500">{Math.round(globalVolume * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          {globalVolume === 0 || isMuted ? (
                            <VolumeX className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                          ) : (
                            <Volume2 className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
                          )}
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={globalVolume}
                            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                            onMouseUp={() => playFlipSound()}
                            onTouchEnd={() => playFlipSound()}
                            className="w-full h-1.5 rounded-lg bg-slate-500/10 appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                            title="Volume Slider"
                          />
                        </div>
                      </div>

                      {/* Separate Toggles */}
                      <div className="grid grid-cols-2 gap-2 pt-1.5">
                        {/* Sound Effects Toggle */}
                        <button
                          onClick={handleToggleEffects}
                          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border transition-all duration-300 active:scale-95 cursor-pointer font-bold ${
                            isEffectsEnabled && !isMuted
                              ? theme === 'dark'
                                ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400 shadow-inner'
                                : 'bg-indigo-50 border-indigo-500/25 text-indigo-600'
                              : theme === 'dark'
                                ? 'bg-slate-950/40 border-white/5 text-slate-500 hover:text-slate-300'
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                          }`}
                        >
                          {isEffectsEnabled && !isMuted ? (
                            <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                          ) : (
                            <VolumeX className="w-3.5 h-3.5" />
                          )}
                          <span className="text-[10px] uppercase tracking-wider">Effects</span>
                        </button>

                        {/* Voice Assistant Toggle */}
                        <button
                          onClick={handleToggleVoice}
                          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border transition-all duration-300 active:scale-95 cursor-pointer font-bold ${
                            isVoiceEnabled && !isMuted
                              ? theme === 'dark'
                                ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400 shadow-inner'
                                : 'bg-indigo-50 border-indigo-500/25 text-indigo-600'
                              : theme === 'dark'
                                ? 'bg-slate-950/40 border-white/5 text-slate-500 hover:text-slate-300'
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-700'
                          }`}
                        >
                          <Mic className={`w-3.5 h-3.5 ${isVoiceEnabled && !isMuted ? 'text-indigo-500' : ''}`} />
                          <span className="text-[10px] uppercase tracking-wider">Voice</span>
                        </button>
                      </div>

                      {/* Main System Mute Alert */}
                      {isMuted && (
                        <div className="p-2 text-center text-[10px] uppercase font-bold tracking-widest text-pink-500/80 bg-pink-500/5 rounded-xl border border-pink-500/10">
                          SYSTEM AUDIO MUTED
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Instructions Panel */}
                  <div
                    className={`p-5 rounded-3xl border backdrop-blur-md transition-all duration-300 companion-avoid ${
                      theme === 'dark'
                        ? 'bg-slate-900/30 border-white/5 text-slate-400'
                        : 'bg-slate-100/40 border-slate-200 text-slate-600 shadow-inner'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <HelpCircle className="w-4.5 h-4.5 text-indigo-500" />
                      <span className={`text-xs font-extrabold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                        Neural Manual
                      </span>
                    </div>
                    <ul className="text-xs space-y-2.5 list-disc list-inside leading-relaxed">
                      <li>Click card nodes to flip them and inspect the hidden symbols.</li>
                      <li>Flip two nodes in sequence. Correct matches stay locked in.</li>
                      <li>Incorrect pairs trigger a system mismatch shake and flip back.</li>
                      <li>Maintain consecutive matches to stack multiplier combo streaks!</li>
                    </ul>
                  </div>

                </aside>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* VICTORY MODAL */}
        <VictoryModal
          isOpen={isWon}
          moves={moves}
          time={elapsedTime}
          accuracy={liveAccuracy}
          bestStreak={bestStreak}
          difficulty={difficulty}
          theme={theme}
          playerName={playerName}
          onRestart={initGame}
          isNewBest={isNewPersonalBest}
        />

        {/* CUSTOM IN-APP CONFIRMATION DIALOG (IFRAME COMPATIBLE) */}
        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
          theme={theme}
        />

        {/* Global permanently-anchored viewport Companion on all screens */}
        {isRegistered && (
          <Companion
            text={companionText}
            emotion={companionEmotion}
            isSpeaking={isCompanionSpeaking}
            theme={theme}
            onInteractiveClick={handleCompanionInteractiveClick}
            layoutMode="fixed"
          />
        )}
      </div>
    </div>
  );
}
