import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withDelay,
} from 'react-native-reanimated'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { useUserStore } from '@/stores/userStore'
import { SafeAreaView } from 'react-native-safe-area-context'

const AVATARS = [
  '🃏', '🎰', '🦁', '🐯', '🦊', '🐺',
  '🤠', '😎', '🥷', '👑', '💎', '🔥',
]

export default function OnboardingScreen() {
  const [username, setUsername]     = useState('')
  const [avatar, setAvatar]         = useState('🃏')
  const [error, setError]           = useState('')
  const { setupProfile }            = useUserStore()

  // Анімація появи елементів
  const titleY   = useSharedValue(-30)
  const titleOp  = useSharedValue(0)
  const formOp   = useSharedValue(0)
  const formY    = useSharedValue(30)
  const btnScale = useSharedValue(0.9)
  const btnOp    = useSharedValue(0)

  React.useEffect(() => {
    titleY.value  = withSpring(0, { damping: 15 })
    titleOp.value = withTiming(1, { duration: 500 })
    formOp.value  = withDelay(300, withTiming(1,  { duration: 500 }))
    formY.value   = withDelay(300, withSpring(0,  { damping: 15 }))
    btnScale.value = withDelay(600, withSpring(1, { damping: 12 }))
    btnOp.value    = withDelay(600, withTiming(1, { duration: 400 }))
  }, [])

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleY.value }],
    opacity: titleOp.value,
  }))
  const formStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formY.value }],
    opacity: formOp.value,
  }))
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
    opacity: btnOp.value,
  }))

  const handleStart = () => {
    const trimmed = username.trim()
    if (trimmed.length < 2) {
      setError('Ім\'я має бути не менше 2 символів')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return
    }
    if (trimmed.length > 16) {
      setError('Максимум 16 символів')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setupProfile(trimmed, avatar)
    router.replace('/(tabs)/home')
  }

  const handleAvatarSelect = (emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setAvatar(emoji)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Заголовок */}
          <Animated.View style={[styles.titleBlock, titleStyle]}>
            <Text style={styles.logo}>🃏</Text>
            <Text style={styles.title}>Card Club</Text>
            <Text style={styles.subtitle}>Ласкаво просимо до столу</Text>
          </Animated.View>

          <Animated.View style={[styles.form, formStyle]}>
            {/* Вибір аватара */}
            <Text style={styles.label}>Обери аватар</Text>
            <View style={styles.avatarGrid}>
              {AVATARS.map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => handleAvatarSelect(emoji)}
                  style={[
                    styles.avatarBtn,
                    avatar === emoji && styles.avatarSelected,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.avatarEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Превʼю вибраного аватара */}
            <View style={styles.previewRow}>
              <View style={styles.previewAvatar}>
                <Text style={styles.previewEmoji}>{avatar}</Text>
              </View>
              <View>
                <Text style={styles.previewName}>
                  {username.trim() || 'Твоє ім\'я'}
                </Text>
                <Text style={styles.previewBalance}>1 000 🪙 стартовий баланс</Text>
              </View>
            </View>

            {/* Поле імені */}
            <Text style={styles.label}>Твоє ім'я</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="Введи нікнейм..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={username}
              onChangeText={t => { setUsername(t); setError('') }}
              maxLength={16}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleStart}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </Animated.View>

          {/* Кнопка старт */}
          <Animated.View style={[styles.btnWrap, btnStyle]}>
            <TouchableOpacity
              style={[styles.startBtn, !username.trim() && styles.startBtnDisabled]}
              onPress={handleStart}
              activeOpacity={0.85}
            >
              <Text style={styles.startBtnText}>Почати гру →</Text>
            </TouchableOpacity>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d1b2a' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 },

  titleBlock: { alignItems: 'center', marginBottom: 40 },
  logo:     { fontSize: 72, marginBottom: 12 },
  title:    { fontSize: 36, fontWeight: '800', color: '#FFD700', letterSpacing: 2 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.5)', marginTop: 6 },

  form: { marginBottom: 32 },

  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12, fontWeight: '600',
    letterSpacing: 1.5, textTransform: 'uppercase',
    marginBottom: 12,
  },

  avatarGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, marginBottom: 24,
  },
  avatarBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 2, borderColor: 'transparent',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarSelected: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.15)',
  },
  avatarEmoji: { fontSize: 28 },

  previewRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 14, marginBottom: 28,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  previewAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,215,0,0.15)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFD700',
  },
  previewEmoji:   { fontSize: 28 },
  previewName:    { color: '#FFF', fontSize: 18, fontWeight: '700' },
  previewBalance: { color: 'rgba(255,215,0,0.7)', fontSize: 13, marginTop: 2 },

  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14,
    color: '#FFF', fontSize: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  inputError:  { borderColor: '#E74C3C' },
  errorText:   { color: '#E74C3C', fontSize: 13, marginTop: 6 },

  btnWrap: { paddingHorizontal: 0 },
  startBtn: {
    backgroundColor: '#FFD700', borderRadius: 18,
    paddingVertical: 18, alignItems: 'center',
    shadowColor: '#FFD700', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  startBtnDisabled: { opacity: 0.45 },
  startBtnText: { color: '#1a1a2e', fontSize: 18, fontWeight: '800', letterSpacing: 1 },
})