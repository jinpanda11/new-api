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
  'HTMLDivElement',
  'Node',
  'Element',
  'Event',
  'CustomEvent',
  'PointerEvent',
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

// Run rAF callbacks synchronously so tilt application is deterministic.
Object.defineProperty(domWindow, 'requestAnimationFrame', {
  configurable: true,
  value: ((callback: FrameRequestCallback) => {
    callback(0)
    return 0
  }) as unknown as typeof domWindow.requestAnimationFrame,
})

const { act } = await import('react')
const { createRoot } = await import('react-dom/client')

const reactTestGlobals = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean
}
reactTestGlobals.IS_REACT_ACT_ENVIRONMENT = true

const { TiltCard } = await import('../tilt-card')

after(() => {
  document.body.innerHTML = ''
})

// Per-test media query control: returns real happy-dom MediaQueryList
// instances with `matches` overridden, so `addEventListener`/`dispatchEvent`
// keep their native behavior.
const originalMatchMedia = domWindow.matchMedia.bind(domWindow)

function stubMatchMedia(matchesByQuery: Record<string, boolean>): void {
  Object.defineProperty(domWindow, 'matchMedia', {
    configurable: true,
    value: (query: string) => {
      const mql = originalMatchMedia(query)
      Object.defineProperty(mql, 'matches', {
        configurable: true,
        get: () => matchesByQuery[query] ?? false,
      })
      return mql
    },
  })
}

function tiltVars(el: HTMLElement): Record<string, string | undefined> {
  return {
    rx: el.style.getPropertyValue('--tilt-rx'),
    ry: el.style.getPropertyValue('--tilt-ry'),
    dx: el.style.getPropertyValue('--tilt-dx'),
    dy: el.style.getPropertyValue('--tilt-dy'),
  }
}

describe('TiltCard', () => {
  test('applies the tilt transform on mouse pointer moves when enabled', async () => {
    stubMatchMedia({})

    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () =>
      root.render(
        <TiltCard>
          <div>content</div>
        </TiltCard>
      )
    )

    const card = container.querySelector<HTMLElement>('[data-tilt-card]')
    assert.ok(card, 'tilt wrapper should expose a test hook')
    card.getBoundingClientRect = () =>
      ({
        width: 100,
        height: 100,
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect

    await act(async () => {
      card.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          pointerType: 'mouse',
          clientX: 75,
          clientY: 25,
        })
      )
    })

    // px = 0.75, py = 0.25 → ry = (0.75-0.5)*3 = 0.75deg, rx = (0.5-0.25)*3.
    const vars = tiltVars(card)
    assert.equal(vars.ry, '0.75deg')
    assert.equal(vars.rx, '0.75deg')
    assert.equal(vars.dx, '2.00px')
    assert.equal(vars.dy, '-2.00px')

    await act(async () =>
      root.render(
        <TiltCard disabled>
          <div>content</div>
        </TiltCard>
      )
    )

    const resetVars = tiltVars(card)
    assert.equal(resetVars.rx, '0deg')
    assert.equal(resetVars.ry, '0deg')
    assert.equal(resetVars.dx, '0px')
    assert.equal(resetVars.dy, '0px')
    assert.equal(card.className.includes('will-change-transform'), false)
    assert.equal(card.className.includes('perspective(1200px)'), false)

    await act(async () => root.unmount())
    container.remove()
  })

  test('stays static when the disabled prop is set', async () => {
    stubMatchMedia({})

    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () =>
      root.render(
        <TiltCard disabled>
          <div>content</div>
        </TiltCard>
      )
    )

    const card = container.querySelector<HTMLElement>('[data-tilt-card]')
    assert.ok(card)
    card.getBoundingClientRect = () =>
      ({
        width: 100,
        height: 100,
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect

    await act(async () => {
      card.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          pointerType: 'mouse',
          clientX: 80,
          clientY: 80,
        })
      )
    })

    const vars = tiltVars(card)
    assert.equal(vars.ry, '')
    assert.equal(vars.rx, '')
    assert.equal(vars.dx, '')
    assert.equal(vars.dy, '')
    assert.equal(card.className.includes('will-change-transform'), false)
    assert.equal(card.className.includes('perspective(1200px)'), false)

    await act(async () => root.unmount())
    container.remove()
  })

  test('stays static on narrow screens (mobile degradation)', async () => {
    stubMatchMedia({ '(max-width: 640px)': true })

    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () =>
      root.render(
        <TiltCard>
          <div>content</div>
        </TiltCard>
      )
    )

    const card = container.querySelector<HTMLElement>('[data-tilt-card]')
    assert.ok(card)
    card.getBoundingClientRect = () =>
      ({
        width: 100,
        height: 100,
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect

    await act(async () => {
      card.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          pointerType: 'mouse',
          clientX: 60,
          clientY: 40,
        })
      )
    })

    const vars = tiltVars(card)
    assert.equal(vars.rx, '')
    assert.equal(vars.ry, '')
    assert.equal(card.className.includes('will-change-transform'), false)
    assert.equal(card.className.includes('perspective(1200px)'), false)

    await act(async () => root.unmount())
    container.remove()
  })

  test('stays static on short viewports (auth-page degradation)', async () => {
    stubMatchMedia({ '(max-height: 640px)': true })

    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () =>
      root.render(
        <TiltCard>
          <div>content</div>
        </TiltCard>
      )
    )

    const card = container.querySelector<HTMLElement>('[data-tilt-card]')
    assert.ok(card)
    card.getBoundingClientRect = () =>
      ({
        width: 100,
        height: 100,
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect

    await act(async () => {
      card.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          pointerType: 'mouse',
          clientX: 60,
          clientY: 40,
        })
      )
    })

    const vars = tiltVars(card)
    assert.equal(vars.rx, '')
    assert.equal(vars.ry, '')
    assert.equal(card.className.includes('will-change-transform'), false)
    assert.equal(card.className.includes('perspective(1200px)'), false)

    await act(async () => root.unmount())
    container.remove()
  })

  test('stays static on coarse pointers (touch degradation)', async () => {
    stubMatchMedia({ '(pointer: coarse)': true })

    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () =>
      root.render(
        <TiltCard>
          <div>content</div>
        </TiltCard>
      )
    )

    const card = container.querySelector<HTMLElement>('[data-tilt-card]')
    assert.ok(card)
    card.getBoundingClientRect = () =>
      ({
        width: 100,
        height: 100,
        left: 0,
        top: 0,
        right: 100,
        bottom: 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect

    await act(async () => {
      card.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          pointerType: 'touch',
          clientX: 60,
          clientY: 40,
        })
      )
    })

    const vars = tiltVars(card)
    assert.equal(vars.rx, '')
    assert.equal(vars.ry, '')
    assert.equal(card.className.includes('will-change-transform'), false)
    assert.equal(card.className.includes('perspective(1200px)'), false)

    await act(async () => root.unmount())
    container.remove()
  })
})
