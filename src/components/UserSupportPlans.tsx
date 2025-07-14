'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supportPlansApi } from '@/lib/api'
import { SupportPlan } from '@/types/database'

interface UserSupportPlansProps {
  userId: string
}

const UserSupportPlans: React.FC<UserSupportPlansProps> = ({ userId }) => {
  const [supportPlans, setSupportPlans] = useState<SupportPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSupportPlans = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await supportPlansApi.getByUserId(userId)
        setSupportPlans(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchSupportPlans()
  }, [userId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          支援計画 ({supportPlans.length}件)
        </h2>
        <a
          href="/support-plans/new"
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-sm md:text-base"
        >
          新規計画作成
        </a>
      </div>

      {supportPlans.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-500 text-lg mb-2">支援計画はありません</div>
          <p className="text-gray-400">
            この利用者の支援計画はまだ作成されていません。
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {supportPlans.map((plan, index) => (
            <div key={plan.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg font-semibold text-gray-900">
                      {formatDate(plan.creation_date)}
                    </span>
                    {index === 0 && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        最新
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    担当スタッフ: {plan.staff_name}
                  </div>
                  
                  {plan.goals && (
                    <div className="text-sm text-gray-600 mb-2">
                      目標: {plan.goals.length > 100 ? `${plan.goals.substring(0, 100)}...` : plan.goals}
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
              
              {/* 基本情報 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">居住・連絡先</h4>
                  <div className="text-sm text-gray-700">
                    {plan.residence && <div>居住場所: {plan.residence}</div>}
                    {plan.contact_info?.mobile_phone && (
                      <div>携帯電話: {plan.contact_info.mobile_phone}</div>
                    )}
                    {plan.contact_info?.line && (
                      <div>LINE: 利用あり</div>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">生活保護・介護保険</h4>
                  <div className="text-sm text-gray-700">
                    <div>生活保護: {plan.welfare_recipient ? 'あり' : 'なし'}</div>
                    {plan.welfare_worker && <div>担当CW: {plan.welfare_worker}</div>}
                    {plan.care_insurance_level && plan.care_insurance_level.length > 0 && (
                      <div>介護保険: {plan.care_insurance_level.join(', ')}</div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 支援内容 */}
              {plan.needs_and_responses && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">支援内容</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {plan.needs_and_responses.financial?.issue && (
                      <div>
                        <span className="font-medium text-gray-700">金銭:</span>
                        <span className="text-gray-600 ml-1">
                          {plan.needs_and_responses.financial.issue.length > 50 
                            ? `${plan.needs_and_responses.financial.issue.substring(0, 50)}...` 
                            : plan.needs_and_responses.financial.issue}
                        </span>
                      </div>
                    )}
                    {plan.needs_and_responses.physical?.issue && (
                      <div>
                        <span className="font-medium text-gray-700">身体状況:</span>
                        <span className="text-gray-600 ml-1">
                          {plan.needs_and_responses.physical.issue.length > 50 
                            ? `${plan.needs_and_responses.physical.issue.substring(0, 50)}...` 
                            : plan.needs_and_responses.physical.issue}
                        </span>
                      </div>
                    )}
                    {plan.needs_and_responses.mental?.issue && (
                      <div>
                        <span className="font-medium text-gray-700">精神状況:</span>
                        <span className="text-gray-600 ml-1">
                          {plan.needs_and_responses.mental.issue.length > 50 
                            ? `${plan.needs_and_responses.mental.issue.substring(0, 50)}...` 
                            : plan.needs_and_responses.mental.issue}
                        </span>
                      </div>
                    )}
                    {plan.needs_and_responses.living?.issue && (
                      <div>
                        <span className="font-medium text-gray-700">生活状況:</span>
                        <span className="text-gray-600 ml-1">
                          {plan.needs_and_responses.living.issue.length > 50 
                            ? `${plan.needs_and_responses.living.issue.substring(0, 50)}...` 
                            : plan.needs_and_responses.living.issue}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-4 text-xs text-gray-500">
                作成日: {formatDate(plan.created_at)} | 更新日: {formatDate(plan.updated_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserSupportPlans