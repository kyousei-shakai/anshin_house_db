'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { consultationsApi, usersApi } from '@/lib/api'
import { generateNewUID } from '@/utils/uid'
// 👇 1. インポートを 'Database' 型に変更
import { Database } from '@/types/database'

// 👇 2. 新しい型定義から型エイリアスを作成
type Consultation = Database['public']['Tables']['consultations']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']

const ConsultationList: React.FC = () => {
  // consultation stateの型は変更なし
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [attributeFilter, setAttributeFilter] = useState('')

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await consultationsApi.getAll()
        setConsultations(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchConsultations()
  }, [])

  const formatDate = (dateString: string) => {
    // 日付が null や undefined の場合も考慮
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  // 👇 3. フィルタリングロジックを新しいフラットなデータ構造に合わせて修正
  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = !searchTerm ||
      consultation.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.consultation_content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (consultation.next_appointment_details && consultation.next_appointment_details.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesDate = !dateFilter ||
      consultation.consultation_date.startsWith(dateFilter)

    const matchesAttribute = !attributeFilter || 
      (attributeFilter === 'elderly' && consultation.attribute_elderly) ||
      (attributeFilter === 'disability' && consultation.attribute_disability) ||
      (attributeFilter === 'childcare' && consultation.attribute_childcare) ||
      (attributeFilter === 'single_parent' && consultation.attribute_single_parent) ||
      (attributeFilter === 'dv' && consultation.attribute_dv) ||
      (attributeFilter === 'foreigner' && consultation.attribute_foreigner) ||
      (attributeFilter === 'poverty' && consultation.attribute_poverty) ||
      (attributeFilter === 'low_income' && consultation.attribute_low_income) ||
      (attributeFilter === 'lgbt' && consultation.attribute_lgbt) ||
      (attributeFilter === 'welfare' && consultation.attribute_welfare)

    return matchesSearch && matchesDate && matchesAttribute
  })

  // 👇 4. handleRegisterAsUser を新しいフラットなデータ構造に合わせて修正
  const handleRegisterAsUser = async (consultation: Consultation) => {
    try {
      const newUID = await generateNewUID()

      const userData: UserInsert = {
        uid: newUID,
        name: consultation.name || '匿名利用者',
        birth_date: consultation.birth_year && consultation.birth_month && consultation.birth_day
          ? `${consultation.birth_year}-${String(consultation.birth_month).padStart(2, '0')}-${String(consultation.birth_day).padStart(2, '0')}`
          : undefined,
        gender: consultation.gender,
        age: consultation.age,
        property_address: consultation.address,
        resident_contact: consultation.phone_mobile || consultation.phone_home,
        line_available: false,
        proxy_payment_eligible: consultation.proxy_payment,
        welfare_recipient: consultation.welfare_recipient,
        posthumous_affairs: false,
      }

      const newUser = await usersApi.create(userData)
      await consultationsApi.update(consultation.id, { user_id: newUser.id })
      const updatedConsultations = await consultationsApi.getAll()
      setConsultations(updatedConsultations)

      alert('利用者として登録しました')
    } catch (err) {
      console.error('利用者登録エラー:', err)
      if (err instanceof Error) {
        console.error('エラーメッセージ:', err.message)
        console.error('エラースタック:', err.stack)
      }
      alert('利用者登録に失敗しました')
    }
  }

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

  return (
    <div className="space-y-6">
      {/* 検索・フィルタリング */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              検索
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="氏名、相談内容、ID で検索..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              相談日
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              属性
            </label>
            {/* 👇 5. 属性フィルタのselectのvalueをDBのカラム名に合わせる */}
            <select
              value={attributeFilter}
              onChange={(e) => setAttributeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            >
              <option value="">全て</option>
              <option value="elderly">高齢</option>
              <option value="disability">障がい</option>
              <option value="childcare">子育て</option>
              <option value="single_parent">ひとり親</option>
              <option value="dv">DV</option>
              <option value="foreigner">外国人</option>
              <option value="poverty">生活困窮</option>
              <option value="low_income">低所得者</option>
              <option value="lgbt">LGBT</option>
              <option value="welfare">生保</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {filteredConsultations.length} / {consultations.length} 件表示
          </div>
          <button
            onClick={() => {
              setSearchTerm('')
              setDateFilter('')
              setAttributeFilter('')
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            フィルタをクリア
          </button>
        </div>
      </div>

      {/* 相談履歴一覧 */}
      {filteredConsultations.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="text-gray-500 text-lg mb-2">
            {searchTerm || dateFilter || attributeFilter ?
              '該当する相談履歴が見つかりません' :
              '相談履歴はありません'}
          </div>
          <p className="text-gray-400">
            {searchTerm || dateFilter || attributeFilter ?
              '検索条件を変更して再度お試しください。' :
              '新しい相談を登録してください。'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConsultations.map((consultation) => {
            // 👇 6. 表示用に boolean の配列から文字列の配列を生成
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
                      <span className="text-lg font-semibold text-gray-900">
                        {formatDate(consultation.consultation_date)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ID: {consultation.id.slice(0, 8)}...
                      </span>
                      {consultation.user_id && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          利用者登録済み
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 mb-2">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">相談者:</span>
                        <span className="text-gray-600 ml-1">
                          {consultation.name || '匿名'}
                        </span>
                      </div>
                      {consultation.age && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">年齢:</span>
                          <span className="text-gray-600 ml-1">{consultation.age}歳</span>
                        </div>
                      )}
                    </div>
                    
                    {/* 👇 7. JSX部分を新しいデータ構造に合わせて修正 */}
                    {consultationRoutes.length > 0 && (
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-600">相談ルート:</span>
                        <div className="flex flex-wrap gap-1">
                          {consultationRoutes.map((route, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {route}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {attributes.length > 0 && (
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-600">属性:</span>
                        <div className="flex flex-wrap gap-1">
                          {attributes.map((attr, index) => (
                            <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              {attr}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      href={`/consultations/${consultation.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      詳細を見る
                    </Link>
                    {!consultation.user_id && (
                      <button
                        onClick={() => handleRegisterAsUser(consultation)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        利用者登録
                      </button>
                    )}
                  </div>
                </div>

                {consultation.next_appointment_scheduled === true && consultation.next_appointment_details && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-4">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-yellow-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <h4 className="text-sm font-semibold text-yellow-900">
                        次回予定
                      </h4>
                    </div>
                    <p className="text-yellow-800 text-sm leading-relaxed mt-2 pl-7">
                      {consultation.next_appointment_details}
                    </p>
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-500">
                  作成日: {formatDate(consultation.created_at)}
                  {consultation.updated_at !== consultation.created_at && (
                    <span> | 更新日: {formatDate(consultation.updated_at)}</span>
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

export default ConsultationList