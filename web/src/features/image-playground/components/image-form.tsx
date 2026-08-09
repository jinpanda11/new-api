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
import { useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import {
  IMAGE_QUALITY_OPTIONS,
  IMAGE_RESPONSE_FORMAT_OPTIONS,
  IMAGE_STYLE_OPTIONS,
  MAX_IMAGES_PER_REQUEST,
} from '../constants'
import type { ImageSizeOption } from '../lib/admin-config'
import type {
  GroupOption,
  ImagePlaygroundConfig,
  ImageResponseFormat,
  ModelOption,
} from '../types'

interface ImageFormProps {
  config: ImagePlaygroundConfig
  updateConfig: <K extends keyof ImagePlaygroundConfig>(
    key: K,
    value: ImagePlaygroundConfig[K]
  ) => void
  models: ModelOption[]
  groups: GroupOption[]
  isLoadingModels: boolean
  referenceImages: File[]
  setReferenceImages: (files: File[]) => void
  isGenerating: boolean
  onSubmit: () => void
  onCancel: () => void
  sizeOptions: ImageSizeOption[]
}

export function ImageForm({
  config,
  updateConfig,
  models,
  groups,
  isLoadingModels,
  referenceImages,
  setReferenceImages,
  isGenerating,
  onSubmit,
  onCancel,
  sizeOptions,
}: ImageFormProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const nOptions = useMemo(() => {
    const items: { label: string; value: string }[] = []
    for (let i = 1; i <= MAX_IMAGES_PER_REQUEST; i++) {
      items.push({ label: String(i), value: String(i) })
    }
    return items
  }, [])

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (!files) return
      const arr = [...files].slice(0, MAX_IMAGES_PER_REQUEST)
      setReferenceImages(arr)
      event.target.value = ''
    },
    [setReferenceImages]
  )

  const removeReference = useCallback(
    (index: number) => {
      const next = referenceImages.filter((_, i) => i !== index)
      setReferenceImages(next)
    },
    [referenceImages, setReferenceImages]
  )

  const previewUrls = useMemo(
    () => referenceImages.map((file) => URL.createObjectURL(file)),
    [referenceImages]
  )

  return (
    <div className='flex h-full flex-col gap-4 overflow-y-auto p-4'>
      <div className='flex rounded-lg border p-1'>
        <button
          type='button'
          className={`flex-1 rounded-md px-3 py-1.5 text-sm transition-colors ${
            config.mode === 'generate'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => updateConfig('mode', 'generate')}
        >
          {t('Text to Image')}
        </button>
        <button
          type='button'
          className={`flex-1 rounded-md px-3 py-1.5 text-sm transition-colors ${
            config.mode === 'edit'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => updateConfig('mode', 'edit')}
        >
          {t('Image Edit')}
        </button>
      </div>

      <div className='grid gap-2'>
        <Label htmlFor='image-model'>{t('Model')}</Label>
        <Select
          value={config.model}
          onValueChange={(value) => updateConfig('model', String(value))}
        >
          <SelectTrigger id='image-model' className='w-full min-w-0'>
            <SelectValue
              placeholder={
                isLoadingModels
                  ? t('Loading models…')
                  : t('Select an image model')
              }
            />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {models.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {groups.length > 1 ? (
        <div className='grid gap-2'>
          <Label htmlFor='image-group'>{t('Group')}</Label>
          <Select
            value={config.group}
            onValueChange={(value) => updateConfig('group', String(value))}
          >
            <SelectTrigger id='image-group' className='w-full min-w-0'>
              <SelectValue placeholder={t('Select group')} />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {groups.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                    {option.desc ? (
                      <span className='text-muted-foreground ml-2 text-xs'>
                        ({option.desc})
                      </span>
                    ) : null}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className='grid gap-2'>
        <Label htmlFor='image-prompt'>{t('Prompt')}</Label>
        <Textarea
          id='image-prompt'
          value={config.prompt}
          onChange={(e) => updateConfig('prompt', e.target.value)}
          placeholder={t(
            'Describe the image you want to generate, e.g. a cute cat, studio lighting'
          )}
          rows={5}
          disabled={isGenerating}
        />
      </div>

      {config.mode === 'edit' ? (
        <div className='grid gap-2'>
          <Label>{t('Reference images')}</Label>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/png,image/jpeg,image/webp'
            multiple
            hidden
            onChange={handleFileSelect}
          />
          {referenceImages.length > 0 ? (
            <div className='grid grid-cols-2 gap-2'>
              {referenceImages.map((file, i) => (
                <div
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className='relative overflow-hidden rounded-lg border'
                >
                  <img
                    src={previewUrls[i]}
                    alt={file.name}
                    className='h-24 w-full object-cover'
                  />
                  <button
                    type='button'
                    className='bg-background/80 hover:bg-background absolute top-1 right-1 rounded px-2 py-0.5 text-xs shadow'
                    onClick={() => removeReference(i)}
                  >
                    {t('Remove')}
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => fileInputRef.current?.click()}
            disabled={isGenerating}
          >
            {referenceImages.length > 0
              ? t('Replace reference images')
              : t('Upload reference images')}
          </Button>
        </div>
      ) : null}

      <div className='grid grid-cols-2 gap-2'>
        <div className='grid gap-2'>
          <Label htmlFor='image-size'>{t('Size')}</Label>
          <Select
            value={config.size}
            onValueChange={(value) => updateConfig('size', String(value))}
          >
            <SelectTrigger id='image-size' className='w-full min-w-0'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {sizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className='grid gap-2'>
          <Label htmlFor='image-count'>{t('Count')}</Label>
          <Select
            value={String(config.n)}
            onValueChange={(value) => updateConfig('n', Number(value))}
          >
            <SelectTrigger id='image-count' className='w-full min-w-0'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {nOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-2'>
        <div className='grid gap-2'>
          <Label htmlFor='image-quality'>{t('Quality')}</Label>
          <Select
            value={config.quality}
            onValueChange={(value) => updateConfig('quality', String(value))}
          >
            <SelectTrigger id='image-quality' className='w-full min-w-0'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {IMAGE_QUALITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {config.mode === 'generate' ? (
          <div className='grid gap-2'>
            <Label htmlFor='image-style'>{t('Style')}</Label>
            <Select
              value={config.style}
              onValueChange={(value) => updateConfig('style', String(value))}
            >
              <SelectTrigger id='image-style' className='w-full min-w-0'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                <SelectGroup>
                  {IMAGE_STYLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      <div className='grid gap-2'>
        <Label htmlFor='image-response-format'>{t('Response format')}</Label>
        <Select
          value={config.response_format}
          onValueChange={(value) =>
            updateConfig('response_format', value as ImageResponseFormat)
          }
        >
          <SelectTrigger id='image-response-format' className='w-full min-w-0'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {IMAGE_RESPONSE_FORMAT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {config.mode === 'generate' ? (
        <div className='grid gap-2'>
          <Label htmlFor='image-seed'>{t('Seed (optional)')}</Label>
          <Input
            id='image-seed'
            type='number'
            inputMode='numeric'
            value={config.seed === null ? '' : config.seed}
            onChange={(e) => {
              const v = e.target.value.trim()
              if (v === '') {
                updateConfig('seed', null)
                return
              }
              const n = Number(v)
              updateConfig('seed', Number.isFinite(n) ? n : null)
            }}
            placeholder={t('Leave empty for random')}
          />
        </div>
      ) : null}

      <div className='mt-2 flex gap-2'>
        {isGenerating ? (
          <Button
            type='button'
            variant='outline'
            className='flex-1'
            onClick={onCancel}
          >
            {t('Cancel')}
          </Button>
        ) : (
          <Button
            type='button'
            className='flex-1'
            onClick={onSubmit}
            disabled={
              isLoadingModels ||
              !config.model ||
              !config.prompt.trim() ||
              (config.mode === 'edit' && referenceImages.length === 0)
            }
          >
            {t('Generate')}
          </Button>
        )}
      </div>
    </div>
  )
}
