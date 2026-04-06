import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Sounds } from '@/utils/sounds'
import * as Haptics from 'expo-haptics'

const CHIPS = [
  { value: 5,    color: '#E74C3C', border: '#C0392B' },
  { value: 25,   color: '#27AE60', border: '#1E8449' },
  { value: 100,  color: '#2980B9', border: '#1A5276' },
  { value: 500,  color: '#8E44AD', border: '#6C3483' },
  { value: 1000, color: '#F39C12', border: '#B7770D' },
]

interface Props {
  currentBet: number
  balance: number
  onAddChip: (value: number) => void
  onClearBet: () => void
  onDeal: () => void
}

export function ChipSelector({ currentBet, balance, onAddChip, onClearBet, onDeal }: Props) {
  const handleChip = (value: number) => {
    if (currentBet + value > balance) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Sounds.chip()
    onAddChip(value)
  }

  return (
    <View style={styles.container}>
      {/* Поточна ставка */}
      <View style={styles.betDisplay}>
        <Text style={styles.betLabel}>СТАВКА</Text>
        <Text style={styles.betAmount}>{currentBet} 🪙</Text>
      </View>

      {/* Фішки */}
      <View style={styles.chips}>
        {CHIPS.map(chip => {
          const disabled = currentBet + chip.value > balance
          return (
            <TouchableOpacity
              key={chip.value}
              onPress={() => handleChip(chip.value)}
              disabled={disabled}
              activeOpacity={0.75}
              style={[styles.chip, { backgroundColor: chip.color, borderColor: chip.border }, disabled && styles.chipDisabled]}
            >
              <View style={[styles.chipInner, { borderColor: 'rgba(255,255,255,0.4)' }]}>
                <Text style={styles.chipText}>{chip.value}</Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Кнопки дій */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.btnClear]}
          onPress={onClearBet}
          disabled={currentBet === 0}
        >
          <Text style={styles.btnText}>Очистити</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnDeal, currentBet === 0 && styles.btnDisabled]}
          onPress={() => {
            if (currentBet > 0) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              onDeal()
            }
          }}
          disabled={currentBet === 0}
        >
          <Text style={[styles.btnText, styles.btnDealText]}>РОЗДАТИ</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 16 },
  betDisplay: { alignItems: 'center', marginBottom: 16 },
  betLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: 2, marginBottom: 4 },
  betAmount: { color: '#FFD700', fontSize: 28, fontWeight: '700' },
  chips: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  chip: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 3, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4, shadowRadius: 4, elevation: 5,
  },
  chipInner: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
  },
  chipText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  chipDisabled: { opacity: 0.35 },
  actions: { flexDirection: 'row', gap: 12 },
  btn: {
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 24, borderWidth: 1,
  },
  btnClear: { borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'transparent' },
  btnDeal: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  btnDealText: { color: '#1a1a2e' },
})