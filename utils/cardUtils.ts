import { Card, Rank, Suit } from '@/types'

const SUITS: Suit[] = ['♠', '♥', '♦', '♣']
const RANKS: Rank[] = ['A','2','3','4','5','6','7',
                       '8','9','10','J','Q','K']

// Створити і перемішати стандартну колоду 52 карти
export function createShuffledDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, faceUp: true, id: `${suit}-${rank}` })
    }
  }
  return shuffle(deck)
}

// Fisher-Yates shuffle
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Числове значення картки
export function getCardValue(rank: Rank): number {
  if (['J', 'Q', 'K'].includes(rank)) return 10
  if (rank === 'A') return 11
  return parseInt(rank, 10)
}

// Підрахунок очок руки
export function calculateHandValue(hand: Card[]): number {
  let total = 0
  let aces = 0

  for (const card of hand) {
    if (!card.faceUp) continue
    const val = getCardValue(card.rank)
    if (card.rank === 'A') aces++
    total += val
  }

  // Знижуємо туз з 11 до 1 якщо перебір
  while (total > 21 && aces > 0) {
    total -= 10
    aces--
  }
  return total
}

// Перевірки стану руки
export const isBust   = (hand: Card[]) => calculateHandValue(hand) > 21
export const isBlackjack = (hand: Card[]) =>
  hand.length === 2 && calculateHandValue(hand) === 21

// Чи можна зробити split
export const canSplit = (hand: Card[]) =>
  hand.length === 2 && hand[0].rank === hand[1].rank

// Чи можна зробити double
export const canDouble = (hand: Card[], balance: number, bet: number) =>
  hand.length === 2 && balance >= bet

// Колір масті (для UI)
export const isRedSuit = (suit: Suit) => suit === '♥' || suit === '♦'