import React, { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Image, Modal, TextInput,
  Alert,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as Haptics from 'expo-haptics'
import { router } from 'expo-router'
import { useUserStore } from '@/stores/userStore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system/legacy'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/hooks/useTheme'

const AVATARS = [
  '🃏', '🎰', '🦁', '🐯', '🦊', '🐺',
  '🤠', '😎', '🥷', '👑', '💎', '🔥',
]

const STAT_ITEMS = [
  { key: 'gamesPlayed',     label: 'Ігор зіграно',   emoji: '🎮' },
  { key: 'wins',            label: 'Перемог',        emoji: '🏆' },
  { key: 'losses',          label: 'Поразок',        emoji: '💀' },
  { key: 'blackjacks',      label: 'Блекджеків',     emoji: '🃏' },
  { key: 'biggestWin',      label: 'Найбільший виграш', emoji: '💰' },
  { key: 'bestWinStreak',   label: 'Краща серія',    emoji: '🔥' },
  { key: 'totalWagered',    label: 'Всього поставлено', emoji: '🪙' },
]

export default function ProfileScreen() {
  const { profile, balance, setupProfile, updateBalance, photoUri, setPhotoUri } = useUserStore()
  const [avatarModal, setAvatarModal] = useState(false)
  const [bonusCode, setBonusCode] = useState('')
  const [bonusModal, setBonusModal] = useState(false)

  const { theme, colors } = useTheme()
  const { setTheme } = useUserStore()
  

  const savePhotoPermamently = async (uri: string): Promise<string> => {
    const fileName = `avatar_${Date.now()}.jpg`
    const dest = (FileSystem.documentDirectory ?? '') + fileName
    await FileSystem.copyAsync({ from: uri, to: dest })
    return dest
  }

  const pickFromGallery = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
  if (status !== 'granted') {
    Alert.alert('Немає доступу', 'Дозволь доступ до галереї в налаштуваннях')
    return
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  })
  if (!result.canceled) {
    const permanentUri = await savePhotoPermamently(result.assets[0].uri)
    setPhotoUri(permanentUri) 
    setAvatarModal(false)
  }
}

const pickFromCamera = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync()
  if (status !== 'granted') {
    Alert.alert('Немає доступу', 'Дозволь доступ до камери в налаштуваннях')
    return
  }
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  })
  if (!result.canceled) {
    const permanentUri = await savePhotoPermamently(result.assets[0].uri)
    setPhotoUri(permanentUri)
    setAvatarModal(false)
  }
}

  // Вибір емодзі аватара
  const selectEmoji = (emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setPhotoUri(null)
    setupProfile(profile.username, emoji)
    setAvatarModal(false)
  }

  // Лог аут
  const handleLogout = () => {
    Alert.alert(
      'Вийти з акаунту?',
      'Весь прогрес буде збережено',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Вийти', style: 'destructive',
          onPress: () => {
            useUserStore.setState(s => ({ ...s, isOnboarded: false }))
            router.replace('/(auth)')
          },
        },
      ]
    )
  }


  const activateBonusCode = async () => {
    const code = bonusCode.trim().toUpperCase()
    if (!code) return

    const raw = await AsyncStorage.getItem('admin:bonus_codes')
    if (!raw) {
      Alert.alert('Невірний код')
      return
    }

    const codes = JSON.parse(raw)
    const found = codes.find((c: any) => c.code === code && !c.usedBy)

    if (!found) {
      Alert.alert('Код не знайдено або вже використано')
      return
    }

    const updated = codes.map((c: any) =>
      c.code === code ? { ...c, usedBy: profile.username } : c
    )
    await AsyncStorage.setItem('admin:bonus_codes', JSON.stringify(updated))

    updateBalance(found.amount)
    setBonusCode('')
    setBonusModal(false)
    Alert.alert('🎉 Успішно!', `Нараховано ${found.amount} монет!`)
  }

  const winRate = profile.stats.gamesPlayed > 0
    ? Math.round((profile.stats.wins / profile.stats.gamesPlayed) * 100)
    : 0

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Хедер профілю */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={() => setAvatarModal(true)}
            activeOpacity={0.8}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarPhoto} />
            ) : (
              <Text style={styles.avatarEmoji}>{profile.avatarEmoji}</Text>
            )}
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>✏️</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.username}>{profile.username}</Text>
          <Text style={styles.memberSince}>
            Гравець з {new Date(profile.createdAt).toLocaleDateString('uk-UA')}
          </Text>

          {/* Баланс */}
          <View style={styles.balanceChip}>
            <Text style={styles.balanceChipText}>{balance.toLocaleString()} 🪙</Text>
          </View>
        </View>

        {/* Win rate бар */}
        <View style={styles.section}>
          <View style={styles.winRateHeader}>
            <Text style={styles.sectionTitle}>Відсоток перемог</Text>
            <Text style={styles.winRateNum}>{winRate}%</Text>
          </View>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${winRate}%` as any }]} />
          </View>
        </View>

        {/* Статистика */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Статистика</Text>
          <View style={styles.statsGrid}>
            {STAT_ITEMS.map(item => (
              <View key={item.key} style={styles.statCard}>
                <Text style={styles.statEmoji}>{item.emoji}</Text>
                <Text style={styles.statValue}>
                  {(profile.stats as any)[item.key].toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.bonusCodeBtn}
          onPress={() => setBonusModal(true)}
        >
          <Text style={styles.bonusCodeText}>🎟️ Ввести бонус код</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adminBtn}
          onPress={() => router.push('/admin' as any)}
        >
          <Text style={styles.adminBtnText}>🛡️ Адмін панель</Text>
        </TouchableOpacity>


        {/* Тема */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Тема</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {(['dark', 'light', 'system'] as const).map(t => (
              <TouchableOpacity
                key={t}
                style={{
                  flex: 1, padding: 12, borderRadius: 12, alignItems: 'center',
                  backgroundColor: theme === t ? colors.goldBg : colors.card,
                  borderWidth: 1,
                  borderColor: theme === t ? colors.gold : colors.border,
                }}
                onPress={() => setTheme(t)}
              >
                <Text style={{ fontSize: 20 }}>
                  {t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '⚙️'}
                </Text>
                <Text style={{ color: theme === t ? colors.gold : colors.textMuted, fontSize: 12, marginTop: 4 }}>
                  {t === 'dark' ? 'Темна' : t === 'light' ? 'Світла' : 'Системна'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>


        {/* Кнопка лог аут */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Вийти з акаунту</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Модалка вибору аватара */}
      <Modal
        visible={avatarModal}
        transparent
        animationType="slide"
        onRequestClose={() => setAvatarModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAvatarModal(false)}
        />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Змінити аватар</Text>

          {/* Фото кнопки */}
          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.photoBtn} onPress={pickFromCamera}>
              <Text style={styles.photoBtnEmoji}>📷</Text>
              <Text style={styles.photoBtnText}>Камера</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={pickFromGallery}>
              <Text style={styles.photoBtnEmoji}>🖼️</Text>
              <Text style={styles.photoBtnText}>Галерея</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalDivider}>або обери емодзі</Text>

          {/* Емодзі сітка */}
          <View style={styles.emojiGrid}>
            {AVATARS.map(emoji => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiBtn,
                  profile.avatarEmoji === emoji && !photoUri && styles.emojiBtnSelected,
                ]}
                onPress={() => selectEmoji(emoji)}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
      <Modal visible={bonusModal} transparent animationType="fade"
        onRequestClose={() => setBonusModal(false)}>
        <View style={styles.bonusOverlay}>
          <View style={styles.bonusSheet}>
            <Text style={styles.bonusSheetTitle}>🎟️ Бонус код</Text>
              <TextInput
                style={styles.input}
                placeholder="Введи код (напр. BONUS-ABC123)"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={bonusCode}
                onChangeText={setBonusCode}
                autoCapitalize="characters"
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={[styles.bonusSheetBtn, { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' }]}
                  onPress={() => setBonusModal(false)}
                >
                  <Text style={styles.bonusCodeText}>Скасувати</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.bonusSheetBtn, { flex: 1, backgroundColor: '#FFD700' }]}
                  onPress={activateBonusCode}
                >
                  <Text style={[styles.bonusCodeText, { color: '#0d1b2a' }]}>Активувати</Text>
                </TouchableOpacity>
              </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d1b2a' },

  profileHeader: {
    alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  avatarWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderWidth: 2, borderColor: '#FFD700',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
  },
  avatarPhoto: { width: 96, height: 96, borderRadius: 48 },
  avatarEmoji: { fontSize: 52 },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#FFD700', borderRadius: 12,
    width: 24, height: 24, justifyContent: 'center', alignItems: 'center',
  },
  editBadgeText: { fontSize: 12 },
  username: { color: '#FFF', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  memberSince: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 14 },
  balanceChip: {
    backgroundColor: 'rgba(255,215,0,0.12)',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
  },
  balanceChipText: { color: '#FFD700', fontSize: 18, fontWeight: '700' },

  section: { paddingHorizontal: 20, paddingVertical: 20 },
  sectionTitle: {
    color: 'rgba(255,255,255,0.5)', fontSize: 11,
    fontWeight: '700', letterSpacing: 1.5,
    textTransform: 'uppercase', marginBottom: 12,
  },

  winRateHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  winRateNum: { color: '#FFD700', fontWeight: '700', fontSize: 15 },
  barBg: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4, overflow: 'hidden',
  },
  barFill: {
    height: 8, backgroundColor: '#FFD700', borderRadius: 4,
    minWidth: 4,
  },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  statEmoji: { fontSize: 22, marginBottom: 6 },
  statValue: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 3 },

  logoutBtn: {
    marginHorizontal: 20, padding: 16,
    backgroundColor: 'rgba(231,76,60,0.12)',
    borderRadius: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(231,76,60,0.3)',
  },
  logoutText: { color: '#E74C3C', fontSize: 15, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: {
    backgroundColor: '#0d1b2a', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 20 },
  photoActions: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  photoBtn: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14, padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  photoBtnEmoji: { fontSize: 28, marginBottom: 6 },
  photoBtnText:  { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  modalDivider: {
    color: 'rgba(255,255,255,0.3)', fontSize: 12,
    textAlign: 'center', marginBottom: 16,
  },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  emojiBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 2, borderColor: 'transparent',
    justifyContent: 'center', alignItems: 'center',
  },
  emojiBtnSelected: {
    borderColor: '#FFD700',
  },
  emojiText: { fontSize: 28 },

  bonusCodeBtn: {
  marginHorizontal: 20, padding: 16, marginBottom: 10,
  backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: 14,
  alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)',
  },
  bonusCodeText: { color: '#FFD700', fontSize: 15, fontWeight: '600' },
  adminBtn: {
    marginHorizontal: 20, padding: 14, marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  adminBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  bonusOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', padding: 24,
  },
  bonusSheet: {
    backgroundColor: '#0d1b2a', borderRadius: 20, padding: 24, gap: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  bonusSheetTitle: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  bonusSheetBtn: { padding: 14, borderRadius: 12, alignItems: 'center' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14, padding: 16,
    color: '#FFF', fontSize: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
})      