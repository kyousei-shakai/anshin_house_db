// src/app/consultations/[id]/ConsultationDetailClientPage.tsx

'use client'

import { Suspense } from 'react'
import Link from 'next/link' // ★ 修正点: Linkコンポーネントをインポート
import Layout from '@/components/Layout'
import ConsultationDetail from '@/components/ConsultationDetail'
import { type ConsultationWithStaff } from '@/types/consultation'

// スケルトンコンポーネント (変更なし)
const TimelineSkeleton = () => (
  <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
)

interface ConsultationDetailClientPageProps {
  consultation: ConsultationWithStaff
  children: React.ReactNode
}

export default function ConsultationDetailClientPage({
  consultation,
  children,
}: ConsultationDetailClientPageProps) {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 text-sm text-gray-600">
              <li>
                {/* ▼▼▼ 修正点: <a> を <Link> に変更 ▼▼▼ */}
                <Link href="/consultations" className="block transition hover:text-gray-700"> 相談履歴 </Link>
              </li>
              <li className="rtl:rotate-180">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </li>
              <li>
                <span className="block transition text-gray-700 font-medium"> 相談詳細 </span>
              </li>
            </ol>
          </nav>
        </div>

        <div className="space-y-10">
          <Suspense fallback={<TimelineSkeleton />}>
            {children}
          </Suspense>

          <ConsultationDetail consultation={consultation} />
        </div>
      </div>
    </Layout>
  )
}