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
import assert from 'node:assert/strict'
import { after, beforeEach, describe, test } from 'node:test'

import { Window } from 'happy-dom'

const domWindow = new Window()
const domGlobals = [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'HTMLDivElement',
  'Node',
  'Element',
  'Event',
  'CustomEvent',
  'MutationObserver',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'getComputedStyle',
] as const

for (const key of domGlobals) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: domWindow[key],
  })
}

const reactTestGlobals = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean
}
reactTestGlobals.IS_REACT_ACT_ENVIRONMENT = true

// Static media query control: system theme never flips mid-test. Returns a
// real happy-dom MediaQueryList (matches overridden) so the provider's
// listener registration keeps working.
const originalMatchMedia = domWindow.matchMedia.bind(domWindow)
Object.defineProperty(domWindow, 'matchMedia', {
  configurable: true,
  value: (query: string) => {
    const mql = originalMatchMedia(query)
    Object.defineProperty(mql, 'matches', {
      configurable: true,
      get: () => query === '(prefers-color-scheme: dark)',
    })
    return mql
  },
})

const { act } = await import('react')
const { createRoot } = await import('react-dom/client')

const { resolveInitialTheme } = await import('@/lib/theme')
const { ThemeProvider, useTheme } = await import('../theme-provider')

function resetThemeCookie(): void {
  // Note: happy-dom drops cookies carrying a `path` attribute; production
  // `setCookie` writes `path=/` which is fine in real browsers.
  document.cookie = 'vite-ui-theme=; max-age=0'
}

function Probe() {
  const { theme, resolvedTheme } = useTheme()
  return <div data-probe-theme={theme} data-probe-resolved={resolvedTheme} />
}

after(() => {
  document.body.innerHTML = ''
  domWindow.close()
})

describe('theme resolution priority (cookie > server default > system)', () => {
  test('a stored user cookie always wins over the server default', () => {
    assert.equal(resolveInitialTheme('light', 'dark'), 'light')
    assert.equal(resolveInitialTheme('system', 'dark'), 'system')
  })

  test('falls back to the server default only when no cookie exists', () => {
    assert.equal(resolveInitialTheme(undefined, 'dark'), 'dark')
    assert.equal(resolveInitialTheme(undefined, 'light'), 'light')
  })

  test('falls back to system when neither cookie nor server default exist', () => {
    assert.equal(resolveInitialTheme(undefined, undefined), 'system')
  })
})

describe('ThemeProvider boot behavior', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    resetThemeCookie()
    document.documentElement.classList.remove('light', 'dark')
  })

  test('applies the server default theme when the visitor has no cookie', async () => {
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () =>
      root.render(
        // The server default is passed down by the app bootstrap.
        <ThemeProvider defaultTheme='dark'>
          <Probe />
        </ThemeProvider>
      )
    )

    assert.equal(document.documentElement.classList.contains('dark'), true)
    assert.equal(document.documentElement.classList.contains('light'), false)
    assert.equal(
      container.querySelector('[data-probe-theme]')?.getAttribute('data-probe-theme'),
      'dark'
    )

    await act(async () => root.unmount())
    container.remove()
  })

  test('never overrides a stored user cookie with the server default', async () => {
    document.cookie = 'vite-ui-theme=light; max-age=31536000'

    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () =>
      root.render(
        <ThemeProvider defaultTheme='dark'>
          <Probe />
        </ThemeProvider>
      )
    )

    assert.equal(document.documentElement.classList.contains('light'), true)
    assert.equal(document.documentElement.classList.contains('dark'), false)

    await act(async () => root.unmount())
    container.remove()
  })

  test('does not fetch /api/status on mount (bootstrap prefills the server default)', async () => {
    let fetchCalls = 0
    Object.defineProperty(domWindow, 'fetch', {
      configurable: true,
      value: async () => {
        fetchCalls += 1
        return new domWindow.Response(JSON.stringify({ success: true, data: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    })

    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () =>
      root.render(
        <ThemeProvider defaultTheme='dark'>
          <Probe />
        </ThemeProvider>
      )
    )

    assert.equal(fetchCalls, 0, 'the provider must not re-request /api/status')
    assert.equal(document.documentElement.classList.contains('dark'), true)

    await act(async () => root.unmount())
    container.remove()
  })
})
