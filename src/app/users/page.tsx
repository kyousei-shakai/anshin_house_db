// ★ 改善点: パンくずリストでLinkコンポーネントを使用するためインポート
import Link from 'next/link'
import Layout from '@/components/Layout'
import { getUsers } from '@/app/actions/users'
import UsersClientPage from './UsersClientPage'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const { data: users, error: fetchError } = await getUsers()

  return (
    <Layout>
      {/* ★ 改善点: 「支援計画」ページと共通のレイアウトコンテナを追加 */}
      <div className="max-w-6xl mx-auto">
        
        {/* ★ 改善点: パンくずリストを追加 */}
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
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                  </svg>
                  {/* ★ 改善点: ページのタイトルに合わせて文言を修正 */}
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">利用者さま一覧</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* 
          ★ 改善点: 
          リスト部分を白背景のカードで囲み、タイトルや説明文を追加。
          これにより、UsersClientPageがリスト表示に専念できます。
        */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">利用者さま管理</h1>
              <p className="text-gray-600">
                登録されている利用者さまの情報を管理します。
              </p>
            </div>
            {/* ★ 変更点: 「新規利用者追加」ボタンをこちらに配置 */}
            <Link
              href="/users/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium whitespace-nowrap"
            >
              ＋ 新規利用者追加
            </Link>
          </div>
          
          {/* 取得したデータをクライアントコンポーネントに渡す */}
          <UsersClientPage
            initialUsers={users || []}
            fetchError={fetchError || null}
          />
        </div>

      </div>
    </Layout>
  )
}