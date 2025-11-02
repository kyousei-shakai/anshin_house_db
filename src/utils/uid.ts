// src/utils/uid.ts 
import { createClient } from '@/utils/supabase/server'

/**
 * 新しいユニークなUIDをサーバーサイドで安全に生成する
 * フォーマット: YYYY-XXXX (例: 2025-0001)
 */
export const generateNewUID = async (): Promise<string> => {
  const supabase = await createClient() // ★ 変更点: await を追加
  const currentYear = new Date().getFullYear()
  const yearPrefix = `${currentYear}-`

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('uid')
      .like('uid', `${yearPrefix}%`)

    if (error) {
      console.error('Error fetching users for UID generation:', error)
      const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
      return `${currentYear}-${randomSuffix}`;
    }

    const currentYearUIDs = users
      .map(user => parseInt(user.uid.split('-')[1], 10))
      .filter(num => !isNaN(num))

    const maxNumber = currentYearUIDs.length > 0 ? Math.max(...currentYearUIDs) : 0
    const newNumber = (maxNumber + 1).toString().padStart(4, '0')

    return `${yearPrefix}${newNumber}`

  } catch (e) {
    // ★ 変更点: エラーがオブジェクトの場合も考慮し、より安全なログ出力に修正
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error('Unexpected error in generateNewUID:', errorMessage)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    return `${currentYear}-${randomSuffix}`;
  }
}

/**
 * UIDの形式をバリデーションする
 */
export const validateUID = (uid: string): boolean => {
  const pattern = /^\d{4}-\d{4}$/
  return pattern.test(uid)
}