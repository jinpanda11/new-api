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
import { flexRender, type Row } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import type { ApiKey } from '../types'

/**
 * API Key glass identity card — the credit-card-style card view of the
 * keys page (neon-glass preset). Reuses the table column cells so key
 * masking, copy and status badges behave identically to the table.
 */
export function ApiKeyCardComponent({
  row,
  isSelected,
}: {
  row: Row<ApiKey>
  isSelected: boolean
}) {
  const { t } = useTranslation()
  const cells = row.getAllCells()

  const renderCell = (id: string) => {
    const cell = cells.find((c) => c.column.id === id)
    if (!cell || !cell.column.columnDef.cell) {
      return null
    }
    return flexRender(cell.column.columnDef.cell, cell.getContext())
  }

  const footerLabels: { id: string; label: string }[] = [
    { id: 'group', label: t('Group') },
    { id: 'quota', label: t('Quota') },
    { id: 'expired_time', label: t('Expires') },
    { id: 'accessed_time', label: t('Last Used') },
  ]

  const selectCell = renderCell('select')
  const nameCell = renderCell('name')
  const statusCell = renderCell('status')
  const actionsCell = renderCell('actions')
  const keyCell = renderCell('key')

  return (
    <div
      data-slot='api-key-card'
      data-state={isSelected ? 'selected' : undefined}
      // Note: no `aria-selected` here — the wrapper is a generic div, and
      // `aria-selected` is only defined for gridcell/option/row/tab roles.
      // Selection is conveyed via the select cell's checkbox (aria-checked).
      className='h-full'
    >
      <div
        className={cn(
          'glass-g1 glass-shine group/card relative flex h-full flex-col gap-3 overflow-hidden rounded-xl p-4 transition-transform duration-300 hover:-translate-y-1',
          isSelected &&
            'border-primary/60 ring-1 ring-primary/40 ring-inset'
        )}
      >
        {/* Row 1: select + name, then status + actions. The select cell is
         * the same checkbox column the table renders, so card and table
         * selection stay fully equivalent (incl. keyboard/Space). */}
        <div className='flex items-start justify-between gap-2'>
          <div className='flex min-w-0 items-center gap-1'>
            {selectCell ? <div className='shrink-0'>{selectCell}</div> : null}
            <div className='min-w-0 flex-1'>{nameCell}</div>
          </div>
          <div className='flex shrink-0 items-center gap-1.5'>
            {statusCell}
            {actionsCell}
          </div>
        </div>

        {/* Key slot — mono, wide tracking like a card number */}
        <div className='border-border/50 bg-background/40 rounded-lg border px-3 py-2.5 font-mono text-sm tracking-[0.06em] [&_button:first-child]:max-w-full [&_button:first-child]:truncate [&_button:first-child]:px-0'>
          {keyCell}
        </div>

        {/* Footer: group / quota / expiry / last used */}
        <div className='mt-auto grid grid-cols-2 gap-x-3 gap-y-2'>
          {footerLabels.map(({ id, label }) => (
            <div key={id} className='min-w-0'>
              <div className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
                {label}
              </div>
              <div className='text-foreground/90 mt-0.5 truncate text-xs tabular-nums'>
                {renderCell(id)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
