import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useUserStore } from '@/stores/userStore'

export default function Index() {
  const router = useRouter()
  const { isOnboarded } = useUserStore()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOnboarded) {
        router.replace('/(tabs)/home')
      } else {
        router.replace('/(auth)')
      }
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <View style={{ flex: 1, backgroundColor: '#0d1b2a', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color="#FFD700" size="large" />
    </View>
  )
}