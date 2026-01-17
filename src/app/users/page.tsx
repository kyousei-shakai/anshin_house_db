// ★ 改善点: パンくずリストでLinkコンポーネントを使用するためインポート
import Link from 'next/link'
import Layout from '@/components/Layout'
import { getUsers } from '@/app/actions/users'
import UsersClientPage from './UsersClientPage'
import { Database } from '@/types/database' // 型定義のインポート

export const dynamic = 'force-dynamic'

// 型定義: クエリパラメータ用
type SearchParams = {
  status?: string
}

// 型定義: データベースのENUMを利用
type UserStatus = Database['public']['Enums']['user_status']

export default async function UsersPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // クエリパラメータからステータスを取得。デフォルトは '利用中'。
  // 不正な値が来た場合も考慮し、バリデーション的に型アサーションを行う
  const rawStatus = searchParams.status
  let currentStatus: UserStatus | 'all' = '利用中'

  if (rawStatus === 'all') {
    currentStatus = 'all'
  } else if (rawStatus === '逝去' || rawStatus === '解約' || rawStatus === '利用中') {
    currentStatus = rawStatus as UserStatus
  }
  
  // 指定されたステータスでデータを取得（Server Actionを呼び出し）
  const { data: users, error: fetchError } = await getUsers(currentStatus)

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
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">利用者さま管理</h1>
              <p className="text-gray-600">
                登録されている利用者さまの情報を管理します。
              </p>
            </div>
            {/* ★ 変更点: 「新規利用者追加」ボタンをこちらに配置 */}
            <Link
              href="/users/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium whitespace-nowrap text-center"
            >
              ＋ 新規利用者追加
            </Link>
          </div>

          {/* ▼▼▼ 追加: フィルタリングタブ ▼▼▼ */}
          {/* タブUI：現在のステータスに応じてスタイル（下線と色）を変更 */}
          <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
            <Link
              href="/users?status=利用中"
              className={`py-2 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                currentStatus === '利用中'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              利用中
            </Link>
            <Link
              href="/users?status=all"
              className={`py-2 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                currentStatus === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              すべて表示
            </Link>
            <Link
              href="/users?status=逝去"
              className={`py-2 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                currentStatus === '逝去'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              逝去
            </Link>
             <Link
              href="/users?status=解約"
              className={`py-2 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                currentStatus === '解約'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              解約
            </Link>
          </div>
          {/* ▲▲▲ 追加ここまで ▲▲▲ */}
          
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