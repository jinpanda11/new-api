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
import type { ImageResultImage } from '../types'

export function downloadImage(src: string, filename: string): void {
  const a = document.createElement('a')
  a.href = src
  a.download = filename
  a.rel = 'noopener'
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

export function buildImageFilename(src: string, index?: number): string {
  const suffix = src.slice(-8).replaceAll(/[^a-zA-Z0-9]/g, '')
  const idxPart = typeof index === 'number' ? `-${index + 1}` : ''
  return `image-${Date.now()}${idxPart}-${suffix}.png`
}

export function downloadImages(images: ImageResultImage[]): void {
  images.forEach((img, i) => {
    downloadImage(img.src, buildImageFilename(img.src, i))
  })
}
