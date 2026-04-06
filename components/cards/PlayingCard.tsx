import React, { useEffect } from 'react'
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, withDelay,
  interpolate, Extrapolation, Easing,
} from 'react-native-reanimated'
import { Card } from '@/types'
import { isRedSuit } from '@/utils/cardUtils'

interface Props {
  card: Card
  index?: number   // порядковий номер картки — визначає затримку
  small?: boolean  // менший розмір для руки дилера
  isNew?: boolean  // true = тільки що роздана, програємо анімацію
}

export function PlayingCard({ card, index = 0, small = false, isNew = true }: Props) {
  // Анімації роздачі
  const translateX = useSharedValue(isNew ? -150 : 0)
  const translateY = useSharedValue(isNew ? -200 : 0)
  const rotate     = useSharedValue(isNew ? -30 : 0)
  const scale      = useSharedValue(isNew ? 0.3 : 1)
  const opacity    = useSharedValue(isNew ? 0 : 1)

  // Анімація фліпу картки (для закритої → відкритої)
  const flip = useSharedValue(card.faceUp ? 1 : 0)

  useEffect(() => {
    if (!isNew) return

    const delay = index * 150  // кожна наступна картка з затримкою 150мс

    // Картка летить зі стопки на стіл
    translateX.value = withDelay(delay, withSpring(0, {
      damping: 18, stiffness: 200, mass: 0.8,
    }))
    translateY.value = withDelay(delay, withSpring(0, {
      damping: 18, stiffness: 200, mass: 0.8,
    }))
    rotate.value = withDelay(delay, withSpring(0, {
      damping: 20, stiffness: 180,
    }))
    scale.value = withDelay(delay, withSpring(1, {
      damping: 15, stiffness: 250,
    }))
    opacity.value = withDelay(delay, withTiming(1, { duration: 80 }))
  }, [])

  useEffect(() => {
    // Фліп коли картка відкривається (закрита → відкрита)
    flip.value = withTiming(card.faceUp ? 1 : 0, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    })
  }, [card.faceUp])

  // Стиль польоту картки
  const dealStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }))

  // Передня сторона (фліп)
  const frontStyle = useAnimatedStyle(() => ({
    transform: [{
      rotateY: `${interpolate(
        flip.value, [0, 1], [90, 0], Extrapolation.CLAMP
      )}deg`
    }],
    backfaceVisibility: 'hidden',
  }))

  // Задня сторона (фліп)
  const backStyle = useAnimatedStyle(() => ({
    transform: [{
      rotateY: `${interpolate(
        flip.value, [0, 1], [0, -90], Extrapolation.CLAMP
      )}deg`
    }],
    backfaceVisibility: 'hidden',
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  }))

  const isRed = isRedSuit(card.suit)
  const W = small ? 60 : 80
  const H = small ? 84 : 112
  const R = small ? 6  : 8
  const P = small ? 4  : 6

  const cardBase: ViewStyle = { width: W, height: H, borderRadius: R, padding: P }

  const rankStyle: TextStyle = {
    fontSize: small ? 13 : 16, fontWeight: '700',
    color: isRed ? '#C0392B' : '#1a1a2e',
    lineHeight: small ? 15 : 18,
  }
  const suitStyle: TextStyle = {
    fontSize: small ? 10 : 12,
    color: isRed ? '#C0392B' : '#1a1a2e',
  }
  const centerStyle: TextStyle = {
    fontSize: small ? 24 : 32, textAlign: 'center',
    marginTop: small ? 12 : 18,
    color: isRed ? '#C0392B' : '#1a1a2e',
  }

  return (
    <View style={{
      width: W, height: H,
      margin: small ? 3 : 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 6,
      borderRadius: R,
    }}>
      <Animated.View style={[{ width: W, height: H }, dealStyle]}>

        <Animated.View style={[cardBase, styles.front, frontStyle]}>
          <View style={styles.corner}>
            <Text style={rankStyle}>{card.rank}</Text>
            <Text style={suitStyle}>{card.suit}</Text>
          </View>
          <Text style={centerStyle}>{card.suit}</Text>
          <View style={[styles.corner, styles.cornerBottom]}>
            <Text style={rankStyle}>{card.rank}</Text>
            <Text style={suitStyle}>{card.suit}</Text>
          </View>
        </Animated.View>

        <Animated.View style={[cardBase, styles.back, backStyle]}>
          <View style={styles.backPattern}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Text key={i} style={styles.backDiamond}>◆</Text>
            ))}
          </View>
        </Animated.View>

      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  front: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#e0e0e0',
  },
  back: {
    backgroundColor: '#1a1a6e',
    borderWidth: 1, borderColor: '#3a3a9e',
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  backPattern: {
    flexDirection: 'row', flexWrap: 'wrap',
    width: '100%', height: '100%',
    justifyContent: 'center', alignItems: 'center',
    opacity: 0.35,
  },
  backDiamond: { fontSize: 14, color: '#FFD700', margin: 2 },
  corner: { position: 'absolute', top: 5, left: 6, alignItems: 'center' },
  cornerBottom: {
    top: 'auto' as any, bottom: 5,
    left: 'auto' as any, right: 6,
    transform: [{ rotate: '180deg' }],
  },
})