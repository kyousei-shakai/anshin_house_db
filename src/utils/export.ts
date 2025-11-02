// src/utils/export.ts (完全版・修正後)

import { Database } from '@/types/database'
import * as XLSX from 'xlsx'
import { generateFormattedConsultationsExcel } from '@/app/actions/export' // ★ 新しいServer Actionをインポート

type User = Database['public']['Tables']['users']['Row']
type Consultation = Database['public']['Tables']['consultations']['Row']
type SupportPlan = Database['public']['Tables']['support_plans']['Row']

// --- Users Export ---
export const exportUsersToExcel = (users: User[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(users)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Users')
  XLSX.writeFile(workbook, filename)
}

export const exportUsersToCSV = (users: User[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(users)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// --- Consultations Export ---
export const exportConsultationsToExcel = (consultations: Consultation[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(consultations)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Consultations')
  XLSX.writeFile(workbook, filename)
}

export const exportConsultationsToCSV = (consultations: Consultation[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(consultations)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// --- Support Plans Export ---
export const exportSupportPlansToExcel = (supportPlans: SupportPlan[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(supportPlans)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SupportPlans')
  XLSX.writeFile(workbook, filename)
}

export const exportSupportPlansToCSV = (supportPlans: SupportPlan[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(supportPlans)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// --- Consultation Report Export ---
export const exportConsultationReport = (
  consultations: Consultation[],
  startDate: string,
  endDate: string,
  filename: string
) => {
  // This is a placeholder. Actual implementation might be more complex.
  const filtered = consultations.filter(c => {
    if (!c.consultation_date) return false
    const d = new Date(c.consultation_date)
    return d >= new Date(startDate) && d <= new Date(endDate)
  })
  const worksheet = XLSX.utils.json_to_sheet(filtered)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report')
  XLSX.writeFile(workbook, filename)
}

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★ ここが今回の主要な修正箇所です ★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
export const exportFormattedConsultationsToExcel = async (
  consultations: Consultation[],
  filename: string
): Promise<void> => {
  try {
    const consultationIds = consultations.map(c => c.id);
    
    // Server Actionを直接呼び出す
    const result = await generateFormattedConsultationsExcel(consultationIds);

    if (!result.success || !result.fileBuffer) {
      throw new Error(result.error || 'Excelファイルの生成に失敗しました。');
    }

    // Base64からBlobに変換してダウンロード
    const byteCharacters = atob(result.fileBuffer);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('エクスポート処理中にエラーが発生しました:', error);
    alert(`エクスポートに失敗しました。詳細: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
};


// --- 共通ヘルパー関数 (APIルートから移動) ---
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