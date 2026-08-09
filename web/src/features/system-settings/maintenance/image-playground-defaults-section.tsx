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
import { Add01Icon, Delete02Icon } from '@hugeicons/core-free-icons'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { SettingsForm } from '../components/settings-form-layout'
import { SettingsPageFormActions } from '../components/settings-page-context'
import { SettingsSection } from '../components/settings-section'
import { useUpdateOption } from '../hooks/use-update-option'
import {
  IMAGE_PLAYGROUND_DEFAULT_SIZE_DEFAULT,
  parseImagePlaygroundSizeOptions,
  serializeImagePlaygroundSizeOptions,
  type ImagePlaygroundSizeOption,
} from './config'

type ImagePlaygroundDefaultsSectionProps = {
  defaultValues: {
    ImagePlaygroundDefaultSize: string
    ImagePlaygroundSizeOptions: string
    ImagePlaygroundDefaultModel: string
  }
}

type Row = ImagePlaygroundSizeOption & { rowId: string }

const rowId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

function rowsFromRaw(raw: string): Row[] {
  return parseImagePlaygroundSizeOptions(raw).map((option) => ({
    ...option,
    rowId: rowId(),
  }))
}

export function ImagePlaygroundDefaultsSection({
  defaultValues,
}: ImagePlaygroundDefaultsSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const [defaultSize, setDefaultSize] = useState(
    defaultValues.ImagePlaygroundDefaultSize
  )
  const [defaultModel, setDefaultModel] = useState(
    defaultValues.ImagePlaygroundDefaultModel
  )
  const [rows, setRows] = useState<Row[]>(() =>
    rowsFromRaw(defaultValues.ImagePlaygroundSizeOptions)
  )

  useEffect(() => {
    setDefaultSize(defaultValues.ImagePlaygroundDefaultSize)
    setDefaultModel(defaultValues.ImagePlaygroundDefaultModel)
    setRows(rowsFromRaw(defaultValues.ImagePlaygroundSizeOptions))
  }, [defaultValues])

  const serializedRows = useMemo(
    () =>
      serializeImagePlaygroundSizeOptions(
        rows.map((r) => ({ label: r.label, value: r.value }))
      ),
    [rows]
  )

  const initialSerialized = useMemo(() => {
    if (!defaultValues.ImagePlaygroundSizeOptions.trim()) return ''
    return serializeImagePlaygroundSizeOptions(
      parseImagePlaygroundSizeOptions(
        defaultValues.ImagePlaygroundSizeOptions
      )
    )
  }, [defaultValues.ImagePlaygroundSizeOptions])

  const resetToDefault = useCallback(() => {
    setDefaultSize('')
    setDefaultModel('')
    setRows(rowsFromRaw(''))
  }, [])

  const updateRow = useCallback(
    (id: string, patch: Partial<ImagePlaygroundSizeOption>) => {
      setRows((prev) =>
        prev.map((r) => (r.rowId === id ? { ...r, ...patch } : r))
      )
    },
    []
  )

  const removeRow = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.rowId !== id))
  }, [])

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, { rowId: rowId(), label: '', value: '' }])
  }, [])

  const onSubmit = async () => {
    const updates: Array<{ key: string; value: string }> = []

    const nextSize = defaultSize.trim()
    const prevSize = defaultValues.ImagePlaygroundDefaultSize.trim()
    if (nextSize !== prevSize) {
      updates.push({ key: 'ImagePlaygroundDefaultSize', value: nextSize })
    }

    const nextModel = defaultModel.trim()
    const prevModel = defaultValues.ImagePlaygroundDefaultModel.trim()
    if (nextModel !== prevModel) {
      updates.push({ key: 'ImagePlaygroundDefaultModel', value: nextModel })
    }

    if (serializedRows !== initialSerialized) {
      const emptied = rows.every((r) => r.value.trim() === '')
      updates.push({
        key: 'ImagePlaygroundSizeOptions',
        value: emptied ? '' : serializedRows,
      })
    }

    if (updates.length === 0) return

    for (const update of updates) {
      await updateOption.mutateAsync(update)
    }
  }

  return (
    <SettingsSection title={t('Image playground defaults')}>
      <SettingsForm
        onSubmit={(event) => {
          event.preventDefault()
          void onSubmit()
        }}
      >
        <SettingsPageFormActions
          onSave={onSubmit}
          onReset={resetToDefault}
          isSaving={updateOption.isPending}
          resetLabel='Reset to default'
          saveLabel='Save image playground defaults'
        />

        <div className='grid gap-2'>
          <Label htmlFor='image-playground-default-size'>
            {t('Default size')}
          </Label>
          <Input
            id='image-playground-default-size'
            placeholder={IMAGE_PLAYGROUND_DEFAULT_SIZE_DEFAULT}
            value={defaultSize}
            onChange={(e) => setDefaultSize(e.target.value)}
          />
          <p className='text-muted-foreground text-xs'>
            {t(
              'The size preselected when a user opens the image playground. Should match one of the size options below.'
            )}
          </p>
        </div>

        <div className='grid gap-2'>
          <div className='flex items-center justify-between'>
            <Label>{t('Size dropdown options')}</Label>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={addRow}
              className='gap-1'
            >
              <HugeiconsIcon
                icon={Add01Icon}
                strokeWidth={2}
                className='size-4'
              />
              {t('Add option')}
            </Button>
          </div>
          <p className='text-muted-foreground text-xs'>
            {t(
              'Options shown in the size dropdown. Leave empty (no rows) to use the built-in defaults.'
            )}
          </p>
          <div className='grid gap-2'>
            {rows.length === 0 ? (
              <p className='text-muted-foreground rounded-lg border border-dashed p-4 text-center text-xs'>
                {t('No custom options — using built-in defaults.')}
              </p>
            ) : (
              rows.map((row) => (
                <div
                  key={row.rowId}
                  className='grid grid-cols-[1fr_1fr_auto] items-center gap-2'
                >
                  <Input
                    value={row.value}
                    onChange={(e) =>
                      updateRow(row.rowId, { value: e.target.value })
                    }
                    placeholder={t('Value (e.g. 1024x1024)')}
                  />
                  <Input
                    value={row.label}
                    onChange={(e) =>
                      updateRow(row.rowId, { label: e.target.value })
                    }
                    placeholder={t('Label (optional)')}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => removeRow(row.rowId)}
                    aria-label={t('Remove option')}
                  >
                    <HugeiconsIcon
                      icon={Delete02Icon}
                      strokeWidth={2}
                      className='size-4'
                    />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className='grid gap-2'>
          <Label htmlFor='image-playground-default-model'>
            {t('Default model')}
          </Label>
          <Input
            id='image-playground-default-model'
            placeholder='gpt-image-1'
            value={defaultModel}
            onChange={(e) => setDefaultModel(e.target.value)}
          />
          <p className='text-muted-foreground text-xs'>
            {t(
              'Model ID preselected in the image playground. Leave blank to auto-pick the first available image model.'
            )}
          </p>
        </div>
      </SettingsForm>
    </SettingsSection>
  )
}
