import { notFound } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/Layout'
import UserEditForm from '@/components/UserEditForm'

// 1. ★ 型定義を、Next.jsが期待する Promise を含む形に戻します
//    キーの名前は 'id' から 'uid' に変更します。
interface UserEditPageProps {
  params: Promise<{
    uid: string
  }>
}

// 2. ★ ページコンポーネントを async function として宣言します
export default async function UserEditPage({ params }: UserEditPageProps) {
  // 3. ★ propsで受け取った params を await で解決して値を取り出します
  const { uid } = await params

  if (!uid) {
    notFound()
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
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
                  {/* リンク先は、解決済みの uid を使います */}
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

        <UserEditForm userUid={uid} />
      </div>
    </Layout>
  )
}