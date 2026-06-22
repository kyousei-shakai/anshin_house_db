//src/app/settings/categories/page.tsx
import React from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import CategoryManagement from '@/components/support/CategoryManagement'
import { getAllSupportCategories } from '@/app/actions/support'

export const dynamic = 'force-dynamic'

export default async function CategorySettingsPage() {
  // すべてのカテゴリ（非表示含む）を取得
  const result = await getAllSupportCategories()

  if (result.error) {
    return (
      <Layout>
        {/* ★ 修正: エラー時も共通のコンテナ設計を適用 */}
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
                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">支援カテゴリの設定</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
          <div className="p-4 sm:p-6 text-red-600 bg-red-50 -mx-4 sm:mx-0 border-y sm:border border-red-200 sm:rounded-lg shadow-sm">
            データの取得に失敗しました。{result.error}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* ★ 修正: 黄金のコンテナ・ルールを適用し、他の全ページと左端を完全に一致させる */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* パンくずリスト */}
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
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">支援カテゴリの設定</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* ★ 修正: 白いカードの中に「見出し」と「説明文」を配置し、構造を支援計画ページと統一 */}
        <div className="bg-white -mx-4 sm:mx-0 border-y sm:border border-gray-200 sm:rounded-lg sm:shadow-md p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">支援カテゴリの設定</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              生活支援記録で使用する項目を管理します。新規追加、表示・非表示の切り替えができます。
            </p>
          </div>

          {/* コンポーネントを呼び出す (内部の独自カードは削除済) */}
          <CategoryManagement initialCategories={result.data || []} />
        </div>
      </div>
    </Layout>
  )
}