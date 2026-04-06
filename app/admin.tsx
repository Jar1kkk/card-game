import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
} from 'react-native'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SafeAreaView } from 'react-native-safe-area-context'

// Секретний пароль адміна
const ADMIN_PASSWORD = 'admin2024'

// Ключ для зберігання бонусних кодів
const BONUS_CODES_KEY = 'admin:bonus_codes'

interface BonusCode {
  code: string
  amount: number
  usedBy: string | null
  createdAt: string
}

export default function AdminScreen() {
  const [password, setPassword]   = useState('')
  const [isAuth, setIsAuth]       = useState(false)
  const [amount, setAmount]       = useState('')
  const [codes, setCodes]         = useState<BonusCode[]>([])
  const [generated, setGenerated] = useState<string | null>(null)

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuth(true)
      loadCodes()
    } else {
      Alert.alert('Невірний пароль')
    }
  }

  const loadCodes = async () => {
    const raw = await AsyncStorage.getItem(BONUS_CODES_KEY)
    if (raw) setCodes(JSON.parse(raw))
  }

  const generateCode = async () => {
    const coins = parseInt(amount)
    if (!coins || coins <= 0) {
      Alert.alert('Введи суму монет')
      return
    }

    // Генерація унікального коду
    const code = 'BONUS-' + Math.random().toString(36).substring(2, 8).toUpperCase()

    const newCode: BonusCode = {
      code, amount: coins, usedBy: null,
      createdAt: new Date().toISOString(),
    }

    const updated = [...codes, newCode]
    await AsyncStorage.setItem(BONUS_CODES_KEY, JSON.stringify(updated))
    setCodes(updated)
    setGenerated(code)
    setAmount('')
  }

  const deleteCode = async (code: string) => {
    const updated = codes.filter(c => c.code !== code)
    await AsyncStorage.setItem(BONUS_CODES_KEY, JSON.stringify(updated))
    setCodes(updated)
  }

  // Екран логіну
  if (!isAuth) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loginContainer}>
          <Text style={styles.loginTitle}>🔐 Адмін панель</Text>
          <TextInput
            style={styles.input}
            placeholder="Пароль адміна"
            placeholderTextColor="rgba(255,255,255,0.3)"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleLogin}
          />
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>Увійти</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Назад</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // Адмін панель
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>🛡️ Адмін панель</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>← Вийти</Text>
          </TouchableOpacity>
        </View>

        {/* Генерація бонус коду */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Створити бонус код</Text>
          <Text style={styles.hint}>
            Код можна передати гравцю — він введе його в профілі і отримає монети
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Кількість монет (напр. 1000)"
            placeholderTextColor="rgba(255,255,255,0.3)"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <TouchableOpacity style={styles.generateBtn} onPress={generateCode}>
            <Text style={styles.generateBtnText}>Згенерувати код</Text>
          </TouchableOpacity>

          {generated ? (
            <View style={styles.generatedBox}>
              <Text style={styles.generatedLabel}>Новий код:</Text>
              <Text style={styles.generatedCode}>{generated}</Text>
              <Text style={styles.generatedHint}>Скопіюй і передай гравцю</Text>
            </View>
          ) : null}
        </View>

        {/* Список кодів */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Всі коди ({codes.length})</Text>
          {codes.length === 0 ? (
            <Text style={styles.empty}>Немає кодів</Text>
          ) : null}
          {codes.map(item => (
            <View key={item.code} style={[styles.codeRow, item.usedBy ? styles.codeUsed : null]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.codeText}>{item.code}</Text>
                <Text style={styles.codeMeta}>
                  {item.amount} 🪙 · {item.usedBy ? `Використано: ${item.usedBy}` : 'Не використано'}
                </Text>
              </View>
              {!item.usedBy ? (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteCode(item.code)}
                >
                  <Text style={styles.deleteBtnText}>🗑</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0d1b2a' },
  loginContainer: {
    flex: 1, justifyContent: 'center',
    padding: 32, gap: 16,
  },
  loginTitle: { color: '#FFD700', fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14, padding: 16,
    color: '#FFF', fontSize: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  loginBtn: {
    backgroundColor: '#FFD700', borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  loginBtnText: { color: '#0d1b2a', fontWeight: '800', fontSize: 16 },
  backLink: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 8 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20,
  },
  title: { color: '#FFD700', fontSize: 20, fontWeight: '800' },
  section: {
    margin: 20, padding: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, gap: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  hint: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  generateBtn: {
    backgroundColor: '#27AE60', borderRadius: 12,
    padding: 14, alignItems: 'center',
  },
  generateBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  generatedBox: {
    backgroundColor: 'rgba(39,174,96,0.15)',
    borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: 'rgba(39,174,96,0.4)',
    alignItems: 'center', gap: 6,
  },
  generatedLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  generatedCode:  { color: '#2ECC71', fontSize: 24, fontWeight: '800', letterSpacing: 2 },
  generatedHint:  { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  empty: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 16 },
  codeRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10, padding: 12, gap: 12,
  },
  codeUsed: { opacity: 0.5 },
  codeText: { color: '#FFD700', fontWeight: '700', fontSize: 15, letterSpacing: 1 },
  codeMeta: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 3 },
  deleteBtn: { padding: 8 },
  deleteBtnText: { fontSize: 18 },
})