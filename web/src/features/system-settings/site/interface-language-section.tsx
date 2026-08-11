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
    default_theme: z.enum(['system', 'light', 'dark']),
  }),
})

type InterfaceLanguageFormValues = z.infer<typeof interfaceLanguageSchema>

const DEFAULT_THEME_OPTIONS = [
  { value: 'system', labelKey: 'Follow System' },
  { value: 'light', labelKey: 'Light' },
  { value: 'dark', labelKey: 'Dark' },
] as const

type InterfaceLanguageSectionProps = {
  defaultLanguage: InterfaceLanguageCode
  defaultTheme: 'system' | 'light' | 'dark'
}

export function InterfaceLanguageSection({
  defaultLanguage,
  defaultTheme,
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
        general_setting: {
          interface_language: defaultLanguage,
          default_theme: defaultTheme,
        },
      },
      onSubmit: async (_data, changedFields) => {
        const language = changedFields['general_setting.interface_language']
        const theme = changedFields['general_setting.default_theme']

        if (typeof language === 'string') {
          const result = await updateOption.mutateAsync({
            key: 'general_setting.interface_language',
            value: language,
          })
          if (!result.success) return

          await applyDefaultInterfaceLanguage(language)
          await applyUserInterfaceLanguage(useAuthStore.getState().auth.user)
        }
        if (theme === 'system' || theme === 'light' || theme === 'dark') {
          await updateOption.mutateAsync({
            key: 'general_setting.default_theme',
            value: theme,
          })
        }
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
            <FormField
              control={form.control}
              name='general_setting.default_theme'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Default Theme')}</FormLabel>
                  <Select
                    items={DEFAULT_THEME_OPTIONS.map((option) => ({
                      value: option.value,
                      label: t(option.labelKey),
                    }))}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full sm:max-w-72'>
                        <SelectValue placeholder={t('Select theme')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectGroup>
                        {DEFAULT_THEME_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {t(option.labelKey)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t(
                      'Theme shown to signed-out visitors. Users who switch the theme themselves keep their own choice.'
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
