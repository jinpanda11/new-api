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
import { zodResolver } from '@hookform/resolvers/zod'
import type { ChangeEvent } from 'react'
import type { Resolver } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as z from 'zod'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { FormDirtyIndicator } from '../components/form-dirty-indicator'
import { FormNavigationGuard } from '../components/form-navigation-guard'
import {
  SettingsForm,
  SettingsFormGrid,
} from '../components/settings-form-layout'
import { SettingsPageFormActions } from '../components/settings-page-context'
import { SettingsSection } from '../components/settings-section'
import { useSettingsForm } from '../hooks/use-settings-form'
import { useUpdateOption } from '../hooks/use-update-option'

const MAX_DISPLAY_MULTIPLIER = 100000

/**
 * react-hook-form 7 interprets dotted `name` strings as nested paths. The
 * schema must model `ranking_setting.display_multiplier` as a nested object,
 * otherwise zod validates the flat key that never exists in the form state and
 * saves fail with an "Invalid input" type error.
 */
const rankingSchema = z.object({
  ranking_setting: z.object({
    display_multiplier: z.coerce
      .number()
      .gt(0, 'Multiplier must be greater than 0')
      .max(MAX_DISPLAY_MULTIPLIER, 'Multiplier is too large'),
  }),
})

type RankingFormValues = z.infer<typeof rankingSchema>
type MultiplierInputValue = number | ''

type FlatRankingDefaults = {
  'ranking_setting.display_multiplier': number
}

type RankingSettingsSectionProps = {
  defaultValues: FlatRankingDefaults
}

export function RankingSettingsSection({
  defaultValues,
}: RankingSettingsSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const handleNumberChange =
    (onChange: (value: MultiplierInputValue) => void) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.currentTarget.valueAsNumber
      onChange(Number.isNaN(value) ? '' : value)
    }

  const { form, handleSubmit, isDirty, isSubmitting } =
    useSettingsForm<RankingFormValues>({
      resolver: zodResolver(rankingSchema) as Resolver<
        RankingFormValues,
        unknown,
        RankingFormValues
      >,
      defaultValues: {
        ranking_setting: {
          display_multiplier:
            defaultValues['ranking_setting.display_multiplier'] ?? 1,
        },
      },
      onSubmit: async (_data, changedFields) => {
        for (const [key, value] of Object.entries(changedFields)) {
          await updateOption.mutateAsync({
            key,
            value: value as string | number | boolean,
          })
        }
      },
    })

  return (
    <SettingsSection title={t('Ranking Settings')}>
      <FormNavigationGuard when={isDirty} />

      <Form {...form}>
        <SettingsForm onSubmit={handleSubmit}>
          <SettingsPageFormActions
            onSave={handleSubmit}
            isSaving={updateOption.isPending || isSubmitting}
          />
          <FormDirtyIndicator isDirty={isDirty} />
          <SettingsFormGrid>
            <FormField
              control={form.control}
              name='ranking_setting.display_multiplier'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Ranking Display Multiplier')}</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min='0'
                      step='0.01'
                      value={field.value ?? ''}
                      onChange={handleNumberChange(field.onChange)}
                      name={field.name}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'Multiplier applied to the cumulative token usage shown on the public rankings page. Display only — real usage, statistics, and billing are unchanged. Default 1 means no scaling.'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SettingsFormGrid>
        </SettingsForm>
      </Form>
    </SettingsSection>
  )
}
