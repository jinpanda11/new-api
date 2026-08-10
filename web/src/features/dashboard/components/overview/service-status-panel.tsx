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
import { HeartPulse } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { IconBadge } from '@/components/ui/icon-badge'
import { GroupStatusCard } from '@/features/status/components/group-status-card'
import type { StatusCard } from '@/features/status/types'

import { PanelWrapper } from '../ui/panel-wrapper'

interface ServiceStatusPanelProps {
  loading: boolean
  cards: StatusCard[]
}

/**
 * Presentational panel for the overview page. Whether to render this panel
 * at all (loading vs. hidden when disabled/empty) is decided by the caller,
 * which owns the single `useStatusCards()` polling instance.
 */
export function ServiceStatusPanel({ loading, cards }: ServiceStatusPanelProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <PanelWrapper
        title={
          <span className='flex items-center gap-2'>
            <IconBadge tone='success' size='sm'>
              <HeartPulse />
            </IconBadge>
            {t('服务状态')}
          </span>
        }
        description={t('按分组查看渠道可用性与近期表现')}
        loading
        height='h-56'
      />
    )
  }

  return (
    <PanelWrapper
      title={
        <span className='flex items-center gap-2'>
          <IconBadge tone='success' size='sm'>
            <HeartPulse />
          </IconBadge>
          {t('服务状态')}
        </span>
      }
      description={t('按分组查看渠道可用性与近期表现')}
      contentClassName='p-3 sm:p-5'
    >
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
        {cards.map((card) => (
          <GroupStatusCard key={card.id} card={card} />
        ))}
      </div>
    </PanelWrapper>
  )
}
