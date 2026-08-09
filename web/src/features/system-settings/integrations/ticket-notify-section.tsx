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
import { useForm } from 'react-hook-form'
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
import { Switch } from '@/components/ui/switch'

import {
  SettingsForm,
  SettingsSwitchContent,
  SettingsSwitchItem,
} from '../components/settings-form-layout'
import { SettingsPageFormActions } from '../components/settings-page-context'
import { SettingsSection } from '../components/settings-section'
import { useResetForm } from '../hooks/use-reset-form'
import { useUpdateOption } from '../hooks/use-update-option'

const createTicketNotifySchema = (t: (key: string) => string) =>
  z.object({
    TicketEmailNotifyEnabled: z.boolean(),
    TicketAdminNotifyEmails: z.string().refine((value) => {
      const trimmed = value.trim()
      if (!trimmed) return true
      const parts = trimmed.split(',')
      return parts.every((part) => {
        const addr = part.trim()
        if (!addr) return true
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)
      })
    }, t('Enter valid comma-separated email addresses')),
    TicketNotifyStatusChangeEnabled: z.boolean(),
  })

type TicketNotifyFormValues = z.infer<ReturnType<typeof createTicketNotifySchema>>

type TicketNotifySectionProps = {
  defaultValues: TicketNotifyFormValues
}

export function TicketNotifySection({
  defaultValues,
}: TicketNotifySectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()
  const ticketNotifySchema = createTicketNotifySchema(t)

  const form = useForm<TicketNotifyFormValues>({
    resolver: zodResolver(ticketNotifySchema),
    defaultValues,
  })

  useResetForm(form, defaultValues)

  const onSubmit = async (values: TicketNotifyFormValues) => {
    const sanitized = {
      ...values,
      TicketAdminNotifyEmails: values.TicketAdminNotifyEmails.trim(),
    }
    const initial = {
      ...defaultValues,
      TicketAdminNotifyEmails: defaultValues.TicketAdminNotifyEmails.trim(),
    }

    const updates: Array<{ key: string; value: string | boolean }> = []

    if (sanitized.TicketEmailNotifyEnabled !== initial.TicketEmailNotifyEnabled) {
      updates.push({
        key: 'TicketEmailNotifyEnabled',
        value: sanitized.TicketEmailNotifyEnabled,
      })
    }

    if (
      sanitized.TicketAdminNotifyEmails !== initial.TicketAdminNotifyEmails
    ) {
      updates.push({
        key: 'TicketAdminNotifyEmails',
        value: sanitized.TicketAdminNotifyEmails,
      })
    }

    if (
      sanitized.TicketNotifyStatusChangeEnabled !==
      initial.TicketNotifyStatusChangeEnabled
    ) {
      updates.push({
        key: 'TicketNotifyStatusChangeEnabled',
        value: sanitized.TicketNotifyStatusChangeEnabled,
      })
    }

    for (const update of updates) {
      await updateOption.mutateAsync(update)
    }
  }

  return (
    <SettingsSection title={t('Ticket Email Notification')}>
      <Form {...form}>
        <SettingsForm onSubmit={form.handleSubmit(onSubmit)} autoComplete='off'>
          <SettingsPageFormActions
            onSave={form.handleSubmit(onSubmit)}
            isSaving={updateOption.isPending}
            saveLabel='Save ticket notification settings'
          />

          <FormField
            control={form.control}
            name='TicketEmailNotifyEnabled'
            render={({ field }) => (
              <SettingsSwitchItem>
                <SettingsSwitchContent>
                  <FormLabel>
                    {t('Enable ticket email notification')}
                  </FormLabel>
                  <FormDescription>
                    {t(
                      'Notify administrators when users create tickets or add replies, and notify users when administrators reply.'
                    )}
                  </FormDescription>
                </SettingsSwitchContent>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </SettingsSwitchItem>
            )}
          />

          <FormField
            control={form.control}
            name='TicketAdminNotifyEmails'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Admin notification emails')}</FormLabel>
                <FormControl>
                  <Input
                    autoComplete='off'
                    placeholder={t('admin@example.com, ops@example.com')}
                    {...field}
                    onChange={(event) => field.onChange(event.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  {t(
                    'Comma-separated email addresses to receive new ticket alerts. Leave blank to fall back to the root user email.'
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='TicketNotifyStatusChangeEnabled'
            render={({ field }) => (
              <SettingsSwitchItem>
                <SettingsSwitchContent>
                  <FormLabel>{t('Notify user on status change')}</FormLabel>
                  <FormDescription>
                    {t(
                      'Send an email to the ticket owner when an administrator changes the ticket status.'
                    )}
                  </FormDescription>
                </SettingsSwitchContent>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </SettingsSwitchItem>
            )}
          />
        </SettingsForm>
      </Form>
    </SettingsSection>
  )
}
