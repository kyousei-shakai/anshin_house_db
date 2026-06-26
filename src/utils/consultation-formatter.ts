// src/utils/consultation-formatter.ts
import { Database } from '@/types/database'
import { getAgeGroupLabel } from './age-utils'

type Consultation = Database['public']['Tables']['consultations']['Row']

/**
 * 満年齢を計算する (変更なし・完全維持)
 */
const calculateAge = (
  birthYear: number | null,
  birthMonth: number | null,
  birthDay: number | null,
  consultationDate: string
): number | null => {
  if (!birthYear || !birthMonth || !birthDay) return null;
  try {
    const consultDate = new Date(consultationDate)
    const birthDate = new Date(birthYear, birthMonth - 1, birthDay)
    let age = consultDate.getFullYear() - birthDate.getFullYear()
    const monthDiff = consultDate.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && consultDate.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  } catch {
    return null
  }
}

/**
 * 入電元（相談ルート）の文字列を生成する (変更なし・完全維持)
 */
export const formatConsultationRoute = (consultation: Consultation): string => {
  const routes: string[] = []
  if (consultation.consultation_route_self) routes.push("本人")
  if (consultation.consultation_route_family) routes.push("家族")
  if (consultation.consultation_route_care_manager) routes.push("ケアマネ")
  if (consultation.consultation_route_elderly_center) routes.push("支援センター（高齢者）")
  if (consultation.consultation_route_disability_center) routes.push("支援センター（障害者）")
  if (consultation.consultation_route_government) routes.push("行政機関")
  if (consultation.consultation_route_other) routes.push("その他")
  return routes.length > 0 ? `(${routes.join("、")}より入電)` : ""
}

/**
 * 相談者情報の文字列を生成する (拡張版)
 */
export const formatConsulterInfo = (consultation: Consultation): string => {
  const genderMap: { [key: string]: string } = { male: "男性", female: "女性", other: "その他" }
  const gender = consultation.gender ? genderMap[consultation.gender] || "" : ""

  const calculatedAgeGroup = getAgeGroupLabel(consultation.birth_year);
  const ageGroup = calculatedAgeGroup || consultation.age_group || ""

  const attributes: string[] = []
  // 既存項目
  if (consultation.attribute_elderly) attributes.push("高齢")
  if (consultation.attribute_welfare) attributes.push("生保")
  if (consultation.attribute_single_parent) attributes.push("ひとり親")
  if (consultation.attribute_disability) attributes.push("障がい")
  if (consultation.attribute_disability_mental) attributes.push("精神")
  if (consultation.attribute_disability_physical) attributes.push("身体")
  if (consultation.attribute_disability_intellectual) attributes.push("知的")
  if (consultation.attribute_poverty) attributes.push("生活困窮")
  if (consultation.attribute_low_income) attributes.push("低額所得")
  if (consultation.attribute_childcare) attributes.push("子育て世帯")
  if (consultation.attribute_foreigner) attributes.push("外国人")
  if (consultation.attribute_dv) attributes.push("DV")
  if (consultation.attribute_lgbt) attributes.push("LGBT")

  // 【追加】新設10項目
  if (consultation.attribute_rehabilitation_support) attributes.push("更生保護")
  if (consultation.attribute_no_guarantor) attributes.push("保証人なし")
  if (consultation.attribute_disaster_victim_3yr) attributes.push("被災者(3年内)")
  if (consultation.attribute_major_disaster_victim) attributes.push("大規災害被災")
  if (consultation.attribute_crime_victim) attributes.push("犯罪被害")
  if (consultation.attribute_child_abuse_victim) attributes.push("児童虐待")
  if (consultation.attribute_newlywed_household) attributes.push("新婚世帯")
  if (consultation.attribute_foster_care_leavers) attributes.push("児養施設退所")
  if (consultation.attribute_uij_turn) attributes.push("UIJターン")
  if (consultation.attribute_support_worker) attributes.push("支援者")
  
  const attributeString = attributes.join("/")

  return `(${[gender, ageGroup, attributeString].filter(Boolean).join("/")})`
}

/**
 * 指定された接頭辞を持つ文字列を生成する (変更なし・完全維持)
 */
export const formatWithPrefix = (content: string | null, prefix: string): string => {
  return content ? `【${prefix}】${content}` : ""
}