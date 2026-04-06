import { Audio } from 'expo-av'

type SoundName = 'card_deal' | 'card_flip' | 'win' | 'lose' | 'blackjack' | 'chip'

// Мапи звуків на файли
const SOUND_FILES: Record<SoundName, any> = {
  card_deal: require('@/assets/sounds/card_deal.mp3'),
  card_flip: require('@/assets/sounds/card_flip.mp3'),
  win:       require('@/assets/sounds/win.mp3'),
  lose:      require('@/assets/sounds/lose.mp3'),
  blackjack: require('@/assets/sounds/blackjack.mp3'),
  chip:      require('@/assets/sounds/chip.mp3'),
}

// Кеш завантажених звуків
const soundCache: Partial<Record<SoundName, Audio.Sound>> = {}

// Ініціалізація аудіо і попереднє завантаження всіх звуків
export async function initSounds() {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    })

    // Завантажуємо всі звуки паралельно
    await Promise.all(
      (Object.keys(SOUND_FILES) as SoundName[]).map(async name => {
        try {
          const { sound } = await Audio.Sound.createAsync(
            SOUND_FILES[name],
            { shouldPlay: false, volume: 1.0 }
          )
          soundCache[name] = sound
        } catch (e) {
          console.warn(`Не вдалось завантажити звук: ${name}`)
        }
      })
    )
    console.log('✅ Звуки завантажено')
  } catch (e) {
    console.warn('Audio init failed', e)
  }
}

// Відтворити звук
export async function playSound(name: SoundName) {
  try {
    const sound = soundCache[name]
    if (!sound) return
    await sound.setPositionAsync(0)
    await sound.playAsync()
  } catch (e) {
  }
}

// Вивантажити всі звуки
export async function unloadSounds() {
  await Promise.all(
    Object.values(soundCache).map(sound => sound?.unloadAsync())
  )
}

export const Sounds = {
  deal:      () => playSound('card_deal'),
  flip:      () => playSound('card_flip'),
  win:       () => playSound('win'),
  lose:      () => playSound('lose'),
  blackjack: () => playSound('blackjack'),
  chip:      () => playSound('chip'),
}