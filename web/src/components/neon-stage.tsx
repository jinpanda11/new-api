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
import { memo } from 'react'

/**
 * Global Neon Glass stage — the fixed full-viewport background layer
 * (hairline grid + wide pink/lime/cyan glow fields + vignette + up to
 * three slowly drifting light blobs) behind the whole app shell.
 *
 * Purely decorative: `aria-hidden`, pointer-events disabled, and invisible
 * outside the `neon-glass` theme preset (see styles/neon.css). Rendered
 * once at the app root, before the router outlet, which is wrapped in a
 * `relative z-10` container so all content paints above the stage.
 */
export const NeonStage = memo(function NeonStage() {
  return (
    <div aria-hidden='true' data-slot='neon-stage' className='neon-stage'>
      <span className='neon-stage-blob neon-stage-blob--violet' />
      <span className='neon-stage-blob neon-stage-blob--pink' />
      <span className='neon-stage-blob neon-stage-blob--soft' />
    </div>
  )
})
