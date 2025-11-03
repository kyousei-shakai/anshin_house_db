// src/types/consultation.ts
// Consultation関連の型定義を一元管理するファイル

import { Database } from './database'

// 基本のConsultation型（データベースのRow型）
export type Consultation = Database['public']['Tables']['consultations']['Row']

// staffリレーションを含む拡張型
// Supabase SSR @0.3.0では、JOINされたリレーションの型推論が不完全なため
// 明示的に型を定義する
export type ConsultationWithStaff = Consultation & {
  staff: {
    name: string | null
  } | null
}

// Consultation Insert型（新規作成時に使用）
export type ConsultationInsert = Database['public']['Tables']['consultations']['Insert']

// Consultation Update型（更新時に使用）
export type ConsultationUpdate = Database['public']['Tables']['consultations']['Update']