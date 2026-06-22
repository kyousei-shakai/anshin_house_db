// src/app/support-plans/page.tsx
import Link from 'next/link'
import Layout from '@/components/Layout'
import SupportPlanList from '@/components/SupportPlanList'
import { getSupportPlans } from '@/app/actions/supportPlans' // ★ Server Actionをインポート
export const dynamic = 'force-dynamic'
export default async function SupportPlansPage() {
  // ▼▼▼ サーバーサイドで安全に支援計画一覧を取得 (既存ロジック維持) ▼▼▼
  const { data: supportPlans, error } = await getSupportPlans()
  return (
    <Layout>
      {/* 
        ★ 修正: 黄金のコンテナ・ルールを適用。
        px-4 sm:px-6 lg:px-8 を追加することで、パンくずのズレを解消し、
        全デバイスでプロフェッショナルな余白を一貫させます。
      */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* パンくずリスト：親に px- があるため、mb-6 だけで正確に整列します */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                  ホーム
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">支援計画</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* 
          ★ 修正: 
          -mx-4 border-y sm:border でスマホ画面を端まで広げ、
          p-4 sm:p-6 で内側の余白を最適化。
        */}
        <div className="bg-white -mx-4 sm:mx-0 border-y sm:border border-gray-200 sm:rounded-lg sm:shadow-md p-4 sm:p-6">
          {/* ヘッダー: スマホ時の配置を最適化しつつ mb-6 を維持 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">支援計画管理</h1>
              <p className="text-gray-600">
                利用者の支援計画を管理します。新規作成、更新履歴の確認ができます。
              </p>
            </div>
            {/* 新規作成ボタン：スマホ全幅、PC自動幅に最適化 */}
            <Link
              href="/support-plans/new"
              className="bg-purple-600 text-white px-4 py-3 sm:py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-auto text-center font-bold shadow-sm transition-colors"
            >
              新規計画作成
            </Link>
          </div>

          {/* ▼▼▼ 取得したデータをpropsで渡す。エラーがあればエラーも渡す。 (既存維持) ▼▼▼ */}
          <SupportPlanList
            initialSupportPlans={supportPlans || []}
            fetchError={error || null}
          />
        </div>
      </div>
    </Layout>
  )
}