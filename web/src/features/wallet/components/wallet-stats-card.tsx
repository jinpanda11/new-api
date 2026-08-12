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
import { Activity, BarChart3, WalletCards } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { TiltCard } from '@/components/tilt-card'
import { IconBadge, type IconBadgeTone } from '@/components/ui/icon-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatQuota } from '@/lib/format'

import type { UserWalletData } from '../types'

interface WalletStatsCardProps {
  user: UserWalletData | null
  loading?: boolean
}

export function WalletStatsCard(props: WalletStatsCardProps) {
  const { t } = useTranslation()
  if (props.loading) {
    return (
      <div className='grid grid-cols-3 divide-x rounded-lg border'>
        {['balance', 'usage', 'requests'].map((key) => (
          <div key={key} className='min-w-0 px-2.5 py-2.5 sm:px-5 sm:py-4'>
            <Skeleton className='h-3.5 w-full' />
            <Skeleton className='mt-2 h-6 w-full sm:h-7' />
            <Skeleton className='mt-1.5 hidden h-3.5 w-24 md:block' />
          </div>
        ))}
      </div>
    )
  }

  const stats: {
    label: string
    value: string
    description: string
    icon: typeof WalletCards
    tone: IconBadgeTone
  }[] = [
    {
      label: t('Current Balance'),
      value: formatQuota(props.user?.quota ?? 0),
      description: t('Remaining quota'),
      icon: WalletCards,
      tone: 'success',
    },
    {
      label: t('Total Usage'),
      value: formatQuota(props.user?.used_quota ?? 0),
      description: t('Total consumed quota'),
      icon: BarChart3,
      tone: 'info',
    },
    {
      label: t('API Requests'),
      value: (props.user?.request_count ?? 0).toLocaleString(),
      description: t('Total requests made'),
      icon: Activity,
      tone: 'chart-4',
    },
  ]

  const balance = stats[0]
  const secondary = stats.slice(1)

  return (
    <div className='grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]'>
      {/* Balance card — G3 hero glass, credit-card feel with a gentle
       * mouse tilt and soft glow field (neon-glass preset). */}
      <TiltCard className='min-w-0'>
        <div className='glass-g3 neon-border relative overflow-hidden rounded-2xl p-5 [--neon-border-fill:var(--glass-g3-bg)] [--wallet-balance-right-glow:var(--neon-yellow-soft)] sm:p-6 dark:[--neon-lime-soft:color-mix(in_oklch,var(--neon-violet)_28%,transparent)] dark:[--neon-lime:var(--neon-violet)] dark:[--wallet-balance-right-glow:color-mix(in_oklch,var(--neon-violet)_34%,transparent)]'>
          {/* Soft glow field behind the balance. */}
          <div
            aria-hidden
            className='pointer-events-none absolute inset-0'
            style={{
              background: [
                'radial-gradient(ellipse 70% 90% at 8% 20%, var(--neon-pink-soft) 0%, transparent 65%)',
                'radial-gradient(ellipse 60% 80% at 92% 90%, var(--wallet-balance-right-glow) 0%, transparent 62%)',
              ].join(', '),
            }}
          />
          <div className='relative flex min-h-[9rem] flex-col justify-between gap-4'>
            <div className='flex items-center justify-between gap-2'>
              <span className='text-muted-foreground text-[11px] font-bold tracking-[0.14em] uppercase'>
                {t('Available Balance')}
              </span>
              <span
                aria-hidden
                className='neon-status-dot neon-status-dot--breath'
              />
            </div>
            <div className='text-warning font-mono text-3xl font-bold tracking-tight break-all tabular-nums sm:text-4xl'>
              {balance.value}
            </div>
            <div className='flex flex-col gap-0.5'>
              <span className='text-muted-foreground/70 text-xs'>
                {balance.description}
              </span>
              <span className='text-muted-foreground/50 text-[11px]'>
                {t('Balance')} · {t('Remaining quota')}
              </span>
            </div>
          </div>
        </div>
      </TiltCard>

      {/* Usage/requests band — G2 glow glass. */}
      <div className='glass-g2 grid grid-cols-2 divide-x overflow-hidden rounded-2xl border'>
        {secondary.map((item) => (
          <div
            key={item.label}
            className='flex min-w-0 flex-col justify-between gap-3 px-4 py-5 sm:px-5'
          >
            <div className='flex items-center gap-1.5 sm:gap-2.5'>
              <IconBadge tone={item.tone} size='stat'>
                <item.icon />
              </IconBadge>
              <div className='text-muted-foreground truncate text-[11px] font-medium tracking-wider uppercase sm:text-xs'>
                {item.label}
              </div>
            </div>
            <div className='text-foreground font-mono text-lg font-bold tracking-tight break-all tabular-nums sm:text-2xl'>
              {item.value}
            </div>
            <div className='text-muted-foreground/60 hidden text-xs md:block'>
              {item.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
