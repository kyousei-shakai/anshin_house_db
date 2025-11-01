//src/app/actions/staff.ts

'use server'

import { createClient } from '@/utils/supabase/server'

// staffテーブルから id と name の一覧を取得するためのServer Action
export async function getStaffForSelection() {
  const supabase = await createClient() // ★ 変更点: await を追加！

  try {
    const { data, error } = await supabase
      .from('staff')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) {
      console.error('Server Action Error (getStaffForSelection):', error)
      return { success: false, error: '担当者リストの取得に失敗しました。' }
    }

    return { success: true, data }

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬエラーが発生しました。'
    // ★ 変更点: エラーメッセージに "supabase.from is not a function" が表示されるのを防ぐ
    console.error('Unexpected Error in getStaffForSelection:', errorMessage)
    return { success: false, error: errorMessage }
  }
}