// src/types/consultation.ts
// Consultation関連の型定義を一元管理するファイル

import { type Database } from './database'

// 基本のConsultation型（データベースのRow型）
export type Consultation = Database['public']['Tables']['consultations']['Row']

// staffリレーションを含む拡張型 (旧バージョン・参考として残すことも可能)
// Supabase SSR @0.3.0では、JOINされたリレーションの型推論が不完全なため
// 明示的に型を定義する
export type ConsultationWithStaff = Consultation & {
  staff: {
    name: string | null
  } | null
}

// ==================================================================
// ▼▼▼【新規追加】RPC関数の返り値に対応する、新しい信頼できる型 ▼▼▼
// ==================================================================
export type ConsultationWithNextAction = Consultation & {
  staff_name: string | null
  next_action_date: string | null
  next_action_memo: string | null
}

// Consultation Insert型（新規作成時に使用）
export type ConsultationInsert = Database['public']['Tables']['consultations']['Insert']

// Consultation Update型（更新時に使用）
export type ConsultationUpdate = Database['public']['Tables']['consultations']['Update']

// ==================================================================
// ▼▼▼【新規追加】RPC関数の引数に対応する型 ▼▼▼
// ==================================================================
export type GetConsultationsArgs = {
  page: number
  itemsPerPage: number
}