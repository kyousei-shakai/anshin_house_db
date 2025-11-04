// src/app/consultations/[id]/ConsultationDetailClientPage.tsx
'use client'

import { Suspense, useMemo } from 'react'
import Link from 'next/link'
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

// 目次コンポーネント
const TableOfContents = ({ sections }: { sections: { id: string; title: string }[] }) => (
  <aside className="sticky top-24 h-full hidden lg:block">
    <h3 className="text-base font-semibold leading-6 text-gray-900">目次</h3>
    <nav className="mt-4">
      <ul className="space-y-3">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md p-2 block text-sm font-medium transition-colors"
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  </aside>
)

export default function ConsultationDetailClientPage({
  consultation,
  children,
}: ConsultationDetailClientPageProps) {
  const sections = useMemo(() => {
    const baseSections = [
      { id: 'timeline', title: '相談タイムライン' },
      { id: 'section-1', title: '1. 基本情報' },
      { id: 'section-2', title: '2. 身体状況・利用サービス' },
      { id: 'section-3', title: '3. 医療・収入' },
    ]

    if (consultation.is_relocation_to_other_city_desired === true) {
      baseSections.push({ id: 'section-4', title: '4. 他市区町村への転居' })
    }

    baseSections.push(
      { id: 'section-5', title: '5. ADL/IADL' },
      { id: 'section-6', title: '6. 現在の住まい' },
      { id: 'section-7', title: '7. 相談内容等' },
      { id: 'section-8', title: 'システム情報' }
    )
    return baseSections
  }, [consultation.is_relocation_to_other_city_desired])

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 text-sm text-gray-600">
              <li>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12">
          <div className="lg:col-span-1">
            <TableOfContents sections={sections} />
          </div>

          <div className="lg:col-span-3 space-y-10">
            <div id="timeline">
              <Suspense fallback={<TimelineSkeleton />}>
                {children}
              </Suspense>
            </div>
            
            <ConsultationDetail consultation={consultation} />
          </div>
        </div>
      </div>
    </Layout>
  )
}