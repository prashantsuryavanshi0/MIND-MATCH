export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Card {
  id: string;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
  hasFailed: boolean; // For shake animation on mismatch
}

export interface GameRecord {
  id: string;
  name: string;
  moves: number;
  time: number; // in seconds
  accuracy: number; // matched / moves ratio
  bestStreak: number;
  difficulty: DifficultyLevel;
  date: string;
}

export interface LeaderboardData {
  easy: GameRecord[];
  medium: GameRecord[];
  hard: GameRecord[];
}

export interface GameStats {
  moves: number;
  matches: number;
  totalPairs: number;
  elapsedTime: number;
  bestMoves: number;
  bestTime: number;
  currentStreak: number;
  bestStreak: number;
  accuracy: number;
}

