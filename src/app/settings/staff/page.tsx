//src/app/settings/staff/page.tsx 
import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import Layout from '@/components/Layout'
import StaffManagement from '@/components/settings/StaffManagement'
import { getAllStaffForManagement } from '@/app/actions/staff'

export const metadata: Metadata = {
  title: 'スタッフ管理 | 居住支援管理システム',
}

// シニアエンジニアの指摘通り、常に最新のマスタを表示するため動的レンダリングを強制
export const dynamic = 'force-dynamic'

export default async function StaffSettingsPage() {
  // サーバーサイドで全スタッフ（無効分含む）を取得
  const result = await getAllStaffForManagement()

  if (result.error) {
    return (
      <Layout>
        {/* エラー時も共通の黄金コンテナ設計を適用 */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">スタッフ管理</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
          <div className="p-4 sm:p-6 text-red-600 bg-red-50 -mx-4 sm:mx-0 border-y sm:border border-red-200 sm:rounded-lg shadow-sm">
            スタッフデータの取得に失敗しました。{result.error}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* 黄金のコンテナ・ルール：他の全ページと左端・右端を完全に一致させる */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* パンくずリストの実装 */}
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
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">スタッフ管理</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* 白いカード構造：見出しと説明文を含め、他ページとトーンを完全統一 */}
        <div className="bg-white -mx-4 sm:mx-0 border-y sm:border border-gray-200 sm:rounded-lg sm:shadow-md p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">スタッフ管理</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              相談フォームや検索フィルターに表示される担当スタッフの情報を管理します。
              退職等で不要になった場合は「削除」ではなく「非表示」にしてください。
            </p>
          </div>

          {/* クライアントコンポーネントの呼び出し */}
          <StaffManagement initialStaff={result.data || []} />
        </div>
      </div>
    </Layout>
  )
}