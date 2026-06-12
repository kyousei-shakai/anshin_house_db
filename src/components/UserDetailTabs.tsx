// src/components/UserDetailTabs.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { deleteUser } from '@/app/actions/users'
import { Database } from '@/types/database'
import UserBasicInfo from './UserBasicInfo'
import UserConsultationHistory from './UserConsultationHistory'
import UserSupportPlans from './UserSupportPlans'

type UserRow = Database['public']['Tables']['users']['Row']
type Consultation = Database['public']['Tables']['consultations']['Row']
type SupportPlan = Database['public']['Tables']['support_plans']['Row']

interface UserDetailTabsProps {
  user: UserRow
  consultations: Consultation[]
  supportPlans: SupportPlan[]
  supportRecordTab: React.ReactNode
}

const UserDetailTabs: React.FC<UserDetailTabsProps> = ({ 
  user, 
  consultations, 
  supportPlans,
  supportRecordTab
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'support-records' | 'consultations' | 'support-plans'>('basic')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!user) return;
    const isConfirmed = window.confirm(`本当に「${user.name}」さんを削除しますか？\nこの操作は元に戻せません。`)
    if (!isConfirmed) return
    setIsDeleting(true)
    try {
      const result = await deleteUser(user.uid)
      if (result && !result.success) throw new Error(result.error || '削除に失敗しました。')
    } catch (err) {
      console.error('利用者削除エラー:', err)
      alert(err instanceof Error ? err.message : '利用者の削除に失敗しました。')
      setIsDeleting(false)
    }
  }

  // ★ 究極のシンプル：IDとラベルのみ
  const tabs = [
    { id: 'basic', label: '基本情報' },
    { id: 'support-records', label: '生活支援記録' },
    { id: 'consultations', label: '相談履歴' },
    { id: 'support-plans', label: '支援計画' }
  ] as const

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* ヘッダー：プロフェッショナルな無彩色設計 */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-[11px] text-gray-500 font-mono mt-0.5 uppercase tracking-widest">ID: {user.uid}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/users/${user.uid}/edit`} className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded text-xs font-bold hover:bg-gray-50 transition-all">編集</Link>
            <button onClick={handleDelete} disabled={isDeleting} type="button" className="text-gray-400 hover:text-red-600 text-xs font-medium px-2 py-1 transition-colors">削除</button>
          </div>
        </div>
      </div>

      {/* タブナビゲーション：テキストのみ */}
      <div className="border-b border-gray-200 px-6 bg-white">
        <nav className="flex space-x-10" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 border-b-2 font-bold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* タブコンテンツ */}
      <div className="p-8">
        {activeTab === 'basic' && <UserBasicInfo user={user} />}
        {activeTab === 'support-records' && supportRecordTab}
        {activeTab === 'consultations' && <UserConsultationHistory consultations={consultations} />}
        {activeTab === 'support-plans' && <UserSupportPlans supportPlans={supportPlans} />}
      </div>
    </div>
  )
}

export default UserDetailTabs