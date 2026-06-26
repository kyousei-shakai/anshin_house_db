//src/app/actions/staff.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath, unstable_noStore } from 'next/cache'
import { Database } from '@/types/database'

type StaffInsert = Database['public']['Tables']['staff']['Insert']

/**
 * 1. 選択用スタッフリスト取得（入力フォーム・フィルター用）
 * @param currentStaffId - 編集モード時に、現在選択されているスタッフIDを保持するために使用
 * 
 * 【防弾設計】
 * シニアエンジニアの指摘に基づき、退職した（is_active=false）スタッフであっても、
 * その相談記録の担当者である場合はリストに含めることで、編集時のデータ消失を防ぎます。
 */
export async function getStaffForSelection(currentStaffId?: string | null) {
  // Next.jsのキャッシュを強制的にバイパスし、常に最新のDBデータを参照する
  unstable_noStore();
  
  const supabase = await createClient()

  try {
    // 基本順序：表示順(display_order)を優先し、次に名前順
    let query = supabase
      .from('staff')
      .select('id, name, role, is_active')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (currentStaffId) {
      // 【証跡保護ロジック】有効なスタッフ OR 既にこのレコードに紐付いているスタッフ
      query = query.or(`is_active.eq.true,id.eq.${currentStaffId}`);
    } else {
      // 新規作成モード：現在有効なスタッフのみを表示
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (e) {
    console.error('getStaffForSelection Error:', e);
    return { success: false, error: '担当者リストの取得に失敗しました。' };
  }
}

/**
 * 2. 管理画面用全スタッフ取得
 * 有効・無効を問わず、マスタ管理のためにすべてのスタッフを返します。
 */
export async function getAllStaffForManagement() {
  unstable_noStore();
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (e) {
    console.error('getAllStaffForManagement Error:', e);
    return { success: false, error: 'スタッフ情報の取得に失敗しました。' };
  }
}

/**
 * 3. スタッフの登録・更新（Upsert）
 * @param staffData - StaffInsert型（name必須、id任意）を使用することで型安全にupsertを行います
 * 
 * 【広域キャッシュパージ】
ルート('/')からレイアウト全体を再検証します。
 * これにより、相談フォーム、一覧のフィルタ、ダッシュボード等、
 * システム全域のスタッフ名が即座に最新化されることを保証します。
 */
export async function upsertStaff(staffData: StaffInsert) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from('staff')
      .upsert(staffData)
      .select()
      .single();

    if (error) throw error;

    // 特定のページだけでなく、全体をパージして整合性を担保
    revalidatePath('/', 'layout');
    
    return { success: true, data };
  } catch (e) {
    console.error('upsertStaff Error:', e);
    return { success: false, error: 'スタッフ情報の保存に失敗しました。' };
  }
}

/**
 * 4. スタッフの有効/無効切り替え（論理削除）
 * 
 * 【三重防御】
 * 物理的な DELETE クエリは一切発行せず、is_active フラグの更新のみを行います。
 * これにより、過去の相談記録との参照整合性が損なわれるリスクを構造的に排除します。
 */
export async function toggleStaffActive(id: string, nextStatus: boolean) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('staff')
      .update({ is_active: nextStatus })
      .eq('id', id);

    if (error) throw error;

    // 全画面の最新化
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (e) {
    console.error('toggleStaffActive Error:', e);
    return { success: false, error: '状態の更新に失敗しました。' };
  }
}