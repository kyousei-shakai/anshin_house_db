// src/app/page.tsx (修正後)

import Layout from '@/components/Layout'
import HomeClient from './HomeClient'
import { getDashboardData } from '@/app/actions/dashboard' // ★ 新しいServer Actionをインポート

export const dynamic = 'force-dynamic' // 常に最新のデータを取得

export default async function Home() {
  
  // ▼▼▼ Server Actionを呼び出してデータを取得 ▼▼▼
  const { stats, analyticsData, error } = await getDashboardData();

  // データ取得に失敗した場合のエラー表示
  if (error || !stats || !analyticsData) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto p-4 bg-red-100 text-red-700 rounded">
          ダッシュボードデータの読み込みに失敗しました: {error}
        </div>
      </Layout>
    )
  }

  // console.logは不要になったので削除

  return (
    <Layout>
      <HomeClient stats={stats} initialAnalyticsData={analyticsData} />
    </Layout>
  )
}