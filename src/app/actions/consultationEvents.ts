//src/app/actions/consultationEvents.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Database } from '@/types/database'
import { CONSULTATION_STATUSES } from '@/lib/consultationConstants'

const supportEventSchema = z.object({
  consultationId: z.string().uuid('無効な相談IDです。'),
  staff_id: z.string().uuid('担当者を選択してください。'),
  status: z.enum(CONSULTATION_STATUSES, {
    errorMap: () => ({ message: '無効なステータスです。' }),
  }),
  event_note: z.string().min(1, '対応内容は必須です。').max(5000, '対応内容は5000文字以内で入力してください。'),
  next_action_date: z.string().nullable(),
})

// ★ 変更点: 返り値の型に `consultation` を追加
type ReturnType = {
  success: boolean
  error?: string
  consultation?: Database['public']['Tables']['consultations']['Row'] 
}

export async function createSupportEvent(formData: any): Promise<ReturnType> {
  const supabase = await createClient()

  const validationResult = supportEventSchema.safeParse(formData)
  if (!validationResult.success) {
    const errorMessage = validationResult.error.errors.map(e => e.message).join('\n')
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
        next_action_date: next_action_date || null,
      })
    if (eventError) throw eventError

    // ★ 変更点: Step Bで、更新後のデータを取得して返すように修正
    const { data: updatedConsultation, error: consultationError } = await supabase
      .from('consultations')
      .update({ status: status, staff_id: staff_id })
      .eq('id', consultationId)
      .select()
      .single()

    if (consultationError) throw consultationError

    revalidatePath('/consultations')
    revalidatePath(`/consultations/${consultationId}`)

    // ★ 変更点: 成功時に更新後のconsultationデータを返す
    return { success: true, consultation: updatedConsultation }
    
  } catch (e: any) {
    console.error('Error in createSupportEvent:', e.message)
    return { success: false, error: '記録の保存に失敗しました。' }
  }
}