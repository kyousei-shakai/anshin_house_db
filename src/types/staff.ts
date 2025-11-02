import { type Database } from './database'

// database.tsからstaffテーブルの型を抽出し、'Staff'という名前でエクスポートします。
export type Staff = Database['public']['Tables']['staff']['Row']