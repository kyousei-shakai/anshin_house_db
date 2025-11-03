// src/utils/consultation-formatter.ts
import { Database } from '@/types/database'

// consultationsテーブルのRow型をエイリアスとして定義
type Consultation = Database['public']['Tables']['consultations']['Row']

/**
 * 相談日時点の満年齢を計算する
 * @param birthYear - 誕生年
 * @param birthMonth - 誕生月
 * @param birthDay - 誕生日
 * @param consultationDate - 相談日 (YYYY-MM-DD形式の文字列)
 * @returns 満年齢。計算できない場合は null
 */
const calculateAge = (
  birthYear: number | null,
  birthMonth: number | null,
  birthDay: number | null,
  consultationDate: string
): number | null => {
  if (!birthYear || !birthMonth || !birthDay) {
    return null
  }

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
 * 入電元（相談ルート）の文字列を生成する
 * @param consultation - 相談データ
 * @returns フォーマットされた文字列 (例: "(本人、家族より入電)")
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
 * 相談者情報の文字列を生成する
 * @param consultation - 相談データ
 * @returns フォーマットされた文字列 (例: "(男/70代/高齢/障がい)")
 */
export const formatConsulterInfo = (consultation: Consultation): string => {
  // 性別
  const genderMap: { [key: string]: string } = { male: "男", female: "女", other: "その他" }
  const gender = consultation.gender ? genderMap[consultation.gender] || "" : ""

  // 年代
  const age = calculateAge(
    consultation.birth_year,
    consultation.birth_month,
    consultation.birth_day,
    consultation.consultation_date
  )
  const ageGroup = age !== null ? `${Math.floor(age / 10) * 10}代` : ""

  // 属性
  const attributes: string[] = []
  if (consultation.attribute_elderly) attributes.push("高齢")
  if (consultation.attribute_disability) attributes.push("障がい")
  if (consultation.attribute_disability_mental) attributes.push("精神")
  if (consultation.attribute_disability_physical) attributes.push("身体")
  if (consultation.attribute_disability_intellectual) attributes.push("知的")
  if (consultation.attribute_childcare) attributes.push("子育て")
  if (consultation.attribute_single_parent) attributes.push("ひとり親")
  if (consultation.attribute_dv) attributes.push("DV")
  if (consultation.attribute_foreigner) attributes.push("外国人")
  if (consultation.attribute_poverty) attributes.push("生活困窮")
  if (consultation.attribute_low_income) attributes.push("低所得者")
  if (consultation.attribute_lgbt) attributes.push("LGBT")
  if (consultation.attribute_welfare) attributes.push("生保")
  
  const attributeString = attributes.join("/")

  return `(${[gender, ageGroup, attributeString].filter(Boolean).join("/")})`
}

/**
 * 指定された接頭辞を持つ文字列を生成する
 * @param content - 元の文字列
 * @param prefix - 接頭辞
 * @returns フォーマットされた文字列 (例: "【引越理由】内容...")
 */
export const formatWithPrefix = (content: string | null, prefix: string): string => {
  return content ? `【${prefix}】${content}` : ""
}