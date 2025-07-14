'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supportPlansApi } from '@/lib/api'

interface SupportPlan {
  id: string
  user_id: string
  creation_date: string
  staff_name: string
  name: string
  furigana: string
  birth_date: string
  age: number
  residence: string
  phone_mobile: string | null
  line_available: boolean
  welfare_recipient: boolean
  welfare_worker: string | null
  welfare_contact: string | null
  care_level_independent: boolean
  care_level_support1: boolean
  care_level_support2: boolean
  care_level_care1: boolean
  care_level_care2: boolean
  care_level_care3: boolean
  care_level_care4: boolean
  care_level_care5: boolean
  outpatient_care: boolean
  outpatient_institution: string | null
  visiting_medical: boolean
  visiting_medical_institution: string | null
  home_oxygen: boolean
  physical_disability_level: string | null
  mental_disability_level: string | null
  therapy_certificate_level: string | null
  pension_national: boolean
  pension_employee: boolean
  pension_disability: boolean
  pension_survivor: boolean
  pension_corporate: boolean
  pension_other: boolean
  pension_other_details: string | null
  monitoring_secom: boolean
  monitoring_secom_details: string | null
  monitoring_hello_light: boolean
  monitoring_hello_light_details: string | null
  support_shopping: boolean
  support_bank_visit: boolean
  support_cleaning: boolean
  support_bulb_change: boolean
  support_garbage_disposal: boolean
  goals: string | null
  needs_financial: string | null
  needs_physical: string | null
  needs_mental: string | null
  needs_lifestyle: string | null
  needs_environment: string | null
  evacuation_plan_completed: boolean
  evacuation_plan_other_details: string | null
  created_at: string
  updated_at: string
}

interface SupportPlanDetailProps {
  supportPlanId: string
}

const SupportPlanDetail: React.FC<SupportPlanDetailProps> = ({ supportPlanId }) => {
  const router = useRouter()
  const [supportPlan, setSupportPlan] = useState<SupportPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSupportPlan = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await supportPlansApi.getById(supportPlanId)
        setSupportPlan(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'エラーが発生しました')
      } finally {
        setLoading(false)
      }
    }

    fetchSupportPlan()
  }, [supportPlanId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
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

  if (!supportPlan) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="text-yellow-700 text-sm">
          支援計画が見つかりません
        </div>
      </div>
    )
  }

  const getCareLevel = () => {
    const levels = []
    if (supportPlan.care_level_independent) levels.push('自立')
    if (supportPlan.care_level_support1) levels.push('要支援1')
    if (supportPlan.care_level_support2) levels.push('要支援2')
    if (supportPlan.care_level_care1) levels.push('要介護1')
    if (supportPlan.care_level_care2) levels.push('要介護2')
    if (supportPlan.care_level_care3) levels.push('要介護3')
    if (supportPlan.care_level_care4) levels.push('要介護4')
    if (supportPlan.care_level_care5) levels.push('要介護5')
    return levels
  }

  const getPensionTypes = () => {
    const types = []
    if (supportPlan.pension_national) types.push('国民年金')
    if (supportPlan.pension_employee) types.push('厚生年金')
    if (supportPlan.pension_disability) types.push('障害年金')
    if (supportPlan.pension_survivor) types.push('遺族年金')
    if (supportPlan.pension_corporate) types.push('企業年金')
    if (supportPlan.pension_other) types.push('その他')
    return types
  }

  const getSupportServices = () => {
    const services = []
    if (supportPlan.support_shopping) services.push('買い物')
    if (supportPlan.support_bank_visit) services.push('外出支援（金融機関）')
    if (supportPlan.support_cleaning) services.push('掃除・片付け')
    if (supportPlan.support_bulb_change) services.push('電球交換')
    if (supportPlan.support_garbage_disposal) services.push('ゴミ捨て')
    return services
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              支援計画 - {supportPlan.name}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              作成日: {formatDate(supportPlan.creation_date)} | 担当: {supportPlan.staff_name}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push(`/support-plans/${supportPlan.id}/edit`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              編集
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
              <label className="block text-sm font-medium text-gray-700 mb-1">氏名</label>
              <div className="text-gray-800">{supportPlan.name}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">フリガナ</label>
              <div className="text-gray-800">{supportPlan.furigana}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">生年月日</label>
              <div className="text-gray-800">
                {formatDate(supportPlan.birth_date)} (年齢: {supportPlan.age}歳)
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">居住場所</label>
              <div className="text-gray-800">{supportPlan.residence}</div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-md font-medium text-gray-800 mb-2">連絡先</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {supportPlan.phone_mobile && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">携帯電話番号</label>
                  <div className="text-gray-800">{supportPlan.phone_mobile}</div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LINE</label>
                <div className="text-gray-800">{supportPlan.line_available ? '利用可能' : '利用不可'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 生活保護・介護保険 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">2. 生活保護・介護保険</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">生活保護受給</label>
              <div className="text-gray-800">{supportPlan.welfare_recipient ? '有' : '無'}</div>
            </div>
            
            {supportPlan.welfare_recipient && (
              <>
                {supportPlan.welfare_worker && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">担当CW</label>
                    <div className="text-gray-800">{supportPlan.welfare_worker}</div>
                  </div>
                )}
                
                {supportPlan.welfare_contact && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CW連絡先</label>
                    <div className="text-gray-800">{supportPlan.welfare_contact}</div>
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">介護保険認定区分</label>
            <div className="flex flex-wrap gap-2">
              {getCareLevel().map(level => (
                <span key={level} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {level}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. 医療状況 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">3. 医療状況</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">通院・訪問診療</label>
              <div className="space-y-2">
                {supportPlan.outpatient_care && (
                  <div className="flex items-center space-x-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">通院</span>
                    {supportPlan.outpatient_institution && (
                      <span className="text-gray-800">{supportPlan.outpatient_institution}</span>
                    )}
                  </div>
                )}
                
                {supportPlan.visiting_medical && (
                  <div className="flex items-center space-x-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">訪問診療</span>
                    {supportPlan.visiting_medical_institution && (
                      <span className="text-gray-800">{supportPlan.visiting_medical_institution}</span>
                    )}
                  </div>
                )}
                
                {supportPlan.home_oxygen && (
                  <div className="flex items-center space-x-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">在宅酸素</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. 障がい状況 */}
        {(supportPlan.physical_disability_level || supportPlan.mental_disability_level || supportPlan.therapy_certificate_level) && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">4. 障がい状況</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {supportPlan.physical_disability_level && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">身体障がい（等級）</label>
                  <div className="text-gray-800">{supportPlan.physical_disability_level}</div>
                </div>
              )}
              
              {supportPlan.mental_disability_level && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">精神障がい（等級）</label>
                  <div className="text-gray-800">{supportPlan.mental_disability_level}</div>
                </div>
              )}
              
              {supportPlan.therapy_certificate_level && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">療育手帳（等級/区分）</label>
                  <div className="text-gray-800">{supportPlan.therapy_certificate_level}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. 年金状況 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">5. 年金状況</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">年金の種類</label>
            <div className="flex flex-wrap gap-2">
              {getPensionTypes().map(type => (
                <span key={type} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                  {type}
                </span>
              ))}
            </div>
            
            {supportPlan.pension_other && supportPlan.pension_other_details && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">その他の年金 詳細</label>
                <div className="text-gray-800">{supportPlan.pension_other_details}</div>
              </div>
            )}
          </div>
        </div>

        {/* 6. 生活支援サービス */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">6. 生活支援サービス</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">見守りサービス</label>
              <div className="space-y-2">
                {supportPlan.monitoring_secom && (
                  <div className="flex items-center space-x-2">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">セコム</span>
                    {supportPlan.monitoring_secom_details && (
                      <span className="text-gray-800">{supportPlan.monitoring_secom_details}</span>
                    )}
                  </div>
                )}
                
                {supportPlan.monitoring_hello_light && (
                  <div className="flex items-center space-x-2">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">ハローライト</span>
                    {supportPlan.monitoring_hello_light_details && (
                      <span className="text-gray-800">{supportPlan.monitoring_hello_light_details}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">生活支援サービス</label>
              <div className="flex flex-wrap gap-2">
                {getSupportServices().map(service => (
                  <span key={service} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 7. 支援計画 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">7. 支援計画</h2>
          
          <div className="space-y-4">
            {supportPlan.goals && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">目標</label>
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {supportPlan.goals}
                  </p>
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-3">ニーズ（課題）と対応</h3>
              <div className="space-y-4">
                {supportPlan.needs_financial && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">金銭</label>
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {supportPlan.needs_financial}
                      </p>
                    </div>
                  </div>
                )}
                
                {supportPlan.needs_physical && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">身体状況</label>
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {supportPlan.needs_physical}
                      </p>
                    </div>
                  </div>
                )}
                
                {supportPlan.needs_mental && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">精神状況</label>
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {supportPlan.needs_mental}
                      </p>
                    </div>
                  </div>
                )}
                
                {supportPlan.needs_lifestyle && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">生活状況</label>
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {supportPlan.needs_lifestyle}
                      </p>
                    </div>
                  </div>
                )}
                
                {supportPlan.needs_environment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">生活環境</label>
                    <div className="bg-white p-4 rounded-md border border-gray-200">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {supportPlan.needs_environment}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 8. 個別避難計画 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">8. 個別避難計画</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">別紙の対応</label>
              <div className="text-gray-800">{supportPlan.evacuation_plan_completed ? '済' : '未了'}</div>
            </div>
            
            {supportPlan.evacuation_plan_other_details && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">その他の詳細</label>
                <div className="bg-white p-4 rounded-md border border-gray-200">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {supportPlan.evacuation_plan_other_details}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* システム情報 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">システム情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">作成日時</label>
              <div className="text-gray-800">{formatDate(supportPlan.created_at)}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最終更新日時</label>
              <div className="text-gray-800">{formatDate(supportPlan.updated_at)}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">利用者ID</label>
              <div className="text-gray-800">{supportPlan.user_id}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupportPlanDetail