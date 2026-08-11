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
import { describe, test } from 'node:test'

import {
  DEFAULT_THEME_CUSTOMIZATION,
  PRESET_DEFAULT_FONT,
  THEME_PRESETS,
  resolveThemeFont,
} from './theme-customization'

describe('Neon Glass theme preset registration', () => {
  test('neon-glass is registered as the first (flagship) preset', () => {
    assert.equal(THEME_PRESETS[0].value, 'neon-glass')
    assert.equal(THEME_PRESETS[0].name, 'Neon Glass')
    assert.ok(THEME_PRESETS[0].swatches.length >= 2)
  })

  test('existing presets remain available alongside neon-glass', () => {
    const values = new Set(THEME_PRESETS.map((preset) => preset.value))
    assert.ok(values.has('neon-glass'))
    const legacyPresets = ['default', 'anthropic', 'rose-garden'] as const
    for (const legacy of legacyPresets) {
      assert.ok(values.has(legacy), `expected ${legacy} to remain`)
    }
  })

  test('new users (no cookie) default to neon-glass', () => {
    assert.equal(DEFAULT_THEME_CUSTOMIZATION.preset, 'neon-glass')
  })

  test('neon-glass defaults to the sans font axis', () => {
    assert.equal(PRESET_DEFAULT_FONT['neon-glass'], 'sans')
    assert.equal(resolveThemeFont('default', 'neon-glass'), 'sans')
  })
})
