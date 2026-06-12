// src/app/actions/dashboard.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { Consultation, User } from '@/types/custom'
// 型の追加
import { type UserCareDashboardRow, type UpcomingTaskRow, type TeamRecentHistoryRow } from '@/types/support'
import { getSupportCategories, getAllUpcomingTasks } from './support'
import { getStaffForSelection } from './staff'

export async function getDashboardData() {
  const supabase = await createClient()

  try {
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const [
      usersCountResult,
      newUsersCountResult,
      consultationsCountResult,
      supportPlansCountResult,
      allConsultationsResult,
      allUsersResult,
      careDashboardResult,
      upcomingTasksResult,
      // ▼▼▼ 【追加】チーム履歴の取得結果
      teamHistoryResult,
      categoriesResult,
      staffsResult
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('registered_at', firstDayOfMonth),
      supabase.from('consultations').select('*', { count: 'exact', head: true }).gte('consultation_date', firstDayOfMonth),
      supabase.from('support_plans').select('*', { count: 'exact', head: true }).gte('creation_date', firstDayOfMonth),
      supabase.from('consultations').select('consultation_date, gender, birth_year, birth_month, birth_day, age_group, consultation_route_self, consultation_route_family, consultation_route_care_manager, consultation_route_elderly_center, consultation_route_disability_center, consultation_route_government, consultation_route_other, consultation_route_government_other, consultation_route_other_text, attribute_elderly, attribute_disability, attribute_poverty, attribute_single_parent, attribute_childcare, attribute_dv, attribute_foreigner, attribute_low_income, attribute_lgbt, attribute_welfare'),
      supabase.from('users').select('registered_at'),
      supabase.rpc('get_user_care_dashboard'),
      supabase.rpc('get_all_upcoming_tasks', { p_limit: 100, p_offset: 0 }),
      // ▼▼▼ 【追加】窓口④を呼び出し
      supabase.rpc('get_team_recent_history', { p_limit: 100 }),
      getSupportCategories(),
      getStaffForSelection()
    ]);

    // ★ 改善：自作関数の成功オブジェクトをBoolean評価しないよう修正
    if (careDashboardResult.error) console.error("CareDashboard RPC Error:", careDashboardResult.error);
    if (teamHistoryResult.error) console.error("TeamHistory RPC Error:", teamHistoryResult.error);

    // 致命的なDB接続エラーがない限りデータを返す（寛容な設計）
    return { 
      stats: {
        totalUsers: usersCountResult.count ?? 0,
        newUsersThisMonth: newUsersCountResult.count ?? 0,
        consultationsThisMonth: consultationsCountResult.count ?? 0,
        supportPlansThisMonth: supportPlansCountResult.count ?? 0,
      }, 
      analyticsData: {
        consultations: (allConsultationsResult.data as Consultation[] | null) ?? [],
        users: (allUsersResult.data as User[] | null) ?? [],
      }, 
      careDashboardData: (careDashboardResult.data as unknown as UserCareDashboardRow[]) || [],
      upcomingTasks: (upcomingTasksResult.data as unknown as UpcomingTaskRow[]) || [],
      // ▼▼▼ 【追加】
      teamHistory: (teamHistoryResult.data as unknown as TeamRecentHistoryRow[]) || [],
      categories: categoriesResult.data || [],
      staffs: staffsResult.data || [],
      error: careDashboardResult.error ? '一部のデータの取得に失敗しました。' : null 
    };

  } catch (e) {
    console.error("Dashboard error:", e);
    return { stats: null, analyticsData: null, careDashboardData: [], upcomingTasks: [], teamHistory: [], categories: [], staffs: [], error: 'データ取得に失敗しました。' };
  }
}