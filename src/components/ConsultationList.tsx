'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { consultationsApi, usersApi } from '@/lib/api'
import { generateNewUID } from '@/utils/uid'
import { Database } from '@/types/database'
import { calculateAge } from '@/utils/date'

// 型エイリアス
type Consultation = Database['public']['Tables']['consultations']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']

const ConsultationList: React.FC = () => {
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = !searchTerm ||
      consultation.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.consultation_content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (consultation.next_appointment_details && consultation.next_appointment_details.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesDate = !dateFilter ||
      (consultation.consultation_date && consultation.consultation_date.startsWith(dateFilter))

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

  const handleRegisterAsUser = async (consultation: Consultation) => {
    if (!confirm(`「${consultation.name || '匿名'}」さんを利用者として登録しますか？`)) {
        return;
    }

    try {
      const newUID = await generateNewUID()

      const userData: UserInsert = {
        uid: newUID,
        name: consultation.name || '匿名利用者',
        birth_date: consultation.birth_year && consultation.birth_month && consultation.birth_day
          ? `${consultation.birth_year}-${String(consultation.birth_month).padStart(2, '0')}-${String(consultation.birth_day).padStart(2, '0')}`
          : undefined,
        gender: consultation.gender,
        property_address: consultation.address,
        resident_contact: consultation.phone_mobile || consultation.phone_home,
        line_available: false,
        proxy_payment_eligible: consultation.proxy_payment,
        welfare_recipient: consultation.welfare_recipient,
        posthumous_affairs: false,
      }

      const newUser = await usersApi.create(userData)
      await consultationsApi.update(consultation.id, { user_id: newUser.id })
      
      setConsultations(prev => 
        prev.map(c => c.id === consultation.id ? { ...c, user_id: newUser.id } : c)
      );

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
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              キーワード検索
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="氏名、相談内容などで検索"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              相談日で絞り込み
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

      {filteredConsultations.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            {searchTerm || dateFilter || attributeFilter ?
              '該当する相談履歴が見つかりません' :
              '相談履歴はありません'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || dateFilter || attributeFilter ?
              '検索条件を変更してください。' :
              '新しい相談を登録してください。'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
          {filteredConsultations.map((consultation) => {
            let age = null;
            if (consultation.birth_year && consultation.birth_month && consultation.birth_day) {
                try {
                    const birthDateStr = `${consultation.birth_year}-${String(consultation.birth_month).padStart(2, '0')}-${String(consultation.birth_day).padStart(2, '0')}`;
                    if (!isNaN(new Date(birthDateStr).getTime())) {
                        age = calculateAge(birthDateStr);
                    }
                } catch {
                    // Do nothing on error
                }
            }
            return (
              <div key={consultation.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-x-3">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        {consultation.name || '匿名'}
                      </p>
                      {consultation.user_id && (
                        <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          利用者登録済み
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                      <p>相談日: {formatDate(consultation.consultation_date)}</p>
                      <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current"><circle cx={1} cy={1} r={1} /></svg>
                      {age !== null && <p>年齢: {age}歳</p>}
                    </div>
                    {consultation.consultation_content && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {consultation.consultation_content}
                        </p>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Link
                      href={`/consultations/${consultation.id}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      <svg className="-ml-0.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                        <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.18l.88-1.84a1.65 1.65 0 011.695-1.075l1.62.29a1.65 1.65 0 011.444 1.443l.29 1.621a1.65 1.65 0 01-1.075 1.695l-1.84.879a1.65 1.65 0 01-1.18 0l-1.839-.88a1.65 1.65 0 01-1.075-1.695l.29-1.621a1.65 1.65 0 011.444-1.443l1.62.29a1.65 1.65 0 011.695 1.075l.88 1.84a1.65 1.65 0 010 1.18l-.88 1.84a1.65 1.65 0 01-1.695 1.075l-1.62-.29a1.65 1.65 0 01-1.444-1.443l-.29-1.621a1.65 1.65 0 011.075-1.695l1.839-.88zM10 15a5 5 0 100-10 5 5 0 000 10z" clipRule="evenodd" />
                      </svg>
                      詳細
                    </Link>
                    {!consultation.user_id && (
                      <button
                        onClick={() => handleRegisterAsUser(consultation)}
                        type="button"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-x-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                      >
                         <svg className="-ml-0.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M11 5a3 3 0 11-6 0 3 3 0 016 0zM2.047 14.5a.75.75 0 001.06 1.061l4.94-4.939a.75.75 0 00-1.06-1.06l-4.94 4.938zM17.953 14.5a.75.75 0 01-1.06 1.061l-4.94-4.939a.75.75 0 111.06-1.06l4.94 4.938z" />
                         </svg>
                        利用者登録
                      </button>
                    )}
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

export default ConsultationList