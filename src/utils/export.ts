import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
// 👇 1. インポートを 'Database' 型に変更
import { Database } from '@/types/database'

// 👇 2. 新しい型定義から型エイリアスを作成
type User = Database['public']['Tables']['users']['Row']
type Consultation = Database['public']['Tables']['consultations']['Row']
type SupportPlan = Database['public']['Tables']['support_plans']['Row']

// 利用者データをExcelにエクスポート
export const exportUsersToExcel = (users: User[], filename: string = 'users.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(
    users.map(user => ({
      'UID': user.uid,
      '氏名': user.name,
      '生年月日': user.birth_date ? new Date(user.birth_date).toLocaleDateString('ja-JP') : '',
      '性別': user.gender === 'male' ? '男性' : user.gender === 'female' ? '女性' : user.gender === 'other' ? 'その他' : '',
      '年齢': user.age ?? '',
      '物件住所': user.property_address || '',
      '物件名': user.property_name || '',
      '部屋番号': user.room_number || '',
      '入居者連絡先': user.resident_contact || '',
      '緊急連絡先': user.emergency_contact || '',
      '家賃': user.rent ?? '',
      '作成日': new Date(user.created_at).toLocaleDateString('ja-JP'),
      '更新日': new Date(user.updated_at).toLocaleDateString('ja-JP')
    }))
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '利用者一覧')
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  
  saveAs(data, filename)
}

// 利用者データをCSVにエクスポート
export const exportUsersToCSV = (users: User[], filename: string = 'users.csv') => {
  const worksheet = XLSX.utils.json_to_sheet(
    users.map(user => ({
      'UID': user.uid,
      '氏名': user.name,
      '生年月日': user.birth_date ? new Date(user.birth_date).toLocaleDateString('ja-JP') : '',
      '性別': user.gender === 'male' ? '男性' : user.gender === 'female' ? '女性' : user.gender === 'other' ? 'その他' : '',
      '年齢': user.age ?? '',
      '物件住所': user.property_address || '',
      '物件名': user.property_name || '',
      '部屋番号': user.room_number || '',
      '入居者連絡先': user.resident_contact || '',
      '緊急連絡先': user.emergency_contact || '',
      '家賃': user.rent ?? '',
      '作成日': new Date(user.created_at).toLocaleDateString('ja-JP'),
      '更新日': new Date(user.updated_at).toLocaleDateString('ja-JP')
    }))
  )

  const csvData = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvData], { type: 'text/csv;charset=utf-8;' })
  
  saveAs(blob, filename)
}

// 相談データをExcelにエクスポート
export const exportConsultationsToExcel = (consultations: Consultation[], filename: string = 'consultations.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(
    consultations.map(c => {
      // 👇 3. フラットなデータから動的に配列を生成
      const consultation_route = [
        c.consultation_route_self && '本人', c.consultation_route_family && '家族', c.consultation_route_care_manager && 'ケアマネ',
        c.consultation_route_elderly_center && '支援センター（高齢者）', c.consultation_route_disability_center && '支援センター（障害者）',
        c.consultation_route_government && `行政機関(${c.consultation_route_government_other || ''})`, c.consultation_route_other && `その他(${c.consultation_route_other_text || ''})`
      ].filter(Boolean).join(', ')

      const attributes = [
        c.attribute_elderly && '高齢', c.attribute_disability && '障がい', c.attribute_childcare && '子育て',
        c.attribute_single_parent && 'ひとり親', c.attribute_dv && 'DV', c.attribute_foreigner && '外国人',
        c.attribute_poverty && '生活困窮', c.attribute_low_income && '低所得者', c.attribute_lgbt && 'LGBT',
        c.attribute_welfare && '生保'
      ].filter(Boolean).join(', ')

      const household_composition = [
        c.household_single && '独居', c.household_couple && '夫婦', c.household_common_law && '内縁夫婦',
        c.household_parent_child && '親子', c.household_siblings && '兄弟姉妹', c.household_acquaintance && '知人',
        c.household_other && `その他(${c.household_other_text || ''})`
      ].filter(Boolean).join(', ')
      
      return {
        'ID': c.id,
        '相談日': new Date(c.consultation_date).toLocaleDateString('ja-JP'),
        '氏名': c.name || '匿名',
        '年齢': c.age ?? '',
        '性別': c.gender === 'male' ? '男性' : c.gender === 'female' ? '女性' : c.gender === 'other' ? 'その他' : '',
        '相談ルート': consultation_route,
        '属性': attributes,
        '世帯構成': household_composition,
        '住所': c.address || '',
        '電話番号': c.phone_mobile || c.phone_home || '',
        '身体状況': c.physical_condition || '',
        '相談内容': c.consultation_content || '',
        '転居理由': c.relocation_reason || '',
        '相談結果': c.consultation_result || '',
        '作成日': new Date(c.created_at).toLocaleDateString('ja-JP'),
        '更新日': new Date(c.updated_at).toLocaleDateString('ja-JP')
      }
    })
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '相談履歴')
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  
  saveAs(data, filename)
}

// 相談データをCSVにエクスポート
export const exportConsultationsToCSV = (consultations: Consultation[], filename: string = 'consultations.csv') => {
  const worksheet = XLSX.utils.json_to_sheet(
    consultations.map(c => {
      const consultation_route = [
        c.consultation_route_self && '本人', c.consultation_route_family && '家族', c.consultation_route_care_manager && 'ケアマネ',
        c.consultation_route_elderly_center && '支援センター（高齢者）', c.consultation_route_disability_center && '支援センター（障害者）',
        c.consultation_route_government && `行政機関(${c.consultation_route_government_other || ''})`, c.consultation_route_other && `その他(${c.consultation_route_other_text || ''})`
      ].filter(Boolean).join(', ')

      const attributes = [
        c.attribute_elderly && '高齢', c.attribute_disability && '障がい', c.attribute_childcare && '子育て',
        c.attribute_single_parent && 'ひとり親', c.attribute_dv && 'DV', c.attribute_foreigner && '外国人',
        c.attribute_poverty && '生活困窮', c.attribute_low_income && '低所得者', c.attribute_lgbt && 'LGBT',
        c.attribute_welfare && '生保'
      ].filter(Boolean).join(', ')

      const household_composition = [
        c.household_single && '独居', c.household_couple && '夫婦', c.household_common_law && '内縁夫婦',
        c.household_parent_child && '親子', c.household_siblings && '兄弟姉妹', c.household_acquaintance && '知人',
        c.household_other && `その他(${c.household_other_text || ''})`
      ].filter(Boolean).join(', ')

      return {
        'ID': c.id,
        '相談日': new Date(c.consultation_date).toLocaleDateString('ja-JP'),
        '氏名': c.name || '匿名',
        '年齢': c.age ?? '',
        '性別': c.gender === 'male' ? '男性' : c.gender === 'female' ? '女性' : c.gender === 'other' ? 'その他' : '',
        '相談ルート': consultation_route,
        '属性': attributes,
        '世帯構成': household_composition,
        '住所': c.address || '',
        '電話番号': c.phone_mobile || c.phone_home || '',
        '身体状況': c.physical_condition || '',
        '相談内容': c.consultation_content || '',
        '転居理由': c.relocation_reason || '',
        '相談結果': c.consultation_result || '',
        '作成日': new Date(c.created_at).toLocaleDateString('ja-JP'),
        '更新日': new Date(c.updated_at).toLocaleDateString('ja-JP')
      }
    })
  )

  const csvData = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvData], { type: 'text/csv;charset=utf-8;' })
  
  saveAs(blob, filename)
}

// 支援計画データをExcelにエクスポート
export const exportSupportPlansToExcel = (plans: SupportPlan[], filename: string = 'support_plans.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(
    plans.map(plan => {
      const care_insurance_level = [
        plan.care_level_independent && '自立', plan.care_level_support1 && '要支援1', plan.care_level_support2 && '要支援2',
        plan.care_level_care1 && '要介護1', plan.care_level_care2 && '要介護2', plan.care_level_care3 && '要介護3',
        plan.care_level_care4 && '要介護4', plan.care_level_care5 && '要介護5'
      ].filter(Boolean).join(', ')

      const pension_types = [
        plan.pension_national && '国民年金', plan.pension_employee && '厚生年金', plan.pension_disability && '障害年金',
        plan.pension_survivor && '遺族年金', plan.pension_corporate && '企業年金',
        plan.pension_other && `その他(${plan.pension_other_details || ''})`
      ].filter(Boolean).join(', ')
      
      const life_support_services = [
        plan.support_shopping && '買い物', plan.support_bank_visit && '外出支援（金融機関）', plan.support_cleaning && '掃除・片付け',
        plan.support_bulb_change && '電球交換', plan.support_garbage_disposal && 'ゴミ捨て'
      ].filter(Boolean).join(', ')

      return {
        'ID': plan.id,
        '利用者名': plan.name,
        '年齢': plan.age,
        '作成日': new Date(plan.creation_date).toLocaleDateString('ja-JP'),
        '担当スタッフ': plan.staff_name,
        '居住場所': plan.residence || '',
        '携帯電話': plan.phone_mobile || '',
        'LINE': plan.line_available ? 'あり' : 'なし',
        '生活保護': plan.welfare_recipient ? 'あり' : 'なし',
        '担当CW': plan.welfare_worker || '',
        '介護保険': care_insurance_level,
        '年金種類': pension_types,
        '生活支援サービス': life_support_services,
        '目標': plan.goals || '',
        '作成日時': new Date(plan.created_at).toLocaleDateString('ja-JP'),
        '更新日時': new Date(plan.updated_at).toLocaleDateString('ja-JP')
      }
    })
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '支援計画')
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  
  saveAs(data, filename)
}

// 支援計画データをCSVにエクスポート
export const exportSupportPlansToCSV = (plans: SupportPlan[], filename: string = 'support_plans.csv') => {
  const worksheet = XLSX.utils.json_to_sheet(
    plans.map(plan => {
      const care_insurance_level = [
        plan.care_level_independent && '自立', plan.care_level_support1 && '要支援1', plan.care_level_support2 && '要支援2',
        plan.care_level_care1 && '要介護1', plan.care_level_care2 && '要介護2', plan.care_level_care3 && '要介護3',
        plan.care_level_care4 && '要介護4', plan.care_level_care5 && '要介護5'
      ].filter(Boolean).join(', ')

      const pension_types = [
        plan.pension_national && '国民年金', plan.pension_employee && '厚生年金', plan.pension_disability && '障害年金',
        plan.pension_survivor && '遺族年金', plan.pension_corporate && '企業年金',
        plan.pension_other && `その他(${plan.pension_other_details || ''})`
      ].filter(Boolean).join(', ')

      const life_support_services = [
        plan.support_shopping && '買い物', plan.support_bank_visit && '外出支援（金融機関）', plan.support_cleaning && '掃除・片付け',
        plan.support_bulb_change && '電球交換', plan.support_garbage_disposal && 'ゴミ捨て'
      ].filter(Boolean).join(', ')

      return {
        'ID': plan.id,
        '利用者名': plan.name,
        '年齢': plan.age,
        '作成日': new Date(plan.creation_date).toLocaleDateString('ja-JP'),
        '担当スタッフ': plan.staff_name,
        '居住場所': plan.residence || '',
        '携帯電話': plan.phone_mobile || '',
        'LINE': plan.line_available ? 'あり' : 'なし',
        '生活保護': plan.welfare_recipient ? 'あり' : 'なし',
        '担当CW': plan.welfare_worker || '',
        '介護保険': care_insurance_level,
        '年金種類': pension_types,
        '生活支援サービス': life_support_services,
        '目標': plan.goals || '',
        '作成日時': new Date(plan.created_at).toLocaleDateString('ja-JP'),
        '更新日時': new Date(plan.updated_at).toLocaleDateString('ja-JP')
      }
    })
  )

  const csvData = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvData], { type: 'text/csv;charset=utf-8;' })
  
  saveAs(blob, filename)
}

// 期間別相談実績レポート
export const exportConsultationReport = (
  consultations: Consultation[], 
  startDate: string, 
  endDate: string,
  filename: string = 'consultation_report.xlsx'
) => {
  const filteredConsultations = consultations.filter(c => {
    const consultationDate = new Date(c.consultation_date)
    const start = new Date(startDate)
    const end = new Date(endDate)
    return consultationDate >= start && consultationDate <= end
  })

  // 統計データ
  const stats = {
    '期間': `${new Date(startDate).toLocaleDateString('ja-JP')} - ${new Date(endDate).toLocaleDateString('ja-JP')}`,
    '総相談件数': filteredConsultations.length,
    '匿名相談件数': filteredConsultations.filter(c => !c.name).length,
    '実名相談件数': filteredConsultations.filter(c => !!c.name).length,
    '高齢者相談': filteredConsultations.filter(c => c.attribute_elderly).length,
    '障がい者相談': filteredConsultations.filter(c => c.attribute_disability).length,
    '生活困窮相談': filteredConsultations.filter(c => c.attribute_poverty).length,
    '生活保護相談': filteredConsultations.filter(c => c.attribute_welfare).length
  }

  // 統計シート
  const statsSheet = XLSX.utils.json_to_sheet([stats])
  
  // 詳細データシート
  const detailSheet = XLSX.utils.json_to_sheet(
    filteredConsultations.map(consultation => {
      const attributes = [
        consultation.attribute_elderly && '高齢', consultation.attribute_disability && '障がい', consultation.attribute_childcare && '子育て',
        consultation.attribute_single_parent && 'ひとり親', consultation.attribute_dv && 'DV', consultation.attribute_foreigner && '外国人',
        consultation.attribute_poverty && '生活困窮', consultation.attribute_low_income && '低所得者', consultation.attribute_lgbt && 'LGBT',
        consultation.attribute_welfare && '生保'
      ].filter(Boolean).join(', ')

      const consultation_route = [
        consultation.consultation_route_self && '本人', consultation.consultation_route_family && '家族', consultation.consultation_route_care_manager && 'ケアマネ',
        consultation.consultation_route_elderly_center && '支援センター（高齢者）', consultation.consultation_route_disability_center && '支援センター（障害者）',
        consultation.consultation_route_government && `行政機関(${consultation.consultation_route_government_other || ''})`, consultation.consultation_route_other && `その他(${consultation.consultation_route_other_text || ''})`
      ].filter(Boolean).join(', ')

      return {
        '相談日': new Date(consultation.consultation_date).toLocaleDateString('ja-JP'),
        '氏名': consultation.name || '匿名',
        '年齢': consultation.age ?? '',
        '属性': attributes,
        '相談ルート': consultation_route,
        '相談内容': consultation.consultation_content || '',
        '相談結果': consultation.consultation_result || ''
      }
    })
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, statsSheet, '統計')
  XLSX.utils.book_append_sheet(workbook, detailSheet, '詳細データ')
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  
  saveAs(data, filename)
}