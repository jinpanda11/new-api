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
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

import { TiltCard } from '@/components/tilt-card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSystemConfig } from '@/hooks/use-system-config'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  const { systemName, logo, loading } = useSystemConfig()

  return (
    <div className='relative grid h-svh max-w-none overflow-hidden'>
      {/* Oversized decorative "ACCESS" outline word behind the glass card
       * (aria-hidden, invisible outside the neon-glass preset). */}
      <span
        aria-hidden
        className='neon-outline-text pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(4rem,14vw,12rem)] whitespace-nowrap'
      >
        Access
      </span>

      {/* Auth-local glow fields: pink top-left, lime bottom-right. */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0'
        style={{
          background: [
            'radial-gradient(ellipse 42% 34% at 10% 8%, var(--neon-pink-soft) 0%, transparent 70%)',
            'radial-gradient(ellipse 40% 32% at 92% 88%, var(--neon-violet-soft) 0%, transparent 72%)',
          ].join(', '),
        }}
      />

      <Link
        to='/'
        className='absolute top-4 left-4 z-10 flex items-center gap-2 transition-opacity hover:opacity-80 sm:top-8 sm:left-8'
      >
        <div className='relative h-8 w-8'>
          {loading ? (
            <Skeleton className='absolute inset-0 rounded-full' />
          ) : (
            <img
              src={logo}
              alt={t('Logo')}
              className='h-8 w-8 rounded-full object-cover'
            />
          )}
        </div>
        {loading ? (
          <Skeleton className='h-6 w-24' />
        ) : (
          <h1 className='text-xl font-medium'>{systemName}</h1>
        )}
        {/* Live signal light — breathes a lime glow under neon-glass. */}
        <span aria-hidden className='neon-brand-pulse' />
      </Link>

      <div className='container flex items-center pt-16 sm:pt-0'>
        {/* Gentle mouse tilt on the glass card (design doc §22.4). */}
        <TiltCard className='mx-auto w-full sm:w-[480px]'>
          <div className='glass-g3 neon-border flex w-full flex-col justify-center space-y-2 rounded-2xl px-5 py-8 sm:px-8 sm:py-10'>
            {children}
          </div>
        </TiltCard>
      </div>
    </div>
  )
}
