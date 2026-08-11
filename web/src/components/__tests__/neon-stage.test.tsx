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

import { Window } from 'happy-dom'

const domWindow = new Window()
const domGlobals = [
  'window',
  'document',
  'navigator',
  'HTMLElement',
  'HTMLSpanElement',
  'Node',
  'Element',
  'Event',
  'CustomEvent',
  'MutationObserver',
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

const { act } = await import('react')
const { createRoot } = await import('react-dom/client')

const { NeonStage } = await import('../neon-stage')

after(() => {
  document.body.innerHTML = ''
})

describe('NeonStage', () => {
  test('renders a decorative stage layer hidden from assistive tech', async () => {
    let root!: ReturnType<typeof createRoot>
    let container!: HTMLDivElement

    await act(async () => {
      container = document.createElement('div')
      document.body.appendChild(container)
      root = createRoot(container)
      root.render(<NeonStage />)
    })

    const stage = container.querySelector('[data-slot="neon-stage"]')
    assert.ok(stage, 'stage layer should be rendered')
    assert.equal(stage.getAttribute('aria-hidden'), 'true')
    assert.equal(stage.className, 'neon-stage')

    // Exactly three drifting glow blobs (perf budget: ≤3 animated fields).
    const blobs = container.querySelectorAll('.neon-stage-blob')
    assert.equal(blobs.length, 3)
    for (const blob of blobs) {
      assert.match(
        blob.className,
        /^neon-stage-blob neon-stage-blob--(violet|pink|soft)$/
      )
    }

    await act(async () => {
      root.unmount()
      container.remove()
    })
  })
})
