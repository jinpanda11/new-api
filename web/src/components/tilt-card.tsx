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
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react'

import { cn } from '@/lib/utils'

type TiltCardProps = {
  children: ReactNode
  className?: string
  /**
   * Max tilt in degrees. Documented ceiling is 3deg (Neon Glass spec §22.4).
   * @default 3
   */
  maxTilt?: number
  /**
   * Max translate shift in px.
   * @default 8
   */
  maxShift?: number
  style?: CSSProperties
}

/**
 * Mouse-following 3D tilt wrapper used by hero/balance/login cards.
 *
 * Writes the tilt into CSS custom properties consumed by the inline
 * `transform` below, driven by a rAF-throttled pointer handler. Disabled on
 * touch devices and under `prefers-reduced-motion`; the card then renders
 * flat with the pointer-follow highlight still available via hover.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 3,
  maxShift = 8,
  style,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return

    let frame = 0
    let rafPending = false

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      const px = (event.clientX - rect.left) / rect.width
      const py = (event.clientY - rect.top) / rect.height
      const rx = (0.5 - py) * maxTilt
      const ry = (px - 0.5) * maxTilt
      const dx = (px - 0.5) * maxShift
      const dy = (py - 0.5) * maxShift

      if (rafPending) return
      rafPending = true
      frame = requestAnimationFrame(() => {
        rafPending = false
        el.style.setProperty('--tilt-rx', `${rx.toFixed(2)}deg`)
        el.style.setProperty('--tilt-ry', `${ry.toFixed(2)}deg`)
        el.style.setProperty('--tilt-dx', `${dx.toFixed(2)}px`)
        el.style.setProperty('--tilt-dy', `${dy.toFixed(2)}px`)
      })
    }

    const onPointerLeave = () => {
      if (rafPending) {
        cancelAnimationFrame(frame)
        rafPending = false
      }
      el.style.setProperty('--tilt-rx', '0deg')
      el.style.setProperty('--tilt-ry', '0deg')
      el.style.setProperty('--tilt-dx', '0px')
      el.style.setProperty('--tilt-dy', '0px')
    }

    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerleave', onPointerLeave)
    return () => {
      if (rafPending) cancelAnimationFrame(frame)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [maxTilt, maxShift])

  return (
    <div
      ref={ref}
      className={cn(
        'motion-safe:[transform:perspective(1200px)_rotateX(var(--tilt-rx,0deg))_rotateY(var(--tilt-ry,0deg))_translate3d(var(--tilt-dx,0px),var(--tilt-dy,0px),0)] motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out motion-safe:will-change-transform',
        className
      )}
      style={style}
    >
      {children}
    </div>
  )
}
