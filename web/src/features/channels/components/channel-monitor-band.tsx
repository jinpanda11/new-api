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
import { useTranslation } from 'react-i18next'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { CHANNEL_STATUS } from '../constants'
import type { Channel } from '../types'

interface ChannelMonitorBandProps {
  channels: Channel[]
  loading?: boolean
}

type BandItem = {
  label: string
  value: string
  dot?: 'lime' | 'yellow' | 'red' | 'cyan'
}

/**
 * Channel monitor band — the G2 glass strip above the channels table
 * summarizing healthy / degraded channels and average latency for the
 * current view (design doc §14.1).
 */
export function ChannelMonitorBand({
  channels,
  loading,
}: ChannelMonitorBandProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className='glass-g2 flex items-center gap-6 rounded-xl border px-4 py-3'>
        {[1, 2, 3, 4].map((key) => (
          <div key={key} className='flex flex-col gap-1'>
            <Skeleton className='h-3 w-16' />
            <Skeleton className='h-5 w-12' />
          </div>
        ))}
      </div>
    )
  }

  const healthy = channels.filter(
    (c) => c.status === CHANNEL_STATUS.ENABLED
  ).length
  const degraded = channels.length - healthy
  const latencies = channels
    .map((c) => Number(c.response_time))
    .filter((v) => Number.isFinite(v) && v > 0)
  const avgLatency =
    latencies.length > 0
      ? `${Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)}ms`
      : '—'

  const items: BandItem[] = [
    {
      label: t('Channels'),
      value: String(channels.length),
      dot: 'cyan',
    },
    { label: t('Healthy'), value: String(healthy), dot: 'lime' },
    {
      label: t('Degraded'),
      value: String(degraded),
      dot: degraded > 0 ? 'red' : 'lime',
    },
    { label: t('Avg. Latency'), value: avgLatency, dot: 'yellow' },
  ]

  return (
    <div
      className={cn(
        'glass-g2 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border px-4 py-3',
        degraded > 0 && 'neon-band-alert'
      )}
    >
      {items.map((item) => (
        <div key={item.label} className='flex min-w-0 flex-col gap-0.5'>
          <span className='text-muted-foreground text-[10px] font-medium tracking-wider uppercase'>
            {item.label}
          </span>
          <span className='flex items-center gap-1.5 font-mono text-base font-semibold tabular-nums'>
            {item.dot && (
              <span
                aria-hidden
                className={cn(
                  'neon-status-dot',
                  item.dot === 'lime' && 'neon-status-dot--breath',
                  item.dot === 'yellow' && 'neon-status-dot--yellow',
                  item.dot === 'red' && 'neon-status-dot--red',
                  item.dot === 'cyan' && 'neon-status-dot--cyan'
                )}
              />
            )}
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}
