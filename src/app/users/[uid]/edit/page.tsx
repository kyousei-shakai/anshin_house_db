// src/app/users/[uid]/edit/page.tsx

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/Layout'
import UserEditForm from '@/components/UserEditForm'
import { getUserByUid } from '@/app/actions/users'

// ▼▼▼ ここからが修正箇所です ▼▼"▼▼

// interface UserEditPageProps を削除

// 我々が確立した「唯一の正しい解決パターン」を適用
export default async function UserEditPage({
  params,
}: {
  params: Promise<{ uid: string }>
}) {
  const resolvedParams = await params;
  const { uid } = resolvedParams;
  const { success, data: user } = await getUserByUid(uid);

// ▲▲▲ ここまでが修正箇所です ▲▲▲

  if (!success || !user) {
    notFound()
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/users" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                  利用者名簿
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                  </svg>
                  <Link href={`/users/${uid}`} className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
                    利用者詳細
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

        <UserEditForm user={user} editMode={true} />
      </div>
    </Layout>
  )
}