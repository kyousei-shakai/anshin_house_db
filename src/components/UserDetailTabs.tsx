// src/components/UserDetailTabs.tsx

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
// import { useRouter } from 'next/navigation' // ★ 修正点: この行を削除
import { deleteUser } from '@/app/actions/users'
import { Database } from '@/types/database'
import UserBasicInfo from './UserBasicInfo'
import UserConsultationHistory from './UserConsultationHistory'
import UserSupportPlans from './UserSupportPlans'

type User = Database['public']['Tables']['users']['Row']
type Consultation = Database['public']['Tables']['consultations']['Row']
type SupportPlan = Database['public']['Tables']['support_plans']['Row']

interface UserDetailTabsProps {
  user: User
  consultations: Consultation[]
  supportPlans: SupportPlan[] // ★ propsにsupportPlansを追加
}

const UserDetailTabs: React.FC<UserDetailTabsProps> = ({ user, consultations, supportPlans }) => { // ★ propsでsupportPlansを受け取る
  const [activeTab, setActiveTab] = useState<'basic' | 'consultations' | 'support-plans'>('basic')
  const [isDeleting, setIsDeleting] = useState(false)
  // const router = useRouter() // ★ 修正点: この行を削除

  const handleDelete = async () => {
    if (!user) return;

    const isConfirmed = window.confirm(`本当に「${user.name}」さんを削除しますか？\nこの操作は元に戻せません。`)
    if (!isConfirmed) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteUser(user.uid)
      if (result && !result.success) {
        throw new Error(result.error || '削除に失敗しました。')
      }
    } catch (err) {
      console.error('利用者削除エラー:', err)
      alert(err instanceof Error ? err.message : '利用者の削除に失敗しました。')
      setIsDeleting(false)
    }
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
        {activeTab === 'consultations' && <UserConsultationHistory consultations={consultations} />}
        {activeTab === 'support-plans' && <UserSupportPlans supportPlans={supportPlans} />}
      </div>
    </div>
  )
}

export default UserDetailTabs