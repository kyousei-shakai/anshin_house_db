// src/utils/import.ts
import * as XLSX from 'xlsx'
import { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']

export interface ImportResult {
  success: boolean
  data?: Partial<User>[]
  errors?: string[]
  warnings?: string[]
}

export interface ImportValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// ★ 追加: タイムゾーン問題を回避する、安全な日付変換関数
const convertDate = (dateInput: string | number | Date | null | undefined): string | undefined => {
  if (!dateInput) return undefined;
  
  const dateStr = dateInput.toString().trim();
  if (dateStr === '') return undefined;

  // YYYY-MM-DD形式の場合はそのまま返す
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Excelのシリアル値（数値）の場合
  const excelDateNumber = Number(dateStr);
  if (!isNaN(excelDateNumber) && excelDateNumber > 0) {
    // Excelのシリアル値は1900-01-01を1とするが、JavaScriptのDateは1970-01-01を基準とするため変換
    // 1900年のうるう年のバグも考慮
    const epoch = Date.UTC(1899, 11, 30); // 1899-12-30を基準点とする
    const date = new Date(epoch + excelDateNumber * 86400 * 1000);
    
    // UTC基準で年月日を取得し、YYYY-MM-DD形式にフォーマットする
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // その他の形式（'YYYY/MM/DD'など）をパースしてみる
  const parsedDate = new Date(dateStr);
  if (!isNaN(parsedDate.getTime())) {
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // いずれにも当てはまらない場合は、バリデーションエラー用の不正な値として返す
  return dateStr; 
}


export const checkUIDDuplication = (data: Partial<User>[]): ImportValidationResult => {
  const errors: string[] = []
  const uids = new Set<string>()
  
  data.forEach((user, index) => {
    if (user.uid) {
      if (uids.has(user.uid)) {
        errors.push(`行 ${index + 2}: UID「${user.uid}」が重複しています`)
      } else {
        uids.add(user.uid)
      }
    }
  })
  
  return { valid: errors.length === 0, errors, warnings: [] }
}

export const validateImportData = (data: Partial<User>[]): ImportValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []
  
  data.forEach((user, index) => {
    const rowNum = index + 2
    
    if (!user.uid || user.uid.trim() === '') {
      errors.push(`行 ${rowNum}: UIDが入力されていません`)
    } else if (!/^\d{4}-\d{4}$/.test(user.uid)) {
      errors.push(`行 ${rowNum}: UIDの形式が正しくありません（例: 2024-0001）`)
    }
    
    if (!user.name || user.name.trim() === '') {
      errors.push(`行 ${rowNum}: 氏名が入力されていません`)
    }

    // ★ 変更点: 新しいconvertDate関数を使い、日付カラムをまとめて処理
    const dateFields: (keyof User)[] = ['birth_date', 'move_in_date', 'next_renewal_date'];
    dateFields.forEach(field => {
      if (user[field]) {
        const originalValue = user[field];
        const converted = convertDate(originalValue as string);
if (converted && /^\d{4}-\d{2}-\d{2}$/.test(converted)) {
          // ★ 変更点: 説明付きの @ts-expect-error に変更
          // @ts-expect-error: 'field'は日付型(string)であることが分かっているが、TSはUnion型と見なすため
          user[field] = converted;
        } else if (originalValue) {
          const fieldName = userMapping[field] || field;
          errors.push(`行 ${rowNum}: ${fieldName}「${originalValue}」の形式が正しくありません（例: 1980-01-01）`);
        }
      }
    });

    const gender = user.gender as string;
    if (gender && !['male', 'female', 'other'].includes(gender)) {
      if (['男性', '男', 'M', 'm'].includes(gender)) user.gender = 'male';
      else if (['女性', '女', 'F', 'f'].includes(gender)) user.gender = 'female';
      else if (['その他', 'other', 'O', 'o'].includes(gender)) user.gender = 'other';
      else {
        warnings.push(`行 ${rowNum}: 性別「${user.gender}」が不明です。空欄に設定されます`);
        user.gender = undefined;
      }
    }
    
    if (user.rent !== undefined && user.rent !== null && Number(user.rent) < 0) warnings.push(`行 ${rowNum}: 家賃「${user.rent}」は0以上の数値で入力してください`);
  })
  
  return { valid: errors.length === 0, errors, warnings }
}

const parseRowToUser = (row: (string | number)[], headers: string[]): Partial<User> => {
    const user: Partial<User> = {};
  
    headers.forEach((header) => {
      const value = row[headers.indexOf(header)];
      if (value === undefined || value === null || value === '') return;
  
      const valueStr = value.toString().trim();
      
      if (header === userMapping.uid) user.uid = valueStr;
      else if (header === userMapping.name) user.name = valueStr;
      else if (header === userMapping.birth_date) user.birth_date = valueStr;
      else if (header === userMapping.gender) user.gender = valueStr as 'male' | 'female' | 'other';
      else if (header === userMapping.property_address) user.property_address = valueStr;
      else if (header === userMapping.property_name) user.property_name = valueStr;
      else if (header === userMapping.room_number) user.room_number = valueStr;
      else if (header === userMapping.intermediary) user.intermediary = valueStr;
      else if (header === userMapping.move_in_date) user.move_in_date = valueStr;
      else if (header === userMapping.next_renewal_date) user.next_renewal_date = valueStr;
      else if (header === userMapping.resident_contact) user.resident_contact = valueStr;
      else if (header === userMapping.emergency_contact) user.emergency_contact = valueStr;
      else if (header === userMapping.emergency_contact_name) user.emergency_contact_name = valueStr;
      else if (header === userMapping.relationship) user.relationship = valueStr;
      else if (header === userMapping.monitoring_system) user.monitoring_system = valueStr;
      else if (header === userMapping.support_medical_institution) user.support_medical_institution = valueStr;
      else if (header === userMapping.notes) user.notes = valueStr;
      else if (header === userMapping.deposit) user.deposit = parseFloat(valueStr);
      else if (header === userMapping.key_money) user.key_money = parseFloat(valueStr);
      else if (header === userMapping.rent) user.rent = parseFloat(valueStr);
      else if (header === userMapping.fire_insurance) user.fire_insurance = parseFloat(valueStr);
      else if (header === userMapping.common_fee) user.common_fee = parseFloat(valueStr);
      else if (header === userMapping.landlord_rent) user.landlord_rent = parseFloat(valueStr);
      else if (header === userMapping.landlord_common_fee) user.landlord_common_fee = parseFloat(valueStr);
      else if (header === userMapping.rent_difference) user.rent_difference = parseFloat(valueStr);
      else if (header === userMapping.renewal_count) user.renewal_count = parseInt(valueStr, 10);
      else if (header === userMapping.line_available) user.line_available = ['true', '1', 'はい', 'あり'].includes(valueStr.toLowerCase());
      else if (header === userMapping.proxy_payment_eligible) user.proxy_payment_eligible = ['true', '1', 'はい', 'あり'].includes(valueStr.toLowerCase());
      else if (header === userMapping.welfare_recipient) user.welfare_recipient = ['true', '1', 'はい', 'あり'].includes(valueStr.toLowerCase());
      else if (header === userMapping.posthumous_affairs) user.posthumous_affairs = ['true', '1', 'はい', 'あり'].includes(valueStr.toLowerCase());
    });
  
    return user;
};
  
const processJsonData = (jsonData: (string | number)[][]): ImportResult => {
  if (jsonData.length < 2) {
    return { success: false, errors: ['ファイルにデータ行が含まれていません'] };
  }
  
  const headers = jsonData[0] as string[]
  const expectedHeaders = Object.values(userMapping).filter((v): v is string => !!v);
  
  const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    return { success: false, errors: [`必須のヘッダーが不足しています: ${missingHeaders.join(', ')}`] };
  }
  
  const users: Partial<User>[] = [];
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i] as (string | number)[];
    if (row.every(cell => cell === null || cell === undefined || cell === '')) continue;
    
    users.push(parseRowToUser(row, headers));
  }
  
  const validationResult = validateImportData(users)
  const duplicationResult = checkUIDDuplication(users)
  
  const allErrors = [...validationResult.errors, ...duplicationResult.errors]
  const allWarnings = [...validationResult.warnings, ...duplicationResult.warnings]
  
  if (allErrors.length > 0) {
    return { success: false, errors: allErrors, warnings: allWarnings };
  }
  
  return { success: true, data: users, warnings: allWarnings };
}

export const importUsersFromExcel = (file: File): Promise<ImportResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const worksheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[worksheetName]
        const jsonData = XLSX.utils.sheet_to_json<(string|number)[]>(worksheet, { header: 1, defval: '' })
        resolve(processJsonData(jsonData));
      } catch (error) {
        resolve({ success: false, errors: [`ファイル読み込みエラー: ${error instanceof Error ? error.message : '不明なエラー'}`] });
      }
    }
    reader.onerror = () => resolve({ success: false, errors: ['ファイル読み込みに失敗しました'] });
    reader.readAsArrayBuffer(file)
  })
}

export const importUsersFromCSV = (file: File): Promise<ImportResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvData = e.target?.result as string
        const workbook = XLSX.read(csvData, { type: 'string' })
        const worksheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[worksheetName]
        const jsonData = XLSX.utils.sheet_to_json<(string|number)[]>(worksheet, { header: 1, defval: '' })
        resolve(processJsonData(jsonData));
      } catch (error) {
        resolve({ success: false, errors: [`ファイル読み込みエラー: ${error instanceof Error ? error.message : '不明なエラー'}`] });
      }
    }
    reader.onerror = () => resolve({ success: false, errors: ['ファイル読み込みに失敗しました'] });
    reader.readAsText(file, 'UTF-8')
  })
}

const userMapping: { [key in keyof User]?: string } = {
  uid: 'UID', name: '氏名', birth_date: '生年月日', gender: '性別',
  property_address: '物件住所', property_name: '物件名', room_number: '部屋番号',
  intermediary: '仲介', deposit: '敷金', key_money: '礼金', rent: '家賃',
  fire_insurance: '火災保険', common_fee: '共益費', landlord_rent: '大家家賃',
  landlord_common_fee: '大家共益費', rent_difference: '家賃差額',
  move_in_date: '入居日', next_renewal_date: '次回更新年月日',
  renewal_count: '更新回数', resident_contact: '入居者連絡先',
  line_available: 'LINE', emergency_contact: '緊急連絡先',
  emergency_contact_name: '緊急連絡先氏名', relationship: '続柄',
  monitoring_system: '見守りシステム', support_medical_institution: '支援機関/医療機関',
  notes: '備考', proxy_payment_eligible: '代理納付該当',
  welfare_recipient: '生活保護受給者', posthumous_affairs: '死後事務委任'
};