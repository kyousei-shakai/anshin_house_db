// src/app/HomeClient.tsx

'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { Consultation, User } from '@/types/custom'
import dynamic from 'next/dynamic'
// デザイン用アイコンのインポート
import { Users, MessageSquareText, FileHeart, ChevronRight } from 'lucide-react'

// データ分析ダッシュボードの動的インポート（ローディング表示は元のリッチな状態を維持）
const AnalyticsDashboard = dynamic(
  () => import('@/components/AnalyticsDashboard'),
  { 
    ssr: false, 
    loading: () => 
      <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">データ分析ダッシュボード</h2>
        </div>
        <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">分析データを読み込み中...</p>
        </div>
      </div>
  }
)

const PlusCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DocumentPlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

interface HomeClientProps {
  stats: {
    totalUsers: number;
    newUsersThisMonth: number;
    consultationsThisMonth: number;
    supportPlansThisMonth: number;
  };
  initialAnalyticsData: {
    consultations: Consultation[];
    users: User[];
  };
}

export default function HomeClient({ stats, initialAnalyticsData }: HomeClientProps) {
  const [activeTab, setActiveTab] = useState<'notifications' | 'future'>('notifications')

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* アクションボタンエリア */}
      <div className="mb-10 pt-2"> 
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link href="/consultations/new" className="group bg-blue-700 text-white rounded-md shadow p-5 flex items-center hover:bg-blue-800 transition-colors">
            <div className="p-2 bg-blue-800 rounded mr-4"><PlusCircleIcon /></div>
            <div>
              <h3 className="text-lg font-bold">新規相談を登録する</h3>
              <p className="text-blue-100 text-xs mt-1">新しい相談や問い合わせを記録します。</p>
            </div>
          </Link>
          <Link href="/support-plans/new" className="group bg-purple-700 text-white rounded-md shadow p-5 flex items-center hover:bg-purple-800 transition-colors">
            <div className="p-2 bg-purple-800 rounded mr-4"><DocumentPlusIcon /></div>
            <div>
              <h3 className="text-lg font-bold">支援計画を作成する</h3>
              <p className="text-purple-100 text-xs mt-1">新しい支援計画書を作成します。</p>
            </div>
          </Link>
        </div>
      </div>
      
      {/* 状況カード：パターンB（背景色付き・ソフト）のデザイン適用 */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-gray-500 pl-3">
          全体の状況
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 利用者情報カード */}
          <Link href="/users" className="group block rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-emerald-900 flex items-center gap-2">
                <Users className="h-5 w-5" /> 利用者情報ハブ
              </h3>
              <ChevronRight className="h-5 w-5 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <div className="flex items-end justify-between px-1">
              <div>
                <p className="text-xs text-emerald-700 font-medium mb-1">総登録者数</p>
                <p className="text-3xl font-bold text-emerald-800 leading-none">{stats.totalUsers}<span className="text-sm font-normal ml-1">人</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-emerald-600">今月の新規</p>
                <p className="text-lg font-bold text-emerald-700">+{stats.newUsersThisMonth}<span className="text-sm font-normal ml-1">人</span></p>
              </div>
            </div>
          </Link>

          {/* 相談記録カード */}
          <Link href="/consultations" className="group block rounded-xl border border-orange-200 bg-orange-50/50 hover:bg-orange-50 transition-colors p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-orange-900 flex items-center gap-2">
                <MessageSquareText className="h-5 w-5" /> 相談記録
              </h3>
              <ChevronRight className="h-5 w-5 text-orange-400 group-hover:text-orange-600 transition-colors" />
            </div>
            <div className="flex items-end justify-between px-1">
              <div>
                <p className="text-xs text-orange-700 font-medium mb-1">今月の相談件数</p>
                <p className="text-3xl font-bold text-orange-800 leading-none">{stats.consultationsThisMonth}<span className="text-sm font-normal ml-1">件</span></p>
              </div>
            </div>
          </Link>

          {/* 支援計画カード */}
          <Link href="/support-plans" className="group block rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 transition-colors p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
                <FileHeart className="h-5 w-5" /> 支援計画
              </h3>
              <ChevronRight className="h-5 w-5 text-rose-400 group-hover:text-rose-600 transition-colors" />
            </div>
            <div className="flex items-end justify-between px-1">
              <div>
                <p className="text-xs text-rose-700 font-medium mb-1">今月の作成計画数</p>
                <p className="text-3xl font-bold text-rose-800 leading-none">{stats.supportPlansThisMonth}<span className="text-sm font-normal ml-1">件</span></p>
              </div>
            </div>
          </Link>

        </div>
      </div>
      
      {/* グラフコンポーネント（変更なし） */}
      <AnalyticsDashboard 
        consultations={initialAnalyticsData.consultations}
        users={initialAnalyticsData.users}
      />

      {/* お知らせセクション（元のロジックと文言を維持） */}
      <div className="mt-12">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-gray-500 pl-3">お知らせ & 開発情報</h2>
        <div className="bg-white rounded-md shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
              <button onClick={() => setActiveTab('notifications')} className={`${activeTab === 'notifications' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}>
                お知らせ
              </button>
              <button onClick={() => setActiveTab('future')} className={`${activeTab === 'future' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}>
                今後の機能について
              </button>
            </nav>
          </div>
          <div className="p-6">
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="text-sm text-gray-500 w-24 shrink-0">2025/08/01</div>
                    <div className="text-sm text-gray-800">【お知らせ】ダミーテキスト</div>
                  </div>
                  <div className="border-t border-gray-100"></div>
                  <div className="flex items-start">
                    <div className="text-sm text-gray-500 w-24 shrink-0">2025/08/01</div>
                    <div className="text-sm text-gray-800">【お知らせ】ダミーテキスト</div>
                  </div>
              </div>
            )}
            {activeTab === 'future' && (
              <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-2"></h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    このシステムは、スタッフの皆様の声を反映して、作成していきます。<br />
                    「ここがやりにくい、こんな機能があったら便利」といったご意見もお待ちしております。
                  </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}