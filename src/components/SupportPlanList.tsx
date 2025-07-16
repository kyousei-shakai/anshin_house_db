'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supportPlansApi } from '@/lib/api'
// 👇 1. インポートを 'Database' 型に変更
import { Database } from '@/types/database'

// 👇 2. 新しい型定義から型エイリアスを作成
type SupportPlan = Database['public']['Tables']['support_plans']['Row']

const SupportPlanList: React.FC = () => {
  // 👇 3. useState の型指定は変更なしでOK
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

  // 👇 4. フィルタリングロジックを修正
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
  
  // 👇 5. JSX部分は変更なしでOK
  return (
    <div className="space-y-6">
      {/* 検索・フィルタリング */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              検索
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="利用者名、担当者名、目標で検索..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              作成日
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
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
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            フィルタをクリア
          </button>
        </div>
      </div>

      {/* 支援計画一覧 */}
      {filteredSupportPlans.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-500 text-lg mb-2">
            {searchTerm || dateFilter ? 
              '該当する支援計画が見つかりません' : 
              '支援計画はありません'}
          </div>
          <p className="text-gray-400">
            {searchTerm || dateFilter ? 
              '検索条件を変更して再度お試しください。' : 
              '新しい支援計画を作成してください。'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSupportPlans.map((plan) => {
            // 👇 6. 新しいフラットなデータ構造から表示用の配列を生成
            const careInsuranceLevels = [
              plan.care_level_independent && '自立',
              plan.care_level_support1 && '要支援1',
              plan.care_level_support2 && '要支援2',
              plan.care_level_care1 && '要介護1',
              plan.care_level_care2 && '要介護2',
              plan.care_level_care3 && '要介護3',
              plan.care_level_care4 && '要介護4',
              plan.care_level_care5 && '要介護5',
            ].filter(Boolean) as string[];

            const lifeSupportServices = [
              plan.support_shopping && '買い物',
              plan.support_bank_visit && '外出支援（金融機関）',
              plan.support_cleaning && '掃除・片付け',
              plan.support_bulb_change && '電球交換',
              plan.support_garbage_disposal && 'ゴミ捨て',
            ].filter(Boolean) as string[];
            
            return (
              <div key={plan.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                      <span className="text-sm text-gray-500">
                        ({plan.age}歳)
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">作成日:</span>
                        <span className="text-gray-600 ml-1">{formatDate(plan.creation_date)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">担当:</span>
                        <span className="text-gray-600 ml-1">{plan.staff_name}</span>
                      </div>
                    </div>
                    
                    {plan.residence && (
                      <div className="text-sm mb-2">
                        <span className="font-medium text-gray-700">居住場所:</span>
                        <span className="text-gray-600 ml-1">{plan.residence}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm text-gray-600">生活保護:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        plan.welfare_recipient 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.welfare_recipient ? 'あり' : 'なし'}
                      </span>
                    </div>
                    
                    {/* 👇 7. JSXを修正後の配列を使うように変更 */}
                    {careInsuranceLevels.length > 0 && (
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-600">介護保険:</span>
                        <div className="flex flex-wrap gap-1">
                          {careInsuranceLevels.map((level, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {level}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {lifeSupportServices.length > 0 && (
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-600">生活支援:</span>
                        <div className="flex flex-wrap gap-1">
                          {lifeSupportServices.map((service, index) => (
                            <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      href={`/support-plans/${plan.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      詳細を見る
                    </Link>
                    <Link
                      href={`/support-plans/${plan.id}/edit`}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                      編集
                    </Link>
                  </div>
                </div>
                
                {plan.goals && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">目標</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {plan.goals.length > 200 
                        ? `${plan.goals.substring(0, 200)}...` 
                        : plan.goals}
                    </p>
                  </div>
                )}
                
                <div className="mt-4 text-xs text-gray-500">
                  作成日: {formatDate(plan.created_at)}
                  {plan.updated_at !== plan.created_at && (
                    <span> | 更新日: {formatDate(plan.updated_at)}</span>
                  )}
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