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
import type { ImageHistoryItem } from '../types'

const DB_NAME = 'image_playground'
const DB_VERSION = 1
const STORE = 'history'
const INDEX_CREATED_AT = 'createdAt'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available'))
  }
  if (dbPromise) return dbPromise
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' })
        store.createIndex(INDEX_CREATED_AT, 'createdAt')
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () =>
      reject(req.error ?? new Error('Failed to open IndexedDB'))
    req.onblocked = () => reject(new Error('IndexedDB open blocked'))
  })
  // Reset the cached promise on failure so subsequent calls retry.
  dbPromise.catch(() => {
    dbPromise = null
  })
  return dbPromise
}

export async function historyList(): Promise<ImageHistoryItem[]> {
  const db = await openDb()
  return new Promise<ImageHistoryItem[]>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const store = tx.objectStore(STORE)
    const idx = store.index(INDEX_CREATED_AT)
    const items: ImageHistoryItem[] = []
    const cursorReq = idx.openCursor(null, 'prev')
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result
      if (!cursor) return
      items.push(cursor.value as ImageHistoryItem)
      cursor.continue()
    }
    tx.oncomplete = () => resolve(items)
    tx.onerror = () => reject(tx.error ?? new Error('History read failed'))
    tx.onabort = () => reject(tx.error ?? new Error('History read aborted'))
  })
}

export async function historyPut(item: ImageHistoryItem): Promise<void> {
  const db = await openDb()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(item)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('History write failed'))
    tx.onabort = () => reject(tx.error ?? new Error('History write aborted'))
  })
}

export async function historyTrimTo(maxCount: number): Promise<void> {
  if (maxCount < 0) return
  const db = await openDb()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const store = tx.objectStore(STORE)
    const idx = store.index(INDEX_CREATED_AT)
    let seen = 0
    const cursorReq = idx.openCursor(null, 'prev')
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result
      if (!cursor) return
      seen++
      if (seen > maxCount) {
        cursor.delete()
      }
      cursor.continue()
    }
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('History trim failed'))
    tx.onabort = () => reject(tx.error ?? new Error('History trim aborted'))
  })
}

export async function historyClear(): Promise<void> {
  const db = await openDb()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('History clear failed'))
    tx.onabort = () => reject(tx.error ?? new Error('History clear aborted'))
  })
}
