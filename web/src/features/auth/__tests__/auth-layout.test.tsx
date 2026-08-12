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
  'matchMedia',
  'Image',
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

// happy-dom has no scrollTo; the router's scroll restoration calls it as a
// bare global during match effects.
if (typeof scrollTo === 'undefined') {
  Object.defineProperty(globalThis, 'scrollTo', {
    configurable: true,
    value: () => undefined,
  })
}

const reactTestGlobals = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean
}
reactTestGlobals.IS_REACT_ACT_ENVIRONMENT = true

// Static media query control (no viewport-dependent surprises). Returns a
// real happy-dom MediaQueryList with `matches` pinned to false.
const originalMatchMedia = domWindow.matchMedia.bind(domWindow)
Object.defineProperty(domWindow, 'matchMedia', {
  configurable: true,
  value: (query: string) => {
    const mql = originalMatchMedia(query)
    Object.defineProperty(mql, 'matches', {
      configurable: true,
      get: () => false,
    })
    return mql
  },
})

const { act } = await import('react')
const { createRoot } = await import('react-dom/client')
const routerModule = await import('@tanstack/react-router')
const {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
} = routerModule
const { createInstance } = await import('i18next')
const { I18nextProvider, initReactI18next } = await import('react-i18next')

const { AuthLayout } = await import('../auth-layout')
const { useSystemConfigStore } = await import('@/stores/system-config-store')

const i18n = createInstance()
await i18n.use(initReactI18next).init({
  lng: 'en',
  resources: { en: { translation: { Logo: 'Logo' } } },
})

const rootRoute = createRootRoute()
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <div>home</div>,
})
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sign-up',
  component: () => (
    <AuthLayout>
      <div data-testid='auth-form'>sign-up form</div>
    </AuthLayout>
  ),
})
// Memory history: under bun the router-core `isServer` split resolves to the
// server build, so an explicit history keeps the router fully client-side.
const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, authRoute]),
  history: createMemoryHistory({ initialEntries: ['/sign-up'] }),
  defaultNotFoundComponent: () => <div>not found</div>,
})
await router.load()

after(() => {
  document.body.innerHTML = ''
  domWindow.close()
})

describe('AuthLayout short-viewport scrolling', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    // Pre-populate branding so the layout renders its real (non-skeleton)
    // content — explicit fixture state, no network involved.
    useSystemConfigStore.getState().setConfig({
      systemName: 'My Gateway',
      logo: 'https://example.com/logo.png',
    })
    useSystemConfigStore.getState().setLoading(false)
  })

  test('root container allows vertical scrolling when the form is taller than the viewport', async () => {
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () =>
      root.render(
        <I18nextProvider i18n={i18n}>
          <RouterProvider router={router} />
        </I18nextProvider>
      )
    )

    // The scroll contract: the root must never pin the page to the viewport
    // height nor clip its overflow (P0 regression: `h-svh overflow-hidden`
    // made short-viewport auth pages unscrollable).
    const layoutRoot = container.querySelector('.grid.min-h-svh')
    assert.ok(layoutRoot, 'auth root should size to at least the viewport')
    assert.equal(
      layoutRoot.getAttribute('data-reveal-neon-stage'),
      'true',
      'auth pages should reveal the shared neon stage'
    )
    assert.equal(
      layoutRoot?.classList.contains('h-svh'),
      false,
      'fixed viewport height would clip the form'
    )
    assert.equal(
      layoutRoot?.classList.contains('overflow-hidden'),
      false,
      'overflow clip would block the only scroll path'
    )

    // The content row carries mobile top clearance (logo) and bottom
    // padding so the last control stays reachable when the page scrolls.
    const contentRow = container.querySelector('.grid.min-h-svh > .container')
    assert.ok(contentRow, 'auth content container should render')
    assert.equal(contentRow?.classList.contains('pb-8'), true)
    assert.equal(contentRow?.classList.contains('pt-16'), true)

    // The form itself is present and would grow the page height.
    assert.ok(
      container.querySelector('[data-testid="auth-form"]'),
      'form content should render inside the scrollable layout'
    )

    await act(async () => root.unmount())
    container.remove()
  })
})
