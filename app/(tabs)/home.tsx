import React, { useEffect } from 'react'
import {
  View, Text, TouchableOpacity,
  StyleSheet, ScrollView, Image,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withDelay, withTiming,
} from 'react-native-reanimated'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useUserStore } from '@/stores/userStore'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/hooks/useTheme'

interface GameCard {
  id: string
  title: string
  emoji: string
  description: string
  route: string
  available: boolean
  color: string
  colorDark: string
}

const GAMES: GameCard[] = [
  {
    id: 'blackjack', title: 'Блекджек', emoji: '🃏',
    description: 'Набери 21 і переможи дилера',
    route: '/games/blackjack', available: true,
    color: '#1a6b3a', colorDark: '#0d4a2a',
  },
  {
    id: 'poker', title: 'Покер', emoji: '♠️',
    description: "Texas Hold'em — скоро",
    route: '', available: false,
    color: '#1a2b6b', colorDark: '#0d1a4a',
  },
  {
    id: 'solitaire', title: 'Пасьянс', emoji: '🎴',
    description: 'Klondike — скоро',
    route: '', available: false,
    color: '#6b1a1a', colorDark: '#4a0d0d',
  },
]

function GameCardItem({ game, index }: { game: GameCard, index: number }) {
  const anim = useSharedValue(0)

  useEffect(() => {
    anim.value = withDelay(index * 120, withSpring(1, { damping: 14 }))
  }, [])

  const animStyle = useAnimatedStyle(() => ({
    opacity: anim.value,
    transform: [{ scale: 0.9 + anim.value * 0.1 }],
  }))

  const handlePress = () => {
    if (!game.available) return
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    router.push(game.route as any)
  }

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        style={[
          styles.gameCard,
          { backgroundColor: game.color, borderColor: game.colorDark },
          !game.available ? styles.gameCardLocked : null,
        ]}
        onPress={handlePress}
        activeOpacity={game.available ? 0.8 : 1}
      >
        <Text style={styles.gameEmoji}>{game.emoji}</Text>
        <Text style={styles.gameTitle}>{game.title}</Text>
        <Text style={styles.gameDesc}>{game.description}</Text>
        {!game.available ? (
          <View style={styles.lockedBadge}>
            <Text style={styles.lockedText}>🔒 Скоро</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  )
}

export default function HomeScreen() {
  const { colors } = useTheme()
  const { profile, balance, canClaimDailyBonus, claimDailyBonus, photoUri } = useUserStore()

  const headerOp = useSharedValue(0)
  const headerY  = useSharedValue(-20)

  useEffect(() => {
    headerOp.value = withTiming(1, { duration: 400 })
    headerY.value  = withSpring(0, { damping: 15 })
  }, [])

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOp.value,
    transform: [{ translateY: headerY.value }],
  }))

  const handleBonus = () => {
    const claimed = claimDailyBonus()
    if (claimed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    }
  }

  const bonusAvailable = canClaimDailyBonus()

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <Animated.View style={[styles.header, headerStyle]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#FFD700' }}
              />
            ) : (
              <Text style={{ fontSize: 36 }}>{profile.avatarEmoji}</Text>
            )}
            <View>
              <Text style={[styles.greeting, { color: colors.textMuted }]}>Вітаємо,</Text>
              <Text style={[styles.username, { color: colors.text }]}>{profile.username}</Text>
            </View>
          </View>
          <View style={[styles.balanceBox, { backgroundColor: colors.goldBg, borderColor: colors.goldBorder }]}>
            <Text style={styles.balanceLabel}>БАЛАНС</Text>
            <Text style={styles.balanceAmount}>{balance.toLocaleString()} 🪙</Text>
          </View>
        </Animated.View>

        {bonusAvailable ? (
          <TouchableOpacity style={[styles.bonusBanner, { backgroundColor: colors.goldBg, borderColor: colors.goldBorder }]} onPress={handleBonus} activeOpacity={0.85}>
            <Text style={styles.bonusEmoji}>🎁</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.bonusTitle}>Щоденний бонус</Text>
              <Text style={styles.bonusSub}>Натисни щоб отримати +100 🪙</Text>
            </View>
            <Text style={styles.bonusArrow}>→</Text>
          </TouchableOpacity>
        ) : null}

        <Text style={styles.sectionTitle}>Ігри</Text>

        <View style={styles.gamesGrid}>
          {GAMES.map((game, i) => (
            <GameCardItem key={game.id} game={game} index={i} />
          ))}
        </View>

        <View style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{profile.stats.gamesPlayed}</Text>
            <Text style={styles.statLabel}>Ігор</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{profile.stats.wins}</Text>
            <Text style={styles.statLabel}>Перемог</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{profile.stats.blackjacks}</Text>
            <Text style={styles.statLabel}>Блекджеків</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statNum, { color: '#FFD700' }]}>
              {profile.stats.bestWinStreak}
            </Text>
            <Text style={styles.statLabel}>Серія</Text>
          </View>
        </View>

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
  greeting:      { color: 'rgba(255,255,255,0.5)', fontSize: 13 },
  username:      { color: '#FFF', fontSize: 22, fontWeight: '700', marginTop: 2 },
  balanceBox: {
    backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.25)', alignItems: 'flex-end',
  },
  balanceLabel:  { color: 'rgba(255,215,0,0.6)', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  balanceAmount: { color: '#FFD700', fontSize: 20, fontWeight: '800', marginTop: 2 },
  bonusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: 'rgba(255,215,0,0.12)', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
  },
  bonusEmoji:  { fontSize: 28 },
  bonusTitle:  { color: '#FFD700', fontSize: 15, fontWeight: '700' },
  bonusSub:    { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  bonusArrow:  { color: '#FFD700', fontSize: 20, fontWeight: '700' },
  sectionTitle: {
    color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '700',
    letterSpacing: 2, textTransform: 'uppercase',
    marginHorizontal: 20, marginBottom: 14,
  },
  gamesGrid:      { paddingHorizontal: 20, gap: 12, marginBottom: 24 },
  gameCard: {
    borderRadius: 20, padding: 20, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  gameCardLocked: { opacity: 0.55 },
  gameEmoji:      { fontSize: 44, marginBottom: 10 },
  gameTitle:      { color: '#FFF', fontSize: 22, fontWeight: '800' },
  gameDesc:       { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 4 },
  lockedBadge: {
    alignSelf: 'flex-start', marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  lockedText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 32,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  statBox:     { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  statNum:     { color: '#FFF', fontSize: 22, fontWeight: '800' },
  statLabel:   { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
})