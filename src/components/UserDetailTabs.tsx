'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUsers' 
import { usersApi } from '@/lib/api'
import UserBasicInfo from './UserBasicInfo'
import UserConsultationHistory from './UserConsultationHistory'
import UserSupportPlans from './UserSupportPlans'

// 1. Propsの型定義を userId から userUid に変更
interface UserDetailTabsProps {
  userUid: string
}

const UserDetailTabs: React.FC<UserDetailTabsProps> = ({ userUid }) => {
  // 2. useUserフックに userUid を渡すように変更
  //    (useUserフックは後で 'uid' で検索するように修正が必要です)
  const { user, loading, error } = useUser(userUid)
  const [activeTab, setActiveTab] = useState<'basic' | 'consultations' | 'support-plans'>('basic')
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    // 3. ★★★ 最重要変更点 ★★★
    // 削除APIを呼び出すためには、主キーである `id` (UUID) が必要。
    // user オブジェクトが存在しない場合は処理を中断する。
    if (!user) return;

    const isConfirmed = window.confirm(`本当に「${user.name}」さんを削除しますか？\nこの操作は元に戻せません。`)
    if (!isConfirmed) {
      return
    }

    setIsDeleting(true)
    try {
      // 4. usersApi.delete には、主キーである `user.id` (UUID) を渡す
      await usersApi.delete(user.id)
      alert('利用者を削除しました。')
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('利用者削除エラー:', err)
      alert('利用者の削除に失敗しました。')
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="text-red-500 text-sm">
            エラーが発生しました: {error}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="text-yellow-700 text-sm">
            利用者が見つかりません
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'basic', label: '基本情報', icon: '👤' },
    { id: 'consultations', label: '相談履歴', icon: '📋' },
    { id: 'support-plans', label: '支援計画', icon: '📝' }
  ] as const

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-600 mt-1">UID: {user.uid}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            {/* 5. 「編集」ボタンのリンク先を新しいURL形式 (`/users/[uid]/edit`) に変更 */}
            <Link
              href={`/users/${user.uid}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-sm md:text-base"
            >
              編集
            </Link>
            <Link
              href="/consultations/new"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-sm md:text-base"
            >
              新規相談
            </Link>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                type="button"
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-center text-sm md:text-base disabled:opacity-50"
            >
                {isDeleting ? '削除中...' : '利用者削除'}
            </button>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* タブコンテンツ */}
      <div className="p-6">
        {activeTab === 'basic' && <UserBasicInfo user={user} />}
        {/* 6. 下層コンポーネントには、主キーである `user.id` (UUID) を渡す */}
        {activeTab === 'consultations' && <UserConsultationHistory userId={user.id} />}
        {activeTab === 'support-plans' && <UserSupportPlans userId={user.id} />}
      </div>
    </div>
  )
}

export default UserDetailTabs