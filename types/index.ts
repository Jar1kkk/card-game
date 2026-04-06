export type Suit = '♠' | '♥' | '♦' | '♣'
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6'
               | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'

export interface Card {
  suit: Suit
  rank: Rank
  faceUp: boolean
  id: string
}

// Фази гри 
export type GamePhase =
  | 'idle'
  | 'betting'
  | 'dealing'
  | 'player_turn'
  | 'dealer_turn'
  | 'result'

export type PlayerAction = 'hit' | 'stand' | 'double' | 'split'

export type GameResult = 'win' | 'lose' | 'push' | 'blackjack'

// Профіль
export interface GameStats {
  gamesPlayed: number
  wins: number
  losses: number
  pushes: number
  blackjacks: number
  biggestWin: number
  currentWinStreak: number
  bestWinStreak: number
  totalWagered: number
}

export interface UserProfile {
  id: string
  username: string
  avatarEmoji: string
  balance: number
  stats: GameStats
  achievements: string[]
  dailyBonusClaimedAt: string | null
  createdAt: string
}