import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { useUserStore } from '@/stores/userStore'

const AVATARS = ['🃏','🎰','🦁','🐺','🦊','🐯','🦅','🐉','👑','💎','🔥','⚡']

export default function OnboardingScreen() {
  const [username, setUsername] = useState('')
  const [avatar, setAvatar]     = useState('🃏')
  const { setupProfile } = useUserStore()

  const handleStart = () => {
    const name = username.trim() || 'Гравець'
    setupProfile(name, avatar)
    router.replace('/')
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <Text style={styles.logo}>🃏</Text>
        <Text style={styles.title}>Ласкаво просимо</Text>
        <Text style={styles.subtitle}>Налаштуй свій профіль щоб почати</Text>

        {/* Вибір аватара */}
        <Text style={styles.label}>ОБЕРИ АВАТАР</Text>
        <View style={styles.avatarGrid}>
          {AVATARS.map(a => (
            <TouchableOpacity
              key={a}
              style={[styles.avatarOption, a === avatar && styles.avatarSelected]}
              onPress={() => setAvatar(a)}
            >
              <Text style={styles.avatarEmoji}>{a}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ім'я */}
        <Text style={styles.label}>ІМ'Я ГРАВЦЯ</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Наприклад: Ace"
          placeholderTextColor="rgba(255,255,255,0.25)"
          maxLength={16}
          autoCapitalize="words"
        />

        {/* Стартовий баланс */}
        <View style={styles.bonusBox}>
          <Text style={styles.bonusText}>🎁 Стартовий бонус: 1000 🪙</Text>
        </View>

        <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
          <Text style={styles.startBtnText}>ПОЧАТИ ГРУ</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#0a0a1a' },
  scroll: { padding: 24, alignItems: 'center' },

  logo:     { fontSize: 72, marginTop: 32, marginBottom: 16 },
  title:    { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.45)', fontSize: 15, textAlign: 'center', marginTop: 8, marginBottom: 36 },

  label: {
    color: 'rgba(255,255,255,0.35)', fontSize: 11,
    fontWeight: '700', letterSpacing: 2,
    alignSelf: 'flex-start', marginBottom: 12,
  },

  avatarGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, marginBottom: 28, justifyContent: 'center',
  },
  avatarOption: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 2, borderColor: 'transparent',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarSelected: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.15)',
  },
  avatarEmoji: { fontSize: 28 },

  input: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14, padding: 16,
    color: '#fff', fontSize: 16, marginBottom: 24,
  },

  bonusBox: {
    width: '100%', backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
    borderRadius: 14, padding: 14,
    alignItems: 'center', marginBottom: 32,
  },
  bonusText: { color: '#FFD700', fontWeight: '700', fontSize: 15 },

  startBtn: {
    width: '100%', backgroundColor: '#FFD700',
    borderRadius: 16, paddingVertical: 18, alignItems: 'center',
  },
  startBtnText: { color: '#0a0a1a', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
})