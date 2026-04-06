import React, { useEffect, useState } from 'react'
import {
  View, Text, TouchableOpacity,
  StyleSheet, StatusBar
} from 'react-native'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useBlackjack } from '@/hooks/useBlackjack'
import { useUserStore } from '@/stores/userStore'
import { CardHand } from '@/components/cards/CardHand'
import { ChipSelector } from '@/components/betting/ChipSelector'
import { isBust, isBlackjack } from '@/utils/cardUtils'
import { SafeAreaView } from 'react-native-safe-area-context'
import { STICKERS } from '@/constants/stickers'

export default function BlackjackScreen() {
  const [pendingBet, setPendingBet] = useState(0)
  const { balance, activeSticker } = useUserStore()
  const game = useBlackjack()
  

  
  const handleDeal = () => {
    game.startRound(pendingBet)
    setPendingBet(0)
  }

  const handleAction = (action: 'hit' | 'stand' | 'double') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (action === 'hit')    game.hit()
    if (action === 'stand')  game.stand()
    if (action === 'double') game.double()
  }

  const isPlayerTurn = game.phase === 'player_turn'
  const isBetting    = game.phase === 'betting' || game.phase === 'idle'
  const isResult     = game.phase === 'result'


  const [showResult, setShowResult] = useState(false)


  useEffect(() => {
  if (isResult) {
    const cardCount = game.playerHand.length + game.dealerHand.length
    const delay = cardCount * 150 + 300
    const timer = setTimeout(() => setShowResult(true), delay)
    return () => clearTimeout(timer)
  } else {
    setShowResult(false)
  }
  }, [isResult])

  const resultColors: Record<string, string> = {
    win: '#2ECC71', blackjack: '#FFD700', lose: '#E74C3C', push: '#95A5A6'
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Хедер */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Блекджек</Text>
        <View style={styles.balance}>
          <Text style={styles.balanceText}>{balance} 🪙</Text>
        </View>
      </View>

      {/* Стікер */}
      {activeSticker ? (
        <View style={{ position: 'absolute', top: 70, right: 16, zIndex: 10, opacity: 0.85 }}>
          <Text style={{ fontSize: 52 }}>
            {STICKERS.find(s => s.id === activeSticker)?.emoji}
          </Text>
        </View>
      ) : null}
      

      {/* Ігровий стіл */}
      <View style={styles.table}>

        {/* Рука дилера */}
        {game.dealerHand.length > 0 ? (
          <CardHand
            cards={game.dealerHand}
            score={game.dealerScore}
            label="ДИЛЕР"
            isDealer
          />
        ) : null}

        {/* Банер результату */}
        {isResult && showResult && game.result && (
          <View style={[styles.resultBanner, { borderColor: resultColors[game.result] }]}>
            <Text style={[styles.resultText, { color: resultColors[game.result] }]}>
              {game.message}
            </Text>
            {game.result !== null && game.result !== 'lose' && (
                <Text style={styles.resultSub}>
                    +{game.bet * (game.result === 'blackjack' ? 1.5 : game.result === 'push' ? 0 : 1)} 🪙
                </Text>
            )}
          </View>
        )}

        {/* Рука гравця */}
        {game.playerHand.length > 0 && (
          <CardHand
            cards={game.playerHand}
            score={game.playerScore}
            label="ВИ"
            isBust={isBust(game.playerHand)}
            isBlackjack={isBlackjack(game.playerHand)}
          />
        )}
      </View>

      {/* Зона керування */}
      <View style={styles.controls}>

        {/* Ставка */}
        {isBetting ? (
          <ChipSelector
            currentBet={pendingBet}
            balance={balance}
            onAddChip={v => setPendingBet(p => p + v)}
            onClearBet={() => setPendingBet(0)}
            onDeal={handleDeal}
          />
        ) : null}

        {/* Дії гравця */}
        {isPlayerTurn ? (
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionBtn, styles.btnHit]} onPress={() => handleAction('hit')}>
              <Text style={styles.actionText}>Ще</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.btnStand]} onPress={() => handleAction('stand')}>
              <Text style={styles.actionText}>Стоп</Text>
            </TouchableOpacity>

            {game.canDouble && (
              <TouchableOpacity style={[styles.actionBtn, styles.btnDouble]} onPress={() => handleAction('double')}>
                <Text style={styles.actionText}>x2</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        {/* Після результату */}
        {showResult ? (
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              game.resetRound()
            }}
          >
            <Text style={styles.nextBtnText}>
              {balance > 0 ? 'Новий раунд' : 'Немає монет 😢'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0d4a2a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
  },
  title: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  balance: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  balanceText: {
    color: '#FFD700',
    fontWeight: '700',
    fontSize: 14,
  },
  table: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
  },
  resultBanner: {
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  resultText: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
  },
  resultSub: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  controls: {
    paddingBottom: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  actionBtn: {
    flex: 1,
    maxWidth: 120,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  btnHit:    { backgroundColor: '#E74C3C' },
  btnStand:  { backgroundColor: '#2C3E50' },
  btnDouble: { backgroundColor: '#F39C12' },
  actionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  nextBtn: {
    marginHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: '#FFD700',
    borderRadius: 16,
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: '700',
  },
})