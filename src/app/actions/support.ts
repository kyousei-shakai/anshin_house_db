//src/app/actions/support.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { 
  type SupportCategory, 
  type DailySupportLogWithStaff, 
  type SupportTaskWithStaff,
  type CreateSupportLogWithTaskArgs,
  type UserCareDashboardRow,
  type UpcomingTaskRow,
  type UserRecentHistoryRow,
  type TeamRecentHistoryRow
} from '@/types/support'

// ==================================================================
// 1. 取得系（Read）のアクション
// ==================================================================

/** 支援カテゴリ一覧取得（入力フォーム用：有効なもののみ） */
export async function getSupportCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('support_categories')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) return { success: false, error: 'カテゴリ取得に失敗しました。' }
  return { success: true, data }
}

/** すべてのカテゴリを取得（管理画面用：非表示含む） */
export async function getAllSupportCategories() {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from('support_categories')
      .select('*')
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) throw error
    return { success: true, data }
  } catch (e) {
    return { success: false, error: '取得に失敗しました。' }
  }
}

/** 利用者ごとの生活支援記録履歴を取得（全件） */
export async function getDailySupportLogs(userId: string) {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from('daily_support_logs')
      .select('*, staff:performed_by_staff_id(name)')
      .eq('user_id', userId)
      .order('support_at', { ascending: false })

    if (error) throw error
    return { success: true, data: (data as unknown) as DailySupportLogWithStaff[] }
  } catch (e) {
    console.error('getDailySupportLogs Error:', e)
    return { success: false, error: '履歴の取得に失敗しました。' }
  }
}

/** 窓口①：ケア状況ダッシュボードのデータを取得する（モニタリング用） */
export async function getUserCareDashboard() {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase.rpc('get_user_care_dashboard')
    if (error) throw error
    return { success: true, data: (data as unknown) as UserCareDashboardRow[] }
  } catch (e) {
    console.error('getUserCareDashboard Error:', e)
    return { success: false, error: 'ダッシュボードのデータ取得に失敗しました。' }
  }
}

/** 窓口②：すべての未完了予定を取得する（スケジュール視点用） */
export async function getAllUpcomingTasks(limit: number = 100, offset: number = 0) {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase.rpc('get_all_upcoming_tasks', {
      p_limit: limit,
      p_offset: offset
    })
    if (error) throw error
    // W-2対策：正直なキャスト（unknownを経由しない）
    return { success: true, data: data as UpcomingTaskRow[] }
  } catch (e) {
    console.error('getAllUpcomingTasks Error:', e)
    return { success: false, error: '全予定の取得に失敗しました。' }
  }
}

/** 窓口③：特定の利用者の直近履歴を取得する（60日分カルテ表示用） */
export async function getUserRecentHistory(userId: string) {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase.rpc('get_user_recent_history', {
      p_user_id: userId
    })
    if (error) throw error
    return { success: true, data: (data as unknown) as UserRecentHistoryRow[] }
  } catch (e) {
    console.error('getUserRecentHistory Error:', e)
    return { success: false, error: '直近履歴の取得に失敗しました。' }
  }
}

/** 窓口④：チーム全体の直近履歴を取得する */
export async function getTeamRecentHistory(limit: number = 100) {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase.rpc('get_team_recent_history', {
      p_limit: limit
    })
    if (error) throw error
    return { success: true, data: (data as unknown) as TeamRecentHistoryRow[] }
  } catch (e) {
    console.error('getTeamRecentHistory Error:', e)
    return { success: false, error: 'チーム履歴の取得に失敗しました。' }
  }
}

/** 【互換用】利用者の未完了の次回予定を取得 */
export async function getOpenSupportTasks(userId: string) {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from('support_tasks')
      .select('*, assigned_staff:assigned_staff_id(name)')
      .eq('user_id', userId)
      .eq('status', 'open')
      .order('scheduled_at', { ascending: true })

    if (error) throw error
    return { success: true, data: (data as unknown) as SupportTaskWithStaff[] }
  } catch (e) {
    console.error('getOpenSupportTasks Error:', e)
    return { success: false, error: '予定の取得に失敗しました。' }
  }
}


// ==================================================================
// 2. 登録・更新系（Write）のアクション
// ==================================================================

/** 生活支援記録と次回予定を同時に保存（トランザクションRPC） */
export async function createSupportLogWithTask(args: CreateSupportLogWithTaskArgs) {
  if (!args.user_id || !args.log_category_id || !args.content?.trim()) {
    return { success: false, error: '支援記録の入力内容が不足しています。' }
  }

  const supabase = await createClient()
  try {
    const { data, error } = await supabase.rpc('save_support_log_with_task', {
      p_user_id: args.user_id,
      p_performed_by_staff_id: args.performed_by_staff_id,
      p_support_date: args.support_date,
      p_log_category_id: args.log_category_id,
      p_content: args.content,
      // TODO: Phase 2 マルチテナント対応
      p_organization_id: undefined, 
      p_task_assigned_staff_id: args.task?.assigned_staff_id ?? undefined,
      p_task_scheduled_at: args.task?.scheduled_at ?? undefined,
      p_task_category_id: args.task?.category_id ?? undefined,
      p_task_content: args.task?.content ?? undefined
    })

    if (error) throw error
    revalidatePath(`/users/${args.user_id}`)
    revalidatePath('/')
    return { success: true, data }
  } catch (e) {
    console.error('createSupportLogWithTask Error:', e)
    return { success: false, error: '記録の保存に失敗しました。' }
  }
}

/** 次回予定のみを単独で登録する */
export async function createSupportTaskOnly(args: {
  user_id: string
  assigned_staff_id: string
  scheduled_at: string
  category_id: string
  content: string
}) {
  if (!args.category_id || !args.content?.trim()) {
    return { success: false, error: '予定の入力内容が不足しています。' }
  }

  const supabase = await createClient()
  try {
    const { data: cat } = await supabase.from('support_categories').select('name').eq('id', args.category_id).single()
    if (!cat) throw new Error('カテゴリが見つかりません。')

    const { error } = await supabase.from('support_tasks').insert({
      user_id: args.user_id,
      assigned_staff_id: args.assigned_staff_id,
      scheduled_at: args.scheduled_at,
      category_id: args.category_id,
      category_name_snapshot: cat.name,
      content: args.content,
      status: 'open',
      // TODO: Phase 2 マルチテナント対応
      organization_id: undefined 
    })

    if (error) throw error
    revalidatePath(`/users/${args.user_id}`)
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    return { success: false, error: '予定の登録に失敗しました。' }
  }
}

/** 
 * 次回予定を完了にし、自動的に実績（ログ）としてコピーする 
 * ★ C-1 & 罠B 対策：原子化された RPC 呼び出しへ変更
 */
export async function completeSupportTask(task: SupportTaskWithStaff) {
  const supabase = await createClient()
  try {
    // 2回に分けて呼び出さず、DB内部で完結するRPCを1回だけ呼び出す
    const { error } = await supabase.rpc('complete_support_task', {
      p_task_id: task.id
    })
    
    if (error) throw error

    revalidatePath(`/users/${task.user_id}`)
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    console.error('completeSupportTask Error:', e)
    return { success: false, error: '予定の完了処理に失敗しました。' }
  }
}

/** 次回予定の内容を編集（スナップショット同期対応版） */
export async function updateSupportTask(
  taskId: string, 
  userId: string, 
  updates: { 
    scheduled_at: string, 
    category_id: string, 
    content: string, 
    assigned_staff_id: string 
  }
) {
  if (!taskId || !updates.category_id || !updates.content?.trim()) {
    return { success: false, error: '更新内容が正しくありません。' }
  }

  const supabase = await createClient()
  try {
    const { data: cat } = await supabase.from('support_categories').select('name').eq('id', updates.category_id).single()
    if (!cat) throw new Error('カテゴリが見つかりません。')

    const { error } = await supabase
      .from('support_tasks')
      .update({
        scheduled_at: updates.scheduled_at,
        category_id: updates.category_id,
        category_name_snapshot: cat.name,
        content: updates.content,
        assigned_staff_id: updates.assigned_staff_id
      })
      .eq('id', taskId)
    
    if (error) throw error

    revalidatePath(`/users/${userId}`)
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    return { success: false, error: '更新に失敗しました。' }
  }
}

/** 次回予定のキャンセル（取消） */
export async function cancelSupportTask(taskId: string, userId: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase
      .from('support_tasks')
      .update({ status: 'cancelled' })
      .eq('id', taskId)

    if (error) throw error
    revalidatePath(`/users/${userId}`)
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    return { success: false, error: '取消に失敗しました。' }
  }
}

// ==================================================================
// 3. マスタ管理（Category Management）用のアクション
// ==================================================================

/** 支援カテゴリの新規登録 */
export async function createSupportCategory(name: string, description?: string) {
  if (!name.trim()) return { success: false, error: '名称を入力してください。' }

  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from('support_categories')
      .insert({
        name: name.trim(),
        description: description?.trim(),
        is_active: true,
        organization_id: undefined 
      })
      .select().single()

    if (error) {
      if (error.code === '23505') throw new Error('同じ名前のカテゴリが既に存在します。')
      throw error
    }
    revalidatePath('/settings/categories')
    return { success: true, data }
  } catch (e) {
    const msg = e instanceof Error ? e.message : '登録に失敗しました。'
    return { success: false, error: msg }
  }
}

/** 支援カテゴリの表示・非表示切り替え（論理削除） */
export async function toggleCategoryActive(id: string, isActive: boolean) {
  const supabase = await createClient()
  try {
    const { error } = await supabase
      .from('support_categories')
      .update({ is_active: isActive })
      .eq('id', id)

    if (error) throw error
    revalidatePath('/settings/categories')
    return { success: true }
  } catch (e) {
    return { success: false, error: '設定変更に失敗しました。' }
  }
}