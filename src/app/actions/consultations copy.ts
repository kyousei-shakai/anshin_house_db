//src/app/actions/consultations.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  type Consultation,
  type ConsultationWithStaff,
  type ConsultationInsert,
  type ConsultationUpdate,
} from '@/types/consultation'

// --- getConsultations (ページネーション対応版) ---
type GetConsultationsReturnType = {
  success: boolean
  data?: ConsultationWithStaff[]
  count?: number | null
  error?: string
}

export async function getConsultations({
  page,
  itemsPerPage,
}: {
  page: number
  itemsPerPage: number
}): Promise<GetConsultationsReturnType> {
  const supabase = createClient() // ★ 修正点: awaitを削除

  try {
    const offset = (page - 1) * itemsPerPage
    const { data, error, count } = await supabase
      .from('consultations')
      // ★ 修正点: 型推論が効きやすい構文に変更
      .select('*, staff:staff_id (name)', { count: 'exact' })
      .order('consultation_date', { ascending: false })
      .range(offset, offset + itemsPerPage - 1)

    if (error) {
      console.error('Get Consultations Server Action Error:', error)
      return { success: false, error: '相談一覧の取得に失敗しました。' }
    }
    // Supabase SSR @0.3.0では、JOINの型推論が不完全なため明示的にキャスト
    return { success: true, data: (data || []) as unknown as ConsultationWithStaff[], count }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬ不明なエラーが発生しました。'
    console.error('Unexpected Error in getConsultations:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}

// --- createConsultation ---
type CreateConsultationReturnType = {
  success: boolean
  data?: Consultation
  error?: string
}

export async function createConsultation(
  consultationData: ConsultationInsert
): Promise<CreateConsultationReturnType> {
  const supabase = createClient() // ★ 修正点: awaitを削除

  try {
    const { data, error } = await supabase
      .from('consultations')
      .insert(consultationData)
      .select()
      .single()

    if (error) {
      console.error('Create Consultation Server Action Error:', error)
      return { success: false, error: '相談記録の作成に失敗しました。' }
    }

    revalidatePath('/consultations')
    revalidatePath('/')

    return { success: true, data }

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬ不明なエラーが発生しました。'
    console.error('Unexpected Error in createConsultation:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}

// --- getConsultationById ---
type GetConsultationByIdReturnType = {
  success: boolean
  data?: ConsultationWithStaff
  error?: string
}

export async function getConsultationById(
  id: string
): Promise<GetConsultationByIdReturnType> {
  if (!id || typeof id !== 'string' || id.length !== 36) {
    console.error('Invalid ID format for getConsultationById:', id)
    return { success: false, error: '無効なID形式です。' }
  }

  const supabase = createClient() // ★ 修正点: awaitを削除
  try {
    const { data, error } = await supabase
      .from('consultations')
       // ★ 修正点: 型推論が効きやすい構文に変更
      .select('*, staff:staff_id (name)')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn(`Consultation with id ${id} not found.`)
        return { success: false, error: '指定された相談記録が見つかりません。' }
      }
      console.error('Get Consultation By ID Server Action Error:', error)
      return { success: false, error: '相談記録の取得に失敗しました。' }
    }

    // Supabase SSR @0.3.0では、JOINの型推論が不完全なため明示的にキャスト
    return { success: true, data: data as unknown as ConsultationWithStaff }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬ不明なエラーが発生しました。'
    console.error('Unexpected Error in getConsultationById:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}

// --- updateConsultation ---
type UpdateConsultationReturnType = {
  success: boolean
  data?: Consultation
  error?: string
}

export async function updateConsultation(
  id: string,
  consultationData: ConsultationUpdate
): Promise<UpdateConsultationReturnType> {
  if (!id) {
    return { success: false, error: '更新対象のIDが指定されていません。' }
  }

  const supabase = createClient() // ★ 修正点: awaitを削除

  try {
    const { data, error } = await supabase
      .from('consultations')
      .update(consultationData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update Consultation Server Action Error:', error)
      return { success: false, error: '相談記録の更新に失敗しました。' }
    }

    revalidatePath('/consultations')
    revalidatePath(`/consultations/${id}`)
    revalidatePath(`/consultations/${id}/edit`)
    revalidatePath('/')

    return { success: true, data }

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬ不明なエラーが発生しました。'
    console.error('Unexpected Error in updateConsultation:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}

// --- deleteConsultation (削除) ---
type DeleteConsultationReturnType = {
  success: boolean
  error?: string
}

export async function deleteConsultation(id: string): Promise<DeleteConsultationReturnType> {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from('consultations')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete Consultation Server Action Error:', error)
      return { success: false, error: '相談記録の削除に失敗しました。' }
    }

    revalidatePath('/consultations')
    redirect('/consultations')
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬエラーが発生しました。'
    console.error('Unexpected Error in deleteConsultation:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}

// --- getAllConsultationsForExport ---
type GetAllConsultationsReturnType = {
  success: boolean
  data?: ConsultationWithStaff[]
  error?: string
}
export async function getAllConsultationsForExport(): Promise<GetAllConsultationsReturnType> {
  const supabase = createClient() // ★ 修正点: awaitを削除
  try {
    const { data, error } = await supabase
      .from('consultations')
      // ★ 修正点: 型推論が効きやすい構文に変更
      .select('*, staff:staff_id (name)')
      .order('consultation_date', { ascending: false })

    if (error) {
      console.error('Get All Consultations For Export Error:', error)
      return { success: false, error: '全相談データの取得に失敗しました。' }
    }
    // Supabase SSR @0.3.0では、JOINの型推論が不完全なため明示的にキャスト
    return { success: true, data: (data || []) as unknown as ConsultationWithStaff[] }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬ不明なエラーが発生しました。'
    console.error('Unexpected Error in getAllConsultationsForExport:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}

// --- getConsultationsByUserId ---
export async function getConsultationsByUserId(userId: string): Promise<GetAllConsultationsReturnType> {
  const supabase = createClient() // ★ 修正点: awaitを削除
  try {
    const { data, error } = await supabase
      .from('consultations')
      // ★ 修正点: 型推論が効きやすい構文に変更
      .select('*, staff:staff_id (name)')
      .eq('user_id', userId)
      .order('consultation_date', { ascending: false })

    if (error) {
      console.error('Get Consultations By UserId Error:', error)
      return { success: false, error: '利用者の相談履歴取得に失敗しました。' }
    }
    // Supabase SSR @0.3.0では、JOINの型推論が不完全なため明示的にキャスト
    return { success: true, data: (data || []) as unknown as ConsultationWithStaff[] }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬ不明なエラーが発生しました。'
    console.error('Unexpected Error in getConsultationsByUserId:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}