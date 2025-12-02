// src/app/actions/consultations.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
// ▼▼▼【修正】redirect は不要になったため削除しました ▼▼▼
// import { redirect } from 'next/navigation' 

import {
  type Consultation,
  type ConsultationInsert,
  type ConsultationUpdate,
  type ConsultationWithStaff,
  type ConsultationWithNextAction,
  type GetConsultationsArgs,
} from '@/types/consultation'

// --- getConsultations (ページネーション対応版) ---
type GetConsultationsReturnType = {
  success: boolean
  data?: ConsultationWithNextAction[]
  count?: number | null
  error?: string
}

export async function getConsultations({
  page,
  itemsPerPage,
}: GetConsultationsArgs): Promise<GetConsultationsReturnType> {
  const supabase = await createClient()

  try {
    const offset = (page - 1) * itemsPerPage

    const { data, error } = await supabase.rpc('get_consultations_with_next_action', {
      page_limit: itemsPerPage,
      page_offset: offset,
    })

    const { count, error: countError } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })

    if (error || countError) {
      const errorMessage = error?.message || countError?.message
      console.error('Get Consultations RPC Server Action Error:', errorMessage)
      return { success: false, error: '相談一覧の取得に失敗しました。' }
    }
    
    return { success: true, data: data as ConsultationWithNextAction[], count }
    
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬ不明なエラーが発生しました。'
    console.error('Unexpected Error in getConsultations:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}


// --- createConsultation (変更なし) ---
type CreateConsultationReturnType = {
  success: boolean
  data?: Consultation
  error?: string
}
export async function createConsultation(
  consultationData: ConsultationInsert
): Promise<CreateConsultationReturnType> {
  const supabase = await createClient()
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

// --- getConsultationById (変更なし) ---
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
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from('consultations')
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
    return { success: true, data: data as unknown as ConsultationWithStaff }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬ不明なエラーが発生しました。'
    console.error('Unexpected Error in getConsultationById:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}


// --- updateConsultation (変更なし) ---
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
  const supabase = await createClient()
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

// --- deleteConsultation (修正箇所) ---
type DeleteConsultationReturnType = {
  success: boolean
  error?: string
}
export async function deleteConsultation(id: string): Promise<DeleteConsultationReturnType> {
  const supabase = await createClient()
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
    // ▼▼▼【修正】redirectを削除し、成功ステータスのみを返す ▼▼▼
    // クライアント側で router.push を実行するため、ここで redirect する必要はありません。
    return { success: true }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬエラーが発生しました。'
    console.error('Unexpected Error in deleteConsultation:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}

// --- getAllConsultationsForExport & getConsultationsByUserId ---

// --- getAllConsultationsForExport (変更なし) ---
type GetAllConsultationsReturnType = {
  success: boolean
  data?: ConsultationWithStaff[]
  error?: string
}
export async function getAllConsultationsForExport(): Promise<GetAllConsultationsReturnType> {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from('consultations')
      .select('*, staff:staff_id (name)')
      .order('consultation_date', { ascending: false })
    if (error) {
      console.error('Get All Consultations For Export Error:', error)
      return { success: false, error: '全相談データの取得に失敗しました。' }
    }
    return { success: true, data: (data || []) as unknown as ConsultationWithStaff[] }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬ不明なエラーが発生しました。'
    console.error('Unexpected Error in getAllConsultationsForExport:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}

// --- getConsultationsByUserId (変更なし) ---
export async function getConsultationsByUserId(userId: string): Promise<GetAllConsultationsReturnType> {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from('consultations')
      .select('*, staff:staff_id (name)')
      .eq('user_id', userId)
      .order('consultation_date', { ascending: false })
    if (error) {
      console.error('Get Consultations By UserId Error:', error)
      return { success: false, error: '利用者の相談履歴取得に失敗しました。' }
    }
    return { success: true, data: (data || []) as unknown as ConsultationWithStaff[] }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬ不明なエラーが発生しました。'
    console.error('Unexpected Error in getConsultationsByUserId:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}