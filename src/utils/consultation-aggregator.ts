
//相談データの真偽値を確認し、エクセル表示用の連結文字列を生成する「純粋な計算ロジック」を担当。
//利点: API Routeから切り離すことで、単体テストが容易になり、他の帳票（支援記録等）でも再利用が可能に。

// src/utils/consultation-aggregator.ts
import { type Database } from '@/types/database'

type Consultation = Database['public']['Tables']['consultations']['Row']

/**
 * 相談ルートの連結文字列を生成する (変更なし・完全維持)
 */
export const aggregateConsultationRoutes = (consultation: Consultation): string => {
  const routes: string[] = [];
  const ROUTE_DEFINITIONS = [
    { key: 'consultation_route_self', label: '本人', textField: null },
    { key: 'consultation_route_family', label: '家族', textField: 'consultation_route_family_text' },
    { key: 'consultation_route_care_manager', label: 'ケアマネジャー', textField: 'consultation_route_care_manager_text' },
    { key: 'consultation_route_elderly_center', label: '支援センター(高齢)', textField: 'consultation_route_elderly_center_text' },
    { key: 'consultation_route_disability_center', label: '支援センター(障害)', textField: 'consultation_route_disability_center_text' },
    { key: 'consultation_route_government', label: '行政機関', textField: 'consultation_route_government_other' },
    { key: 'consultation_route_other', label: 'その他', textField: 'consultation_route_other_text' },
  ] as const;

  for (const def of ROUTE_DEFINITIONS) {
    if (consultation[def.key as keyof Consultation]) {
      let entry = def.label;
      if (def.textField) {
        const detail = (consultation[def.textField as keyof Consultation] as string | null || '').trim();
        if (detail) entry += `(${detail})`;
      }
      routes.push(entry);
    }
  }
  return routes.length > 0 ? routes.join('、') : '選択項目なし';
};

/**
 * 属性の連結文字列を生成する (拡張版)
 */
export const aggregateConsultationAttributes = (consultation: Consultation): string => {
  const attrs: string[] = [];
  const ATTRIBUTE_DEFINITIONS = [
    // --- 第1階層：最重要（ラベル適正化） ---
    { key: 'attribute_elderly', label: '高齢' },
    { key: 'attribute_welfare', label: '生保' },
    { key: 'attribute_single_parent', label: 'ひとり親（母子・父子）' },
    { key: 'attribute_disability', label: '障がい' },
    { key: 'attribute_disability_mental', label: '精神' },
    { key: 'attribute_disability_physical', label: '身体' },
    { key: 'attribute_disability_intellectual', label: '知的' },
    
    // --- 第2階層：頻出（ラベル適正化 ＋ 新設） ---
    { key: 'attribute_poverty', label: '生活困窮' },
    { key: 'attribute_low_income', label: '低額所得者' },
    { key: 'attribute_childcare', label: '子育て世帯（一般）' },
    { key: 'attribute_foreigner', label: '外国人' },
    { key: 'attribute_dv', label: 'DV' },
    { key: 'attribute_rehabilitation_support', label: '更生保護対象者' }, // 【新設】
    { key: 'attribute_lgbt', label: 'LGBT' },
    { key: 'attribute_no_guarantor', label: '保証人なし' }, // 【新設】

    // --- 第3階層：その他（新設10項目の残り） ---
    { key: 'attribute_disaster_victim_3yr', label: '被災者（発災から3年以内）' }, // 【新設】
    { key: 'attribute_major_disaster_victim', label: '大規模災害被災者' }, // 【新設】
    { key: 'attribute_crime_victim', label: '犯罪被害者' }, // 【新設】
    { key: 'attribute_child_abuse_victim', label: '児童虐待被害者' }, // 【新設】
    { key: 'attribute_newlywed_household', label: '新婚世帯' }, // 【新設】
    { key: 'attribute_foster_care_leavers', label: '児童養護施設退所者' }, // 【新設】
    { key: 'attribute_uij_turn', label: 'UIJターン転入者' }, // 【新設】
    { key: 'attribute_support_worker', label: '要配慮者への生活支援者' }, // 【新設】
  ] as const;

  for (const def of ATTRIBUTE_DEFINITIONS) {
    if (consultation[def.key as keyof Consultation]) {
      attrs.push(def.label);
    }
  }
  return attrs.length > 0 ? attrs.join('、') : '選択項目なし';
};

/**
 * 利用中の支援サービスの連結文字列を生成する (変更なし・完全維持)
 */
export const aggregateSupportServices = (consultation: Consultation): string => {
  const services: string[] = [];
  const SERVICE_DEFINITIONS = [
    { key: 'service_day_service', label: 'デイサービス', textField: null },
    { key: 'service_visiting_nurse', label: '訪問看護', textField: null },
    { key: 'service_visiting_care', label: '訪問介護', textField: null },
    { key: 'service_home_medical', label: '在宅診療', textField: null },
    { key: 'service_short_stay', label: '短期入所施設', textField: null },
    { key: 'service_other', label: 'その他', textField: 'service_other_text' },
  ] as const;

  for (const def of SERVICE_DEFINITIONS) {
    if (consultation[def.key as keyof Consultation]) {
      let entry = def.label;
      if (def.textField) {
        const detail = (consultation[def.textField as keyof Consultation] as string | null || '').trim();
        if (detail) entry += `(${detail})`;
      }
      services.push(entry);
    }
  }
  return services.length > 0 ? services.join('、') : '選択項目なし';
};

/**
 * 世帯構成の連結文字列を生成する (変更なし・完全維持)
 */
export const aggregateHouseholdComposition = (consultation: Consultation): string => {
  const households: string[] = [];
  const HOUSEHOLD_DEFINITIONS = [
    { key: 'household_single', label: '独居', textField: null },
    { key: 'household_couple', label: '夫婦', textField: null },
    { key: 'household_common_law', label: '内縁夫婦', textField: null },
    { key: 'household_parent_child', label: '親子', textField: null },
    { key: 'household_siblings', label: '兄弟姉妹', textField: null },
    { key: 'household_acquaintance', label: '知人', textField: null },
    { key: 'household_other', label: 'その他', textField: 'household_other_text' },
  ] as const;

  for (const def of HOUSEHOLD_DEFINITIONS) {
    if (consultation[def.key as keyof Consultation]) {
      let entry = def.label;
      if (def.textField) {
        const detail = (consultation[def.textField as keyof Consultation] as string | null || '').trim();
        if (detail) entry += `(${detail})`;
      }
      households.push(entry);
    }
  }
  return households.length > 0 ? households.join('、') : '選択項目なし';
};