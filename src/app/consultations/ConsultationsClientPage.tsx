// src/app/consultations/ConsultationsClientPage.tsx
'use client'

import Link from 'next/link'
import Layout from '@/components/Layout'
import ConsultationList from '@/components/ConsultationList'
import Pagination from '@/components/Pagination'
import { type ConsultationWithNextAction } from '@/types/consultation'
import { type Staff } from '@/types/staff'

// page.tsx から渡されるpropsの型定義
interface ConsultationsClientPageProps {
  initialConsultations: ConsultationWithNextAction[]
  staffs: Pick<Staff, 'id' | 'name'>[]
  totalPages: number
  currentPage: number
  // ▼▼▼【追加】集計データの型定義 ▼▼▼
  statusCounts: { [key: string]: number }
  fetchError: string | null
}

export default function ConsultationsClientPage({
  initialConsultations,
  staffs,
  totalPages,
  currentPage,
  // ▼▼▼【追加】受け取る ▼▼▼
  statusCounts,
  fetchError
}: ConsultationsClientPageProps) {

  return (
    <Layout>
      {/* 
        ★ 修正: 黄金のコンテナ・ルールを適用。
        px-4 sm:px-6 lg:px-8 を追加することで、パンくずのズレを解消し、
        全デバイスでプロフェッショナルな余白を確保します。
      */}
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
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">相談履歴</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* 
          ★ 修正: カードのデザインを他ページと完全統一。
          -mx-4 border-y sm:border でスマホ画面を最大限に活用しつつ、
          p-4 sm:p-6 で内側の情報密度を最適化。
        */}
        <div className="bg-white -mx-4 sm:mx-0 border-y sm:border border-gray-200 sm:rounded-lg sm:shadow-md p-4 sm:p-6">
          {/* ヘッダー: スマホ時の折り返しとボタンサイズを最適化 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">相談履歴管理</h1>
            </div>
            <Link
              href="/consultations/new"
              className="bg-green-600 text-white px-4 py-3 sm:py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-center font-bold w-full sm:w-auto"
            >
              ＋ 新規相談登録
            </Link>
          </div>
          
          {fetchError ? (
            <div className="text-red-500 p-4 bg-red-50 rounded-lg border border-red-100">
              データの読み込み中にエラーが発生しました: {fetchError}
            </div>
          ) : (
            <>
              {/* ▼▼▼【修正】ConsultationList に statusCounts を渡す (既存維持) ▼▼▼ */}
              <ConsultationList
                initialConsultations={initialConsultations}
                staffs={staffs}
                statusCounts={statusCounts}
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