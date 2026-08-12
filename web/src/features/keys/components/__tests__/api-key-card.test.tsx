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
import { after, describe, test } from 'node:test'

import type { ColumnDef } from '@tanstack/react-table'
import { Window } from 'happy-dom'

import type { ApiKey } from '../../types'

const domWindow = new Window()
const domGlobals = [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'HTMLButtonElement',
  'SVGElement',
  'Node',
  'Element',
  'Event',
  'CustomEvent',
  'MutationObserver',
  'ResizeObserver',
  'PointerEvent',
  'MouseEvent',
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

const { act } = await import('react')
const { createRoot } = await import('react-dom/client')
const { flushSync } = await import('react-dom')
const tableModule = await import('@tanstack/react-table')
const { useReactTable, getCoreRowModel } = tableModule
const { createInstance } = await import('i18next')
const { I18nextProvider, initReactI18next } = await import('react-i18next')
const { Checkbox } = await import('@/components/ui/checkbox')

const { ApiKeyCardComponent } = await import('../api-key-card')

const i18n = createInstance()
await i18n.use(initReactI18next).init({
  lng: 'en',
  resources: {
    en: {
      translation: {
        Group: 'Group',
        Quota: 'Quota',
        Expires: 'Expires',
        'Last Used': 'Last Used',
      },
    },
  },
})

const keyFixture: ApiKey = {
  id: 1,
  name: 'Test Key',
  key: 'sk-test-1234',
  status: 1,
  remain_quota: 1000,
  used_quota: 500,
  unlimited_quota: false,
  expired_time: -1,
  created_time: 0,
  accessed_time: 0,
  group: 'default',
  auto_groups: null,
  cross_group_retry: false,
  model_limits_enabled: false,
  model_limits: '',
  allow_ips: '',
}

// Mirrors the production `select` column cell (api-keys-columns.tsx) so the
// card's checkbox is literally the table's selection control.
const columns: ColumnDef<ApiKey, unknown>[] = [
  {
    id: 'select',
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: 'name',
    cell: ({ row }) => <span>{String(row.getValue('name'))}</span>,
  },
]

function CardHarness() {
  const table = useReactTable({
    data: [keyFixture],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => String(row.id),
  })
  const row = table.getRowModel().rows[0]
  return <ApiKeyCardComponent row={row} isSelected={row.getIsSelected()} />
}

after(() => {
  document.body.innerHTML = ''
  domWindow.close()
})

describe('API key card selection', () => {
  test('reuses the table select cell and toggles row selection from the card', async () => {
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () =>
      root.render(
        <I18nextProvider i18n={i18n}>
          <CardHarness />
        </I18nextProvider>
      )
    )

    const card = container.querySelector<HTMLElement>('[data-slot="api-key-card"]')
    assert.ok(card, 'card wrapper should render')
    const checkbox = container.querySelector<HTMLElement>(
      '[data-slot="checkbox"]'
    )
    assert.ok(checkbox, 'card must render the table select checkbox')
    assert.equal(checkbox?.getAttribute('aria-label'), 'Select row')
    assert.equal(checkbox?.getAttribute('aria-checked'), 'false')

    // Unselected: no selected state is exposed.
    assert.equal(card?.getAttribute('data-state'), null)
    assert.equal(card?.hasAttribute('aria-selected'), false)

    // Clicking the card checkbox selects the row (same table state the bulk
    // actions bar reads). flushSync keeps the Base UI checkbox + table state
    // updates synchronous — plain `act` never settles in happy-dom for this
    // component chain.
    flushSync(() => checkbox?.click())

    assert.equal(checkbox?.getAttribute('aria-checked'), 'true')
    assert.equal(card?.getAttribute('data-state'), 'selected')

    // Legal ARIA: the card wrapper is a generic div, and `aria-selected` is
    // only defined for gridcell/option/row/tab roles — it must never be set
    // here. Selection is conveyed to assistive tech by the checkbox's
    // `aria-checked` and to sighted users by the selected ring/border.
    assert.equal(
      card?.hasAttribute('aria-selected'),
      false,
      'a generic div cannot legally carry aria-selected'
    )

    // Toggle off again.
    flushSync(() => checkbox?.click())
    assert.equal(checkbox?.getAttribute('aria-checked'), 'false')
    assert.equal(card?.getAttribute('data-state'), null)
    assert.equal(card?.hasAttribute('aria-selected'), false)

    await act(async () => root.unmount())
    container.remove()
  })
})
