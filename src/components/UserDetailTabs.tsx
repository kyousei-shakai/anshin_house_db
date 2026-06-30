// src/components/UserDetailTabs.tsx
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { deleteUser } from '@/app/actions/users'
import { Database } from '@/types/database'
import UserBasicInfo from './UserBasicInfo'
import UserConsultationHistory from './UserConsultationHistory'
import UserSupportPlans from './UserSupportPlans'

type UserRow = Database['public']['Tables']['users']['Row']
type Consultation = Database['public']['Tables']['consultations']['Row']
type SupportPlan = Database['public']['Tables']['support_plans']['Row']

// ★ 改善：tabs の定義をコンポーネントの「外」に移動しました。
// これによりビルド時の Warning (dependency missing) が根本から消えます。
const tabs = [
  { id: 'basic', label: '基本情報' },
  { id: 'support-records', label: '生活支援記録' },
  { id: 'consultations', label: '相談履歴' },
  { id: 'support-plans', label: '支援計画' }
] as const

type TabId = typeof tabs[number]['id']

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
  const searchParams = useSearchParams()
  const targetTab = searchParams.get('tab')

  // 初期タブの決定ロジック
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const isValidTab = (id: any): id is TabId => tabs.some(t => t.id === id)
    return isValidTab(targetTab) ? targetTab : 'basic'
  })

  // URLパラメータの変化に連動
  useEffect(() => {
    const isValidTab = (id: any): id is TabId => tabs.some(t => t.id === id)
    if (isValidTab(targetTab)) {
      setActiveTab(targetTab)
    }
  }, [targetTab]) // 外に出したため、依存配列に tabs を含める必要がなくなりました

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

  return (
    <div className="bg-white -mx-4 sm:mx-0 border-y sm:border border-gray-200 sm:rounded-lg shadow-sm overflow-hidden">

      {/* ヘッダー：パディングを標準(px-4 sm:px-6)に調整 */}
      <div className="px-4 sm:px-6 py-5 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              {/* ステータスバッジ：一目で現在の状態を識別 */}
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ring-1 ring-inset ${user.status === '利用中' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                  user.status === '逝去' ? 'bg-gray-100 text-gray-600 ring-gray-500/20' :
                    'bg-orange-50 text-orange-700 ring-orange-600/20'
                }`}>
                {user.status}
              </span>
              <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">ID: {user.uid}</p>
            </div>
            {user.furigana && (
              <p className="text-xs text-gray-500 font-medium mb-0.5 ml-0.5">{user.furigana}</p>
            )}
            <h1 className="text-2xl font-bold text-gray-900 truncate">{user.name}</h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href={`/users/${user.uid}/edit`} className="inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-md text-sm font-bold hover:bg-gray-50 transition-all shadow-sm">
              編集する
            </Link>
            <button onClick={handleDelete} disabled={isDeleting} type="button" className="text-gray-400 hover:text-red-600 text-xs font-medium px-2 py-1 transition-colors">
              削除
            </button>
          </div>
        </div>
      </div>

     {/* タブナビゲーション：相対位置の器を作成 */}
      <div className="relative border-b border-gray-200 bg-white">
        
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white via-white/80 to-transparent sm:hidden" />

        {/* 実際のスクロール層 */}
        <div className="px-4 sm:px-6 overflow-x-auto custom-scrollbar">
          <nav className="flex space-x-4 sm:space-x-10" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                /* py-3 に凝縮し、高さを最適化 */
                className={`py-3 border-b-2 font-bold text-sm whitespace-nowrap transition-all flex-shrink-0 ${
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
      </div>

      {/* タブコンテンツ */}
      <div className="p-4 sm:p-8">
        {activeTab === 'basic' && <UserBasicInfo user={user} />}
        {activeTab === 'support-records' && supportRecordTab}
        {activeTab === 'consultations' && <UserConsultationHistory consultations={consultations} />}
        {activeTab === 'support-plans' && <UserSupportPlans supportPlans={supportPlans} />}
      </div>
    </div>
  )
}

export default UserDetailTabs