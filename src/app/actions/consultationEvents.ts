//src/app/actions/consultationEvents.ts
'use server'

// tsconfig.jsonのパスエイリアスに基づいた絶対パスに修正
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { type Database } from '@/types/database'
import { CONSULTATION_STATUSES } from '@/lib/consultationConstants'

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

const supportEventSchema = z.object({
  consultationId: z.string().uuid('無効な相談IDです。'),
  staff_id: z.string().uuid('担当者を選択してください。'),
  status: z.enum(CONSULTATION_STATUSES, {
    message: '無効なステータ-スです。',
  }),
  event_note: z.string().min(1, '対応内容は必須です。').max(5000, '対応内容は5000文字以内で入力してください。'),
  next_action_date: z.string().nullable(),
})

type SupportEventData = z.infer<typeof supportEventSchema>

type ReturnType = {
  success: boolean
  error?: string
  consultation?: Tables<'consultations'>
}

export async function createSupportEvent(formData: SupportEventData): Promise<ReturnType> {
  // createClientが同期関数になったため、awaitを削除
  const supabase = createClient()

  const validationResult = supportEventSchema.safeParse(formData)
  if (!validationResult.success) {
    const errorMessage = validationResult.error.issues.map((e: { message: string }) => e.message).join('\n')
    return { success: false, error: errorMessage }
  }

  const { consultationId, staff_id, status, event_note, next_action_date } = validationResult.data

  try {
    // tryブロック全体を非同期処理で包む必要はないが、
    // Supabaseへの各APIコールは非同期(Promiseを返す)なので、awaitは各所で必要
    const { error: eventError } = await supabase
      .from('consultation_events')
      .insert({
        consultation_id: consultationId,
        staff_id: staff_id,
        status: status,
        event_note: event_note,
        next_action_date: next_action_date || null,
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