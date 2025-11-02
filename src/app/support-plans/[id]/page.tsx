// src/app/support-plans/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/Layout'
import SupportPlanDetail from '@/components/SupportPlanDetail'
import { getSupportPlanById } from '@/app/actions/supportPlans'
import { headers } from 'next/headers' // ★ 変更点: headersをインポート

export const dynamic = 'force-dynamic'

// ★ 変更点: propsからparamsを受け取らない
export default async function SupportPlanDetailPage() {
  // ★ 変更点: headers()を使ってURLからidを安全に抽出
  const headersList = await headers()
  const url = headersList.get('x-url') || ''
  const segments = new URL(url).pathname.split('/')
  const id = segments[segments.length - 1] || ''

  if (!id) {
    notFound()
  }

  const { success, data: supportPlan } = await getSupportPlanById(id)

  if (!success || !supportPlan) {
    notFound()
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/support-plans" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                  支援計画
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">詳細</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <SupportPlanDetail supportPlan={supportPlan} />
      </div>
    </Layout>
  )
}