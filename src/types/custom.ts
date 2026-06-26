// src/types/custom.ts
import { Database } from './database';

// グラフで扱うために、Row型から必要なプロパティを抜き出した型を定義
export type Consultation = Pick<
  Database['public']['Tables']['consultations']['Row'],
  | 'consultation_date'
  // ▼▼▼ 性別・年齢分析用（維持） ▼▼▼
  | 'gender'
  | 'birth_year'
  | 'birth_month'
  | 'birth_day'
  // ▲▲▲ 維持ここまで ▲▲▲
  | 'consultation_route_self'
  | 'consultation_route_family'
  | 'consultation_route_care_manager'
  | 'consultation_route_elderly_center'
  | 'consultation_route_disability_center'
  | 'consultation_route_government'
  | 'consultation_route_other'
  | 'consultation_route_government_other'
  | 'consultation_route_other_text'
  | 'attribute_elderly'
  | 'attribute_disability'
  | 'attribute_poverty'
  | 'attribute_single_parent'
  | 'attribute_childcare'
  | 'attribute_dv'
  | 'attribute_foreigner'
  | 'attribute_low_income'
  | 'attribute_lgbt'
  | 'attribute_welfare'
  // ▼▼▼ 【新規追加】マイグレーションと同期した10項目 ▼▼▼
  | 'attribute_rehabilitation_support' // 更生保護対象者
  | 'attribute_no_guarantor'           // 保証人なし
  | 'attribute_disaster_victim_3yr'    // 被災者（発災から3年以内）
  | 'attribute_major_disaster_victim'  // 大規模災害被災者
  | 'attribute_crime_victim'           // 犯罪被害者
  | 'attribute_child_abuse_victim'     // 児童虐待被害者
  | 'attribute_newlywed_household'     // 新婚世帯
  | 'attribute_foster_care_leavers'    // 児童養護施設退所者
  | 'attribute_uij_turn'               // UIJターン転入者
  | 'attribute_support_worker'         // 要配慮者への生活支援者
  // ▲▲▲ 追加終了 ▲▲▲
>;

export type User = Pick<
  Database['public']['Tables']['users']['Row'],
  'registered_at'
>;