// src/app/users/page.tsx (修正後)

import Layout from '@/components/Layout'
import { getUsers } from '@/app/actions/users' // 新しいServer Actionをインポート
import UsersClientPage from './UsersClientPage' // 新しいClient Componentをインポート

export const dynamic = 'force-dynamic'

// サーバーコンポーネントとしてasync関数にする
export default async function UsersPage() {
  // 1. サーバーサイドで安全にデータを取得
  const { data: users, error: fetchError } = await getUsers()

  // 2. 取得したデータをクライアントコンポーネントにpropsとして渡す
  return (
    <Layout>
      <UsersClientPage
        initialUsers={users || []}
        fetchError={fetchError || null}
      />
    </Layout>
  )
}