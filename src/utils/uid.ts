import { usersApi } from '@/lib/api'

/**
 * 新しいユニークなUIDを生成する
 * フォーマット: YYYY-XXXX (例: 2024-0001)
 */
export const generateNewUID = async (): Promise<string> => {
  const currentYear = new Date().getFullYear()
  const yearPrefix = currentYear.toString()

  const existingUsers = await usersApi.getAll()
  const currentYearUIDs = existingUsers
    .map(user => user.uid)
    .filter(uid => uid.startsWith(yearPrefix))
    .map(uid => parseInt(uid.split('-')[1], 10))
    .filter(num => !isNaN(num))

  const maxNumber = currentYearUIDs.length > 0 ? Math.max(...currentYearUIDs) : 0
  const newNumber = (maxNumber + 1).toString().padStart(4, '0')

  return `${yearPrefix}-${newNumber}`
}

/**
 * UIDの形式をバリデーションする
 */
export const validateUID = (uid: string): boolean => {
  const pattern = /^\d{4}-\d{4}$/
  return pattern.test(uid)
}

/**
 * UIDが既に使用されているかチェックする
 */
export const isUIDExists = async (uid: string): Promise<boolean> => {
  try {
    const user = await usersApi.getByUid(uid)
    return user !== null
  } catch {
    return false
  }
}