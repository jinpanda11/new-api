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

import { shouldRevealNeonStage } from '../neon-stage-visibility'

describe('authenticated neon stage visibility', () => {
  test('reveals the stage on standard console pages', () => {
    assert.equal(shouldRevealNeonStage('/dashboard/overview'), true)
    assert.equal(shouldRevealNeonStage('/channels'), true)
    assert.equal(shouldRevealNeonStage('/system-settings/site/general'), true)
  })

  test('keeps specialized and embedded work surfaces isolated', () => {
    const excludedPaths = [
      '/chat/conversation-id',
      '/chat/conversation-id/',
      '/chat2link',
      '/errors/404',
      '/errors/404/',
      '/image-playground',
      '/image-playground/',
      '/playground',
      '/playground/',
    ]

    for (const pathname of excludedPaths) {
      assert.equal(
        shouldRevealNeonStage(pathname),
        false,
        `${pathname} should keep its isolated background`
      )
    }
  })
})
