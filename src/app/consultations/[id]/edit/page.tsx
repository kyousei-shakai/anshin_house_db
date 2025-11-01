// src/app/consultations/[id]/edit/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ConsultationFormLayout from '@/components/ConsultationFormLayout'
import ConsultationForm from '@/components/ConsultationForm'
import { getConsultationById } from '@/app/actions/consultations'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function ConsultationEditPage() {
  const headersList = await headers()
  const url = headersList.get('x-url') || ''
  const segments = new URL(url).pathname.split('/')
  
  // ★ 変更点: 最後の要素ではなく、最後から2番目の要素をIDとして取得
  const id = segments[segments.length - 2] || ''

  if (!id) {
    notFound()
  }

  const { success, data: initialData } = await getConsultationById(id)

  if (!success || !initialData) {
    notFound()
  }

  const pageHeader = (
    <div>
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
                <Link href="/consultations" className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
                  相談履歴
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <Link href={`/consultations/${id}`} className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
                  相談詳細
                </Link>
              </div>
            </li>
            <li aria-current="page">
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
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">相談内容の編集</h1>
          <p className="text-gray-600">
            既存の相談内容を修正します。
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <ConsultationFormLayout pageHeader={pageHeader}>
      <ConsultationForm
        editMode={true}
        initialData={initialData}
      />
    </ConsultationFormLayout>
  )
}