// app/page.tsx

import Layout from '@/components/Layout'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import HomeClient from './HomeClient'

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
          // 【最終修正点】catchの引数をなくし、ESLintエラーを完全に解消
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // サーバーコンポーネントでのクッキー設定エラーは無視してOK
          }
        },
        remove(name: string, options: CookieOptions) {
          // 【最終修正点】catchの引数をなくし、ESLintエラーを完全に解消
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
    // 1. 総登録者数 (usersテーブルの全行)
    { count: totalUsers },
    
    // 2. 今月の新規登録者数 (usersテーブルでcreated_atが今月以降の行)
    { count: newUsersThisMonth },
    
    // 3. 今月の相談件数 (consultationsテーブルでconsultation_dateが今月以降の行)
    { count: consultationsThisMonth },
    
    // 4. 今月の作成計画数 (support_plansテーブルでcreation_dateが今月以降の行)
    { count: supportPlansThisMonth },

  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', firstDayOfMonth),
    supabase.from('consultations').select('*', { count: 'exact', head: true }).gte('consultation_date', firstDayOfMonth),
    supabase.from('support_plans').select('*', { count: 'exact', head: true }).gte('creation_date', firstDayOfMonth),
  ]);
  
  const stats = {
    totalUsers: totalUsers ?? 0,
    newUsersThisMonth: newUsersThisMonth ?? 0,
    consultationsThisMonth: consultationsThisMonth ?? 0,
    supportPlansThisMonth: supportPlansThisMonth ?? 0,
  };

  return (
    <Layout>
      <HomeClient stats={stats} />
    </Layout>
  )
}