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
import { useMemo } from 'react'

import { useStatus } from '@/hooks/use-status'

import {
  IMAGE_PLAYGROUND_SIZE_OPTIONS_DEFAULT,
  parseImagePlaygroundSizeOptions,
  type ImagePlaygroundSizeOption,
} from '@/features/system-settings/maintenance/config'

export type UseImagePlaygroundAdminConfigResult = {
  defaultSize: string | null
  defaultModel: string | null
  sizeOptions: ImagePlaygroundSizeOption[]
}

function readString(status: unknown, key: string): string {
  if (!status || typeof status !== 'object') return ''
  const record = status as Record<string, unknown>
  const value = record[key]
  return typeof value === 'string' ? value.trim() : ''
}

export function useImagePlaygroundAdminConfig(): UseImagePlaygroundAdminConfigResult {
  const { status } = useStatus()

  return useMemo(() => {
    const defaultSize = readString(status, 'ImagePlaygroundDefaultSize') || null
    const defaultModel =
      readString(status, 'ImagePlaygroundDefaultModel') || null
    const rawOptions = readString(status, 'ImagePlaygroundSizeOptions')
    const sizeOptions = rawOptions
      ? parseImagePlaygroundSizeOptions(rawOptions)
      : IMAGE_PLAYGROUND_SIZE_OPTIONS_DEFAULT.map((option) => ({ ...option }))
    return { defaultSize, defaultModel, sizeOptions }
  }, [status])
}
