// src/app/page.tsx 

import Layout from '@/components/Layout'
import HomeClient from './HomeClient'
import { getDashboardData } from '@/app/actions/dashboard'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const result = await getDashboardData();
  const { stats, analyticsData, careDashboardData, upcomingTasks, teamHistory, categories, staffs, error } = result;

    if (!stats || !analyticsData) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl shadow-sm">
            <h2 className="text-lg font-bold mb-2">データの読み込みに失敗しました</h2>
            <p className="text-sm opacity-90">{error || 'システム管理者にお問い合わせください。'}</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <HomeClient 
        stats={stats} 
        initialAnalyticsData={analyticsData} 
        careDashboardData={careDashboardData || []} 
        upcomingTasks={upcomingTasks || []}
        // ★ teamHistory を渡す
        teamHistory={teamHistory || []} 
        categories={categories || []}
        staffs={staffs || []}
      />
    </Layout>
  )
}