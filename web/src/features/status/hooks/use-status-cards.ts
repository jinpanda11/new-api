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
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { getStatusPageCards } from '../api'

const MIN_REFRESH_SECONDS = 10
const DEFAULT_REFRESH_SECONDS = 60

/**
 * Shared polling logic for the status cards feed (`/api/status/cards`).
 * Used by both the standalone status page and any embedded panel (e.g.
 * the dashboard overview) so the refresh cadence stays consistent.
 */
export function useStatusCards() {
  const [countdown, setCountdown] = useState<number>(DEFAULT_REFRESH_SECONDS)

  const query = useQuery({
    queryKey: ['status-cards'],
    queryFn: getStatusPageCards,
    refetchOnWindowFocus: false,
    staleTime: 5_000,
  })

  const refreshSeconds = Math.max(
    MIN_REFRESH_SECONDS,
    query.data?.refresh_seconds ?? DEFAULT_REFRESH_SECONDS
  )

  // 每次成功拉取后，重置倒计时到 refreshSeconds
  useEffect(() => {
    if (query.data) {
      setCountdown(refreshSeconds)
    }
  }, [query.data, refreshSeconds])

  // 倒计时 tick + 到点触发 refetch，页面隐藏时暂停
  useEffect(() => {
    const tick = () => {
      if (
        typeof document !== 'undefined' &&
        document.visibilityState === 'hidden'
      ) {
        return
      }
      setCountdown((prev) => {
        if (prev <= 1) {
          void query.refetch()
          return refreshSeconds
        }
        return prev - 1
      })
    }
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [query, refreshSeconds])

  const enabled = query.data?.enabled ?? true
  const cards = query.data?.cards ?? []

  return { query, countdown, refreshSeconds, enabled, cards }
}
