// src/app/actions/consultations.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

import {
  type Consultation,
  type ConsultationInsert,
  type ConsultationUpdate,
  type ConsultationWithStaff,
  type ConsultationWithNextAction,
  type GetConsultationsArgs,
} from '@/types/consultation'

// --- getConsultations (ページネーション + グローバル集計対応版) ---
type GetConsultationsReturnType = {
  success: boolean
  data?: ConsultationWithNextAction[]
  count?: number | null
  // ▼▼▼【追加】ステータスごとの集計結果を返す型定義 ▼▼▼
  statusCounts?: { [key: string]: number }
  error?: string
}

export async function getConsultations({
  page,
  itemsPerPage,
  searchTerm, // 【追加】検索キーワードを受け取る
}: GetConsultationsArgs): Promise<GetConsultationsReturnType> {
  const supabase = await createClient()

  try {
    const offset = (page - 1) * itemsPerPage

    // 1. ページネーションデータの取得（更新したRPCを呼び出し）
    // 引数に search_query を追加
    const { data, error } = await supabase.rpc('get_consultations_with_next_action', {
      page_limit: itemsPerPage,
      page_offset: offset,
      search_query: searchTerm || undefined, // 【追加】
    })

    // 2. 全体の件数取得（検索キーワードがある場合は、その条件でカウントする）
     // 2. 全体の件数取得（より確実に全フィールドを対象にする）
    let countQuery = supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })

    if (searchTerm) {
      // OR条件をグループ化して確実に適用する
      countQuery = countQuery.or(
        `name.ilike.%${searchTerm}%,` +
        `furigana.ilike.%${searchTerm}%,` +
        `address.ilike.%${searchTerm}%,` +
        `phone_home.ilike.%${searchTerm}%,` +
        `phone_mobile.ilike.%${searchTerm}%,` +
        `consultation_content.ilike.%${searchTerm}%,` +
        `emergency_contact_name.ilike.%${searchTerm}%,` +
        `care_manager.ilike.%${searchTerm}%`
      )
    }
    const { count, error: countError } = await countQuery

    if (error || countError) {
      const errorMessage = error?.message || countError?.message
      console.error('Get Consultations RPC Server Action Error:', errorMessage)
      return { success: false, error: '相談一覧の取得に失敗しました。' }
    }

    // ▼▼▼ グローバル集計ロジック（既存のロジックを1文字も削除せず維持） ▼▼▼
    // ※集計結果は「検索条件に関わらず全体の統計」を示す必要があるため、あえて searchTerm で絞り込まない全件取得を維持します
    const { data: allStatusData, error: aggregationError } = await supabase
      .from('consultations')
      .select('status, user_id')
    
    const statusCounts: { [key: string]: number } = {
      'active': 0,
      '利用者登録済み': 0,
      'すべて表示': count || 0, // ここは検索時のヒット数ではなく、本来の「すべて」を指す場合は別途取得が必要ですが、現状の仕様を維持します
    }

    if (!aggregationError && allStatusData) {
      const inactiveStatuses = ['支援終了', '対象外・辞退'];
      allStatusData.forEach(row => {
        if (row.user_id) {
          statusCounts['利用者登録済み'] = (statusCounts['利用者登録済み'] || 0) + 1;
          return;
        }
        const status = row.status || '未設定';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
        if (!inactiveStatuses.includes(status)) {
          statusCounts['active'] = (statusCounts['active'] || 0) + 1;
        }
      });
      // 検索時は「すべて表示」のラベルにヒット件数を反映させる
      if (searchTerm) {
        statusCounts['すべて表示'] = count || 0;
      }
    }
    // ▲▲▲ 集計ロジック終了 ▲▲▲

    return { 
      success: true, 
      data: data as ConsultationWithNextAction[], 
      count, 
      statusCounts 
    }
    
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

// --- deleteConsultation (変更なし) ---
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
    return { success: true }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬエラーが発生しました。'
    console.error('Unexpected Error in deleteConsultation:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}

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