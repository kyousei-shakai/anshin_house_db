// src/types/custom.ts
import { Database } from './database';

// グラフで扱うために、Row型から必要なプロパティを抜き出した型を定義
export type Consultation = Pick<
  Database['public']['Tables']['consultations']['Row'],
  | 'consultation_date'
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
>;

export type User = Pick<
  Database['public']['Tables']['users']['Row'],
  'created_at'
>;