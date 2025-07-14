import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { User, Consultation, SupportPlan } from '@/types/database'

// 利用者データをExcelにエクスポート
export const exportUsersToExcel = (users: User[], filename: string = 'users.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(
    users.map(user => ({
      'UID': user.uid,
      '氏名': user.name,
      '生年月日': user.birth_date ? new Date(user.birth_date).toLocaleDateString('ja-JP') : '',
      '性別': user.gender === 'male' ? '男性' : user.gender === 'female' ? '女性' : user.gender === 'other' ? 'その他' : '',
      '年齢': user.age || '',
      '物件住所': user.property_address || '',
      '物件名': user.property_name || '',
      '部屋番号': user.room_number || '',
      '入居者連絡先': user.resident_contact || '',
      '緊急連絡先': user.emergency_contact || '',
      '家賃': user.rent || '',
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
      '年齢': user.age || '',
      '物件住所': user.property_address || '',
      '物件名': user.property_name || '',
      '部屋番号': user.room_number || '',
      '入居者連絡先': user.resident_contact || '',
      '緊急連絡先': user.emergency_contact || '',
      '家賃': user.rent || '',
      '作成日': new Date(user.created_at).toLocaleDateString('ja-JP'),
      '更新日': new Date(user.updated_at).toLocaleDateString('ja-JP')
    }))
  )

  const csvData = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
  
  saveAs(blob, filename)
}

// 相談データをExcelにエクスポート
export const exportConsultationsToExcel = (consultations: Consultation[], filename: string = 'consultations.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(
    consultations.map(consultation => ({
      'ID': consultation.id,
      '相談日': new Date(consultation.consultation_date).toLocaleDateString('ja-JP'),
      '氏名': consultation.name || '匿名',
      '年齢': consultation.age || '',
      '性別': consultation.gender === 'male' ? '男性' : consultation.gender === 'female' ? '女性' : consultation.gender === 'other' ? 'その他' : '',
      '相談ルート': consultation.consultation_route ? consultation.consultation_route.join(', ') : '',
      '属性': consultation.attributes ? consultation.attributes.join(', ') : '',
      '世帯構成': consultation.household_composition ? consultation.household_composition.join(', ') : '',
      '住所': consultation.address || '',
      '電話番号': consultation.phone_mobile || consultation.phone_home || '',
      '身体状況': consultation.physical_condition || '',
      '相談内容': consultation.consultation_content || '',
      '転居理由': consultation.relocation_reason || '',
      '相談結果': consultation.consultation_result || '',
      '作成日': new Date(consultation.created_at).toLocaleDateString('ja-JP'),
      '更新日': new Date(consultation.updated_at).toLocaleDateString('ja-JP')
    }))
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
    consultations.map(consultation => ({
      'ID': consultation.id,
      '相談日': new Date(consultation.consultation_date).toLocaleDateString('ja-JP'),
      '氏名': consultation.name || '匿名',
      '年齢': consultation.age || '',
      '性別': consultation.gender === 'male' ? '男性' : consultation.gender === 'female' ? '女性' : consultation.gender === 'other' ? 'その他' : '',
      '相談ルート': consultation.consultation_route ? consultation.consultation_route.join(', ') : '',
      '属性': consultation.attributes ? consultation.attributes.join(', ') : '',
      '世帯構成': consultation.household_composition ? consultation.household_composition.join(', ') : '',
      '住所': consultation.address || '',
      '電話番号': consultation.phone_mobile || consultation.phone_home || '',
      '身体状況': consultation.physical_condition || '',
      '相談内容': consultation.consultation_content || '',
      '転居理由': consultation.relocation_reason || '',
      '相談結果': consultation.consultation_result || '',
      '作成日': new Date(consultation.created_at).toLocaleDateString('ja-JP'),
      '更新日': new Date(consultation.updated_at).toLocaleDateString('ja-JP')
    }))
  )

  const csvData = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
  
  saveAs(blob, filename)
}

// 支援計画データをExcelにエクスポート
export const exportSupportPlansToExcel = (plans: SupportPlan[], filename: string = 'support_plans.xlsx') => {
  const worksheet = XLSX.utils.json_to_sheet(
    plans.map(plan => ({
      'ID': plan.id,
      '利用者名': plan.name,
      '年齢': plan.age,
      '作成日': new Date(plan.creation_date).toLocaleDateString('ja-JP'),
      '担当スタッフ': plan.staff_name,
      '居住場所': plan.residence || '',
      '携帯電話': plan.contact_info?.mobile_phone || '',
      'LINE': plan.contact_info?.line ? 'あり' : 'なし',
      '生活保護': plan.welfare_recipient ? 'あり' : 'なし',
      '担当CW': plan.welfare_worker || '',
      '介護保険': plan.care_insurance_level ? plan.care_insurance_level.join(', ') : '',
      '年金種類': plan.pension_types ? plan.pension_types.join(', ') : '',
      '生活支援サービス': plan.life_support_services ? plan.life_support_services.join(', ') : '',
      '目標': plan.goals || '',
      '作成日時': new Date(plan.created_at).toLocaleDateString('ja-JP'),
      '更新日時': new Date(plan.updated_at).toLocaleDateString('ja-JP')
    }))
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
    plans.map(plan => ({
      'ID': plan.id,
      '利用者名': plan.name,
      '年齢': plan.age,
      '作成日': new Date(plan.creation_date).toLocaleDateString('ja-JP'),
      '担当スタッフ': plan.staff_name,
      '居住場所': plan.residence || '',
      '携帯電話': plan.contact_info?.mobile_phone || '',
      'LINE': plan.contact_info?.line ? 'あり' : 'なし',
      '生活保護': plan.welfare_recipient ? 'あり' : 'なし',
      '担当CW': plan.welfare_worker || '',
      '介護保険': plan.care_insurance_level ? plan.care_insurance_level.join(', ') : '',
      '年金種類': plan.pension_types ? plan.pension_types.join(', ') : '',
      '生活支援サービス': plan.life_support_services ? plan.life_support_services.join(', ') : '',
      '目標': plan.goals || '',
      '作成日時': new Date(plan.created_at).toLocaleDateString('ja-JP'),
      '更新日時': new Date(plan.updated_at).toLocaleDateString('ja-JP')
    }))
  )

  const csvData = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
  
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
    '実名相談件数': filteredConsultations.filter(c => c.name).length,
    '高齢者相談': filteredConsultations.filter(c => c.attributes?.includes('高齢')).length,
    '障がい者相談': filteredConsultations.filter(c => c.attributes?.includes('障がい')).length,
    '生活困窮相談': filteredConsultations.filter(c => c.attributes?.includes('生活困窮')).length,
    '生活保護相談': filteredConsultations.filter(c => c.attributes?.includes('生保')).length
  }

  // 統計シート
  const statsSheet = XLSX.utils.json_to_sheet([stats])
  
  // 詳細データシート
  const detailSheet = XLSX.utils.json_to_sheet(
    filteredConsultations.map(consultation => ({
      '相談日': new Date(consultation.consultation_date).toLocaleDateString('ja-JP'),
      '氏名': consultation.name || '匿名',
      '年齢': consultation.age || '',
      '属性': consultation.attributes ? consultation.attributes.join(', ') : '',
      '相談ルート': consultation.consultation_route ? consultation.consultation_route.join(', ') : '',
      '相談内容': consultation.consultation_content || '',
      '相談結果': consultation.consultation_result || ''
    }))
  )

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, statsSheet, '統計')
  XLSX.utils.book_append_sheet(workbook, detailSheet, '詳細データ')
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  
  saveAs(data, filename)
}