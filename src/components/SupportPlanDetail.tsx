// src/components/SupportPlanDetail.tsx
'use client'

import React, { useState, useMemo } from 'react'
// import { useRouter } from 'next/navigation' // ★ 修正済
import Link from 'next/link'
import { deleteSupportPlan } from '@/app/actions/supportPlans'
import { Database } from '@/types/database'
import { calculateAge } from '@/utils/date'

type SupportPlan = Database['public']['Tables']['support_plans']['Row'] & {
  staff: {
    name: string | null
  } | null
}

interface SupportPlanDetailProps {
  supportPlan: SupportPlan
}

const SupportPlanDetail: React.FC<SupportPlanDetailProps> = ({ supportPlan }) => {
  // const router = useRouter() // ★ 修正済
  const [isDeleting, setIsDeleting] = useState(false)

  const calculatedAge = useMemo(() => {
    if (supportPlan?.birth_date) {
      try {
        return calculateAge(supportPlan.birth_date)
      } 
      catch { // ★ 修正点: (e) を削除
        return null
      }
    }
    return null
  }, [supportPlan])

  const handleDelete = async () => {
    if (!supportPlan) return;

    const isConfirmed = window.confirm(
      `本当にこの支援計画を削除しますか？\n（氏名: ${supportPlan.name}, 作成日: ${formatDate(supportPlan.creation_date)}）\nこの操作は元に戻せません。`
    );
    if (!isConfirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteSupportPlan(supportPlan.id);
      if (result && !result.success) {
        throw new Error(result.error || '削除に失敗しました。')
      }
      // 成功時はServer Action内でredirectされる
    } catch (err) {
      console.error('支援計画の削除エラー:', err);
      alert(err instanceof Error ? err.message : '支援計画の削除に失敗しました。');
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ja-JP')
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
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              支援計画 - {supportPlan.name}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {/* ★ 変更点: supportPlan.staff_name を supportPlan.staff?.name に変更 */}
              作成日: {formatDate(supportPlan.creation_date)} | 担当: {supportPlan.staff?.name || '未設定'}
            </p>
          </div>
          <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Link
              href={`/support-plans/${supportPlan.id}/edit`}
              className="inline-flex items-center justify-center gap-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="-ml-0.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
              </svg>
              編集
            </Link>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                type="button"
                className="inline-flex items-center justify-center gap-x-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
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
                {formatDate(supportPlan.birth_date)}
                {calculatedAge !== null && ` (年齢: ${calculatedAge}歳)`}
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