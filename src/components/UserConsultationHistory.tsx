'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { consultationsApi } from '@/lib/api'
// 👇 1. インポートを 'Database' 型に変更
import { Database } from '@/types/database'

// 👇 2. 新しい型定義から型エイリアスを作成
type Consultation = Database['public']['Tables']['consultations']['Row']

interface UserConsultationHistoryProps {
  userId: string
}

const UserConsultationHistory: React.FC<UserConsultationHistoryProps> = ({ userId }) => {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await consultationsApi.getByUserId(userId)
        setConsultations(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchConsultations()
  }, [userId])

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
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
        <div className="text-red-500 text-sm">エラーが発生しました: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">相談履歴 ({consultations.length}件)</h2>
        <Link
          href="/consultations/new"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-sm md:text-base"
        >
          新規相談登録
        </Link>
      </div>

      {consultations.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-500 text-lg mb-2">相談履歴はありません</div>
          <p className="text-gray-400">この利用者の相談履歴はまだ登録されていません。</p>
        </div>
      ) : (
        <div className="space-y-4">
          {consultations.map((consultation) => {
            // 👇 3. 新しいフラットなデータ構造から表示用の配列を生成
            const consultationRoutes = [
              consultation.consultation_route_self && '本人',
              consultation.consultation_route_family && '家族',
              consultation.consultation_route_care_manager && 'ケアマネ',
              consultation.consultation_route_elderly_center && '支援センター（高齢者）',
              consultation.consultation_route_disability_center && '支援センター（障害者）',
              consultation.consultation_route_government && '行政機関',
              consultation.consultation_route_other && 'その他',
            ].filter(Boolean) as string[]

            const attributes = [
              consultation.attribute_elderly && '高齢',
              consultation.attribute_disability && '障がい',
              consultation.attribute_childcare && '子育て',
              consultation.attribute_single_parent && 'ひとり親',
              consultation.attribute_dv && 'DV',
              consultation.attribute_foreigner && '外国人',
              consultation.attribute_poverty && '生活困窮',
              consultation.attribute_low_income && '低所得者',
              consultation.attribute_lgbt && 'LGBT',
              consultation.attribute_welfare && '生保',
            ].filter(Boolean) as string[]

            return (
              <div key={consultation.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg font-semibold text-gray-900">{formatDate(consultation.consultation_date)}</span>
                      <span className="text-sm text-gray-500">ID: {consultation.id.slice(0, 8)}...</span>
                    </div>
                    
                    {consultationRoutes.length > 0 && (
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-600">相談ルート:</span>
                        <div className="flex flex-wrap gap-1">
                          {consultationRoutes.map((route, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{route}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {attributes.length > 0 && (
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-600">属性:</span>
                        <div className="flex flex-wrap gap-1">
                          {attributes.map((attr, index) => (
                            <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{attr}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Link 
                    href={`/consultations/${consultation.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    詳細を見る
                  </Link>
                </div>
                
                {consultation.consultation_content && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">相談内容</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {consultation.consultation_content.length > 200 
                        ? `${consultation.consultation_content.substring(0, 200)}...` 
                        : consultation.consultation_content}
                    </p>
                  </div>
                )}
                
                {consultation.consultation_result && (
                  <div className="mt-4 bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">相談結果</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {consultation.consultation_result.length > 200 
                        ? `${consultation.consultation_result.substring(0, 200)}...` 
                        : consultation.consultation_result}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default UserConsultationHistory