import { useState, useCallback, useRef } from 'react'
import { Card, GamePhase, GameResult } from '@/types'
import {
  createShuffledDeck, calculateHandValue,
  isBust, isBlackjack, canSplit, canDouble,
} from '@/utils/cardUtils'
import { useUserStore } from '@/stores/userStore'
import { Sounds } from '@/utils/sounds'

interface BlackjackState {
  deck:       Card[]
  playerHand: Card[]
  dealerHand: Card[]
  phase:      GamePhase
  bet:        number
  result:     GameResult | null
  message:    string
}

const INITIAL: BlackjackState = {
  deck: [], playerHand: [], dealerHand: [],
  phase: 'idle', bet: 0, result: null, message: '',
}

// Взяти N карт з колоди (поза компонентом — чиста функція)
function deal(deck: Card[], count: number, faceUp = true) {
  const cards     = deck.slice(0, count).map(c => ({ ...c, faceUp }))
  const remaining = deck.slice(count)
  return { cards, remaining }
}

// Хід дилера — чиста функція, повертає новий стан
function resolveDealerTurn(
  deck: Card[],
  playerHand: Card[],
  dealerHand: Card[],
  bet: number,
  updateBalance: (delta: number) => void,
  recordResult: (result: GameResult, profit: number, bet: number) => void,
): BlackjackState {
  // Відкриваємо закриту картку дилера
  let dHand     = dealerHand.map(c => ({ ...c, faceUp: true }))
  let remaining = deck

  // Дилер тягне до 17
  while (calculateHandValue(dHand) < 17) {
    const d = deal(remaining, 1)
    dHand     = [...dHand, ...d.cards]
    remaining = d.remaining
  }

  const playerScore = calculateHandValue(playerHand)
  const dealerScore = calculateHandValue(dHand)

  let result: GameResult
  if      (isBust(dHand))              result = 'win'
  else if (playerScore > dealerScore)  result = 'win'
  else if (playerScore < dealerScore)  result = 'lose'
  else                                 result = 'push'

  const soundDelay = dHand.length * 150 + 300
  setTimeout(() => {
    if (result === 'win')       Sounds.win()
    else if (result === 'lose') Sounds.lose()
  }, soundDelay)

  const PAYOUTS: Record<GameResult, number> = {
    win: bet * 2, blackjack: bet * 2.5, push: bet, lose: 0,
  }
  const MESSAGES: Record<GameResult, string> = {
    win: 'Ви виграли!', blackjack: 'BLACKJACK!',
    push: 'Нічия', lose: 'Програли',
  }

  updateBalance(PAYOUTS[result])
  recordResult(result, PAYOUTS[result] - (result === 'lose' ? 0 : bet), bet)

  return {
    deck: remaining, playerHand, dealerHand: dHand,
    phase: 'result', bet, result, message: MESSAGES[result],
  }
}

export function useBlackjack() {
  const [state, setState] = useState<BlackjackState>(INITIAL)
  const { balance, updateBalance, recordResult } = useUserStore()

  // ref щоб мати актуальний стан всередині колбеків
  const stateRef = useRef(state)
  stateRef.current = state

  // ── Початок раунду ────────────────────────────────
  const startRound = useCallback((bet: number) => {
    if (bet <= 0 || bet > balance) return

    let deck = createShuffledDeck()
    const p1 = deal(deck, 1);       deck = p1.remaining
    const d1 = deal(deck, 1);       deck = d1.remaining
    const p2 = deal(deck, 1);       deck = p2.remaining
    const d2 = deal(deck, 1, false); deck = d2.remaining

    const playerHand = [...p1.cards, ...p2.cards]
    const dealerHand = [...d1.cards, ...d2.cards]

    updateBalance(-bet)
    Sounds.deal()

    // Перевірка блекджека одразу після роздачі
    if (isBlackjack(playerHand)) {
      const dealerFull = dealerHand.map(c => ({ ...c, faceUp: true }))
      const result: GameResult = isBlackjack(dealerFull) ? 'push' : 'blackjack'

      setTimeout(() => {
        if (result === 'blackjack') Sounds.blackjack()
        else Sounds.win()
      }, 600)

      const payout = result === 'blackjack' ? bet * 2.5 : bet
      updateBalance(payout)
      recordResult(result, payout - bet, bet)
      setState({
        deck, playerHand, dealerHand: dealerFull,
        phase: 'result', bet, result,
        message: result === 'blackjack' ? 'BLACKJACK!' : 'Нічия',
      })
      return
    }

    setState({ deck, playerHand, dealerHand, phase: 'player_turn', bet, result: null, message: '' })
  }, [balance])

  // ── Гравець бере картку ───────────────────────────
  const hit = useCallback(() => {
    const s = stateRef.current
    if (s.phase !== 'player_turn') return

    const { cards, remaining } = deal(s.deck, 1)
    Sounds.deal()
    const newHand = [...s.playerHand, ...cards]

    if (isBust(newHand)) {
      updateBalance(0)
      recordResult('lose', -s.bet, s.bet)
      setState({
        ...s, deck: remaining, playerHand: newHand,
        phase: 'result', result: 'lose', message: 'Програли',
      })
      return
    }
    setState({ ...s, deck: remaining, playerHand: newHand })
  }, [])

  // ── Гравець зупиняється ───────────────────────────
  const stand = useCallback(() => {
    const s = stateRef.current
    if (s.phase !== 'player_turn') return

    const newState = resolveDealerTurn(
      s.deck, s.playerHand, s.dealerHand, s.bet,
      updateBalance, recordResult,
    )
    setState(newState)
  }, [])

  // Double down
  const double = useCallback(() => {
    const s = stateRef.current
    if (!canDouble(s.playerHand, balance, s.bet)) return

    updateBalance(-s.bet)
    const newBet = s.bet * 2
    const { cards, remaining } = deal(s.deck, 1)
    const newHand = [...s.playerHand, ...cards]

    if (isBust(newHand)) {
      setTimeout(() => Sounds.lose(), 600)
      recordResult('lose', -newBet, newBet)
      setState({
        ...s, deck: remaining, playerHand: newHand, bet: newBet,
        phase: 'result', result: 'lose', message: 'Програли',
      })
      return
    }

    const newState = resolveDealerTurn(
      remaining, newHand, s.dealerHand, newBet,
      updateBalance, recordResult,
    )
    setState(newState)
  }, [balance])

  // Новий раунд
  const resetRound = useCallback(() => {
    setState({ ...INITIAL, phase: 'betting' })
  }, [])

  return {
    ...state,
    playerScore: calculateHandValue(state.playerHand),
    dealerScore:  calculateHandValue(state.dealerHand),
    canSplit:  canSplit(state.playerHand),
    canDouble: canDouble(state.playerHand, balance, state.bet),
    startRound, hit, stand, double: double, resetRound,
  }
}