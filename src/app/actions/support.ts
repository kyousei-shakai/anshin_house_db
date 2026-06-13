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

/** 支援カテゴリ一覧取得 */
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

/** すべてのカテゴリを取得 */
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
  } catch {
    return { success: false, error: '取得に失敗しました。' }
  }
}

/** 利用者ごとの生活支援記録履歴を取得（副次カテゴリ含む） */
export async function getDailySupportLogs(userId: string) {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from('daily_support_logs')
      .select(`
        *,
        staff:performed_by_staff_id(name),
        sub_categories:daily_support_log_sub_categories(
          category_id,
          category_name_snapshot
        )
      `)
      .eq('user_id', userId)
      .order('support_at', { ascending: false })

    if (error) throw error
    return { success: true, data: (data as unknown) as DailySupportLogWithStaff[] }
  } catch (e) {
    console.error('getDailySupportLogs Error:', e)
    return { success: false, error: '履歴の取得に失敗しました。' }
  }
}

/** 窓口①：ケア状況ダッシュボードのデータを取得 */
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

/** 窓口②：すべての未完了予定を取得 */
export async function getAllUpcomingTasks(limit: number = 100, offset: number = 0) {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase.rpc('get_all_upcoming_tasks', {
      p_limit: limit,
      p_offset: offset
    })
    if (error) throw error
    return { success: true, data: data as UpcomingTaskRow[] }
  } catch (e) {
    console.error('getAllUpcomingTasks Error:', e)
    return { success: false, error: '全予定の取得に失敗しました。' }
  }
}

/** 窓口④：チーム全体の直近履歴を取得 */
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

/** 利用者の未完了の次回予定を取得（副次カテゴリ含む） */
export async function getOpenSupportTasks(userId: string) {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from('support_tasks')
      .select(`
        *,
        assigned_staff:assigned_staff_id(name),
        sub_categories:support_task_sub_categories(
          category_id,
          category_name_snapshot
        )
      `)
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

/** 特定利用者の直近履歴 */
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


// ==================================================================
// 2. 登録・更新系（Write）のアクション
// ==================================================================

/** 生活支援記録と次回予定を同時に保存（複数カテゴリ・原子性対応版） */
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
      p_log_sub_category_ids: args.log_sub_category_ids ?? [],
      p_organization_id: undefined, 
      p_task_assigned_staff_id: args.task?.assigned_staff_id ?? undefined,
      p_task_scheduled_at: args.task?.scheduled_at ?? undefined,
      p_task_category_id: args.task?.category_id ?? undefined,
      p_task_content: args.task?.content ?? undefined,
      p_task_sub_category_ids: args.task?.sub_category_ids ?? []
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

/** 次回予定のみを単独で登録する（複数カテゴリ対応版） */
export async function createSupportTaskOnly(args: {
  user_id: string
  assigned_staff_id: string
  scheduled_at: string
  category_id: string
  sub_category_ids?: string[]
  content: string
}) {
  if (!args.category_id || !args.content?.trim()) {
    return { success: false, error: '予定の入力内容が不足しています。' }
  }

  const supabase = await createClient()
  try {
    const { data: cat } = await supabase.from('support_categories').select('name').eq('id', args.category_id).single()
    if (!cat) throw new Error('カテゴリが見つかりません。')

    // 1. タスク本体の作成
    const { data: task, error: taskError } = await supabase.from('support_tasks').insert({
      user_id: args.user_id,
      assigned_staff_id: args.assigned_staff_id,
      scheduled_at: args.scheduled_at,
      category_id: args.category_id,
      category_name_snapshot: cat.name,
      content: args.content,
      status: 'open',
      organization_id: undefined 
    }).select().single()

    if (taskError) throw taskError

    // 2. 副次カテゴリの作成（名称スナップショット取得・保存）
    if (args.sub_category_ids && args.sub_category_ids.length > 0) {
      const { data: catNames } = await supabase.from('support_categories').select('id, name').in('id', args.sub_category_ids)
      const subEntries = args.sub_category_ids.map(subId => ({
        task_id: task.id,
        category_id: subId,
        category_name_snapshot: catNames?.find(c => c.id === subId)?.name || '不明'
      }))
      await supabase.from('support_task_sub_categories').insert(subEntries)
    }

    revalidatePath(`/users/${args.user_id}`)
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    console.error('createSupportTaskOnly Error:', e)
    return { success: false, error: '予定の登録に失敗しました。' }
  }
}

/** 次回予定を完了にし実績コピー（副次カテゴリ一括コピー対応版） */
export async function completeSupportTask(task: SupportTaskWithStaff) {
  const supabase = await createClient()
  try {
    // 高度化された RPC を呼び出し（DB内部で副次カテゴリもコピーされます）
    const { error } = await supabase.rpc('complete_support_task', { p_task_id: task.id })
    if (error) throw error
    revalidatePath(`/users/${task.user_id}`)
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    console.error('completeSupportTask Error:', e)
    return { success: false, error: '更新に失敗しました。' }
  }
}

/** 次回予定の内容を編集（副次カテゴリ同期ロジック搭載版） */
export async function updateSupportTask(
  taskId: string, 
  userId: string, 
  updates: { 
    scheduled_at: string, 
    category_id: string, 
    sub_category_ids?: string[],
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

    // 1. 本体更新
    const { error: taskError } = await supabase.from('support_tasks').update({
      scheduled_at: updates.scheduled_at,
      category_id: updates.category_id,
      category_name_snapshot: cat.name,
      content: updates.content,
      assigned_staff_id: updates.assigned_staff_id
    }).eq('id', taskId)
    
    if (taskError) throw taskError

    // 2. 副次カテゴリの同期
    await supabase.from('support_task_sub_categories').delete().eq('task_id', taskId)
    if (updates.sub_category_ids && updates.sub_category_ids.length > 0) {
      const { data: catNames } = await supabase.from('support_categories').select('id, name').in('id', updates.sub_category_ids)
      const subEntries = updates.sub_category_ids.map(subId => ({
        task_id: taskId,
        category_id: subId,
        category_name_snapshot: catNames?.find(c => c.id === subId)?.name || '不明'
      }))
      await supabase.from('support_task_sub_categories').insert(subEntries)
    }

    revalidatePath(`/users/${userId}`)
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    console.error('updateSupportTask Error:', e)
    return { success: false, error: '更新に失敗しました。' }
  }
}

/** 次回予定のキャンセル */
export async function cancelSupportTask(taskId: string, userId: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase.from('support_tasks').update({ status: 'cancelled' }).eq('id', taskId)
    if (error) throw error
    revalidatePath(`/users/${userId}`)
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    return { success: false, error: '取消に失敗しました。' }
  }
}

// ==================================================================
// 3. マスタ管理（Category Management）
// ==================================================================

/** 支援カテゴリの新規登録 */
export async function createSupportCategory(name: string, description?: string) {
  if (!name.trim()) return { success: false, error: '名称を入力してください。' }
  const supabase = await createClient()
  try {
    const { data, error } = await supabase.from('support_categories').insert({
      name: name.trim(),
      description: description?.trim(),
      is_active: true,
      organization_id: undefined 
    }).select().single()
    if (error) {
      if (error.code === '23505') throw new Error('同じ名前のカテゴリが既に存在します。')
      throw error
    }
    revalidatePath('/settings/categories')
    return { success: true, data }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : '登録に失敗しました。' }
  }
}

/** カテゴリの表示・非表示切り替え */
export async function toggleCategoryActive(id: string, isActive: boolean) {
  const supabase = await createClient()
  try {
    const { error } = await supabase.from('support_categories').update({ is_active: isActive }).eq('id', id)
    if (error) throw error
    revalidatePath('/settings/categories')
    return { success: true }
  } catch {
    return { success: false, error: '設定変更に失敗しました。' }
  }
}