// src/app/actions/supportPlans.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'
import { redirect } from 'next/navigation'

type SupportPlan = Database['public']['Tables']['support_plans']['Row']
type SupportPlanInsert = Database['public']['Tables']['support_plans']['Insert']
type SupportPlanUpdate = Database['public']['Tables']['support_plans']['Update']

// --- createSupportPlan (変更なし) ---
type CreateSupportPlanReturnType = { success: boolean; data?: SupportPlan; error?: string }
export async function createSupportPlan(planData: SupportPlanInsert): Promise<CreateSupportPlanReturnType> {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase.from('support_plans').insert(planData).select().single()
    if (error) {
      console.error('Create Support Plan Server Action Error:', error)
      return { success: false, error: `支援計画の作成に失敗しました: ${error.message}` }
    }
    revalidatePath('/support-plans')
    return { success: true, data }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬエラーが発生しました。'
    console.error('Unexpected Error in createSupportPlan:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}

// --- updateSupportPlan (変更なし) ---
type UpdateSupportPlanReturnType = { success: boolean; data?: SupportPlan; error?: string }
export async function updateSupportPlan(id: string, planData: SupportPlanUpdate): Promise<UpdateSupportPlanReturnType> {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase.from('support_plans').update(planData).eq('id', id).select().single()
    if (error) {
      console.error('Update Support Plan Server Action Error:', error)
      return { success: false, error: `支援計画の更新に失敗しました: ${error.message}` }
    }
    revalidatePath('/support-plans')
    revalidatePath(`/support-plans/${id}`)
    revalidatePath(`/support-plans/${id}/edit`)
    return { success: true, data }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬエラーが発生しました。'
    console.error('Unexpected Error in updateSupportPlan:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}

// --- getSupportPlans ---
type GetSupportPlansReturnType = { 
  success: boolean; 
  data?: (SupportPlan & { users: { uid: string } | null, staff: { name: string | null } | null })[]; 
  error?: string 
}
export async function getSupportPlans(): Promise<GetSupportPlansReturnType> {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase.from('support_plans').select(`*, users ( uid ), staff:staff_id ( name )`).order('creation_date', { ascending: false })
    if (error) {
      console.error('Get Support Plans Server Action Error:', error)
      return { success: false, error: '支援計画一覧の取得に失敗しました。' }
    }
    // ★ 変更点 1: 説明コメントを追加
    // @ts-expect-error: Supabaseの型推論はJOINした外部キーの型(staff, users)を認識できないため
    return { success: true, data: data || [] }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬエラーが発生しました。'
    console.error('Unexpected Error in getSupportPlans:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}

// --- getSupportPlanById ---
type GetSupportPlanByIdReturnType = { 
  success: boolean; 
  data?: SupportPlan & { staff: { name: string | null } | null }; 
  error?: string 
}
export async function getSupportPlanById(id: string): Promise<GetSupportPlanByIdReturnType> {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase.from('support_plans').select(`*, staff:staff_id ( name )`).eq('id', id).single()
    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Get Support Plan By Id Server Action Error:', error)
      }
      return { success: false, error: '支援計画の取得に失敗しました。' }
    }
    // ★ 変更点 2: 説明コメントを追加
    // @ts-expect-error: Supabaseの型推論はJOINした外部キーの型(staff)を認識できないため
    return { success: true, data }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬエラーが発生しました。'
    console.error('Unexpected Error in getSupportPlanById:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}

// --- deleteSupportPlan ---
export async function deleteSupportPlan(id: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase
      .from('support_plans')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete Support Plan Server Action Error:', error)
      return { success: false, error: '支援計画の削除に失敗しました。' }
    }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬエラーが発生しました。'
    console.error('Unexpected Error in deleteSupportPlan:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }

  revalidatePath('/support-plans')
  redirect('/support-plans')
}

// --- getAllSupportPlansForExport ---
type GetAllSupportPlansReturnType = {
  success: boolean
  data?: (SupportPlan & { users: { uid: string } | null, staff: { name: string | null } | null })[]
  error?: string
}
export async function getAllSupportPlansForExport(): Promise<GetAllSupportPlansReturnType> {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase.from('support_plans').select(`*, users ( uid ), staff:staff_id ( name )`).order('creation_date', { ascending: false })
    if (error) {
      console.error('Get All Support Plans For Export Error:', error)
      return { success: false, error: '全支援計画データの取得に失敗しました。' }
    }
    // ★ 変更点 3: 説明コメントを追加
    // @ts-expect-error: Supabaseの型推論はJOINした外部キーの型(staff, users)を認識できないため
    return { success: true, data: data || [] }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬエラーが発生しました。'
    console.error('Unexpected Error in getAllSupportPlansForExport:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}

// --- getSupportPlansByUserId ---
export async function getSupportPlansByUserId(userId: string): Promise<GetAllSupportPlansReturnType> {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from('support_plans')
      .select('*, staff:staff_id ( name )')
      .eq('user_id', userId)
      .order('creation_date', { ascending: false })

    if (error) {
      console.error('Get Support Plans By UserId Error:', error)
      return { success: false, error: '利用者の支援計画取得に失敗しました。' }
    }
    // ★ 変更点 4: 説明コメントを追加
    // @ts-expect-error: Supabaseの型推論はJOINした外部キーの型(staff)を認識できないため
    return { success: true, data: data || [] }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬエラーが発生しました。'
    console.error('Unexpected Error in getSupportPlansByUserId:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}