import type { AppSettings } from "../types"

const SETTINGS_KEY = "buildpos_settings"

const defaultSettings: AppSettings = {
  theme: "dark",
  telegramNotifications: true,
  reminderDays: 1,
}

export const SettingsUtils = {
  getSettings: (): AppSettings => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY)
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings
    } catch (error) {
      console.error("Settings yuklanmadi:", error)
      return defaultSettings
    }
  },

  saveSettings: (settings: AppSettings): void => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error("Settings saqlanmadi:", error)
      throw error
    }
  },

  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]): void => {
    try {
      const settings = SettingsUtils.getSettings()
      settings[key] = value
      SettingsUtils.saveSettings(settings)
    } catch (error) {
      console.error("Setting yangilanmadi:", error)
      throw error
    }
  },
}
