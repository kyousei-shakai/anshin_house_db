// src/types/support.ts

import { type Database } from './database'

// --- 基本Row型 ---
export type SupportCategory = Database['public']['Tables']['support_categories']['Row']
export type DailySupportLog = Database['public']['Tables']['daily_support_logs']['Row']
export type SupportTask = Database['public']['Tables']['support_tasks']['Row']

// --- 保存用引数型 ---
export type CreateSupportLogWithTaskArgs = {
  user_id: string
  performed_by_staff_id: string
  support_date: string 
  log_category_id: string
  content: string
  task?: {
    assigned_staff_id: string
    scheduled_at: string
    category_id: string
    content: string
  }
}

// --- 窓口①：【監視用】ダッシュボード行型 ---
export type UserCareDashboardRow = {
  user_id: string
  user_name: string
  user_uid: string
  last_support_at: string | null
  elapsed_days: number | null
  last_category_name: string | null
  last_staff_name: string | null
  next_scheduled_at: string | null
  next_category_name: string | null
  next_task_content: string | null
  next_staff_name: string | null
  is_overdue: boolean | null
  is_neglected: boolean | null
  has_no_log: boolean | null
}

// --- 窓口②：【実行用】全スケジュール視点型 ---
// ★ W-2 対策: user_id, elapsed_days, has_no_log を追加しSQLと同期
export type UpcomingTaskRow = {
  task_id: string
  user_id: string          
  user_name: string
  user_uid: string
  scheduled_at: string
  category_name: string
  content: string
  staff_name: string | null
  is_overdue: boolean
  elapsed_days: number | null   
  has_no_log: boolean           
}

// --- 窓口④：【活動証明】チーム全体の直近履歴型 ---
export type TeamRecentHistoryRow = {
  log_id: string
  user_id: string
  user_name: string
  user_uid: string
  support_at: string
  category_name: string
  content: string
  staff_name: string | null
}

// --- ★ 新規：ダッシュボード用 判別可能ユニオン型 ---
// これにより any[] を追放し、種別ごとの型安全を確保します
export type CareDashboardItem = 
  | (UserCareDashboardRow & { kind: 'user' })
  | (UpcomingTaskRow & { kind: 'task' })
  | (TeamRecentHistoryRow & { kind: 'history' });

// 既存互換用
export type UserRecentHistoryRow = {
  log_id: string
  support_at: string
  category_name: string
  content: string
  staff_name: string | null
}
export type DailySupportLogWithStaff = DailySupportLog & {
  staff: { name: string | null } | null
}
export type SupportTaskWithStaff = SupportTask & {
  assigned_staff: { name: string | null } | null
}