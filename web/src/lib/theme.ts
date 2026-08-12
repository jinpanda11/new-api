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

export type Theme = 'dark' | 'light' | 'system'
export type ResolvedTheme = Exclude<Theme, 'system'>

export const DEFAULT_THEME: Theme = 'system'
export const THEME_COOKIE_NAME = 'vite-ui-theme'

const THEMES = new Set<Theme>(['dark', 'light', 'system'])
const THEME_COLORS: Record<ResolvedTheme, string> = {
  dark: '#0d0628',
  light: '#f6f4fa',
}

export function isTheme(value: unknown): value is Theme {
  return THEMES.has(value as Theme)
}

export function resolveInitialTheme(
  storedTheme: Theme | undefined,
  serverDefault: Theme | undefined
): Theme {
  if (storedTheme) return storedTheme
  if (serverDefault) return serverDefault
  return DEFAULT_THEME
}

export function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme !== 'system') return theme
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function applyThemeToDom(theme: Theme): ResolvedTheme {
  const resolvedTheme = resolveTheme(theme)
  const root = document.documentElement

  root.classList.remove('light', 'dark')
  root.classList.add(resolvedTheme)
  root.style.colorScheme = resolvedTheme

  document
    .querySelector("meta[name='theme-color']")
    ?.setAttribute('content', THEME_COLORS[resolvedTheme])

  return resolvedTheme
}
