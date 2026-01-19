// src/types/consultation.ts
// Consultation関連の型定義を一元管理するファイル

import { type Database } from './database'

// 基本のConsultation型（データベースのRow型）
// supabase gen typesコマンドによって、この型は常にDBスキーマと同期される
export type Consultation = Database['public']['Tables']['consultations']['Row']

// staffリレーションを含む拡張型 (旧バージョン・参考として残すことも可能)
export type ConsultationWithStaff = Consultation & {
  staff: {
    name: string | null
  } | null
}

// ==================================================================
// ▼▼▼【修正】RPC関数の返り値と完全に一致するように型定義を更新 ▼▼▼
// ==================================================================
// `Consultation` 型は `database.ts` から取得し、DBスキーマと常に同期させる。
// この型定義では、RPC関数がJOINによって追加するカラムのみを明示的に定義する。
export type ConsultationWithNextAction = Consultation & {
  staff_name: string | null
  next_action_date: string | null
  next_action_memo: string | null
  age_group: string | null
  
  // ★★★ 変更点 ★★★
  // RPC関数の返り値の型と、ベースとなる `Consultation` 型の構造が
  // `db push` と `gen types` によって一致しているため、
  // ここに `consultations` テーブルのカラムを再定義する必要はない。
  // `Consultation` 型に含まれるプロパティは自動的にこの型の一部となる。
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