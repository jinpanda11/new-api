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
import { IMAGE_PLAYGROUND_DEFAULT_SIZE_DEFAULT } from '@/features/system-settings/maintenance/config'

import type { ImagePlaygroundConfig } from './types'

export const API_ENDPOINTS = {
  IMAGE_GENERATIONS: '/pg/images/generations',
  IMAGE_EDITS: '/pg/images/edits',
  USER_MODELS: '/api/user/models',
  USER_GROUPS: '/api/user/self/groups',
} as const

export const DEFAULT_GROUP = 'default' as const

export const DEFAULT_IMAGE_SIZE = IMAGE_PLAYGROUND_DEFAULT_SIZE_DEFAULT

export const IMAGE_QUALITY_OPTIONS = [
  { label: 'low', value: 'low' },
  { label: 'medium', value: 'medium' },
  { label: 'high', value: 'high' },
  { label: 'auto (default)', value: 'auto' },
] as const

export const IMAGE_STYLE_OPTIONS = [
  { label: 'vivid', value: 'vivid' },
  { label: 'natural', value: 'natural' },
] as const

export const IMAGE_RESPONSE_FORMAT_OPTIONS = [
  { label: 'b64_json (persistent)', value: 'b64_json' },
  { label: 'url (may expire)', value: 'url' },
] as const

export const IMAGE_MODES = {
  GENERATE: 'generate',
  EDIT: 'edit',
} as const

export const MODEL_NAME_HINTS = [
  'dall-e',
  'dalle',
  'gpt-image',
  'gpt-4o-image',
  'image',
  'flux',
  'sd',
  'stable-diffusion',
  'imagen',
  'midjourney',
  'ideogram',
  'recraft',
  'seedream',
  'kolors',
  'wanx',
  'cogview',
  'hunyuan-image',
  'qwen-image',
] as const

export const MAX_IMAGES_PER_REQUEST = 4
export const MAX_HISTORY_ITEMS = 20

export const STORAGE_KEYS = {
  CONFIG: 'image_playground_config',
  HISTORY: 'image_playground_history',
} as const

export const DEFAULT_CONFIG: ImagePlaygroundConfig = {
  mode: 'generate',
  model: '',
  group: DEFAULT_GROUP,
  prompt: '',
  n: 1,
  size: DEFAULT_IMAGE_SIZE,
  quality: 'auto',
  style: 'vivid',
  response_format: 'b64_json',
  seed: null,
}
