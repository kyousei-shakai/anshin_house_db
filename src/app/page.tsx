// app/page.tsx の完全なコード

import Layout from '@/components/Layout'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import HomeClient from './HomeClient'
import { Consultation, User } from '@/types/custom'

export default async function Home() {
  
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // サーバーコンポーネントでのクッキー設定エラーは無視してOK
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // エラーを無視
          }
        },
      },
    }
  )

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
    supabase.from('consultations').select('consultation_date, consultation_route_self, consultation_route_family, consultation_route_care_manager, consultation_route_elderly_center, consultation_route_disability_center, consultation_route_government, consultation_route_other, consultation_route_government_other, consultation_route_other_text, attribute_elderly, attribute_disability, attribute_poverty, attribute_single_parent, attribute_childcare, attribute_dv, attribute_foreigner, attribute_low_income, attribute_lgbt, attribute_welfare'),
    supabase.from('users').select('registered_at')
  ]);
  
  const stats = {
    totalUsers: usersCountResult.count ?? 0,
    newUsersThisMonth: newUsersCountResult.count ?? 0,
    consultationsThisMonth: consultationsCountResult.count ?? 0,
    supportPlansThisMonth: supportPlansCountResult.count ?? 0,
  };
  
  // ▼▼▼▼▼ エラーハンドリングとデフォルト値の設定を強化 ▼▼▼▼▼
  if (allConsultationsResult.error) {
    console.error("Consultations fetch error:", allConsultationsResult.error.message);
  }
  if (allUsersResult.error) {
    console.error("Users fetch error:", allUsersResult.error.message);
  }

  const analyticsData = {
    consultations: (allConsultationsResult.data as Consultation[] | null) ?? [], // nullの場合は空配列を保証
    users: (allUsersResult.data as User[] | null) ?? [], // nullの場合は空配列を保証
  };
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  return (
    <Layout>
      <HomeClient stats={stats} initialAnalyticsData={analyticsData} />
    </Layout>
  )
}