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
import { CherryStudio } from '@lobehub/icons'
import { Link } from '@tanstack/react-router'
import { ArrowRight, BookOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { TiltCard } from '@/components/tilt-card'
import { Button } from '@/components/ui/button'
import { useStatus } from '@/hooks/use-status'

import { HeroTerminalDemo } from '../hero-terminal-demo'

interface HeroProps {
  className?: string
  isAuthenticated?: boolean
}

// Stylized three-dots indicator representing "More"
const MoreIcon = () => (
  <svg
    className='text-muted-foreground/60 group-hover:text-foreground size-6 shrink-0 transition-colors'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <circle cx='6' cy='12' r='2' fill='currentColor' />
    <circle cx='12' cy='12' r='2' fill='currentColor' />
    <circle cx='18' cy='12' r='2' fill='currentColor' />
  </svg>
)

export function Hero(props: HeroProps) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const systemName = status?.system_name || 'New API'
  const docsUrl =
    (status?.docs_link as string | undefined) || 'https://docs.newapi.pro'

  const renderDocsButton = () => {
    const isExternal = docsUrl.startsWith('http')
    if (isExternal) {
      return (
        <Button
          variant='outline'
          className='group border-border/50 hover:border-border hover:bg-muted/50 inline-flex h-11 items-center gap-1.5 rounded-lg px-5 text-sm font-medium'
          render={
            <a href={docsUrl} target='_blank' rel='noopener noreferrer' />
          }
        >
          <BookOpen className='text-muted-foreground/80 group-hover:text-foreground size-4 transition-colors duration-200' />
          <span>{t('Docs')}</span>
        </Button>
      )
    }
    return (
      <Button
        variant='outline'
        className='group border-border/50 hover:border-border hover:bg-muted/50 inline-flex h-11 items-center gap-1.5 rounded-lg px-5 text-sm font-medium'
        render={<Link to={docsUrl} />}
      >
        <BookOpen className='text-muted-foreground/80 group-hover:text-foreground size-4 transition-colors duration-200' />
        <span>{t('Docs')}</span>
      </Button>
    )
  }

  return (
    <section className='relative z-10 overflow-hidden px-6 pt-16 pb-20 md:pt-24 md:pb-28 lg:pt-28'>
      {/* Oversized decorative outline words behind the stage (aria-hidden,
       * invisible outside the neon-glass preset). */}
      <span
        aria-hidden
        className='neon-outline-text neon-hero-outline neon-hero-outline--b'
      >
        Relay
      </span>

      {/* Hero-local glow field: pink top-left, lime bottom-right, yellow
       * bridging in the middle (see design doc §5.2). */}
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10'
        style={{
          background: [
            'radial-gradient(ellipse 46% 36% at 12% 10%, var(--neon-pink-soft) 0%, transparent 68%)',
            'radial-gradient(ellipse 40% 32% at 90% 22%, var(--neon-violet-soft) 0%, transparent 70%)',
            'radial-gradient(ellipse 34% 30% at 50% 78%, var(--neon-violet-soft) 0%, transparent 72%)',
          ].join(', '),
        }}
      />

      <div className='mx-auto flex max-w-5xl flex-col items-center text-center'>
        {/* Online signal badge, with the ROUTER background word sitting
         * right below it as its own layout row (no overlap with the
         * headline; hidden on mobile). */}
        <div className='mb-4'>
          <div
            className='landing-animate-fade-up inline-flex items-center gap-2 rounded-full border border-border/40 bg-muted/10 px-3.5 py-1.5 text-[11px] font-medium text-muted-foreground opacity-0 backdrop-blur-sm'
            style={{ animationDelay: '0ms' }}
          >
            <span aria-hidden className='neon-status-dot neon-status-dot--breath' />
            <span>{t('AI Application Infrastructure Foundation')}</span>
          </div>
          <span
            aria-hidden
            className='neon-outline-text neon-hero-outline--inline'
          >
            JPGAPI
          </span>
        </div>

        {/* Brand title — the product name is the H1, directly on the stage. */}
        <h1
          className='landing-animate-fade-up neon-hero-title text-4xl font-extrabold tracking-tight opacity-0 md:text-6xl'
          style={{ animationDelay: '60ms' }}
        >
          {systemName}
        </h1>

        {/* Subtitle */}
        <h2
          className='landing-animate-fade-up mt-5 text-lg font-semibold opacity-0 sm:text-xl md:text-2xl'
          style={{ animationDelay: '110ms' }}
        >
          {t('Unified API Gateway for')}{' '}
          <span className='neon-subtitle-gradient from-blue-400 via-violet-400 to-purple-500 bg-gradient-to-r bg-clip-text text-transparent'>
            {t('Vast Range of AI Models')}
          </span>
        </h2>

        <p
          className='landing-animate-fade-up text-muted-foreground/80 mt-5 max-w-xl text-base leading-relaxed opacity-0 md:text-[15px]'
          style={{ animationDelay: '160ms' }}
        >
          {t(
            'Access a vast selection of models via a standard, unified API protocol. Power AI applications, manage digital assets, and connect the Future.'
          )}
        </p>

        {/* Actions */}
        <div
          className='landing-animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-3 opacity-0'
          style={{ animationDelay: '210ms' }}
        >
          {props.isAuthenticated ? (
            <>
              <Button
                className='group h-11 rounded-lg px-5 text-sm font-medium'
                render={<Link to='/dashboard' />}
              >
                {t('Go to Dashboard')}
                <ArrowRight className='ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
              </Button>
              {renderDocsButton()}
            </>
          ) : (
            <>
              <Button
                className='group h-11 rounded-lg px-5 text-sm font-medium'
                render={<Link to='/sign-up' />}
              >
                {t('Get Started')}
                <ArrowRight className='ml-1.5 size-4 transition-transform duration-200 group-hover:translate-x-0.5' />
              </Button>
              <Button
                variant='outline'
                className='border-border/50 hover:border-border hover:bg-muted/50 h-11 rounded-lg px-5 text-sm font-medium'
                render={<Link to='/pricing' />}
              >
                {t('View Pricing')}
              </Button>
              {renderDocsButton()}
            </>
          )}
        </div>

        {/* Main visual: G3 glass terminal with a gentle mouse tilt. */}
        <TiltCard
          className='landing-animate-fade-up mt-14 w-full max-w-2xl opacity-0'
          style={{ animationDelay: '280ms' }}
        >
          <div className='glass-g3 neon-border rounded-2xl p-2 sm:p-2.5'>
            <HeroTerminalDemo />
          </div>
        </TiltCard>

        {/* Supported apps */}
        <div
          className='landing-animate-fade-up mt-12 w-full max-w-2xl opacity-0'
          style={{ animationDelay: '340ms' }}
        >
          <div className='mb-4 flex flex-col items-center gap-1'>
            <span className='text-muted-foreground/50 text-[10px] font-bold tracking-[0.15em] uppercase'>
              {t('Supported Applications')}
            </span>
            <p className='text-muted-foreground/60 text-xs leading-relaxed'>
              {t(
                'Supports one-click configuration and perfectly adapts to NewAPI multi-protocol configuration.'
              )}
            </p>
          </div>
          <div className='flex flex-wrap items-center justify-center gap-3'>
            {/* Cherry Studio */}
            <a
              href='https://cherry-ai.com'
              target='_blank'
              rel='noopener noreferrer'
              className='group border-border/40 bg-muted/15 text-foreground/80 hover:border-border hover:bg-muted/30 hover:text-foreground flex items-center gap-3 rounded-full border px-5 py-2.5 text-sm font-medium shadow-[0_1px_2.5px_rgba(0,0,0,0.01)] backdrop-blur-xs transition-all duration-300 hover:scale-[1.02]'
            >
              <CherryStudio.Color size={24} className='shrink-0' />
              <span>Cherry Studio</span>
            </a>

            {/* CC Switch */}
            <a
              href='https://ccswitch.io'
              target='_blank'
              rel='noopener noreferrer'
              className='group border-border/40 bg-muted/15 text-foreground/80 hover:border-border hover:bg-muted/30 hover:text-foreground flex items-center gap-3 rounded-full border px-5 py-2.5 text-sm font-medium shadow-[0_1px_2.5px_rgba(0,0,0,0.01)] backdrop-blur-xs transition-all duration-300 hover:scale-[1.02]'
            >
              <img
                src='https://ccswitch.io/favicon.png'
                alt='CC Switch'
                className='size-6 shrink-0 rounded-md object-contain'
                onError={(e) => {
                  // Fallback to a styled text avatar if the remote favicon fails to load in sandbox or local environments
                  e.currentTarget.style.display = 'none'
                  const fallback = e.currentTarget.nextSibling as HTMLElement
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
              <span
                style={{ display: 'none' }}
                className='size-6 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-[10px] font-bold text-blue-600 dark:bg-blue-400/10 dark:text-blue-400'
              >
                CC
              </span>
              <span>CC Switch</span>
            </a>

            {/* "更多" */}
            <div className='group border-border/40 bg-muted/15 text-foreground/55 hover:border-border hover:bg-muted/30 hover:text-foreground flex cursor-default items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm font-medium shadow-[0_1px_2.5px_rgba(0,0,0,0.01)] backdrop-blur-xs transition-all duration-300 hover:scale-[1.02]'>
              <MoreIcon />
              <span>{t('More Apps')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
