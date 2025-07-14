'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { consultationsApi, usersApi } from '@/lib/api'
import { generateNewUID } from '@/utils/uid'
import { Consultation } from '@/types/database'

interface ConsultationDetailProps {
  consultationId: string
}

const ConsultationDetail: React.FC<ConsultationDetailProps> = ({ consultationId }) => {
  const router = useRouter()
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConsultation = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await consultationsApi.getById(consultationId)
        setConsultation(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchConsultation()
  }, [consultationId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const handleRegisterAsUser = async () => {
    if (!consultation) return

    try {
      const newUID = await generateNewUID()
      
      // 新仕様に基づく利用者データの構築
      const userData = {
        uid: newUID,
        name: consultation.name || '匿名利用者',
        birth_date: consultation.birth_year && consultation.birth_month && consultation.birth_day 
          ? `${consultation.birth_year}-${String(consultation.birth_month).padStart(2, '0')}-${String(consultation.birth_day).padStart(2, '0')}`
          : undefined,
        gender: consultation.gender || undefined,
        age: consultation.age || undefined,
        property_address: consultation.address || undefined,
        resident_contact: consultation.phone_mobile || consultation.phone_home || undefined,
        line_available: false,
        proxy_payment_eligible: consultation.proxy_payment || false,
        welfare_recipient: consultation.welfare_recipient || false,
        posthumous_affairs: false
      }
      
      const newUser = await usersApi.create(userData)
      
      // 相談に利用者IDを関連付け
      await consultationsApi.update(consultationId, { user_id: newUser.id })
      
      // ページをリロードして最新データを表示
      window.location.reload()
    } catch (err) {
      console.error('利用者登録エラー:', err)
      alert('利用者登録に失敗しました')
    }
  }

  const getGenderLabel = (gender: string | null) => {
    if (!gender) return '未設定'
    switch (gender) {
      case 'male': return '男'
      case 'female': return '女'
      case 'other': return 'その他'
      default: return gender
    }
  }

  const getPhysicalConditionLabel = (condition: string | null) => {
    if (!condition) return '未設定'
    switch (condition) {
      case 'independent': return '自立'
      case 'support1': return '要支援１'
      case 'support2': return '要支援２'
      case 'care1': return '要介護１'
      case 'care2': return '要介護２'
      case 'care3': return '要介護３'
      case 'care4': return '要介護４'
      case 'care5': return '要介護５'
      default: return condition
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

  if (!consultation) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="text-yellow-700 text-sm">
          相談が見つかりません
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              相談詳細 - {formatDate(consultation.consultation_date)}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              ID: {consultation.id}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push(`/consultations/${consultation.id}/edit`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              編集
            </button>
            {!consultation.user_id && (
              <button 
                onClick={handleRegisterAsUser}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                利用者として登録
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* 1. 基本情報 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">1. 基本情報</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">相談日</label>
              <div className="text-gray-800">{formatDate(consultation.consultation_date)}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">お名前</label>
              <div className="text-gray-800">{consultation.name ? `${consultation.name}様` : '匿名'}</div>
            </div>
            
            {consultation.furigana && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">フリガナ</label>
                <div className="text-gray-800">{consultation.furigana}</div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
              <div className="text-gray-800">{getGenderLabel(consultation.gender)}</div>
            </div>
            
            {(consultation.birth_year || consultation.birth_month || consultation.birth_day) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">生年月日</label>
                <div className="text-gray-800">
                  {consultation.birth_year && `${consultation.birth_year}年`}
                  {consultation.birth_month && `${consultation.birth_month}月`}
                  {consultation.birth_day && `${consultation.birth_day}日`}
                  {consultation.age && ` (満${consultation.age}歳)`}
                </div>
              </div>
            )}
            
            {consultation.address && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
                <div className="text-gray-800">
                  {consultation.postal_code && `〒${consultation.postal_code} `}
                  {consultation.address}
                </div>
              </div>
            )}
            
            {(consultation.phone_home || consultation.phone_mobile) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">連絡先</label>
                <div className="text-gray-800">
                  {consultation.phone_home && <div>自宅: {consultation.phone_home}</div>}
                  {consultation.phone_mobile && <div>携帯: {consultation.phone_mobile}</div>}
                </div>
              </div>
            )}
          </div>
          
          {/* 相談ルート */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">相談ルート</label>
            <div className="flex flex-wrap gap-2">
              {consultation.consultation_route_self && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">本人</span>}
              {consultation.consultation_route_family && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">家族</span>}
              {consultation.consultation_route_care_manager && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">ケアマネ</span>}
              {consultation.consultation_route_elderly_center && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">支援センター（高齢者）</span>}
              {consultation.consultation_route_disability_center && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">支援センター（障害者）</span>}
              {consultation.consultation_route_government && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">行政機関{consultation.consultation_route_government_other && `: ${consultation.consultation_route_government_other}`}</span>}
              {consultation.consultation_route_other && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">その他{consultation.consultation_route_other_text && `: ${consultation.consultation_route_other_text}`}</span>}
            </div>
          </div>
          
          {/* 属性 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">属性</label>
            <div className="flex flex-wrap gap-2">
              {consultation.attribute_elderly && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">高齢</span>}
              {consultation.attribute_disability && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  障がい
                  {(consultation.attribute_disability_mental || consultation.attribute_disability_physical || consultation.attribute_disability_intellectual) && (
                    <span className="ml-1">
                      ({[
                        consultation.attribute_disability_mental && '精神',
                        consultation.attribute_disability_physical && '身体',
                        consultation.attribute_disability_intellectual && '知的'
                      ].filter(Boolean).join('・')})
                    </span>
                  )}
                </span>
              )}
              {consultation.attribute_childcare && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">子育て</span>}
              {consultation.attribute_single_parent && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">ひとり親</span>}
              {consultation.attribute_dv && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">DV</span>}
              {consultation.attribute_foreigner && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">外国人</span>}
              {consultation.attribute_poverty && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">生活困窮</span>}
              {consultation.attribute_low_income && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">低所得者</span>}
              {consultation.attribute_lgbt && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">LGBT</span>}
              {consultation.attribute_welfare && <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">生保</span>}
            </div>
          </div>
          
          {/* 世帯構成 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">世帯構成</label>
            <div className="flex flex-wrap gap-2">
              {consultation.household_single && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">独居</span>}
              {consultation.household_couple && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">夫婦</span>}
              {consultation.household_common_law && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">内縁夫婦</span>}
              {consultation.household_parent_child && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">親子</span>}
              {consultation.household_siblings && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">兄弟姉妹</span>}
              {consultation.household_acquaintance && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">知人</span>}
              {consultation.household_other && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">その他{consultation.household_other_text && `: ${consultation.household_other_text}`}</span>}
            </div>
          </div>
        </div>

        {/* 2. 身体状況・利用サービス */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">2. 身体状況・利用サービス</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {consultation.physical_condition && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">身体状況</label>
                <div className="text-gray-800">{getPhysicalConditionLabel(consultation.physical_condition)}</div>
              </div>
            )}
            
            {consultation.medical_history && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">既往症及び病歴</label>
                <div className="text-gray-800">{consultation.medical_history}</div>
              </div>
            )}
          </div>
          
          {/* 手帳 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">手帳</label>
            <div className="space-y-1">
              {consultation.mental_disability_certificate && (
                <div className="text-gray-800">
                  精神障害者保健福祉手帳
                  {consultation.mental_disability_level && ` (${consultation.mental_disability_level})`}
                </div>
              )}
              {consultation.physical_disability_certificate && (
                <div className="text-gray-800">
                  身体障害者手帳
                  {consultation.physical_disability_level && ` (${consultation.physical_disability_level})`}
                </div>
              )}
              {consultation.therapy_certificate && (
                <div className="text-gray-800">
                  療育手帳
                  {consultation.therapy_level && ` (${consultation.therapy_level})`}
                </div>
              )}
            </div>
          </div>
          
          {/* 利用中のサービス */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">利用中の支援サービス</label>
            <div className="flex flex-wrap gap-2">
              {consultation.service_day_service && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">デイサービス</span>}
              {consultation.service_visiting_nurse && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">訪問看護</span>}
              {consultation.service_visiting_care && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">訪問介護</span>}
              {consultation.service_home_medical && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">在宅診療</span>}
              {consultation.service_short_stay && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">短期入所施設</span>}
              {consultation.service_other && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">その他{consultation.service_other_text && `: ${consultation.service_other_text}`}</span>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {consultation.service_provider && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">サービス提供事業所</label>
                <div className="text-gray-800">{consultation.service_provider}</div>
              </div>
            )}
            
            {consultation.care_support_office && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">居宅介護支援事業所</label>
                <div className="text-gray-800">{consultation.care_support_office}</div>
              </div>
            )}
            
            {consultation.care_manager && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">担当</label>
                <div className="text-gray-800">{consultation.care_manager}</div>
              </div>
            )}
          </div>
        </div>

        {/* 3. 医療・収入 */}
        {(consultation.medical_institution_name || consultation.income_salary || consultation.welfare_recipient) && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">3. 医療・収入</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {consultation.medical_institution_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">かかりつけ医療機関</label>
                  <div className="text-gray-800">
                    {consultation.medical_institution_name}
                    {consultation.medical_institution_staff && ` (担当: ${consultation.medical_institution_staff})`}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">収入</label>
                <div className="space-y-1 text-gray-800">
                  {consultation.income_salary && <div>給与: {consultation.income_salary.toLocaleString()}円</div>}
                  {consultation.income_injury_allowance && <div>傷病手当: {consultation.income_injury_allowance.toLocaleString()}円</div>}
                  {consultation.income_pension && <div>年金振込額: {consultation.income_pension.toLocaleString()}円</div>}
                  {consultation.welfare_recipient && (
                    <div>
                      生活保護受給
                      {consultation.welfare_staff && ` (担当: ${consultation.welfare_staff})`}
                    </div>
                  )}
                  {consultation.savings && <div>預金: {consultation.savings.toLocaleString()}円</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. ADL/IADL */}
        {(consultation.dementia || consultation.hospital_support_required !== undefined || consultation.other_notes) && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">4. ADL/IADL</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {consultation.dementia && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">認知症</label>
                  <div className="text-gray-800">
                    {consultation.dementia}
                    {consultation.dementia_hospital && ` (病院: ${consultation.dementia_hospital})`}
                  </div>
                </div>
              )}
              
              {consultation.hospital_support_required !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">通院支援</label>
                  <div className="text-gray-800">{consultation.hospital_support_required ? '要' : '不要'}</div>
                </div>
              )}
              
              {consultation.medication_management_needed !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">内服管理の必要性</label>
                  <div className="text-gray-800">{consultation.medication_management_needed ? '有' : '無'}</div>
                </div>
              )}
            </div>
            
            {consultation.other_notes && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">その他特記事項</label>
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {consultation.other_notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. 相談内容等 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">5. 相談内容等</h2>
          
          {consultation.consultation_content && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">相談内容（困りごと、何が大変でどうしたいか、等）</label>
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {consultation.consultation_content}
                </p>
              </div>
            </div>
          )}
          
          {consultation.relocation_reason && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">転居理由</label>
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {consultation.relocation_reason}
                </p>
              </div>
            </div>
          )}
          
          {/* 緊急連絡先 */}
          {(consultation.emergency_contact_name || consultation.emergency_contact_relationship) && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">緊急連絡先</label>
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {consultation.emergency_contact_name && (
                    <div>
                      <span className="font-medium">氏名:</span> {consultation.emergency_contact_name}
                      {consultation.emergency_contact_relationship && ` (${consultation.emergency_contact_relationship})`}
                    </div>
                  )}
                  
                  {(consultation.emergency_contact_postal_code || consultation.emergency_contact_address) && (
                    <div>
                      <span className="font-medium">住所:</span> 
                      {consultation.emergency_contact_postal_code && `〒${consultation.emergency_contact_postal_code} `}
                      {consultation.emergency_contact_address}
                    </div>
                  )}
                  
                  {(consultation.emergency_contact_phone_home || consultation.emergency_contact_phone_mobile) && (
                    <div>
                      <span className="font-medium">連絡先:</span>
                      {consultation.emergency_contact_phone_home && ` 自宅: ${consultation.emergency_contact_phone_home}`}
                      {consultation.emergency_contact_phone_mobile && ` 携帯: ${consultation.emergency_contact_phone_mobile}`}
                    </div>
                  )}
                  
                  {consultation.emergency_contact_email && (
                    <div>
                      <span className="font-medium">Email:</span> {consultation.emergency_contact_email}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {consultation.consultation_result && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">相談結果</label>
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {consultation.consultation_result}
                </p>
              </div>
            </div>
          )}
          
          {consultation.next_appointment_scheduled !== undefined && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">次回予定</label>
              <div className="text-gray-800">
                {consultation.next_appointment_scheduled ? (
                  <div>
                    あり
                    {consultation.next_appointment_details && (
                      <div className="mt-1 text-sm text-gray-600">
                        詳細: {consultation.next_appointment_details}
                      </div>
                    )}
                  </div>
                ) : (
                  'なし'
                )}
              </div>
            </div>
          )}
        </div>

        {/* システム情報 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">システム情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">作成日時</label>
              <div className="text-gray-800">{formatDate(consultation.created_at)}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最終更新日時</label>
              <div className="text-gray-800">{formatDate(consultation.updated_at)}</div>
            </div>
            
            {consultation.user_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">利用者ID</label>
                <div className="text-gray-800">{consultation.user_id}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConsultationDetail