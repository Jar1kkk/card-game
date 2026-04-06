import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import { useUserStore } from '@/stores/userStore'
import { SafeAreaView } from 'react-native-safe-area-context'
import { STICKERS } from '@/constants/stickers'
import { useTheme } from '@/hooks/useTheme'

const COIN_PACKS = [
  { id: 'pack1', label: 'Стартовий', amount: 500,  emoji: '💰', price: 'Безкоштовно', free: true },
  { id: 'pack2', label: 'Малий',     amount: 1000, emoji: '💰', price: 'Безкоштовно', free: true },
  { id: 'pack3', label: 'Середній',  amount: 5000, emoji: '💎', price: 'Безкоштовно', free: true },
  { id: 'pack4', label: 'Великий',   amount: 10000,emoji: '👑', price: 'Безкоштовно', free: true },
]

export default function ShopScreen() {
  const {
    balance, addCoins, ownedStickers,
    buySticker, activeSticker, setActiveSticker
  } = useUserStore()

  const { colors } = useTheme()


  const handleBuyCoins = (pack: typeof COIN_PACKS[0]) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    addCoins(pack.amount)
    Alert.alert('🎉 Отримано!', `+${pack.amount.toLocaleString()} монет додано на баланс`)
  }

  const handleBuySticker = (sticker: typeof STICKERS[0]) => {
    if (ownedStickers.includes(sticker.id)) {
      setActiveSticker(activeSticker === sticker.id ? null : sticker.id)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      return
    }

    if (balance < sticker.price) {
      Alert.alert('Недостатньо монет', `Потрібно ${sticker.price} 🪙`)
      return
    }

    Alert.alert(
      `Купити ${sticker.emoji} ${sticker.label}?`,
      `Вартість: ${sticker.price} 🪙`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Купити',
          onPress: () => {
            const ok = buySticker(sticker.id, sticker.price)
            if (ok) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
              setActiveSticker(sticker.id)
              Alert.alert('✅ Куплено!', `Стікер ${sticker.emoji} активовано`)
            }
          }
        }
      ]
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Хедер */}
        <View style={styles.header}>
          <Text style={styles.title}>🏪 Магазин</Text>
          <View style={styles.balanceChip}>
            <Text style={styles.balanceText}>{balance.toLocaleString()} 🪙</Text>
          </View>
        </View>

        {/* Монети */}
        <Text style={styles.sectionTitle}>Монети</Text>
        <View style={styles.coinGrid}>
          {COIN_PACKS.map(pack => (
            <TouchableOpacity
              key={pack.id}
              style={styles.coinCard}
              onPress={() => handleBuyCoins(pack)}
              activeOpacity={0.8}
            >
              <Text style={styles.coinEmoji}>{pack.emoji}</Text>
              <Text style={styles.coinAmount}>{pack.amount.toLocaleString()}</Text>
              <Text style={styles.coinLabel}>{pack.label}</Text>
              <View style={styles.coinPriceBtn}>
                <Text style={styles.coinPriceText}>{pack.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Стікери */}
        <Text style={styles.sectionTitle}>Стікери</Text>
        <Text style={styles.sectionHint}>
          Активний стікер відображається під час гри
        </Text>
        <View style={styles.stickerGrid}>
          {STICKERS.map(sticker => {
            const owned  = ownedStickers.includes(sticker.id)
            const active = activeSticker === sticker.id
            return (
              <TouchableOpacity
                key={sticker.id}
                style={[
                  styles.stickerCard,
                  owned  ? styles.stickerOwned  : null,
                  active ? styles.stickerActive : null,
                ]}
                onPress={() => handleBuySticker(sticker)}
                activeOpacity={0.8}
              >
                <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
                <Text style={styles.stickerLabel}>{sticker.label}</Text>
                {active ? (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Активний</Text>
                  </View>
                ) : owned ? (
                  <Text style={styles.ownedText}>✓ Куплено</Text>
                ) : (
                  <Text style={styles.stickerPrice}>{sticker.price} 🪙</Text>
                )}
              </TouchableOpacity>
            )
          })}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d1b2a' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20, paddingTop: 16,
  },
  title: { color: '#FFD700', fontSize: 24, fontWeight: '800' },
  balanceChip: {
    backgroundColor: 'rgba(255,215,0,0.12)', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
  },
  balanceText: { color: '#FFD700', fontWeight: '700', fontSize: 15 },
  sectionTitle: {
    color: 'rgba(255,255,255,0.5)', fontSize: 11,
    fontWeight: '700', letterSpacing: 2,
    textTransform: 'uppercase',
    marginHorizontal: 20, marginBottom: 6, marginTop: 8,
  },
  sectionHint: {
    color: 'rgba(255,255,255,0.3)', fontSize: 12,
    marginHorizontal: 20, marginBottom: 14,
  },
  coinGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 10, marginBottom: 24,
  },
  coinCard: {
    width: '47%', backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18, padding: 16, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  coinEmoji:  { fontSize: 36 },
  coinAmount: { color: '#FFD700', fontSize: 22, fontWeight: '800' },
  coinLabel:  { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  coinPriceBtn: {
    backgroundColor: '#27AE60', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 6, marginTop: 4,
  },
  coinPriceText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  stickerGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 10, marginBottom: 24,
  },
  stickerCard: {
    width: '30%', backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16, padding: 14, alignItems: 'center', gap: 6,
    borderWidth: 2, borderColor: 'transparent',
  },
  stickerOwned:  { borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.08)' },
  stickerActive: { borderColor: '#FFD700', backgroundColor: 'rgba(255,215,0,0.1)' },
  stickerEmoji: { fontSize: 36 },
  stickerLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  stickerPrice: { color: '#FFD700', fontSize: 12, fontWeight: '700' },
  ownedText:    { color: '#27AE60', fontSize: 11, fontWeight: '700' },
  activeBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeBadgeText: {
    color: '#0d1b2a',
    fontSize: 10,
    fontWeight: '800',
  },
})