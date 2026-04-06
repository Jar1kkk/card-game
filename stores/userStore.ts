import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { UserProfile, GameResult } from '@/types'

const DAILY_BONUS = 100
const STARTING_BALANCE = 1000

const DEFAULT_PROFILE: UserProfile = {
  id: Date.now().toString(),
  username: 'Гравець',
  avatarEmoji: '🃏',
  balance: STARTING_BALANCE,
  stats: {
    gamesPlayed: 0, wins: 0, losses: 0, pushes: 0,
    blackjacks: 0, biggestWin: 0, currentWinStreak: 0,
    bestWinStreak: 0, totalWagered: 0,
  },
  achievements: [],
  dailyBonusClaimedAt: null,
  createdAt: new Date().toISOString(),
}

interface UserStore {
  profile: UserProfile
  balance: number
  isOnboarded: boolean
  photoUri: string | null
  // Actions
  setupProfile(username: string, avatarEmoji: string): void
  updateBalance(delta: number): void
  recordResult(result: GameResult, profit: number, bet?: number): void
  claimDailyBonus(): boolean
  canClaimDailyBonus(): boolean
  setPhotoUri(uri: string | null): void

  ownedStickers: string[]
  activeSticker: string | null
  buySticker(id: string, price: number): boolean
  setActiveSticker(id: string | null): void
  addCoins(amount: number): void


  theme: 'dark' | 'light' | 'system'
  setTheme(theme: 'dark' | 'light' | 'system'): void
  
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      balance: STARTING_BALANCE,
      isOnboarded: true,

      setupProfile(username, avatarEmoji) {
        set(s => ({
          isOnboarded: true,
          profile: { ...s.profile, username, avatarEmoji }
        }))
      },

      updateBalance(delta) {
        set(s => ({
          balance: Math.max(0, s.balance + delta),
          profile: { ...s.profile, balance: Math.max(0, s.profile.balance + delta) }
        }))
      },

      recordResult(result, profit, bet = 0) {
        set(s => {
          const stats = { ...s.profile.stats }
          stats.gamesPlayed++
          stats.totalWagered += bet

          if (result === 'win' || result === 'blackjack') {
            stats.wins++
            stats.currentWinStreak++
            stats.bestWinStreak = Math.max(stats.bestWinStreak, stats.currentWinStreak)
            stats.biggestWin = Math.max(stats.biggestWin, profit)
            if (result === 'blackjack') stats.blackjacks++
          } else if (result === 'lose') {
            stats.losses++
            stats.currentWinStreak = 0
          } else {
            stats.pushes++
          }

          return { profile: { ...s.profile, stats } }
        })
      },

      canClaimDailyBonus() {
        const claimed = get().profile.dailyBonusClaimedAt
        if (!claimed) return true
        const lastDate = new Date(claimed).toDateString()
        const today = new Date().toDateString()
        return lastDate !== today
      },

      claimDailyBonus(): boolean {
      if (!get().canClaimDailyBonus()) return false
      set(s => ({
        balance: s.balance + DAILY_BONUS,
        profile: {
          ...s.profile,
          balance: s.profile.balance + DAILY_BONUS,
          dailyBonusClaimedAt: new Date().toISOString(),
        }
      }))
        return true
      },

      photoUri: null,
      setPhotoUri(uri) {
        set(s => ({
          photoUri: uri,
          profile: { ...s.profile, avatarEmoji: uri ? '📷' : s.profile.avatarEmoji }
        }))
      },

      theme: 'dark',
      setTheme(theme) {
        set({ theme })
      },

      ownedStickers: [],
      activeSticker: null,

      buySticker(id, price) {
        if (get().balance < price) return false
        set(s => ({
          balance: s.balance - price,
          profile: { ...s.profile, balance: s.profile.balance - price },
          ownedStickers: [...s.ownedStickers, id],
        }))
        return true
      },

      setActiveSticker(id) {
        set({ activeSticker: id })
      },

      addCoins(amount) {
        set(s => ({
          balance: s.balance + amount,
          profile: { ...s.profile, balance: s.profile.balance + amount },
        }))
      },
    }),
    {
      name: 'card-game-user',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)