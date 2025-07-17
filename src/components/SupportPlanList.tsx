// src/components/SupportPlanList.tsx

'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supportPlansApi } from '@/lib/api'
import { Database } from '@/types/database'

// 型エイリアス
type SupportPlan = Database['public']['Tables']['support_plans']['Row']

const SupportPlanList: React.FC = () => {
  const [supportPlans, setSupportPlans] = useState<SupportPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    const fetchSupportPlans = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await supportPlansApi.getAll()
        setSupportPlans(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchSupportPlans()
  }, [])

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const filteredSupportPlans = supportPlans.filter(plan => {
    const matchesSearch = !searchTerm || 
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.goals?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDate = !dateFilter || 
      plan.creation_date.startsWith(dateFilter)

    return matchesSearch && matchesDate
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

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
      {/* 検索・フィルタリング */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              キーワード検索
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="利用者名、担当者名、目標で検索..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              作成日で絞り込み
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
            />
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {filteredSupportPlans.length} / {supportPlans.length} 件表示
          </div>
          <button
            onClick={() => {
              setSearchTerm('')
              setDateFilter('')
            }}
            className="text-sm text-purple-600 hover:text-purple-800"
          >
            フィルタをクリア
          </button>
        </div>
      </div>

      {/* 支援計画一覧 */}
      {filteredSupportPlans.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
           <h3 className="mt-2 text-sm font-semibold text-gray-900">
             {searchTerm || dateFilter ? 
               '該当する支援計画が見つかりません' : 
               '支援計画はありません'}
           </h3>
           <p className="mt-1 text-sm text-gray-500">
             {searchTerm || dateFilter ? 
               '検索条件を変更してください。' : 
               '新しい支援計画を作成してください。'}
           </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
          {filteredSupportPlans.map((plan) => {
            // ★★★ エラー修正箇所 ★★★
            // 不要になった careInsuranceLevels の定義を削除。
            // lifeSupportServices も新しいレイアウトでは使わないため削除。
            return (
              <div key={plan.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  {/* 左側：主要情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-x-3">
                      <p className="text-base font-semibold leading-6 text-gray-900">
                        {plan.name}
                        {plan.age != null && <span className="ml-2 text-sm font-normal text-gray-500">({plan.age}歳)</span>}
                      </p>
                    </div>
                    <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-xs leading-5 text-gray-500">
                      <p className="flex items-center gap-x-1.5">
                        <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.5 6.75A1.25 1.25 0 015.75 8h8.5a1.25 1.25 0 011.25 1.25v5.5a1.25 1.25 0 01-1.25 1.25h-8.5a1.25 1.25 0 01-1.25-1.25v-5.5z" clipRule="evenodd" />
                        </svg>
                        作成日: {formatDate(plan.creation_date)}
                      </p>
                      <p className="flex items-center gap-x-1.5">
                        <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
                        </svg>
                        担当: {plan.staff_name}
                      </p>
                    </div>
                     {plan.goals && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          <span className="font-medium text-gray-700">目標: </span>{plan.goals}
                      </p>
                    )}
                  </div>
                   {/* 右側：アクションボタン */}
                   <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Link
                      href={`/support-plans/${plan.id}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      <svg className="-ml-0.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.18l.88-1.84a1.65 1.65 0 011.695-1.075l1.62.29a1.65 1.65 0 011.444 1.443l.29 1.621a1.65 1.65 0 01-1.075 1.695l-1.84.879a1.65 1.65 0 01-1.18 0l-1.839-.88a1.65 1.65 0 01-1.075-1.695l.29-1.621a1.65 1.65 0 011.444-1.443l1.62.29a1.65 1.65 0 011.695 1.075l.88 1.84a1.65 1.65 0 010 1.18l-.88 1.84a1.65 1.65 0 01-1.695 1.075l-1.62-.29a1.65 1.65 0 01-1.444-1.443l-.29-1.621a1.65 1.65 0 011.075-1.695l1.839-.88zM10 15a5 5 0 100-10 5 5 0 000 10z" clipRule="evenodd" />
                      </svg>
                      詳細
                    </Link>
                    <Link
                        href={`/support-plans/${plan.id}/edit`}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-x-2 rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
                    >
                        <svg className="-ml-0.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                        </svg>
                        編集
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SupportPlanList