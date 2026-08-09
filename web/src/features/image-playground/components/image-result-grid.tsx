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
import { HugeiconsIcon } from '@hugeicons/react'
import { AlertCircleIcon, Download04Icon, ImageAdd01Icon } from '@hugeicons/core-free-icons'
import { useTranslation } from 'react-i18next'

import { Spinner } from '@/components/ui/spinner'

import type { ImageResultImage } from '../types'

interface ImageResultGridProps {
  images: ImageResultImage[]
  revisedPrompt: string | null
  isGenerating: boolean
  errorMessage: string | null
}

function downloadImage(src: string, filename: string) {
  const a = document.createElement('a')
  a.href = src
  a.download = filename
  a.rel = 'noopener'
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function ImageResultGrid({
  images,
  revisedPrompt,
  isGenerating,
  errorMessage,
}: ImageResultGridProps) {
  const { t } = useTranslation()

  if (isGenerating && images.length === 0) {
    return (
      <div className='text-muted-foreground flex h-full flex-col items-center justify-center gap-3 p-6'>
        <Spinner className='size-8' />
        <p className='text-sm'>{t('Generating…')}</p>
      </div>
    )
  }

  if (errorMessage && images.length === 0) {
    return (
      <div className='text-destructive flex h-full flex-col items-center justify-center gap-3 p-6 text-center'>
        <HugeiconsIcon icon={AlertCircleIcon} className='size-8' strokeWidth={2} />
        <p className='text-sm'>{errorMessage}</p>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className='text-muted-foreground flex h-full flex-col items-center justify-center gap-3 p-6 text-center'>
        <HugeiconsIcon icon={ImageAdd01Icon} className='size-10' strokeWidth={1.5} />
        <p className='text-sm'>
          {t('Enter a prompt on the left and click Generate to create images')}
        </p>
      </div>
    )
  }

  return (
    <div className='flex h-full flex-col gap-4 overflow-y-auto p-4'>
      {revisedPrompt ? (
        <div className='bg-muted/50 text-muted-foreground rounded-lg border p-3 text-xs'>
          <span className='font-medium'>{t('Revised prompt')}:</span>{' '}
          {revisedPrompt}
        </div>
      ) : null}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {images.map((img) => {
          const filename = `image-${Date.now()}-${img.src.slice(-8)}.png`
          return (
            <div
              key={img.src}
              className='group relative overflow-hidden rounded-lg border'
            >
              <img
                src={img.src}
                alt={img.revisedPrompt ?? 'generated image'}
                className='w-full object-contain'
                loading='lazy'
              />
              <button
                type='button'
                title={t('Download')}
                onClick={() => downloadImage(img.src, filename)}
                className='bg-background/80 hover:bg-background absolute top-2 right-2 flex size-8 items-center justify-center rounded-md opacity-0 shadow transition-opacity group-hover:opacity-100'
              >
                <HugeiconsIcon
                  icon={Download04Icon}
                  className='size-4'
                  strokeWidth={2}
                />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
