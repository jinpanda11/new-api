/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import i18n from './config'
import { normalizeInterfaceLanguage } from './languages'

import { useSystemConfigStore } from '@/stores/system-config-store'

type LanguageUser = {
  language?: unknown
  setting?: unknown
}

function getSavedLanguage(user?: LanguageUser | null): string | undefined {
  if (!user) return undefined
  if (typeof user.language === 'string') return user.language

  if (user.setting && typeof user.setting === 'object') {
    const setting = user.setting as { language?: unknown }
    return typeof setting.language === 'string' ? setting.language : undefined
  }

  if (typeof user.setting !== 'string') return undefined

  try {
    const setting = JSON.parse(user.setting) as { language?: unknown }
    return typeof setting.language === 'string' ? setting.language : undefined
  } catch {
    return undefined
  }
}

function isInterfaceLanguage(value: string | undefined): value is string {
  return Boolean(value && normalizeInterfaceLanguage(value) === value)
}

export function getDefaultInterfaceLanguage(): string {
  return normalizeInterfaceLanguage(
    useSystemConfigStore.getState().config.interfaceLanguage
  )
}

export async function applyDefaultInterfaceLanguage(
  language?: string | null
): Promise<void> {
  const nextLanguage = normalizeInterfaceLanguage(language)
  useSystemConfigStore.getState().setConfig({ interfaceLanguage: nextLanguage })
  if (i18n.language !== nextLanguage) {
    await i18n.changeLanguage(nextLanguage)
  }
}

export async function applyUserInterfaceLanguage(
  user?: LanguageUser | null
): Promise<void> {
  const savedLanguage = getSavedLanguage(user)
  const nextLanguage = isInterfaceLanguage(savedLanguage)
    ? savedLanguage
    : getDefaultInterfaceLanguage()
  if (i18n.language !== nextLanguage) {
    await i18n.changeLanguage(nextLanguage)
  }
}
