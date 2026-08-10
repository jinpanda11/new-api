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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  applyDefaultInterfaceLanguage,
  applyUserInterfaceLanguage,
} from '@/i18n/language-state'
import {
  INTERFACE_LANGUAGE_OPTIONS,
  type InterfaceLanguageCode,
} from '@/i18n/languages'
import { useAuthStore } from '@/stores/auth-store'

import { FormDirtyIndicator } from '../components/form-dirty-indicator'
import { FormNavigationGuard } from '../components/form-navigation-guard'
import { SettingsForm } from '../components/settings-form-layout'
import { SettingsPageFormActions } from '../components/settings-page-context'
import { SettingsSection } from '../components/settings-section'
import { useSettingsForm } from '../hooks/use-settings-form'
import { useUpdateOption } from '../hooks/use-update-option'

const interfaceLanguageSchema = z.object({
  general_setting: z.object({
    interface_language: z.enum([
      'zhCN',
      'en',
      'fr',
      'ru',
      'ja',
      'vi',
      'zhTW',
    ]),
  }),
})

type InterfaceLanguageFormValues = z.infer<typeof interfaceLanguageSchema>

type InterfaceLanguageSectionProps = {
  defaultLanguage: InterfaceLanguageCode
}

export function InterfaceLanguageSection({
  defaultLanguage,
}: InterfaceLanguageSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()

  const { form, handleSubmit, handleReset, isDirty, isSubmitting } =
    useSettingsForm<InterfaceLanguageFormValues>({
      resolver: zodResolver(interfaceLanguageSchema) as Resolver<
        InterfaceLanguageFormValues,
        unknown,
        InterfaceLanguageFormValues
      >,
      defaultValues: {
        general_setting: { interface_language: defaultLanguage },
      },
      onSubmit: async (_data, changedFields) => {
        const language = changedFields['general_setting.interface_language']
        if (typeof language !== 'string') return

        const result = await updateOption.mutateAsync({
          key: 'general_setting.interface_language',
          value: language,
        })
        if (!result.success) return

        await applyDefaultInterfaceLanguage(language)
        await applyUserInterfaceLanguage(useAuthStore.getState().auth.user)
      },
    })

  return (
    <>
      <FormNavigationGuard when={isDirty} />
      <SettingsSection title={t('Interface Language')}>
        <Form {...form}>
          <SettingsForm onSubmit={handleSubmit}>
            <SettingsPageFormActions
              onSave={handleSubmit}
              onReset={handleReset}
              isSaving={isSubmitting || updateOption.isPending}
              isResetDisabled={!isDirty}
            />
            <FormDirtyIndicator isDirty={isDirty} />
            <FormField
              control={form.control}
              name='general_setting.interface_language'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Default Interface Language')}</FormLabel>
                  <Select
                    items={INTERFACE_LANGUAGE_OPTIONS.map((language) => ({
                      value: language.code,
                      label: language.label,
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full sm:max-w-72'>
                        <SelectValue placeholder={t('Select language')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        {INTERFACE_LANGUAGE_OPTIONS.map((language) => (
                          <SelectItem key={language.code} value={language.code}>
                            {language.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t(
                      'Used for signed-out visitors and users without a saved language preference.'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </SettingsForm>
        </Form>
      </SettingsSection>
    </>
  )
}
