//src/app/actions/consultationEvents.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { type Database } from '@/types/database'
import { CONSULTATION_STATUSES } from '@/lib/consultationConstants'

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

// ▼▼▼ 変更点: zodスキーマをアプリケーションの仕様と一致させる ▼▼▼
const supportEventSchema = z.object({
  consultationId: z.string().uuid('無効な相談IDです。'),
  staff_id: z.string().uuid('担当者を選択してください。'),
  status: z.enum(CONSULTATION_STATUSES, {
    message: '無効なステータスです。',
  }),
  event_note: z.string().max(5000, '対応内容は5000文字以内で入力してください。').optional().nullable(),
  next_action_date: z.string().optional().nullable(),
})
// ▲▲▲ 変更点 ▲▲▲

type SupportEventData = z.infer<typeof supportEventSchema>

type ReturnType = {
  success: boolean
  error?: string
  consultation?: Tables<'consultations'>
}

export async function createSupportEvent(formData: SupportEventData): Promise<ReturnType> {
  const supabase = await createClient()

  const validationResult = supportEventSchema.safeParse(formData)
  if (!validationResult.success) {
    const errorMessage = validationResult.error.issues.map((e: { message: string }) => e.message).join('\n')
    return { success: false, error: errorMessage }
  }

  const { consultationId, staff_id, status, event_note, next_action_date } = validationResult.data

  try {
    const { error: eventError } = await supabase
      .from('consultation_events')
      .insert({
        consultation_id: consultationId,
        staff_id: staff_id,
        status: status,
        event_note: event_note,
        next_action_date: next_action_date,
      })
    if (eventError) throw eventError

    const { data: updatedConsultation, error: consultationError } = await supabase
      .from('consultations')
      .update({
        status: status,
        staff_id: staff_id,
      })
      .eq('id', consultationId)
      .select()
      .single()

    if (consultationError) throw consultationError

    revalidatePath('/consultations')
    revalidatePath(`/consultations/${consultationId}`)

    return { success: true, consultation: updatedConsultation }

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred'
    console.error('Error in createSupportEvent:', errorMessage)
    return { success: false, error: '記録の保存に失敗しました。' }
  }
}

const updateSupportEventSchema = supportEventSchema.omit({ consultationId: true });
type UpdateSupportEventData = z.infer<typeof updateSupportEventSchema>

type UpdateReturnType = {
  success: boolean
  error?: string
}

export async function updateSupportEvent(
  eventId: string,
  consultationId: string,
  formData: UpdateSupportEventData
): Promise<UpdateReturnType> {
  const supabase = await createClient()
  
  const validationResult = updateSupportEventSchema.safeParse(formData)
  if (!validationResult.success) {
    const errorMessage = validationResult.error.issues.map((e: { message: string }) => e.message).join('\n')
    return { success: false, error: errorMessage }
  }

  if (!z.string().uuid().safeParse(eventId).success) {
    return { success: false, error: '無効なイベントIDです。' };
  }
   if (!z.string().uuid().safeParse(consultationId).success) {
    return { success: false, error: '無効な相談IDです。' };
  }

  const { staff_id, status, event_note, next_action_date } = validationResult.data

  try {
    const { error } = await supabase
      .from('consultation_events')
      .update({
        staff_id: staff_id,
        status: status,
        event_note: event_note,
        next_action_date: next_action_date,
      })
      .eq('id', eventId)
    
    if (error) throw error

    revalidatePath(`/consultations/${consultationId}`)

    return { success: true }

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred'
    console.error('Error in updateSupportEvent:', errorMessage)
    return { success: false, error: '記録の更新に失敗しました。' }
  }
}

type DeleteReturnType = {
  success: boolean
  error?: string
}

export async function deleteSupportEvent(
  eventId: string,
  consultationId: string
): Promise<DeleteReturnType> {
  const supabase = await createClient()

  if (!z.string().uuid().safeParse(eventId).success) {
    return { success: false, error: '無効なイベントIDです。' };
  }
  if (!z.string().uuid().safeParse(consultationId).success) {
    return { success: false, error: '無効な相談IDです。' };
  }

  try {
    const { error } = await supabase
      .from('consultation_events')
      .delete()
      .eq('id', eventId)

    if (error) throw error

    revalidatePath(`/consultations/${consultationId}`)

    return { success: true }

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred'
    console.error('Error in deleteSupportEvent:', errorMessage)
    return { success: false, error: '記録の削除に失敗しました。' }
  }
}