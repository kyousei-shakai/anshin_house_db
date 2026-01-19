// src/app/actions/dashboard.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { Consultation, User } from '@/types/custom'

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
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).gte('registered_at', firstDayOfMonth),
      supabase.from('consultations').select('*', { count: 'exact', head: true }).gte('consultation_date', firstDayOfMonth),
      supabase.from('support_plans').select('*', { count: 'exact', head: true }).gte('creation_date', firstDayOfMonth),
      
      // ▼▼▼【修正点】age_group カラムを select 句に追加しました ▼▼▼
      supabase.from('consultations').select(`
        consultation_date, 
        gender, 
        birth_year, 
        birth_month, 
        birth_day, 
        age_group, 
        consultation_route_self, 
        consultation_route_family, 
        consultation_route_care_manager, 
        consultation_route_elderly_center, 
        consultation_route_disability_center, 
        consultation_route_government, 
        consultation_route_other, 
        consultation_route_government_other, 
        consultation_route_other_text, 
        attribute_elderly, 
        attribute_disability, 
        attribute_poverty, 
        attribute_single_parent, 
        attribute_childcare, 
        attribute_dv, 
        attribute_foreigner, 
        attribute_low_income, 
        attribute_lgbt, 
        attribute_welfare
      `),
      
      supabase.from('users').select('registered_at')
    ]);

    // エラーチェック
    const errors = [
      usersCountResult.error,
      newUsersCountResult.error,
      consultationsCountResult.error,
      supportPlansCountResult.error,
      allConsultationsResult.error,
      allUsersResult.error
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error("Dashboard data fetch errors:", errors);
      throw new Error('ダッシュボードのデータ取得中にエラーが発生しました。');
    }
    
    const stats = {
      totalUsers: usersCountResult.count ?? 0,
      newUsersThisMonth: newUsersCountResult.count ?? 0,
      consultationsThisMonth: consultationsCountResult.count ?? 0,
      supportPlansThisMonth: supportPlansCountResult.count ?? 0,
    };
    
    const analyticsData = {
      consultations: (allConsultationsResult.data as Consultation[] | null) ?? [],
      users: (allUsersResult.data as User[] | null) ?? [],
    };

    return { stats, analyticsData, error: null };

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : '予期せぬエラーが発生しました。'
    console.error("Unexpected error in getDashboardData:", errorMessage);
    return { stats: null, analyticsData: null, error: errorMessage };
  }
}