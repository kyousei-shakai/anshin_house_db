// src/app/users/new/page.tsx (修正後)

import Link from 'next/link'
import Layout from '@/components/Layout'
import UserEditForm from '@/components/UserEditForm'

// サーバーコンポーネントにする
export default function NewUserPage() {
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
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">新規利用者追加</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        
        {/* UserEditFormを新規作成モードで呼び出す */}
        <UserEditForm editMode={false} />
      </div>
    </Layout>
  )
}