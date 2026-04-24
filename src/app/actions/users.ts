// src/app/actions/users.ts
'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'
import { generateNewUID } from '@/utils/uid'

// 型定義
type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']
// ステータスのENUM型を定義（DB型から抽出）
type UserStatus = Database['public']['Enums']['user_status']

// --- getUsers ---
type GetUsersReturnType = {
  success: boolean
  data?: User[]
  error?: string
}

/**
 * 利用者一覧を取得する
 * @param status - フィルタリングするステータス (省略時は '利用中' のみ取得)
 *                 'all' を指定すると全件取得
 */
export async function getUsers(status: UserStatus | 'all' = '利用中'): Promise<GetUsersReturnType> {
  const supabase = await createClient()
  try {
    // クエリの構築
    let query = supabase.from('users').select('*').order('name', { ascending: true })

    // 'all' 以外が指定された場合はステータスでフィルタリング
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Get Users Server Action Error:', error)
      return { success: false, error: '利用者一覧の取得に失敗しました。' }
    }
    return { success: true, data: data || [] }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬ不明なエラーが発生しました。'
    console.error('Unexpected Error in getUsers:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}

// --- createUser ---
type CreateUserReturnType = {
  success: boolean
  data?: User
  error?: string
}
// --- createUser (この関数を現在のものと差し替えてください) ---
export async function createUser(
  userData: Omit<UserInsert, 'uid'>,
  consultationId: string | null
): Promise<CreateUserReturnType> {
  const supabase = await createClient()

  try {
    const newUID = await generateNewUID()
    
    // 最初に入力フォームからのデータをセット
    let finalUserData: UserInsert = { ...userData, uid: newUID }

    // 【追加ロジック】相談から利用者登録する場合、相談時の緊急連絡先情報を自動引き継ぎ
    if (consultationId) {
      // 該当する相談データを取得
      const { data: consultation } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', consultationId)
        .single()

      if (consultation) {
        // フォーム側が空の場合のみ、相談データの値を補完する
        finalUserData = {
          ...finalUserData,
          // 緊急連絡先住所（今回の新規項目）
          emergency_contact_address: userData.emergency_contact_address || consultation.emergency_contact_address,
          // 緊急連絡先電話番号（携帯優先、なければ固定）
          emergency_contact: userData.emergency_contact || consultation.emergency_contact_phone_mobile || consultation.emergency_contact_phone_home,
          // 緊急連絡先氏名
          emergency_contact_name: userData.emergency_contact_name || consultation.emergency_contact_name,
          // 続柄
          relationship: userData.relationship || consultation.emergency_contact_relationship,
        }
      }
    }

    // 補完されたデータでユーザーを作成
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert(finalUserData)
      .select()
      .single()

    if (userError) {
      console.error('Create User Server Action Error:', userError)
      if (userError.code === '23502') {
        return { success: false, error: `必須項目が不足しています: ${userError.details}` }
      }
      return { success: false, error: `利用者の作成に失敗しました: ${userError.message}` }
    }

    // 相談データのステータスを更新し、user_idを紐付ける
    if (consultationId) {
      const { error: consultationError } = await supabase
        .from('consultations')
        .update({ user_id: newUser.id, status: '利用者登録済み' })
        .eq('id', consultationId)

      if (consultationError) {
        console.error('Update Consultation on User Create Error:', consultationError)
      }
    }

    revalidatePath('/users')
    revalidatePath('/consultations')

    return { success: true, data: newUser }

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬ不明なエラーが発生しました。'
    console.error('Unexpected Error in createUser:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}

// --- deleteUser ---
export async function deleteUser(uid: string) {
  const supabase = await createClient()
  try {
    const { error } = await supabase.from('users').delete().eq('uid', uid)
    if (error) {
      console.error('Delete User Server Action Error:', error)
      return { success: false, error: '利用者の削除に失敗しました。' }
    }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬ不明なエラーが発生しました。'
    console.error('Unexpected Error in deleteUser:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }

  revalidatePath('/users')
  redirect('/users')
}

// --- getUserByUid ---
type GetUserByUidReturnType = {
  success: boolean
  data?: User
  error?: string
}
export async function getUserByUid(uid: string): Promise<GetUserByUidReturnType> {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase.from('users').select('*').eq('uid', uid).single()
    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: '指定された利用者が見つかりません。' }
      }
      console.error('Get User By Uid Server Action Error:', error)
      return { success: false, error: '利用者情報の取得に失敗しました。' }
    }
    return { success: true, data }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬ不明なエラーが発生しました。'
    console.error('Unexpected Error in getUserByUid:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}

// --- updateUser ---
type UpdateUserReturnType = {
  success: boolean
  data?: User
  error?: string
}
export async function updateUser(
  uid: string,
  userData: UserUpdate
): Promise<UpdateUserReturnType> {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('uid', uid)
      .select()
      .single()

    if (error) {
      console.error('Update User Server Action Error:', error)
      return { success: false, error: `利用者の更新に失敗しました: ${error.message}` }
    }

    revalidatePath('/users')
    revalidatePath(`/users/${uid}`)
    revalidatePath(`/users/${uid}/edit`)

    return { success: true, data }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬ不明なエラーが発生しました。'
    console.error('Unexpected Error in updateUser:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}

// --- getAllUsersForExport ---
export async function getAllUsersForExport(): Promise<GetUsersReturnType> {
  const supabase = await createClient()
  try {
    // エクスポート時は全ステータスを取得する
    const { data, error } = await supabase.from('users').select('*').order('uid', { ascending: true })
    if (error) {
      console.error('Get All Users For Export Error:', error)
      return { success: false, error: '全利用者データの取得に失敗しました。' }
    }
    return { success: true, data: data || [] }
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬ不明なエラーが発生しました。'
    console.error('Unexpected Error in getAllUsersForExport:', errorMessage)
    return { success: false, error: '予期せぬエラーが発生しました。' }
  }
}