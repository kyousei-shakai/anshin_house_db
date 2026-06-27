// src/utils/export.ts
import { Database } from '@/types/database'
import * as XLSX from 'xlsx'

type User = Database['public']['Tables']['users']['Row']
type Consultation = Database['public']['Tables']['consultations']['Row']
type SupportPlan = Database['public']['Tables']['support_plans']['Row']

/**
 * エクスポート用定義の型
 */
interface ExportDefinition<T> {
  key: string;
  label: string;
  format?: (val: any, row: T) => string | number | null;
}

// --- 共通トランスフォーマー ---
const formatBool = (v: boolean | null, trueText = '○', falseText = '－') => v ? trueText : falseText;
const formatDate = (v: string | null) => v ? v.split('T')[0].replace(/-/g, '/') : "";
const formatNum = (v: number | null) => (v !== null && v !== undefined) ? v.toLocaleString() : "";
const formatStatus = (status: string | null, trueVal: string, label: string) => status === trueVal ? label : "－";

/**
 * 1. 利用者データ・エクスポート定義 (完全版)
 */
const USER_EXPORT_MAP: ExportDefinition<User>[] = [
  { key: 'status', label: '現在の状態' },
  { key: 'end_date', label: '利用終了日（逝去・解約日）', format: (v) => formatDate(v) },
  { key: 'uid', label: 'UID' },
  { key: 'name', label: '氏名' },
  { key: 'birth_date', label: '生年月日', format: (v) => formatDate(v) },
  { key: 'gender', label: '性別', format: (v) => v === 'male' ? '男性' : v === 'female' ? '女性' : v === 'other' ? 'その他' : "" },
  { key: 'property_address', label: '物件住所' },
  { key: 'property_name', label: '物件名' },
  { key: 'room_number', label: '部屋番号' },
  { key: 'intermediary', label: '仲介' },
  { key: 'deposit', label: '敷金（円）', format: (v) => formatNum(v) },
  { key: 'key_money', label: '礼金（円）', format: (v) => formatNum(v) },
  { key: 'rent', label: '家賃（円）', format: (v) => formatNum(v) },
  { key: 'fire_insurance', label: '火災保険（円）', format: (v) => formatNum(v) },
  { key: 'common_fee', label: '共益費（円）', format: (v) => formatNum(v) },
  { key: 'landlord_rent', label: '大家家賃（円）', format: (v) => formatNum(v) },
  { key: 'landlord_common_fee', label: '大家共益費（円）', format: (v) => formatNum(v) },
  { key: 'rent_difference', label: '家賃差額（円）', format: (v) => formatNum(v) },
  { key: 'move_in_date', label: '入居日', format: (v) => formatDate(v) },
  { key: 'next_renewal_date', label: '次回更新年月日', format: (v) => formatDate(v) },
  { key: 'renewal_count', label: '更新回数' },
  { key: 'resident_contact', label: '入居者連絡先' },
  { key: 'line_available', label: 'LINE利用可能', format: (v) => formatBool(v, '有り', '無し') },
  { key: 'emergency_contact_name', label: '緊急連絡先氏名' },
  { key: 'emergency_contact', label: '緊急連絡先 Tel' },
  { key: 'emergency_contact_address', label: '緊急連絡先住所' },
  { key: 'relationship', label: '続柄' },
  { key: 'monitoring_system', label: '見守りシステム' },
  { key: 'support_medical_institution', label: '支援・医療機関' },
  { key: 'proxy_payment_eligible', label: '代理納付該当', format: (v) => formatBool(v, '該当', '非該当') },
  { key: 'welfare_recipient', label: '生活保護受給者', format: (v) => formatBool(v, '該当', '非該当') },
  { key: 'posthumous_affairs', label: '死後事務委任', format: (v) => formatBool(v, '有り', '無し') },
  { key: 'notes', label: '備考' },
  { key: 'registered_at', label: '登録日', format: (v) => formatDate(v) },
];

/**
 * 2. 支援計画データ・エクスポート定義 (完全版)
 */
const SUPPORT_PLAN_EXPORT_MAP: ExportDefinition<any>[] = [
  { key: 'creation_date', label: '計画作成日', format: (v) => formatDate(v) },
  { key: 'staff_name', label: '担当スタッフ名', format: (_, row) => row.staff?.name || '未設定' },
  { key: 'name', label: '利用者氏名' },
  { key: 'furigana', label: 'フリガナ' },
  { key: 'birth_date', label: '生年月日', format: (v) => formatDate(v) },
  { key: 'residence', label: '居住場所' },
  { key: 'phone_mobile', label: '携帯電話番号' },
  { key: 'line_available', label: 'LINE利用', format: (v) => formatBool(v, '有り', '無し') },
  { key: 'welfare_recipient', label: '生活保護受給', format: (v) => formatBool(v, '有', '無') },
  { key: 'welfare_worker', label: '担当CW' },
  { key: 'welfare_contact', label: 'CW連絡先' },
  { key: 'care_level_independent', label: '介護度：自立', format: (v) => formatBool(v) },
  { key: 'care_level_support1', label: '介護度：要支援1', format: (v) => formatBool(v) },
  { key: 'care_level_support2', label: '介護度：要支援2', format: (v) => formatBool(v) },
  { key: 'care_level_care1', label: '介護度：要介護1', format: (v) => formatBool(v) },
  { key: 'care_level_care2', label: '介護度：要介護2', format: (v) => formatBool(v) },
  { key: 'care_level_care3', label: '介護度：要介護3', format: (v) => formatBool(v) },
  { key: 'care_level_care4', label: '介護度：要介護4', format: (v) => formatBool(v) },
  { key: 'care_level_care5', label: '介護度：要介護5', format: (v) => formatBool(v) },
  { key: 'outpatient_care', label: '通院', format: (v) => formatBool(v, '有', '-') },
  { key: 'outpatient_institution', label: '医療機関名（通院）' },
  { key: 'visiting_medical', label: '訪問診療', format: (v) => formatBool(v, '有', '-') },
  { key: 'visiting_medical_institution', label: '医療機関名（訪問診療）' },
  { key: 'home_oxygen', label: '在宅酸素', format: (v) => formatBool(v, '有', '-') },
  { key: 'physical_disability_level', label: '身体障がい（等級）' },
  { key: 'mental_disability_level', label: '精神障がい（等級）' },
  { key: 'therapy_certificate_level', label: '療育手帳（等級/区分）' },
  { key: 'pension_national', label: '国民年金', format: (v) => formatBool(v, '該当', '-') },
  { key: 'pension_employee', label: '厚生年金', format: (v) => formatBool(v, '該当', '-') },
  { key: 'pension_disability', label: '障害年金', format: (v) => formatBool(v, '該当', '-') },
  { key: 'pension_survivor', label: '遺族年金', format: (v) => formatBool(v, '該当', '-') },
  { key: 'pension_corporate', label: '企業年金', format: (v) => formatBool(v, '該当', '-') },
  { key: 'pension_other', label: 'その他年金', format: (v) => formatBool(v, '該当', '-') },
  { key: 'pension_other_details', label: 'その他年金詳細' },
  { key: 'monitoring_secom', label: '見守り：セコム', format: (v) => formatBool(v, '利用', '-') },
  { key: 'monitoring_secom_details', label: '見守り：セコム詳細' },
  { key: 'monitoring_hello_light', label: '見守り：ハローライト', format: (v) => formatBool(v, '利用', '-') },
  { key: 'monitoring_hello_light_details', label: '見守り：ハローライト詳細' },
  { key: 'support_shopping', label: '生活支援：買い物', format: (v) => formatBool(v, '要', '-') },
  { key: 'support_bank_visit', label: '生活支援：外出支援', format: (v) => formatBool(v, '要', '-') },
  { key: 'support_cleaning', label: '生活支援：掃除・片付け', format: (v) => formatBool(v, '要', '-') },
  { key: 'support_bulb_change', label: '生活支援：電球交換', format: (v) => formatBool(v, '要', '-') },
  { key: 'support_garbage_disposal', label: '生活支援：ゴミ捨て', format: (v) => formatBool(v, '要', '-') },
  { key: 'goals', label: '支援目標' },
  { key: 'needs_financial', label: 'ニーズ：金銭' },
  { key: 'needs_physical', label: 'ニーズ：身体状況' },
  { key: 'needs_mental', label: 'ニーズ：精神状況' },
  { key: 'needs_lifestyle', label: 'ニーズ：生活状況' },
  { key: 'needs_environment', label: 'ニーズ：生活環境' },
  { key: 'evacuation_plan_completed', label: '個別避難計画：別紙対応', format: (v) => formatBool(v, '済', '未了') },
  { key: 'evacuation_plan_other_details', label: '避難計画その他詳細' },
];

/**
 * 3. 相談データ・エクスポート定義 (100%完全網羅・不整合修正版)
 */
const CONSULTATION_EXPORT_MAP: ExportDefinition<any>[] = [
  // --- Section 1: 基本情報 ---
  { key: 'consultation_date', label: '相談日', format: (v) => formatDate(v) },
  // 【修正】ActionでのJOIN構造 (staff: {name: ...}) に合わせて参照を適正化
  { key: 'staff', label: '担当スタッフ', format: (_, row) => row.staff?.name || '未設定' },
  { key: 'consultation_route_self', label: 'ルート:本人', format: (v) => formatBool(v) },
  { key: 'consultation_route_family', label: 'ルート:家族', format: (v, r) => r.consultation_route_family ? `○${r.consultation_route_family_text ? `(${r.consultation_route_family_text})` : ""}` : "－" },
  { key: 'consultation_route_care_manager', label: 'ルート:ケアマネ', format: (v, r) => r.consultation_route_care_manager ? `○${r.consultation_route_care_manager_text ? `(${r.consultation_route_care_manager_text})` : ""}` : "－" },
  { key: 'consultation_route_elderly_center', label: 'ルート:支援セ(高)', format: (v, r) => r.consultation_route_elderly_center ? `○${r.consultation_route_elderly_center_text ? `(${r.consultation_route_elderly_center_text})` : ""}` : "－" },
  { key: 'consultation_route_disability_center', label: 'ルート:支援セ(障)', format: (v, r) => r.consultation_route_disability_center ? `○${r.consultation_route_disability_center_text ? `(${r.consultation_route_disability_center_text})` : ""}` : "－" },
  { key: 'consultation_route_government', label: 'ルート:行政機関', format: (v, r) => r.consultation_route_government ? `○${r.consultation_route_government_other ? `(${r.consultation_route_government_other})` : ""}` : "－" },
  { key: 'consultation_route_other', label: 'ルート:その他', format: (v, r) => r.consultation_route_other ? `○${r.consultation_route_other_text ? `(${r.consultation_route_other_text})` : ""}` : "－" },
  
  // 属性 (Tier 1-3 完全維持)
  { key: 'attribute_elderly', label: '属性:高齢', format: (v) => formatBool(v) },
  { key: 'attribute_welfare', label: '属性:生保', format: (v) => formatBool(v) },
  { key: 'attribute_single_parent', label: '属性:ひとり親(母子・父子)', format: (v) => formatBool(v) },
  { key: 'attribute_disability', label: '属性:障がい', format: (v) => formatBool(v) },
  { key: 'attribute_disability_mental', label: '属性:障がい(精神)', format: (v) => formatBool(v) },
  { key: 'attribute_disability_physical', label: '属性:障がい(身体)', format: (v) => formatBool(v) },
  { key: 'attribute_disability_intellectual', label: '属性:障がい(知的)', format: (v) => formatBool(v) },
  { key: 'attribute_disability_other', label: '属性:障がい(その他)', format: (v) => formatBool(v) },
  { key: 'attribute_poverty', label: '属性:生活困窮', format: (v) => formatBool(v) },
  { key: 'attribute_low_income', label: '属性:低額所得者', format: (v) => formatBool(v) },
  { key: 'attribute_childcare', label: '属性:子育て世帯(一般)', format: (v) => formatBool(v) },
  { key: 'attribute_foreigner', label: '属性:外国人', format: (v) => formatBool(v) },
  { key: 'attribute_dv', label: '属性:DV', format: (v) => formatBool(v) },
  { key: 'attribute_rehabilitation_support', label: '属性:更生保護対象者', format: (v) => formatBool(v) },
  { key: 'attribute_lgbt', label: '属性:LGBT', format: (v) => formatBool(v) },
  { key: 'attribute_no_guarantor', label: '属性:保証人なし', format: (v) => formatBool(v) },
  { key: 'attribute_disaster_victim_3yr', label: '属性:被災者(3年内)', format: (v) => formatBool(v) },
  { key: 'attribute_major_disaster_victim', label: '属性:大規模災害被災者', format: (v) => formatBool(v) },
  { key: 'attribute_crime_victim', label: '属性:犯罪被害者', format: (v) => formatBool(v) },
  { key: 'attribute_child_abuse_victim', label: '属性:児童虐待被害者', format: (v) => formatBool(v) },
  { key: 'attribute_newlywed_household', label: '属性:新婚世帯', format: (v) => formatBool(v) },
  { key: 'attribute_foster_care_leavers', label: '属性:児童養護施設退所者', format: (v) => formatBool(v) },
  { key: 'attribute_uij_turn', label: '属性:UIJターン転入者', format: (v) => formatBool(v) },
  { key: 'attribute_support_worker', label: '属性:要配慮者への生活支援者', format: (v) => formatBool(v) },

  { key: 'name', label: '氏名' },
  { key: 'furigana', label: 'フリガナ' },
  { key: 'gender', label: '性別', format: (v) => v === 'male' ? '男' : v === 'female' ? '女' : v === 'other' ? 'その他' : "" },
  
  // 世帯構成
  { key: 'household_single', label: '世帯:独居', format: (v) => formatBool(v) },
  { key: 'household_couple', label: '世帯:夫婦', format: (v) => formatBool(v) },
  { key: 'household_common_law', label: '世帯:内縁夫婦', format: (v) => formatBool(v) },
  { key: 'household_parent_child', label: '世帯:親子', format: (v) => formatBool(v) },
  { key: 'household_siblings', label: '世帯:兄弟姉妹', format: (v) => formatBool(v) },
  { key: 'household_acquaintance', label: '世帯:知人', format: (v) => formatBool(v) },
  { key: 'household_other', label: '世帯:その他', format: (v, r) => r.household_other ? `○${r.household_other_text ? `(${r.household_other_text})` : ""}` : "－" },
  
  { key: 'postal_code', label: '郵便番号' },
  { key: 'address', label: '住所' },
  { key: 'phone_home', label: '電話:自宅' },
  { key: 'phone_mobile', label: '電話:携帯' },
  { key: 'birth_year', label: '生年月日:年' },
  { key: 'birth_month', label: '生年月日:月' },
  { key: 'birth_day', label: '生年月日:日' },
  { key: 'age_group', label: '年代' },

  // --- Section 2: 身体状況・利用サービス (完全維持) ---
  { key: 'physical_condition', label: '身体状況', format: (v) => {
    const map: any = { independent: '自立', support1: '要支援1', support2: '要支援2', care1: '要介護1', care2: '要介護2', care3: '要介護3', care4: '要介護4', care5: '要介護5' };
    return map[v] || v || "未設定";
  }},
  { key: 'mental_disability_certificate', label: '手帳:精神', format: (v, r) => v ? `有(${r.mental_disability_level || "-"})` : "－" },
  { key: 'physical_disability_certificate', label: '手帳:身体', format: (v, r) => v ? `有(${r.physical_disability_level || "-"})` : "－" },
  { key: 'therapy_certificate', label: '手帳:療育', format: (v, r) => v ? `有(${r.therapy_level || "-"})` : "－" },
  { key: 'service_day_service', label: 'サービス:デイ', format: (v) => formatBool(v) },
  { key: 'service_visiting_nurse', label: 'サービス:訪看', format: (v) => formatBool(v) },
  { key: 'service_visiting_care', label: 'サービス:訪介', format: (v) => formatBool(v) },
  { key: 'service_home_medical', label: 'サービス:在宅診療', format: (v) => formatBool(v) },
  { key: 'service_short_stay', label: 'サービス:短期入所', format: (v) => formatBool(v) },
  { key: 'service_other', label: 'サービス:その他', format: (v, r) => v ? `○(${r.service_other_text || "-"})` : "－" },
  { key: 'service_provider', label: 'サービス提供事業所' },
  { key: 'care_support_office', label: '居宅介護支援事業所' },
  { key: 'care_manager', label: '担当ケアマネ' },
  { key: 'medical_history', label: '既往症・病歴' },

  // --- Section 3: 医療・収入 (完全維持) ---
  { key: 'medical_institution_name', label: '医療機関名' },
  { key: 'medical_institution_staff', label: '医療機関担当' },
  { key: 'income_salary', label: '収入:給与（手取り/月額）', format: (v) => formatNum(v) },
  { key: 'income_injury_allowance', label: '収入:傷病手当（月額換算）', format: (v) => formatNum(v) },
  { key: 'income_pension', label: '収入:年金（1ヶ月分換算）', format: (v) => formatNum(v) },
  { key: 'welfare_recipient', label: '生活保護受給', format: (v) => formatBool(v, '有', '無') },
  { key: 'welfare_staff', label: '生保担当者' },
  { key: 'savings', label: '預金（現在高）', format: (v) => formatNum(v) },

  // --- Section 4: 転居希望 ---
  // 【修正】DBの boolean (true/false) に合わせて判定ロジックを修正
  { key: 'is_relocation_to_other_city_desired', label: '他市町村転居希望', format: (v) => v === true ? 'はい' : v === false ? 'いいえ' : '－' },
  { key: 'relocation_admin_opinion', label: '行政見解', format: (v, r) => {
    const map: any = { possible: '可', impossible: '否', pending: '確認中', other: 'その他' };
    return r.is_relocation_to_other_city_desired === true ? (map[v] || v || "") + (v === 'other' ? `(${r.relocation_admin_opinion_details || ""})` : "") : "－";
  }},
  { key: 'relocation_cost_bearer', label: '費用負担', format: (v, r) => {
    const map: any = { previous_city: '前市負担', next_city: '次市負担', self: '自己負担', pending: '確認中', other: 'その他' };
    return r.is_relocation_to_other_city_desired === true ? (map[v] || v || "") + (v === 'other' ? `(${r.relocation_cost_bearer_details || ""})` : "") : "－";
  }},
  { key: 'relocation_notes', label: '転居特記事項' },

  // --- Section 5: ADL/IADL (完全維持) ---
  { key: 'dementia', label: '認知症' },
  { key: 'dementia_hospital', label: '認知症病院' },
  { key: 'hospital_support_required', label: '通院支援', format: (v) => v === true ? '要' : v === false ? '不要' : '－' },
  { key: 'medication_management_needed', label: '内服管理', format: (v) => v === true ? '有' : v === false ? '無' : '－' },
  { key: 'mobility_status', label: 'ADL:移動', format: (v, r) => {
    const map: any = { independent: '自立', partial_assist: '一部介助', full_assist: '全介助', other: 'その他' };
    return (map[v] || v || "") + (v === 'other' ? `(${r.mobility_other_text || ""})` : "");
  }},
  { key: 'mobility_aids', label: '補助具・用具' },
  { key: 'eating_status', label: 'ADL:食事', format: (v, r) => {
    const map: any = { independent: '自立', partial_assist: '一部介助', full_assist: '全介助', other: 'その他' };
    return (map[v] || v || "") + (v === 'other' ? `(${r.eating_other_text || ""})` : "");
  }},
  { key: 'shopping_status', label: 'IADL:買物', format: (v, r) => v === 'possible' ? '可' : v === 'support_needed' ? `支援必要(${r.shopping_support_text || ""})` : "－" },
  { key: 'garbage_disposal_status', label: 'IADL:ゴミ出', format: (v, r) => v === 'independent' ? '自立' : v === 'support_needed' ? `支援必要(${r.garbage_disposal_support_text || ""})` : "－" },
  { key: 'excretion_status', label: 'ADL:排泄', format: (v, r) => {
    const map: any = { independent: '自立', partial_assist: '一部介助', full_assist: '全介助', other: 'その他' };
    return (map[v] || v || "") + (v === 'other' ? `(${r.excretion_other_text || ""})` : "");
  }},
  { key: 'second_floor_possible', label: '2階移動', format: (v) => v === 'possible' ? '可' : v === 'impossible' ? '不可' : '－' },
  { key: 'bathing_status', label: 'ADL:入浴', format: (v, r) => {
    const map: any = { independent: '自立', partial_assist: '一部介助', full_assist: '全介助', other: 'その他' };
    return (map[v] || v || "") + (v === 'other' ? `(${r.bathing_other_text || ""})` : "");
  }},
  { key: 'money_management_supporter', label: '金銭管理支援者' },
  { key: 'uses_proxy_payment_service', label: '代理納付利用', format: (v) => v === 'yes' ? '有' : v === 'no' ? '無' : '－' },
  { key: 'rent_payment_method', label: '家賃納入方法', format: (v) => {
    const map: any = { transfer: '振込', collection: '集金', automatic: '口座振替' };
    return map[v] || v || "－";
  }},
  { key: 'other_notes', label: 'ADL特記事項' },

  // --- Section 6: 現在の住まい (完全維持) ---
  { key: 'rent_arrears_status', label: '家賃滞納', format: (v, r) => v === 'yes' ? `有(${r.rent_arrears_duration || ""})` : v === 'no' ? '無' : '－' },
  { key: 'rent_arrears_details', label: '滞納理由状況' },
  { key: 'pet_status', label: 'ペット', format: (v, r) => v === 'yes' ? `有(${r.pet_details || ""})` : v === 'no' ? '無' : '－' },
  { key: 'vehicle_car', label: '車両:車', format: (v) => formatBool(v) },
  { key: 'vehicle_motorcycle', label: '車両:バイク', format: (v) => formatBool(v) },
  { key: 'vehicle_bicycle', label: '車両:自転車', format: (v) => formatBool(v) },
  { key: 'vehicle_none', label: '車両:なし', format: (v) => formatBool(v) },
  { key: 'current_floor_plan', label: '現在の間取り' },
  { key: 'current_rent', label: '現在の家賃', format: (v) => formatNum(v) },
  { key: 'eviction_date', label: '退去期限', format: (v) => formatDate(v) },
  { key: 'eviction_date_notes', label: '退去補足' },

  // --- Section 7: 相談内容等 (完全維持) ---
  { key: 'consultation_content', label: '相談内容' },
  { key: 'relocation_reason', label: '転居理由' },
  { key: 'emergency_contact_name', label: '緊急連絡先氏名' },
  { key: 'emergency_contact_relationship', label: '緊急連絡先続柄' },
  { key: 'emergency_contact_postal_code', label: '緊急連絡先郵便' },
  { key: 'emergency_contact_address', label: '緊急連絡先住所' },
  { key: 'emergency_contact_phone_home', label: '緊急連絡先自宅Tel' },
  { key: 'emergency_contact_phone_mobile', label: '緊急連絡先携帯Tel' },
  { key: 'emergency_contact_email', label: '緊急連絡先Mail' },
  { key: 'consultation_result', label: '相談結果' },

  // --- システム情報 ---
  { key: 'status', label: '進捗ステータス' },
  { key: 'created_at', label: '作成日時', format: (v) => v ? new Date(v).toLocaleString('ja-JP') : "" },
  { key: 'id', label: '相談ID' },
];
/**
 * 汎用エクスポート・エンジン
 */
const processAndExport = <T extends object>(
  data: T[], 
  definition: ExportDefinition<T>[], 
  sheetName: string, 
  filename: string,
  formatType: 'excel' | 'csv'
) => {
  const processedData = data.map(row => {
    const newRow: Record<string, any> = {};
    definition.forEach(def => {
      const rawValue = (row as any)[def.key];
      newRow[def.label] = def.format ? def.format(rawValue, row) : (rawValue ?? "");
    });
    return newRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(processedData);
  
  if (formatType === 'excel') {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filename);
  } else {
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' }); 
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// --- 公開関数 ---

export const exportUsersToExcel = (users: User[], filename: string) => {
  processAndExport(users, USER_EXPORT_MAP, 'Users', filename, 'excel');
};

export const exportUsersToCSV = (users: User[], filename: string) => {
  processAndExport(users, USER_EXPORT_MAP, 'Users', filename, 'csv');
};

export const exportConsultationsToExcel = (consultations: Consultation[], filename: string) => {
  processAndExport(consultations, CONSULTATION_EXPORT_MAP, 'Consultations', filename, 'excel');
};

export const exportConsultationsToCSV = (consultations: Consultation[], filename: string) => {
  processAndExport(consultations, CONSULTATION_EXPORT_MAP, 'Consultations', filename, 'csv');
};

export const exportSupportPlansToExcel = (supportPlans: any[], filename: string) => {
  processAndExport(supportPlans, SUPPORT_PLAN_EXPORT_MAP, 'SupportPlans', filename, 'excel');
};

export const exportSupportPlansToCSV = (supportPlans: any[], filename: string) => {
  processAndExport(supportPlans, SUPPORT_PLAN_EXPORT_MAP, 'SupportPlans', filename, 'csv');
};

// --- 職人芸ロジック (既存維持) ---

const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const exportMonthlyReport = async (year: number, month: number): Promise<void> => {
  try {
    const response = await fetch('/api/export/monthly-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year, month }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'エクスポートに失敗しました' }));
      throw new Error(errorData.error || 'エクスポートに失敗しました');
    }
    const blob = await response.blob();
    const filename = `月次報告書_${year}年${String(month).padStart(2, '0')}月.xlsx`;
    downloadFile(blob, filename);
  } catch (error) {
    console.error('月次報告書のエクスポート処理中にエラーが発生しました:', error);
    alert(`エクスポートに失敗しました。詳細: ${error instanceof Error ? error.message : '不明なエラー'}`);
    throw error;
  }
};

export const exportFormattedConsultationsToExcel = async (
  consultations: Consultation[],
  filename: string
): Promise<void> => {
  try {
    const consultationIds = consultations.map(c => c.id);
    const response = await fetch('/api/export/consultations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultationIds }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'エクスポートに失敗しました' }));
      throw new Error(errorData.error || 'エクスポートに失敗しました');
    }
    const blob = await response.blob();
    downloadFile(blob, filename);
  } catch (error) {
    console.error('エクスポート処理中にエラーが発生しました:', error);
    alert(`エクスポートに失敗しました。詳細: ${error instanceof Error ? error.message : '不明なエラー'}`);
    throw error;
  }
};

export const getRelocationAdminOpinionLabel = (opinion: string | null | undefined, details: string | null | undefined): string => {
    if (!opinion) return '未設定';
    const detailText = details ? ` (${details})` : '';
    switch (opinion) {
      case 'possible': return '可';
      case 'impossible': return '否';
      case 'pending': return '確認中';
      case 'other': return `その他${detailText}`;
      default: return opinion;
    }
};

export const getRelocationCostBearerLabel = (bearer: string | null | undefined, details: string | null | undefined): string => {
    if (!bearer) return '未設定';
    const detailText = details ? ` (${details})` : '';
    switch (bearer) {
      case 'previous_city': return '転居前の市区町村が負担';
      case 'next_city': return '転居先の市区町村が負担';
      case 'self': return '利用者本人の負担';
      case 'pending': return '確認中';
      case 'other': return `その他${detailText}`;
      default: return bearer;
    }
};
  
export const getRentArrearsDurationLabel = (duration: string | null | undefined, details: string | null | undefined): string => {
      if (!duration) return '未設定';
      const detailText = details ? ` (${details})` : '';
      switch (duration) {
          case '1_month': return '1ヶ月';
          case '2_to_3_months': return '2〜3ヶ月';
          case 'half_year_or_more': return '半年以上';
          case 'other': return `その他${detailText}`;
          default: return duration;
      }
};