// src/app/support-plans/new/page.tsx (修正後)

import Link from 'next/link'
import Layout from '@/components/Layout'
import SupportPlanForm from '@/components/SupportPlanForm'
import { getUsers } from '@/app/actions/users' // ★ 利用者一覧を取得するServer Actionをインポート

export default async function NewSupportPlanPage() {
  // ▼▼▼ サーバーサイドで安全に利用者一覧を取得 ▼▼▼
  const { data: users, error } = await getUsers()

  if (error) {
    // データ取得に失敗した場合のエラー表示
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4 bg-red-100 text-red-700 rounded">
          利用者一覧の読み込みに失敗しました: {error}
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
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
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                  </svg>
                  <Link href="/support-plans" className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
                    支援計画
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">新規作成</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">新規支援計画作成</h1>
            <p className="text-gray-600 text-sm md:text-base">
              利用者の支援計画を作成します。
            </p>
          </div>

          {/* ▼▼▼ 取得した利用者一覧をpropsでフォームに渡す ▼▼▼ */}
          <SupportPlanForm users={users || []} />
        </div>
      </div>
    </Layout>
  )
}