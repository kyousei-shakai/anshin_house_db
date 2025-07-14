import { notFound } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/Layout'
import UserDetailTabs from '@/components/UserDetailTabs'

interface UserDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
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
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">利用者詳細</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        <UserDetailTabs userId={id} />
      </div>
    </Layout>
  )
}