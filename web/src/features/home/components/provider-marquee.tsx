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
import { getLobeIcon } from '@/lib/lobe-icon'

import { AI_MODELS } from '../constants'

/**
 * Horizontally flowing provider icon track (decorative, aria-hidden).
 *
 * The track renders two copies of the icon set and translates by -50% for
 * a seamless loop (see `.neon-marquee` / `.neon-marquee-track` in
 * styles/neon.css — paused on hover, stopped under reduced-motion).
 * Outside the neon-glass preset the track renders as a static, subdued
 * row (the animation is defined globally but the section keeps its
 * regular border treatment).
 */
export function ProviderMarquee() {
  // Two copies of the icon set (track ids `a`/`b`) — the track translates
  // by -50% for a seamless loop. Keys derive from the stable track id +
  // icon name, which is unique within each copy.
  const tracks = [
    { id: 'a', icons: AI_MODELS },
    { id: 'b', icons: AI_MODELS },
  ]

  return (
    <section
      aria-hidden
      className='border-border/40 relative z-10 border-t px-6 py-12 md:py-16'
    >
      <div className='neon-marquee mx-auto max-w-6xl'>
        <div className='neon-marquee-track flex w-max items-center gap-4'>
          {tracks.map((track) =>
            track.icons.map((iconName) => (
              <div
                key={`${track.id}-${iconName}`}
                className='glass-g1 border-border/50 flex size-16 items-center justify-center rounded-xl border'
              >
                {getLobeIcon(iconName, 28)}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
