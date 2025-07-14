'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useUser } from '@/hooks/useUsers'
import UserBasicInfo from './UserBasicInfo'
import UserConsultationHistory from './UserConsultationHistory'
import UserSupportPlans from './UserSupportPlans'

interface UserDetailTabsProps {
  userId: string
}

const UserDetailTabs: React.FC<UserDetailTabsProps> = ({ userId }) => {
  const { user, loading, error } = useUser(userId)
  const [activeTab, setActiveTab] = useState<'basic' | 'consultations' | 'support-plans'>('basic')

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
            <Link
              href={`/users/${userId}/edit`}
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
        {activeTab === 'consultations' && <UserConsultationHistory userId={userId} />}
        {activeTab === 'support-plans' && <UserSupportPlans userId={userId} />}
      </div>
    </div>
  )
}

export default UserDetailTabs