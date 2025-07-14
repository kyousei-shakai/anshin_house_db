import * as XLSX from 'xlsx'
import { User } from '@/types/database'

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

// UIDの重複チェック
export const checkUIDDuplication = (data: Partial<User>[]): ImportValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []
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
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

// データ整合性チェック
export const validateImportData = (data: Partial<User>[]): ImportValidationResult => {
  const errors: string[] = []
  const warnings: string[] = []
  
  data.forEach((user, index) => {
    const rowNum = index + 2 // Excelの行番号（ヘッダー込み）
    
    // 必須項目チェック
    if (!user.uid || user.uid.trim() === '') {
      errors.push(`行 ${rowNum}: UIDが入力されていません`)
    } else if (!/^\d{4}-\d{4}$/.test(user.uid)) {
      errors.push(`行 ${rowNum}: UIDの形式が正しくありません（例: 2024-0001）`)
    }
    
    if (!user.name || user.name.trim() === '') {
      errors.push(`行 ${rowNum}: 氏名が入力されていません`)
    }
    
    // 生年月日の形式チェック
    if (user.birth_date && user.birth_date.toString().trim() !== '') {
      const dateStr = user.birth_date.toString()
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        // Excel日付の場合の変換を試行
        const excelDate = new Date(dateStr)
        if (isNaN(excelDate.getTime())) {
          errors.push(`行 ${rowNum}: 生年月日の形式が正しくありません（例: 1980-01-01）`)
        } else {
          // 正しい日付形式に変換
          user.birth_date = excelDate.toISOString().split('T')[0]
        }
      }
    }
    
    // 性別チェック
    if (user.gender && !['male', 'female', 'other'].includes(user.gender as string)) {
      if (['男性', '男', 'M', 'm'].includes(user.gender as string)) {
        user.gender = 'male'
      } else if (['女性', '女', 'F', 'f'].includes(user.gender as string)) {
        user.gender = 'female'
      } else if (['その他', 'other', 'O', 'o'].includes(user.gender as string)) {
        user.gender = 'other'
      } else {
        warnings.push(`行 ${rowNum}: 性別「${user.gender}」が不明です。空欄に設定されます`)
        user.gender = undefined
      }
    }
    
    // 年齢の数値チェック
    if (user.age && user.age < 0) {
      warnings.push(`行 ${rowNum}: 年齢「${user.age}」は0以上の数値で入力してください`)
    }
    
    // 家賃の数値チェック
    if (user.rent && user.rent < 0) {
      warnings.push(`行 ${rowNum}: 家賃「${user.rent}」は0以上の数値で入力してください`)
    }
  })
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

// Excelファイルの読み込み
export const importUsersFromExcel = (file: File): Promise<ImportResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const worksheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[worksheetName]
        
        // JSONに変換
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        if (jsonData.length === 0) {
          resolve({
            success: false,
            errors: ['ファイルにデータが含まれていません']
          })
          return
        }
        
        // ヘッダー行の確認
        const headers = jsonData[0] as string[]
        const expectedHeaders = [
          'UID', '氏名', '生年月日', '性別', '年齢', '物件住所', '物件名', '部屋番号', '仲介',
          '敷金', '礼金', '家賃', '火災保険', '共益費', '大家家賃', '大家共益費', '家賃差額',
          '入居日', '次回更新年月日', '更新回数', '入居者連絡先', 'LINE', '緊急連絡先', '緊急連絡先氏名',
          '続柄', '見守りシステム', '支援機関/医療機関', '備考', '代理納付該当', '生活保護受給者', '死後事務委任'
        ]
        
        const missingHeaders = expectedHeaders.filter(h => !headers.includes(h))
        if (missingHeaders.length > 0) {
          resolve({
            success: false,
            errors: [`必須のヘッダーが不足しています: ${missingHeaders.join(', ')}`]
          })
          return
        }
        
        // データ行の変換
        const users: Partial<User>[] = []
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as (string | number)[]
          if (row.length === 0 || !row[0]) continue // 空行をスキップ
          
          const user: Partial<User> = {
            uid: row[headers.indexOf('UID')] && row[headers.indexOf('UID')]?.toString().trim() ? row[headers.indexOf('UID')]?.toString().trim() : undefined,
            name: row[headers.indexOf('氏名')] && row[headers.indexOf('氏名')]?.toString().trim() ? row[headers.indexOf('氏名')]?.toString().trim() : undefined,
            birth_date: row[headers.indexOf('生年月日')] && row[headers.indexOf('生年月日')]?.toString().trim() ? row[headers.indexOf('生年月日')]?.toString().trim() : undefined,
            gender: row[headers.indexOf('性別')] && row[headers.indexOf('性別')]?.toString().trim() ? row[headers.indexOf('性別')]?.toString().trim() as 'male' | 'female' | 'other' | undefined : undefined,
            age: row[headers.indexOf('年齢')] && row[headers.indexOf('年齢')]?.toString().trim() ? parseInt(row[headers.indexOf('年齢')]?.toString().trim()) : undefined,
            property_address: row[headers.indexOf('物件住所')] && row[headers.indexOf('物件住所')]?.toString().trim() ? row[headers.indexOf('物件住所')]?.toString().trim() : undefined,
            property_name: row[headers.indexOf('物件名')] && row[headers.indexOf('物件名')]?.toString().trim() ? row[headers.indexOf('物件名')]?.toString().trim() : undefined,
            room_number: row[headers.indexOf('部屋番号')] && row[headers.indexOf('部屋番号')]?.toString().trim() ? row[headers.indexOf('部屋番号')]?.toString().trim() : undefined,
            intermediary: row[headers.indexOf('仲介')] && row[headers.indexOf('仲介')]?.toString().trim() ? row[headers.indexOf('仲介')]?.toString().trim() : undefined,
            deposit: row[headers.indexOf('敷金')] && row[headers.indexOf('敷金')]?.toString().trim() ? parseFloat(row[headers.indexOf('敷金')]?.toString().trim()) : undefined,
            key_money: row[headers.indexOf('礼金')] && row[headers.indexOf('礼金')]?.toString().trim() ? parseFloat(row[headers.indexOf('礼金')]?.toString().trim()) : undefined,
            rent: row[headers.indexOf('家賃')] && row[headers.indexOf('家賃')]?.toString().trim() ? parseFloat(row[headers.indexOf('家賃')]?.toString().trim()) : undefined,
            fire_insurance: row[headers.indexOf('火災保険')] && row[headers.indexOf('火災保険')]?.toString().trim() ? parseFloat(row[headers.indexOf('火災保険')]?.toString().trim()) : undefined,
            common_fee: row[headers.indexOf('共益費')] && row[headers.indexOf('共益費')]?.toString().trim() ? parseFloat(row[headers.indexOf('共益費')]?.toString().trim()) : undefined,
            landlord_rent: row[headers.indexOf('大家家賃')] && row[headers.indexOf('大家家賃')]?.toString().trim() ? parseFloat(row[headers.indexOf('大家家賃')]?.toString().trim()) : undefined,
            landlord_common_fee: row[headers.indexOf('大家共益費')] && row[headers.indexOf('大家共益費')]?.toString().trim() ? parseFloat(row[headers.indexOf('大家共益費')]?.toString().trim()) : undefined,
            rent_difference: row[headers.indexOf('家賃差額')] && row[headers.indexOf('家賃差額')]?.toString().trim() ? parseFloat(row[headers.indexOf('家賃差額')]?.toString().trim()) : undefined,
            move_in_date: row[headers.indexOf('入居日')] && row[headers.indexOf('入居日')]?.toString().trim() ? row[headers.indexOf('入居日')]?.toString().trim() : undefined,
            next_renewal_date: row[headers.indexOf('次回更新年月日')] && row[headers.indexOf('次回更新年月日')]?.toString().trim() ? row[headers.indexOf('次回更新年月日')]?.toString().trim() : undefined,
            renewal_count: row[headers.indexOf('更新回数')] && row[headers.indexOf('更新回数')]?.toString().trim() ? parseInt(row[headers.indexOf('更新回数')]?.toString().trim()) : undefined,
            resident_contact: row[headers.indexOf('入居者連絡先')] && row[headers.indexOf('入居者連絡先')]?.toString().trim() ? row[headers.indexOf('入居者連絡先')]?.toString().trim() : undefined,
            line_available: row[headers.indexOf('LINE')] ? (row[headers.indexOf('LINE')]?.toString().trim() === 'true' || row[headers.indexOf('LINE')]?.toString().trim() === '1' || row[headers.indexOf('LINE')]?.toString().trim() === 'はい') : false,
            emergency_contact: row[headers.indexOf('緊急連絡先')] && row[headers.indexOf('緊急連絡先')]?.toString().trim() ? row[headers.indexOf('緊急連絡先')]?.toString().trim() : undefined,
            emergency_contact_name: row[headers.indexOf('緊急連絡先氏名')] && row[headers.indexOf('緊急連絡先氏名')]?.toString().trim() ? row[headers.indexOf('緊急連絡先氏名')]?.toString().trim() : undefined,
            relationship: row[headers.indexOf('続柄')] && row[headers.indexOf('続柄')]?.toString().trim() ? row[headers.indexOf('続柄')]?.toString().trim() : undefined,
            monitoring_system: row[headers.indexOf('見守りシステム')] && row[headers.indexOf('見守りシステム')]?.toString().trim() ? row[headers.indexOf('見守りシステム')]?.toString().trim() : undefined,
            support_medical_institution: row[headers.indexOf('支援機関/医療機関')] && row[headers.indexOf('支援機関/医療機関')]?.toString().trim() ? row[headers.indexOf('支援機関/医療機関')]?.toString().trim() : undefined,
            notes: row[headers.indexOf('備考')] && row[headers.indexOf('備考')]?.toString().trim() ? row[headers.indexOf('備考')]?.toString().trim() : undefined,
            proxy_payment_eligible: row[headers.indexOf('代理納付該当')] ? (row[headers.indexOf('代理納付該当')]?.toString().trim() === 'true' || row[headers.indexOf('代理納付該当')]?.toString().trim() === '1' || row[headers.indexOf('代理納付該当')]?.toString().trim() === 'はい') : false,
            welfare_recipient: row[headers.indexOf('生活保護受給者')] ? (row[headers.indexOf('生活保護受給者')]?.toString().trim() === 'true' || row[headers.indexOf('生活保護受給者')]?.toString().trim() === '1' || row[headers.indexOf('生活保護受給者')]?.toString().trim() === 'はい') : false,
            posthumous_affairs: row[headers.indexOf('死後事務委任')] ? (row[headers.indexOf('死後事務委任')]?.toString().trim() === 'true' || row[headers.indexOf('死後事務委任')]?.toString().trim() === '1' || row[headers.indexOf('死後事務委任')]?.toString().trim() === 'はい') : false
          }
          
          // 空の文字列をundefinedに変換
          Object.keys(user).forEach(key => {
            if (user[key as keyof User] === '') {
              user[key as keyof User] = undefined
            }
          })
          
          users.push(user)
        }
        
        // データ検証
        const validationResult = validateImportData(users)
        const duplicationResult = checkUIDDuplication(users)
        
        const allErrors = [...validationResult.errors, ...duplicationResult.errors]
        const allWarnings = [...validationResult.warnings, ...duplicationResult.warnings]
        
        if (allErrors.length > 0) {
          resolve({
            success: false,
            errors: allErrors,
            warnings: allWarnings
          })
          return
        }
        
        resolve({
          success: true,
          data: users,
          warnings: allWarnings
        })
        
      } catch (error) {
        resolve({
          success: false,
          errors: [`ファイル読み込みエラー: ${error instanceof Error ? error.message : '不明なエラー'}`]
        })
      }
    }
    
    reader.onerror = () => {
      resolve({
        success: false,
        errors: ['ファイル読み込みに失敗しました']
      })
    }
    
    reader.readAsArrayBuffer(file)
  })
}

// CSVファイルの読み込み
export const importUsersFromCSV = (file: File): Promise<ImportResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const csvData = e.target?.result as string
        const workbook = XLSX.read(csvData, { type: 'string' })
        const worksheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[worksheetName]
        
        // JSONに変換
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        if (jsonData.length === 0) {
          resolve({
            success: false,
            errors: ['ファイルにデータが含まれていません']
          })
          return
        }
        
        // ヘッダー行の確認
        const headers = jsonData[0] as string[]
        const expectedHeaders = [
          'UID', '氏名', '生年月日', '性別', '年齢', '物件住所', '物件名', '部屋番号', '仲介',
          '敷金', '礼金', '家賃', '火災保険', '共益費', '大家家賃', '大家共益費', '家賃差額',
          '入居日', '次回更新年月日', '更新回数', '入居者連絡先', 'LINE', '緊急連絡先', '緊急連絡先氏名',
          '続柄', '見守りシステム', '支援機関/医療機関', '備考', '代理納付該当', '生活保護受給者', '死後事務委任'
        ]
        
        const missingHeaders = expectedHeaders.filter(h => !headers.includes(h))
        if (missingHeaders.length > 0) {
          resolve({
            success: false,
            errors: [`必須のヘッダーが不足しています: ${missingHeaders.join(', ')}`]
          })
          return
        }
        
        // データ行の変換
        const users: Partial<User>[] = []
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as (string | number)[]
          if (row.length === 0 || !row[0]) continue // 空行をスキップ
          
          const user: Partial<User> = {
            uid: row[headers.indexOf('UID')] && row[headers.indexOf('UID')]?.toString().trim() ? row[headers.indexOf('UID')]?.toString().trim() : undefined,
            name: row[headers.indexOf('氏名')] && row[headers.indexOf('氏名')]?.toString().trim() ? row[headers.indexOf('氏名')]?.toString().trim() : undefined,
            birth_date: row[headers.indexOf('生年月日')] && row[headers.indexOf('生年月日')]?.toString().trim() ? row[headers.indexOf('生年月日')]?.toString().trim() : undefined,
            gender: row[headers.indexOf('性別')] && row[headers.indexOf('性別')]?.toString().trim() ? row[headers.indexOf('性別')]?.toString().trim() as 'male' | 'female' | 'other' | undefined : undefined,
            age: row[headers.indexOf('年齢')] && row[headers.indexOf('年齢')]?.toString().trim() ? parseInt(row[headers.indexOf('年齢')]?.toString().trim()) : undefined,
            property_address: row[headers.indexOf('物件住所')] && row[headers.indexOf('物件住所')]?.toString().trim() ? row[headers.indexOf('物件住所')]?.toString().trim() : undefined,
            property_name: row[headers.indexOf('物件名')] && row[headers.indexOf('物件名')]?.toString().trim() ? row[headers.indexOf('物件名')]?.toString().trim() : undefined,
            room_number: row[headers.indexOf('部屋番号')] && row[headers.indexOf('部屋番号')]?.toString().trim() ? row[headers.indexOf('部屋番号')]?.toString().trim() : undefined,
            intermediary: row[headers.indexOf('仲介')] && row[headers.indexOf('仲介')]?.toString().trim() ? row[headers.indexOf('仲介')]?.toString().trim() : undefined,
            deposit: row[headers.indexOf('敷金')] && row[headers.indexOf('敷金')]?.toString().trim() ? parseFloat(row[headers.indexOf('敷金')]?.toString().trim()) : undefined,
            key_money: row[headers.indexOf('礼金')] && row[headers.indexOf('礼金')]?.toString().trim() ? parseFloat(row[headers.indexOf('礼金')]?.toString().trim()) : undefined,
            rent: row[headers.indexOf('家賃')] && row[headers.indexOf('家賃')]?.toString().trim() ? parseFloat(row[headers.indexOf('家賃')]?.toString().trim()) : undefined,
            fire_insurance: row[headers.indexOf('火災保険')] && row[headers.indexOf('火災保険')]?.toString().trim() ? parseFloat(row[headers.indexOf('火災保険')]?.toString().trim()) : undefined,
            common_fee: row[headers.indexOf('共益費')] && row[headers.indexOf('共益費')]?.toString().trim() ? parseFloat(row[headers.indexOf('共益費')]?.toString().trim()) : undefined,
            landlord_rent: row[headers.indexOf('大家家賃')] && row[headers.indexOf('大家家賃')]?.toString().trim() ? parseFloat(row[headers.indexOf('大家家賃')]?.toString().trim()) : undefined,
            landlord_common_fee: row[headers.indexOf('大家共益費')] && row[headers.indexOf('大家共益費')]?.toString().trim() ? parseFloat(row[headers.indexOf('大家共益費')]?.toString().trim()) : undefined,
            rent_difference: row[headers.indexOf('家賃差額')] && row[headers.indexOf('家賃差額')]?.toString().trim() ? parseFloat(row[headers.indexOf('家賃差額')]?.toString().trim()) : undefined,
            move_in_date: row[headers.indexOf('入居日')] && row[headers.indexOf('入居日')]?.toString().trim() ? row[headers.indexOf('入居日')]?.toString().trim() : undefined,
            next_renewal_date: row[headers.indexOf('次回更新年月日')] && row[headers.indexOf('次回更新年月日')]?.toString().trim() ? row[headers.indexOf('次回更新年月日')]?.toString().trim() : undefined,
            renewal_count: row[headers.indexOf('更新回数')] && row[headers.indexOf('更新回数')]?.toString().trim() ? parseInt(row[headers.indexOf('更新回数')]?.toString().trim()) : undefined,
            resident_contact: row[headers.indexOf('入居者連絡先')] && row[headers.indexOf('入居者連絡先')]?.toString().trim() ? row[headers.indexOf('入居者連絡先')]?.toString().trim() : undefined,
            line_available: row[headers.indexOf('LINE')] ? (row[headers.indexOf('LINE')]?.toString().trim() === 'true' || row[headers.indexOf('LINE')]?.toString().trim() === '1' || row[headers.indexOf('LINE')]?.toString().trim() === 'はい') : false,
            emergency_contact: row[headers.indexOf('緊急連絡先')] && row[headers.indexOf('緊急連絡先')]?.toString().trim() ? row[headers.indexOf('緊急連絡先')]?.toString().trim() : undefined,
            emergency_contact_name: row[headers.indexOf('緊急連絡先氏名')] && row[headers.indexOf('緊急連絡先氏名')]?.toString().trim() ? row[headers.indexOf('緊急連絡先氏名')]?.toString().trim() : undefined,
            relationship: row[headers.indexOf('続柄')] && row[headers.indexOf('続柄')]?.toString().trim() ? row[headers.indexOf('続柄')]?.toString().trim() : undefined,
            monitoring_system: row[headers.indexOf('見守りシステム')] && row[headers.indexOf('見守りシステム')]?.toString().trim() ? row[headers.indexOf('見守りシステム')]?.toString().trim() : undefined,
            support_medical_institution: row[headers.indexOf('支援機関/医療機関')] && row[headers.indexOf('支援機関/医療機関')]?.toString().trim() ? row[headers.indexOf('支援機関/医療機関')]?.toString().trim() : undefined,
            notes: row[headers.indexOf('備考')] && row[headers.indexOf('備考')]?.toString().trim() ? row[headers.indexOf('備考')]?.toString().trim() : undefined,
            proxy_payment_eligible: row[headers.indexOf('代理納付該当')] ? (row[headers.indexOf('代理納付該当')]?.toString().trim() === 'true' || row[headers.indexOf('代理納付該当')]?.toString().trim() === '1' || row[headers.indexOf('代理納付該当')]?.toString().trim() === 'はい') : false,
            welfare_recipient: row[headers.indexOf('生活保護受給者')] ? (row[headers.indexOf('生活保護受給者')]?.toString().trim() === 'true' || row[headers.indexOf('生活保護受給者')]?.toString().trim() === '1' || row[headers.indexOf('生活保護受給者')]?.toString().trim() === 'はい') : false,
            posthumous_affairs: row[headers.indexOf('死後事務委任')] ? (row[headers.indexOf('死後事務委任')]?.toString().trim() === 'true' || row[headers.indexOf('死後事務委任')]?.toString().trim() === '1' || row[headers.indexOf('死後事務委任')]?.toString().trim() === 'はい') : false
          }
          
          // 空の文字列をundefinedに変換
          Object.keys(user).forEach(key => {
            if (user[key as keyof User] === '') {
              user[key as keyof User] = undefined
            }
          })
          
          users.push(user)
        }
        
        // データ検証
        const validationResult = validateImportData(users)
        const duplicationResult = checkUIDDuplication(users)
        
        const allErrors = [...validationResult.errors, ...duplicationResult.errors]
        const allWarnings = [...validationResult.warnings, ...duplicationResult.warnings]
        
        if (allErrors.length > 0) {
          resolve({
            success: false,
            errors: allErrors,
            warnings: allWarnings
          })
          return
        }
        
        resolve({
          success: true,
          data: users,
          warnings: allWarnings
        })
        
      } catch (error) {
        resolve({
          success: false,
          errors: [`ファイル読み込みエラー: ${error instanceof Error ? error.message : '不明なエラー'}`]
        })
      }
    }
    
    reader.onerror = () => {
      resolve({
        success: false,
        errors: ['ファイル読み込みに失敗しました']
      })
    }
    
    reader.readAsText(file, 'UTF-8')
  })
}