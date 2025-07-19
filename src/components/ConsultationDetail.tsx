// src/components/ConsultationDetail.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link' // Linkコンポーネントをインポート
import { consultationsApi, usersApi } from '@/lib/api'
import { generateNewUID } from '@/utils/uid'
import { Database } from '@/types/database'

// 型エイリアス
type Consultation = Database['public']['Tables']['consultations']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']

interface ConsultationDetailProps {
  consultationId: string
}

const ConsultationDetail: React.FC<ConsultationDetailProps> = ({ consultationId }) => {
  const router = useRouter()
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false) // 削除処理中の状態を追加

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

  const handleDelete = async () => {
    if (!consultation) return;

    const isConfirmed = window.confirm(`本当にこの相談履歴を削除しますか？\n（相談日: ${formatDate(consultation.consultation_date)}, 相談者: ${consultation.name || '匿名'}）\nこの操作は元に戻せません。`)
    if (!isConfirmed) {
      return
    }

    setIsDeleting(true)
    try {
      await consultationsApi.delete(consultationId)
      alert('相談履歴を削除しました。')
      router.push('/consultations') // 相談履歴一覧ページにリダイレクト
      router.refresh()
    } catch (err) {
      console.error('相談履歴の削除エラー:', err)
      alert('相談履歴の削除に失敗しました。')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const handleRegisterAsUser = async () => {
    if (!consultation) return

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
      
      await consultationsApi.update(consultationId, { user_id: newUser.id })
      
      alert('利用者として登録しました。ページを更新します。');
      window.location.reload();
    } catch (err) {
      console.error('利用者登録エラー:', err)
      alert('利用者登録に失敗しました')
    }
  }

  const getGenderLabel = (gender: string | null | undefined): string => {
    if (!gender) return '未設定'
    switch (gender) {
      case 'male': return '男'
      case 'female': return '女'
      case 'other': return 'その他'
      default: return gender
    }
  }

  const getPhysicalConditionLabel = (condition: string | null | undefined): string => {
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              相談詳細 - {formatDate(consultation.consultation_date)}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              ID: {consultation.id}
            </p>
          </div>
          <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Link
              href={`/consultations/${consultation.id}/edit`}
              className="inline-flex items-center justify-center gap-x-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <svg className="-ml-0.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
              </svg>
              編集
            </Link>
            {!consultation.user_id && (
              <button 
                onClick={handleRegisterAsUser}
                className="inline-flex items-center justify-center gap-x-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                <svg className="-ml-0.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M11 5a3 3 0 11-6 0 3 3 0 016 0zM2.047 14.5a.75.75 0 001.06 1.061l4.94-4.939a.75.75 0 00-1.06-1.06l-4.94 4.938zM17.953 14.5a.75.75 0 01-1.06 1.061l-4.94-4.939a.75.75 0 111.06-1.06l4.94 4.938z" />
                </svg>
                利用者として登録
              </button>
            )}
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                type="button"
                className="inline-flex items-center justify-center gap-x-2 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
            >
                <svg className="-ml-0.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.576l.84-10.518.149.022a.75.75 0 10.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                </svg>
                {isDeleting ? '削除中...' : '削除'}
            </button>
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
                  {consultation.age != null && ` (満${consultation.age}歳)`}
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">既往症及び病歴</label>
                <div className="text-gray-800 whitespace-pre-wrap">{consultation.medical_history}</div>
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
                  {consultation.income_salary && <div>給与: {Number(consultation.income_salary).toLocaleString()}円</div>}
                  {consultation.income_injury_allowance && <div>傷病手当: {Number(consultation.income_injury_allowance).toLocaleString()}円</div>}
                  {consultation.income_pension && <div>年金振込額: {Number(consultation.income_pension).toLocaleString()}円</div>}
                  {consultation.welfare_recipient && (
                    <div>
                      生活保護受給
                      {consultation.welfare_staff && ` (担当: ${consultation.welfare_staff})`}
                    </div>
                  )}
                  {consultation.savings && <div>預金: {Number(consultation.savings).toLocaleString()}円</div>}
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