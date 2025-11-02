//src/app/consultations/ConsultationsClientPage.tsx
'use client'

import Link from 'next/link'
import Layout from '@/components/Layout'
import ConsultationList from '@/components/ConsultationList'
import Pagination from '@/components/Pagination'
import { type ConsultationWithStaff } from '@/types/consultation'
// --- ▼▼▼【エラー修正箇所】▼▼▼ ---
import { type Staff } from '@/types/staff'
// --- ▲▲▲【エラー修正箇所】▲▲▲ ---

// page.tsx から渡されるpropsの型定義
interface ConsultationsClientPageProps {
  initialConsultations: ConsultationWithStaff[]
  // --- ▼ 変更点 2: staffsプロパティを型定義に追加 ▼ ---
  staffs: Pick<Staff, 'id' | 'name'>[]
  totalPages: number
  currentPage: number
  fetchError: string | null
}

export default function ConsultationsClientPage({
  initialConsultations,
  // --- ▼ staffsプロパティを受け取るように変更 ▼ ---
  staffs,
  totalPages,
  currentPage,
  fetchError
}: ConsultationsClientPageProps) {

  // ここはクライアントサイドで実行される
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* --- ▼【重要】パンくずリストのコードは元のまま完全に維持します ▼ --- */}
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
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">相談履歴</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        {/* --- ▲ ここまで元のコードを維持 ▲ --- */}

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">相談履歴管理</h1>
            </div>
            <Link
              href="/consultations/new"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              新規相談登録
            </Link>
          </div>
          
          {fetchError ? (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg">
              データの読み込み中にエラーが発生しました: {fetchError}
            </div>
          ) : (
            <>
              {/* --- ▼ 変更点 3: ConsultationListにstaffsを渡す ▼ --- */}
              <ConsultationList
                initialConsultations={initialConsultations}
                staffs={staffs}
              />
              <div className="mt-8">
                <Pagination currentPage={currentPage} totalPages={totalPages} />
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}