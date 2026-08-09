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
import axios from 'axios'

export interface ExtractedError {
  message: string
  code?: string
  status?: number
}

export function extractImageError(
  error: unknown,
  fallback: string
): ExtractedError {
  if (axios.isCancel(error)) {
    return { message: 'canceled', code: 'canceled' }
  }
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const payload = error.response?.data as
      | { error?: { message?: string; code?: string; type?: string } }
      | { message?: string }
      | undefined

    if (payload) {
      if (
        'error' in payload &&
        payload.error &&
        typeof payload.error === 'object'
      ) {
        const message =
          payload.error.message ||
          payload.error.type ||
          error.message ||
          fallback
        return {
          message,
          code: payload.error.code || payload.error.type,
          status,
        }
      }
      if ('message' in payload && typeof payload.message === 'string') {
        return { message: payload.message, status }
      }
    }
    return { message: error.message || fallback, status }
  }
  if (error instanceof Error) {
    return { message: error.message || fallback }
  }
  return { message: fallback }
}
