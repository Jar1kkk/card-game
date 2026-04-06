import { useColorScheme } from 'react-native'
import { useUserStore } from '@/stores/userStore'
import { Colors } from '@/constants/colors'

export function useTheme() {
  const { theme } = useUserStore()
  const systemScheme = useColorScheme()

  const resolvedTheme = theme === 'system'
    ? (systemScheme ?? 'dark')
    : theme

  return {
    colors: Colors[resolvedTheme],
    isDark: resolvedTheme === 'dark',
    theme: resolvedTheme,
  }
}