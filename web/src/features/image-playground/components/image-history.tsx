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
import { Download04Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'

import { buildImageFilename, downloadImage, downloadImages } from '../lib/download'
import type { ImageHistoryItem } from '../types'

interface ImageHistoryProps {
  history: ImageHistoryItem[]
  onClear: () => void
  onSelect: (item: ImageHistoryItem) => void
}

function formatTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return ''
  }
}

export function ImageHistory({ history, onClear, onSelect }: ImageHistoryProps) {
  const { t } = useTranslation()

  if (history.length === 0) {
    return (
      <div className='text-muted-foreground p-4 text-center text-xs'>
        {t('No history yet')}
      </div>
    )
  }

  return (
    <div className='flex h-full flex-col'>
      <div className='flex items-center justify-between border-b px-3 py-2'>
        <h3 className='text-sm font-medium'>{t('History')}</h3>
        <Button variant='ghost' size='sm' onClick={onClear}>
          {t('Clear')}
        </Button>
      </div>
      <div className='flex-1 overflow-y-auto p-2'>
        <ul className='space-y-2'>
          {history.map((item) => {
            const downloadable = item.images.length > 0
            const downloadLabel =
              item.images.length > 1
                ? t('Download all')
                : t('Download')
            return (
              <li key={item.id}>
                <div
                  role='button'
                  tabIndex={0}
                  onClick={() => onSelect(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelect(item)
                    }
                  }}
                  className='hover:bg-muted group relative flex w-full cursor-pointer gap-2 rounded-md border p-2 text-left transition-colors'
                >
                  <div className='bg-muted h-12 w-12 flex-shrink-0 overflow-hidden rounded'>
                    {item.images[0] ? (
                      <img
                        src={item.images[0].src}
                        alt=''
                        className='h-full w-full object-cover'
                        loading='lazy'
                      />
                    ) : null}
                  </div>
                  <div className='min-w-0 flex-1 pr-8'>
                    <p className='truncate text-xs font-medium'>{item.prompt}</p>
                    <p className='text-muted-foreground mt-0.5 text-[10px]'>
                      {item.model} · {item.size} · n={item.n}
                    </p>
                    <p className='text-muted-foreground text-[10px]'>
                      {formatTime(item.createdAt)}
                    </p>
                  </div>
                  {downloadable ? (
                    <button
                      type='button'
                      title={downloadLabel}
                      aria-label={downloadLabel}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (item.images.length === 1) {
                          const img = item.images[0]
                          downloadImage(img.src, buildImageFilename(img.src))
                        } else {
                          downloadImages(item.images)
                        }
                      }}
                      className='bg-background/80 hover:bg-background absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-md opacity-0 shadow transition-opacity group-hover:opacity-100 focus:opacity-100'
                    >
                      <HugeiconsIcon
                        icon={Download04Icon}
                        className='size-3.5'
                        strokeWidth={2}
                      />
                    </button>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
