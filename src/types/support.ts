// src/types/support.ts
// src/types/support.ts

import { type Database } from './database'

// --- 基本Row型 ---
export type SupportCategory = Database['public']['Tables']['support_categories']['Row']
export type DailySupportLog = Database['public']['Tables']['daily_support_logs']['Row']
export type SupportTask = Database['public']['Tables']['support_tasks']['Row']

// --- 【新規】中間テーブルのRow型 ---
export type DailySupportLogSubCategory = Database['public']['Tables']['daily_support_log_sub_categories']['Row']
export type SupportTaskSubCategory = Database['public']['Tables']['support_task_sub_categories']['Row']

// --- 保存用引数型 (主カテゴリ + 副次カテゴリ配列) ---
export type CreateSupportLogWithTaskArgs = {
  user_id: string
  performed_by_staff_id: string
  support_date: string 
  log_category_id: string         // 主カテゴリ
  log_sub_category_ids?: string[] // ★追加: 副次カテゴリIDの配列
  content: string
  task?: {
    assigned_staff_id: string
    scheduled_at: string
    category_id: string           // 予定の主カテゴリ
    sub_category_ids?: string[]   // ★追加: 予定の副次カテゴリIDの配列
    content: string
  }
}

// --- 表示用拡張型 (タイムライン・履歴用) ---
// 副次カテゴリの名称（スナップショット）をリスト表示するために定義します
export type DailySupportLogWithStaff = DailySupportLog & {
  staff: { name: string | null } | null
  // ★追加: 紐付いている副次カテゴリのスナップショット一覧
  sub_categories?: {
    category_id: string
    category_name_snapshot: string
  }[]
}

export type SupportTaskWithStaff = SupportTask & {
  assigned_staff: { name: string | null } | null
  // ★追加: 予定に紐付いている副次カテゴリのスナップショット一覧
  sub_categories?: {
    category_id: string
    category_name_snapshot: string
  }[]
}

// --- 窓口①：【監視用】ダッシュボード行型 (現状維持) ---
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

// --- 窓口②：【実行用】全スケジュール視点型 (現状維持) ---
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

// --- 判別可能ユニオン型 ---
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