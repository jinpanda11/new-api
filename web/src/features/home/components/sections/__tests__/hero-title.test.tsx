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
  'matchMedia',
  'customElements',
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

const reactTestGlobals = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean
}
reactTestGlobals.IS_REACT_ACT_ENVIRONMENT = true

const { HeroTitle } = await import('../hero')

after(() => {
  document.body.innerHTML = ''
})

/**
 * Regression guard for the P0 hero regression: `neon-hero-title` (shimmer)
 * and `landing-animate-fade-up` (entrance) must never share the same
 * element, because both use the `animation` shorthand and the later
 * (shimmer) rule overrides the fade-up's `both` fill — leaving the H1
 * permanently transparent.
 */
describe('HeroTitle', () => {
  test('renders the product name in an H1 with the entrance animation on the H1 and the shimmer only on an inner span', async () => {
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () => root.render(<HeroTitle>My API</HeroTitle>))

    const heading = container.querySelector('h1')
    assert.ok(heading, 'product name must be an H1')
    assert.equal(heading?.textContent, 'My API')

    // Entrance fade-up lives on the H1 so the title becomes visible after
    // the entrance animation, including with `prefers-reduced-motion`.
    assert.equal(heading?.classList.contains('landing-animate-fade-up'), true)
    assert.equal(heading?.classList.contains('opacity-0'), true)
    // The shimmer must NOT compete with the entrance animation on the H1.
    assert.equal(heading?.classList.contains('neon-hero-title'), false)

    // The shimmer gradient lives on a dedicated inner span.
    const shimmer = container.querySelector('h1 > span.neon-hero-title')
    assert.ok(shimmer, 'shimmer layer should be an inner span of the H1')
    assert.equal(shimmer?.textContent, 'My API')
    assert.equal(container.querySelectorAll('h1').length, 1)

    await act(async () => root.unmount())
    container.remove()
  })

  test('keeps the shimmer layer free of animation classes so reduced-motion CSS can force the H1 visible', async () => {
    // The reduced-motion CSS forces opacity 1 on .landing-animate-fade-up.
    // The shimmer span must not carry any animation class of its own, or
    // it could keep the H1 transparent when animations are disabled.
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () => root.render(<HeroTitle>My API</HeroTitle>))

    const heading = container.querySelector('h1')
    assert.ok(heading)
    assert.equal(heading?.classList.contains('landing-animate-fade-up'), true)

    // The span only carries the gradient/clip hook — nothing animated.
    const shimmer = container.querySelector('h1 > span')
    assert.ok(shimmer)
    assert.equal(shimmer?.className, 'neon-hero-title')

    await act(async () => root.unmount())
    container.remove()
  })
})
