// src/app/support-plans/[id]/edit/page.tsx

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/Layout'
import SupportPlanForm from '@/components/SupportPlanForm'

// Next.js 15の仕様に合わせた正しい型定義
interface SupportPlanEditPageProps {
  params: Promise<{
    id: string
  }>
}

// Next.js 15の仕様に合わせ、async/awaitを正しく使用する
export default async function SupportPlanEditPage({ params }: SupportPlanEditPageProps) {
  const { id } = await params

  if (!id) {
    notFound()
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
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
                  <Link href={`/support-plans/${id}`} className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
                    詳細
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">編集</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">支援計画の編集</h1>
            <p className="text-sm text-gray-600 mt-1">既存の支援計画を修正します</p>
          </div>

          <SupportPlanForm editMode={true} supportPlanId={id} />
        </div>
      </div>
    </Layout>
  )
}