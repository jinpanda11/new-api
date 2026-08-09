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
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { ImageForm } from './components/image-form'
import { ImageHistory } from './components/image-history'
import { ImageResultGrid } from './components/image-result-grid'
import { useImagePlayground } from './hooks/use-image-playground'
import type { ImageHistoryItem } from './types'

export function ImagePlayground() {
  const { t } = useTranslation()
  const state = useImagePlayground()

  const handleSelectHistory = useCallback(
    (item: ImageHistoryItem) => {
      state.updateConfig('prompt', item.prompt)
      state.updateConfig('mode', item.mode)
      state.updateConfig('model', item.model)
      state.updateConfig('n', item.n)
      state.updateConfig('size', item.size)
    },
    [state]
  )

  return (
    <div className='grid h-full min-h-0 grid-rows-[1fr_auto] gap-0 md:grid-cols-[360px_1fr_280px] md:grid-rows-1'>
      <aside className='overflow-hidden border-r'>
        <div className='border-b px-4 py-3'>
          <h2 className='text-sm font-medium'>{t('Image Playground')}</h2>
          <p className='text-muted-foreground text-xs'>
            {t('Generate or edit images with your available models')}
          </p>
        </div>
        <ImageForm
          config={state.config}
          updateConfig={state.updateConfig}
          models={state.imageModels}
          groups={state.groups}
          isLoadingModels={state.isLoadingModels}
          referenceImages={state.referenceImages}
          setReferenceImages={state.setReferenceImages}
          isGenerating={state.isGenerating}
          onSubmit={state.submit}
          onCancel={state.cancel}
          sizeOptions={state.sizeOptions}
        />
      </aside>
      <main className='min-h-0 overflow-hidden'>
        <ImageResultGrid
          images={state.currentResults}
          revisedPrompt={state.currentRevisedPrompt}
          isGenerating={state.isGenerating}
          errorMessage={state.errorMessage}
        />
      </main>
      <aside className='overflow-hidden border-l md:block'>
        <ImageHistory
          history={state.history}
          onClear={state.clearHistoryItems}
          onSelect={handleSelectHistory}
        />
      </aside>
    </div>
  )
}
