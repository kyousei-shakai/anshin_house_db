// app/HomeClient.tsx

'use client' // このファイルがブラウザで動作することを示す命令

import Link from 'next/link'
import React, { useState } from 'react'
import QuickUserAccess from '@/components/QuickUserAccess' // 忘れずにインポート

// アイコン用のSVGコンポーネント (Heroiconsより)
const PlusCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// 「支援計画を作成する」ボタン用のアイコン
const DocumentPlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

// サーバーから渡されるpropsの型を定義
interface HomeClientProps {
  stats: {
    totalUsers: number;
    newUsersThisMonth: number;
    consultationsThisMonth: number;
    supportPlansThisMonth: number;
  }
}

export default function HomeClient({ stats }: HomeClientProps) {
  // お知らせタブの状態を管理
  const [activeTab, setActiveTab] = useState<'notifications' | 'future'>('notifications')

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* スマホ用：利用者名簿クイックアクセス (既存コンポーネント) */}
      <div className="lg:hidden mb-6">
        <QuickUserAccess />
      </div>

      {/* --- クイックアクション --- */}
      <div className="mb-12 pt-4"> 
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/consultations/new" className="group bg-blue-600 text-white rounded-lg shadow-md p-6 flex items-center hover:bg-blue-700 transition-all duration-200 transform hover:scale-105">
            <PlusCircleIcon />
            <div>
              <h3 className="text-xl font-semibold">新規相談を登録する</h3>
              <p className="text-blue-100 text-sm mt-1">新しい相談や問い合わせを記録します。</p>
            </div>
          </Link>
          <Link href="/support-plans/new" className="group bg-purple-600 text-white rounded-lg shadow-md p-6 flex items-center hover:bg-purple-700 transition-all duration-200 transform hover:scale-105">
            <DocumentPlusIcon />
            <div>
              <h3 className="text-xl font-semibold">支援計画を作成する</h3>
              <p className="text-purple-100 text-sm mt-1">新しい支援計画書を作成します。</p>
            </div>
          </Link>
        </div>
      </div>
      
      {/* --- 全体の状況 --- */}
      <div className="mb-12">
        <h2 className="text-xl font-bold text-gray-800 mb-4">全体の状況</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 利用者情報カード */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">利用者情報ハブ</h3>
            <div className="space-y-2 mb-4 flex-grow">
              <div className="flex justify-between text-sm"><span className="text-gray-600">総登録者数:</span> <span className="font-bold text-lg text-gray-600">{stats.totalUsers} 人</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">今月の新規登録:</span> <span className="font-bold text-lg text-gray-600">{stats.newUsersThisMonth} 人</span></div>
            </div>
            <Link href="/users" className="text-sm font-medium text-blue-600 hover:text-blue-800 self-end mt-2">名簿全体を見る →</Link>
          </div>

          {/* 相談記録カード */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">相談記録</h3>
            <div className="space-y-2 mb-4 flex-grow">
              <div className="flex justify-between text-sm"><span className="text-gray-600">今月の相談件数:</span> <span className="font-bold text-lg text-gray-600">{stats.consultationsThisMonth} 件</span></div>
            </div>
            <Link href="/consultations" className="text-sm font-medium text-blue-600 hover:text-blue-800 self-end mt-2">履歴を詳しく見る →</Link>
          </div>

          {/* 支援計画カード */}
          <div className="bg-white rounded-lg shadow p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">支援計画</h3>
            <div className="space-y-2 mb-4 flex-grow">
              <div className="flex justify-between text-sm"><span className="text-gray-600">今月の作成計画数:</span> <span className="font-bold text-lg text-gray-600">{stats.supportPlansThisMonth} 件</span></div>
            </div>
            <Link href="/support-plans" className="text-sm font-medium text-blue-600 hover:text-blue-800 self-end mt-2">計画一覧へ →</Link>
          </div>

        </div>
      </div>
      
      {/* --- お知らせ & 開発情報 --- */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">お知らせ & 開発情報</h2>
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
              <button onClick={() => setActiveTab('notifications')} className={`${activeTab === 'notifications' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                お知らせ
              </button>
              <button onClick={() => setActiveTab('future')} className={`${activeTab === 'future' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
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
                  <h3 className="text-md font-semibold text-gray-800 mb-2">より良いシステムを目指して</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    このシステムは、スタッフの皆様の声を反映して、これからも成長していきます。<br />
                    現在、より業務を効率化するための新しい機能（例：統計レポート機能の強化、カレンダー連携によるスケジュール管理など）を計画中です。<br />
                    具体的な内容が決まり次第、こちらで詳細をご案内します。「こんな機能があったら便利」といったご意見もお待ちしております。
                  </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}