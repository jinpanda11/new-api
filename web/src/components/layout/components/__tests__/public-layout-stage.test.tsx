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
import { describe, test } from 'node:test'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { createInstance } from 'i18next'
import { renderToStaticMarkup } from 'react-dom/server'
import { I18nextProvider, initReactI18next } from 'react-i18next'

import { PublicLayout } from '../public-layout'

const hiddenHeaderProps = {
  showAuthButtons: false,
  showLanguageSwitcher: false,
  showNotifications: false,
  showThemeSwitch: false,
}

const i18n = createInstance()
await i18n.use(initReactI18next).init({
  lng: 'en',
  resources: { en: { translation: {} } },
})

async function renderLayout(revealNeonStage: boolean): Promise<string> {
  const rootRoute = createRootRoute()
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => (
      <PublicLayout
        headerProps={hiddenHeaderProps}
        revealNeonStage={revealNeonStage}
      >
        content
      </PublicLayout>
    ),
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  const queryClient = new QueryClient({
    defaultOptions: { queries: { enabled: false, retry: false } },
  })

  await router.load()

  return renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <RouterProvider router={router} />
      </I18nextProvider>
    </QueryClientProvider>
  )
}

describe('PublicLayout neon stage background', () => {
  test('exposes the stage only when the page explicitly opts in', async () => {
    const defaultMarkup = await renderLayout(false)
    const stageMarkup = await renderLayout(true)

    assert.equal(defaultMarkup.includes('data-reveal-neon-stage'), false)
    assert.equal(
      stageMarkup.includes('data-reveal-neon-stage="true"'),
      true
    )
  })
})
