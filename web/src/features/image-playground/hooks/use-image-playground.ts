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
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { editImage, generateImage, getUserGroups, getUserModels } from '../api'
import { MAX_HISTORY_ITEMS, MODEL_NAME_HINTS } from '../constants'
import type { ImageSizeOption } from '../lib/admin-config'
import { extractImageError } from '../lib/error-utils'
import {
  clearHistory,
  loadConfig,
  loadHistory,
  mergeStoredConfig,
  saveConfig,
  saveHistoryItem,
} from '../lib/storage'
import type {
  GroupOption,
  ImageGenerationRequest,
  ImageGenerationResponse,
  ImageHistoryItem,
  ImagePlaygroundConfig,
  ImageResultImage,
  ModelOption,
} from '../types'
import { useImagePlaygroundAdminConfig } from './use-admin-config'

const genId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `img-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

export interface UseImagePlaygroundResult {
  config: ImagePlaygroundConfig
  updateConfig: <K extends keyof ImagePlaygroundConfig>(
    key: K,
    value: ImagePlaygroundConfig[K]
  ) => void
  models: ModelOption[]
  imageModels: ModelOption[]
  groups: GroupOption[]
  isLoadingModels: boolean
  referenceImages: File[]
  setReferenceImages: (files: File[]) => void
  currentResults: ImageResultImage[]
  currentRevisedPrompt: string | null
  history: ImageHistoryItem[]
  clearHistoryItems: () => void
  submit: () => Promise<void>
  cancel: () => void
  isGenerating: boolean
  errorMessage: string | null
  sizeOptions: ImageSizeOption[]
}

function matchesImageModelName(name: string): boolean {
  const lower = name.toLowerCase()
  return MODEL_NAME_HINTS.some((hint) => lower.includes(hint))
}

export function filterImageModels(models: ModelOption[]): ModelOption[] {
  const filtered = models.filter((m) => matchesImageModelName(m.value))
  return filtered.length > 0 ? filtered : models
}

function mapResponseImages(
  response: ImageGenerationResponse
): { images: ImageResultImage[]; revised?: string } {
  const images: ImageResultImage[] = []
  let revised: string | undefined
  for (const item of response.data ?? []) {
    if (item.b64_json) {
      images.push({
        src: `data:image/png;base64,${item.b64_json}`,
        isBase64: true,
        revisedPrompt: item.revised_prompt,
      })
    } else if (item.url) {
      images.push({
        src: item.url,
        isBase64: false,
        revisedPrompt: item.revised_prompt,
      })
    }
    if (!revised && item.revised_prompt) {
      revised = item.revised_prompt
    }
  }
  return { images, revised }
}

export function useImagePlayground(): UseImagePlaygroundResult {
  const { t } = useTranslation()

  const adminConfig = useImagePlaygroundAdminConfig()
  const sizeOptions = adminConfig.sizeOptions

  const [config, setConfig] = useState<ImagePlaygroundConfig>(() =>
    mergeStoredConfig(loadConfig(), {
      defaultSize: adminConfig.defaultSize,
      defaultModel: adminConfig.defaultModel,
      sizeOptions: adminConfig.sizeOptions,
    })
  )
  const [referenceImages, setReferenceImages] = useState<File[]>([])
  const [currentResults, setCurrentResults] = useState<ImageResultImage[]>([])
  const [currentRevisedPrompt, setCurrentRevisedPrompt] = useState<
    string | null
  >(null)
  const [history, setHistory] = useState<ImageHistoryItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    saveConfig(config)
  }, [config])

  useEffect(() => {
    let cancelled = false
    loadHistory().then((items) => {
      if (!cancelled) setHistory(items)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const {
    data: modelsData,
    isLoading: isLoadingModels,
    error: modelsError,
    isError: isModelsError,
  } = useQuery({
    queryKey: ['image-playground-models', config.group],
    queryFn: () => getUserModels(config.group),
    enabled: !!config.group,
  })

  const { data: groupsData, isError: isGroupsError } = useQuery({
    queryKey: ['image-playground-groups'],
    queryFn: getUserGroups,
  })

  useEffect(() => {
    if (isModelsError) {
      const err = extractImageError(
        modelsError,
        t('Failed to load image models')
      )
      toast.error(err.message)
    }
  }, [isModelsError, modelsError, t])

  useEffect(() => {
    if (isGroupsError) toast.error(t('Failed to load user groups'))
  }, [isGroupsError, t])

  const models = useMemo<ModelOption[]>(() => modelsData ?? [], [modelsData])
  const groups = useMemo<GroupOption[]>(() => groupsData ?? [], [groupsData])
  const imageModels = useMemo(() => filterImageModels(models), [models])

  useEffect(() => {
    if (imageModels.length === 0) return
    if (config.model && imageModels.some((m) => m.value === config.model)) {
      return
    }
    const adminPreferred = adminConfig.defaultModel
    const fallback =
      adminPreferred && imageModels.some((m) => m.value === adminPreferred)
        ? adminPreferred
        : imageModels[0].value
    setConfig((prev) => ({ ...prev, model: fallback }))
  }, [imageModels, config.model, adminConfig.defaultModel])

  useEffect(() => {
    if (groups.length === 0) return
    if (config.group && groups.some((g) => g.value === config.group)) return
    setConfig((prev) => ({ ...prev, group: groups[0].value }))
  }, [groups, config.group])

  const updateConfig = useCallback(
    <K extends keyof ImagePlaygroundConfig>(
      key: K,
      value: ImagePlaygroundConfig[K]
    ) => {
      setConfig((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsGenerating(false)
  }, [])

  const pushHistory = useCallback((item: ImageHistoryItem) => {
    setHistory((prev) => [item, ...prev].slice(0, MAX_HISTORY_ITEMS))
    void saveHistoryItem(item)
  }, [])

  const clearHistoryItems = useCallback(() => {
    setHistory([])
    void clearHistory()
  }, [])

  const submit = useCallback(async () => {
    if (!config.model) {
      toast.error(t('Please select an image model'))
      return
    }
    if (!config.prompt.trim()) {
      toast.error(t('Please enter a prompt'))
      return
    }
    if (config.mode === 'edit' && referenceImages.length === 0) {
      toast.error(t('Please upload at least one reference image'))
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsGenerating(true)
    setErrorMessage(null)
    setCurrentResults([])
    setCurrentRevisedPrompt(null)

    try {
      let response: ImageGenerationResponse
      if (config.mode === 'edit') {
        const form = new FormData()
        form.append('model', config.model)
        form.append('prompt', config.prompt)
        form.append('n', String(config.n))
        if (config.size && config.size !== 'auto') {
          form.append('size', config.size)
        }
        if (config.quality && config.quality !== 'auto') {
          form.append('quality', config.quality)
        }
        if (config.response_format) {
          form.append('response_format', config.response_format)
        }
        if (referenceImages.length === 1) {
          form.append(
            'image',
            referenceImages[0],
            referenceImages[0].name
          )
        } else {
          for (const file of referenceImages) {
            form.append('image[]', file, file.name)
          }
        }
        response = await editImage(form, controller.signal)
      } else {
        const payload: ImageGenerationRequest = {
          model: config.model,
          prompt: config.prompt,
          n: config.n,
        }
        if (config.size && config.size !== 'auto') payload.size = config.size
        if (config.quality && config.quality !== 'auto') {
          payload.quality = config.quality
        }
        if (config.style) payload.style = config.style
        if (config.response_format) {
          payload.response_format = config.response_format
        }
        if (config.seed !== null && Number.isFinite(config.seed)) {
          payload.seed = config.seed
        }
        response = await generateImage(payload, controller.signal)
      }

      if (controller.signal.aborted) return

      const { images, revised } = mapResponseImages(response)
      if (images.length === 0) {
        setErrorMessage(t('The response contained no image data'))
        toast.error(t('The response contained no image data'))
        return
      }

      setCurrentResults(images)
      setCurrentRevisedPrompt(revised ?? null)

      pushHistory({
        id: genId(),
        createdAt: Date.now(),
        mode: config.mode,
        model: config.model,
        prompt: config.prompt,
        n: config.n,
        size: config.size,
        images,
      })
    } catch (error) {
      if (controller.signal.aborted) return
      const extracted = extractImageError(error, t('Image generation failed'))
      if (extracted.code === 'canceled') return
      setErrorMessage(extracted.message)
      toast.error(extracted.message)
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
      }
      setIsGenerating(false)
    }
  }, [config, referenceImages, pushHistory, t])

  return {
    config,
    updateConfig,
    models,
    imageModels,
    groups,
    isLoadingModels,
    referenceImages,
    setReferenceImages,
    currentResults,
    currentRevisedPrompt,
    history,
    clearHistoryItems,
    submit,
    cancel,
    isGenerating,
    errorMessage,
    sizeOptions,
  }
}
