import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Card } from '@/types'
import { PlayingCard } from './PlayingCard'

interface Props {
  cards: Card[]
  score: number
  label: string
  isDealer?: boolean
  isBust?: boolean
  isBlackjack?: boolean
}

export function CardHand({ cards, score, label, isDealer, isBust, isBlackjack }: Props) {
  const scoreColor = isBust
    ? styles.scoreBust
    : isBlackjack ? styles.scoreBlackjack : styles.scoreNormal


    const [showScore, setShowScore] = useState(false)

    useEffect(() => {
      setShowScore(false)
      const delay = (cards.length) * 150 + 200
      const timer = setTimeout(() => setShowScore(true), delay)
      return () => clearTimeout(timer)
    }, [cards.length])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {showScore ? (
          <View style={[styles.scoreBadge, isBust ? styles.bustBadge : null, isBlackjack ? styles.bjBadge : null]}>
            <Text style={[styles.scoreText, scoreColor]}>
              {isBlackjack ? 'BJ!' : isBust ? 'Bust' : score}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.hand}>
        {cards.map((card, i) => (
          <PlayingCard
            key={card.id}
            card={card}
            index={i}
            small={isDealer}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 8 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 10,
  },
  label: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500', letterSpacing: 1 },
  scoreBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  bustBadge: { backgroundColor: 'rgba(192,57,43,0.3)', borderColor: '#C0392B' },
  bjBadge:   { backgroundColor: 'rgba(255,215,0,0.2)',  borderColor: '#FFD700' },
  scoreText:      { fontSize: 15, fontWeight: '700' },
  scoreNormal:    { color: '#FFFFFF' },
  scoreBust:      { color: '#E74C3C' },
  scoreBlackjack: { color: '#FFD700' },
  hand: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
})