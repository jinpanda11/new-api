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
import { DEFAULT_CONFIG, MAX_HISTORY_ITEMS, STORAGE_KEYS } from '../constants'
import type { ImageHistoryItem, ImagePlaygroundConfig } from '../types'
import type { ImagePlaygroundAdminConfig } from './admin-config'
import {
  historyClear as dbHistoryClear,
  historyList as dbHistoryList,
  historyPut as dbHistoryPut,
  historyTrimTo as dbHistoryTrimTo,
} from './history-db'

export function loadConfig(): Partial<ImagePlaygroundConfig> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<ImagePlaygroundConfig>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function saveConfig(config: ImagePlaygroundConfig): void {
  try {
    const { prompt: _prompt, ...persistable } = config
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(persistable))
  } catch {
    /* no-op */
  }
}

export function mergeStoredConfig(
  stored: Partial<ImagePlaygroundConfig>,
  admin?: ImagePlaygroundAdminConfig | null
): ImagePlaygroundConfig {
  const adminOverrides: Partial<ImagePlaygroundConfig> = {}
  if (admin?.defaultSize) adminOverrides.size = admin.defaultSize
  if (admin?.defaultModel) adminOverrides.model = admin.defaultModel
  return { ...DEFAULT_CONFIG, ...adminOverrides, ...stored, prompt: '' }
}

let legacyMigrationPromise: Promise<void> | null = null

async function migrateLegacyHistoryOnce(): Promise<void> {
  if (legacyMigrationPromise) return legacyMigrationPromise
  legacyMigrationPromise = (async () => {
    if (typeof localStorage === 'undefined') return
    let raw: string | null
    try {
      raw = localStorage.getItem(STORAGE_KEYS.HISTORY)
    } catch {
      return
    }
    if (!raw) return
    try {
      const parsed = JSON.parse(raw) as ImageHistoryItem[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        for (const item of parsed.slice(0, MAX_HISTORY_ITEMS)) {
          try {
            await dbHistoryPut(item)
          } catch {
            /* per-item migration failures are non-fatal */
          }
        }
      }
    } catch {
      /* malformed legacy payload — drop it */
    }
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY)
    } catch {
      /* ignore — worst case, migration runs again next session as no-op */
    }
  })()
  return legacyMigrationPromise
}

export async function loadHistory(): Promise<ImageHistoryItem[]> {
  try {
    await migrateLegacyHistoryOnce()
    const items = await dbHistoryList()
    return items.slice(0, MAX_HISTORY_ITEMS)
  } catch {
    return []
  }
}

export async function saveHistoryItem(
  item: ImageHistoryItem,
  maxItems: number = MAX_HISTORY_ITEMS
): Promise<void> {
  try {
    await dbHistoryPut(item)
    await dbHistoryTrimTo(maxItems)
  } catch {
    /* no-op — persistence is best-effort */
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await dbHistoryClear()
  } catch {
    /* no-op */
  }
}
