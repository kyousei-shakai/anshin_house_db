// src/utils/export.ts
import { Database } from '@/types/database'
import * as XLSX from 'xlsx'
import { 
  generateFormattedConsultationsExcel,
  generateMonthlyReportExcel,
} from '@/app/actions/export'

type User = Database['public']['Tables']['users']['Row']
type Consultation = Database['public']['Tables']['consultations']['Row']
type SupportPlan = Database['public']['Tables']['support_plans']['Row']

// --- Base64からBlobへの変換ヘルパー ---
const base64ToBlob = (base64: string, contentType: string): Blob => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

// --- ファイルダウンロードのヘルパー ---
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

// --- 月次報告書を呼び出す新しい関数 ---
export const exportMonthlyReport = async (year: number, month: number): Promise<void> => {
  try {
    const result = await generateMonthlyReportExcel(year, month);
    if (!result.success || !result.fileBuffer) {
      throw new Error(result.error || 'Excelファイルの生成に失敗しました。');
    }
    const blob = base64ToBlob(
      result.fileBuffer, 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    const filename = `月次報告書_${year}年${String(month).padStart(2, '0')}月.xlsx`;
    downloadFile(blob, filename);
  } catch (error) {
    console.error('月次報告書のエクスポート処理中にエラーが発生しました:', error);
    alert(`エクスポートに失敗しました。詳細: ${error instanceof Error ? error.message : '不明なエラー'}`);
    throw error;
  }
};


// --- 整形済み相談記録のエクスポート (既存) ---
export const exportFormattedConsultationsToExcel = async (
  consultations: Consultation[],
  filename: string
): Promise<void> => {
  try {
    const consultationIds = consultations.map(c => c.id);
    
    const result = await generateFormattedConsultationsExcel(consultationIds);

    if (!result.success || !result.fileBuffer) {
      throw new Error(result.error || 'Excelファイルの生成に失敗しました。');
    }

    const blob = base64ToBlob(
      result.fileBuffer,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    
    downloadFile(blob, filename);

  } catch (error) {
    console.error('エクスポート処理中にエラーが発生しました:', error);
    alert(`エクスポートに失敗しました。詳細: ${error instanceof Error ? error.message : '不明なエラー'}`);
    throw error;
  }
};


// --- 共通ヘルパー関数 (既存) ---
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