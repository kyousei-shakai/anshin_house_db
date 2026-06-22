// src/components/SupportPlanList.tsx 
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Database } from '@/types/database'
import { calculateAge } from '@/utils/date'
import { Calendar, UserIcon, Target } from 'lucide-react'

// 型定義：既存の定義を完全維持
type SupportPlanWithUserAndStaff = Database['public']['Tables']['support_plans']['Row'] & {
  users: {
    uid: string
  } | null
  staff: {
    name: string | null
  } | null
}

interface SupportPlanListProps {
  initialSupportPlans: SupportPlanWithUserAndStaff[]
  fetchError: string | null
}

const SupportPlanList: React.FC<SupportPlanListProps> = ({ initialSupportPlans, fetchError }) => {
  // ロジック：定数代入、ステート管理、フィルタリングを完全維持
  const supportPlans = initialSupportPlans
  const error = fetchError
  
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const filteredSupportPlans = supportPlans.filter(plan => {
    const matchesSearch = !searchTerm || 
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.staff?.name && plan.staff.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      plan.goals?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDate = !dateFilter || 
      plan.creation_date.startsWith(dateFilter)

    return matchesSearch && matchesDate
  })

  // エラーハンドリング：既存ロジックを完全維持
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-500 text-sm">
          エラーが発生しました: {error}
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* 
        検索・フィルタセクション：
        指示通り、幅をリストと統一 (-mx-4 sm:mx-0) し、スマホ時は上下線のみに。
      */}
      <div className="bg-gray-50 -mx-4 sm:mx-0 border-y sm:border border-gray-200 sm:rounded-lg p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              キーワード検索
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="利用者名、担当者名、目標で検索..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-800 shadow-sm font-normal"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              作成日で絞り込み
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-800 shadow-sm font-normal"
            />
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-600">
            結果: <span className="text-gray-900">{filteredSupportPlans.length}</span> / {supportPlans.length} 件
          </div>
          <button
            onClick={() => {
              setSearchTerm('')
              setDateFilter('')
            }}
            className="text-sm font-semibold text-purple-600 hover:text-purple-800 p-1 transition-colors"
          >
            条件をリセット
          </button>
        </div>
      </div>

      {/* リスト表示セクション */}
      {filteredSupportPlans.length === 0 ? (
        <div className="bg-white border-y sm:border border-gray-200 sm:rounded-lg p-12 text-center shadow-sm -mx-4 sm:mx-0">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900">
             {searchTerm || dateFilter ? '該当する計画がありません' : '支援計画が登録されていません'}
          </h3>
          <p className="mt-2 text-sm text-gray-500">条件を変えて検索するか、新規作成してください。</p>
        </div>
      ) : (
        <div className="bg-white border-y sm:border border-gray-200 sm:rounded-lg shadow-sm -mx-4 sm:mx-0 overflow-hidden divide-y divide-gray-100">
          {filteredSupportPlans.map((plan) => {
            let age = null;
            try {
                if (plan.birth_date) {
                    age = calculateAge(plan.birth_date);
                }
            } catch {
                // 年齢計算エラー時のハンドリングを維持
            }
            
            return (
              <Link 
                key={plan.id} 
                href={`/support-plans/${plan.id}`}
                /* 
                  指示通り、余白を標準の px-4 に最適化。
                  PC(sm)ではゆとりを持たせた px-6 を維持。
                  右端のアイコンを削除したため、flex-1 min-w-0 を直下で展開。
                */
                className="block px-4 py-4 sm:px-6 sm:py-6 hover:bg-gray-50 active:bg-gray-100 transition-all duration-150 group"
              >
                <div className="min-w-0">
                  {/* 利用者名と年齢：既存の表示ロジックを完全維持 */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-baseline gap-x-2">
                      <span className="text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors truncate">
                        {plan.name}
                      </span>
                      {age !== null && (
                        <span className="text-sm font-normal text-gray-500">
                          ({age}歳)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* メタ情報：既存の作成日・担当者表示を維持 */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                    <div className="flex items-center gap-x-1.5">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>作成: {formatDate(plan.creation_date)}</span>
                    </div>
                    <div className="flex items-center gap-x-1.5 border-l border-gray-200 pl-4 sm:border-none sm:pl-0">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <span>担当: {plan.staff?.name || '未設定'}</span>
                    </div>
                  </div>

                  {/* 目標：既存の line-clamp 等の表示ロジックを完全維持 */}
                  {plan.goals && (
                    <div className="mt-3 flex items-start gap-x-2 bg-gray-50/50 p-2 rounded-md sm:bg-transparent sm:p-0">
                      <Target className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0 hidden sm:block" />
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        <span className="font-semibold text-gray-700 sm:sr-only">目標: </span>
                        {plan.goals}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SupportPlanList