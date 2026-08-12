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
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { AxiosError } from 'axios'
import i18next from 'i18next'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { toast } from 'sonner'

import {
  applyDefaultInterfaceLanguage,
  applyUserInterfaceLanguage,
} from '@/i18n/language-state'
import { getStatus } from '@/lib/api'
import { getCookie } from '@/lib/cookies'
import { installBuildMetadata } from '@/lib/build-metadata'
import {
  applyThemeToDom,
  isTheme,
  resolveInitialTheme,
  THEME_COOKIE_NAME,
} from '@/lib/theme'
import { useAuthStore } from '@/stores/auth-store'
import { applyFaviconToDom } from '@/lib/dom-utils'
import '@/lib/dayjs'
import { initializeFrontendCache } from '@/lib/frontend-cache'
import { handleServerError } from '@/lib/handle-server-error'
import { mapStatusDataToConfig } from '@/hooks/use-system-config'
import { useSystemConfigStore } from '@/stores/system-config-store'

import { DirectionProvider } from './context/direction-provider'
import { FontProvider } from './context/font-provider'
import { ThemeProvider } from './context/theme-provider'
import './i18n/config'
// Generated Routes
import { routeTree } from './routeTree.gen'

// Styles
import './styles/index.css'

// Ensure VChart theme is initialized before any chart mounts (prevents white default theme flash)
// VChart theme is driven by our ThemeProvider (html.light/html.dark) via per-chart `theme` prop.
initializeFrontendCache()
installBuildMetadata()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // eslint-disable-next-line no-console
        if (import.meta.env.DEV) console.log({ failureCount, error })

        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false

        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      // Keep focused tabs from silently re-running heavy pages like logs.
      refetchOnWindowFocus: false,
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)

        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast.error(i18next.t('Content not modified!'))
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 500) {
          toast.error(i18next.t('Internal Server Error!'))
          router.navigate({ to: '/500' })
        }
      }
    },
  }),
})

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function applySystemBranding(status: Record<string, unknown>): void {
  if (typeof status.system_name === 'string' && status.system_name) {
    document.title = status.system_name
    document
      .querySelector('meta[name="title"]')
      ?.setAttribute('content', status.system_name)
  }
  if (typeof status.logo === 'string' && status.logo) {
    applyFaviconToDom(status.logo)
  }
}

async function initializeInterfaceLanguage(): Promise<
  Record<string, unknown> | undefined
> {
  try {
    const cachedStatus = window.localStorage.getItem('status')
    if (cachedStatus) {
      applySystemBranding(JSON.parse(cachedStatus) as Record<string, unknown>)
    }
  } catch {
    /* empty */
  }

  try {
    const status = await getStatus()
    applySystemBranding(status)
    try {
      window.localStorage.setItem('status', JSON.stringify(status))
    } catch {
      /* empty */
    }
    // Populate the system config store from the same boot request so
    // `useSystemConfig` consumers see real branding/currency on the first
    // render instead of defaults (the `useStatus` query is prefilled below,
    // so its queryFn — which used to perform this sync — is not re-run).
    try {
      useSystemConfigStore.getState().setConfig(mapStatusDataToConfig(status))
    } catch {
      /* empty */
    }
    await applyDefaultInterfaceLanguage(
      typeof status.interface_language === 'string'
        ? status.interface_language
        : undefined
    )
    await applyUserInterfaceLanguage(useAuthStore.getState().auth.user)
    return status
  } catch {
    // Keep the English fallback when the public status endpoint is unavailable.
  }

  await applyUserInterfaceLanguage(useAuthStore.getState().auth.user)
  return undefined
}

async function renderApp(): Promise<void> {
  const status = await initializeInterfaceLanguage()

  // Resolve the first-render theme once, from the same boot status request.
  const storedTheme = getCookie(THEME_COOKIE_NAME)
  const serverDefaultTheme = isTheme(status?.default_theme)
    ? status.default_theme
    : undefined
  applyThemeToDom(
    resolveInitialTheme(
      isTheme(storedTheme) ? storedTheme : undefined,
      serverDefaultTheme
    )
  )

  // Prefill the shared status query so `useStatus` and friends never issue
  // a second /api/status request for the same state.
  if (status) {
    queryClient.setQueryData(['status'], status)
  }

  const rootElement = document.querySelector<HTMLElement>('#root')
  if (!rootElement) {
    throw new Error('Root element not found')
  }

  if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme={serverDefaultTheme}>
            <FontProvider>
              <DirectionProvider>
                <RouterProvider router={router} />
              </DirectionProvider>
            </FontProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </StrictMode>
    )
  }
}

void renderApp()
