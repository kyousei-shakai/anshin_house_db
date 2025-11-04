// src/components/SupportPlanDetail.tsx
'use client'

import React, { useState, useMemo } from 'react'
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

// ▼▼▼ ここから再利用コンポーネント定義 ▼▼▼

// DetailItem: ラベルと値を左右に配置するリスト形式
const DetailItem: React.FC<{ label: string; children: React.ReactNode; fullWidth?: boolean }> = ({ label, children, fullWidth = false }) => {
  if (children === null || children === undefined || children === '' || children === false || (Array.isArray(children) && children.length === 0) ) return null;

  if (fullWidth) {
    return (
      <div className="px-4 py-3 sm:px-6">
        <dt className="text-sm font-semibold text-gray-700">{label}</dt>
        <dd className="mt-2 text-base text-gray-900">{children}</dd>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
      <dt className="text-sm font-semibold text-gray-700 flex items-center">{label}</dt>
      <dd className="mt-1 text-base text-gray-900 sm:col-span-2 sm:mt-0">{children}</dd>
    </div>
  );
};

// DetailSection: ヘッダー付きのカードコンポーネント
const DetailSection: React.FC<{ title: string; children: React.ReactNode; id: string }> = ({ title, children, id }) => {
    // childrenがすべてnullの場合、セクション自体をレンダリングしない
    const childArray = React.Children.toArray(children);
    if (childArray.every(child => child === null)) {
        return null;
    }
    
    return (
        <div id={id} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg scroll-mt-24 overflow-hidden">
            <div className="px-4 py-4 sm:px-6 bg-gray-50 border-b border-gray-200">
                <h2 className="text-base font-semibold leading-6 text-gray-800">{title}</h2>
            </div>
            <div className="border-t border-gray-200">
                <dl className="divide-y divide-gray-200">
                    {children}
                </dl>
            </div>
        </div>
    )
};

// タグ用のスタイルを統一するためのコンポーネント
const InfoTag: React.FC<{ children: React.ReactNode; color?: 'blue' | 'green' | 'purple' | 'yellow' | 'orange' | 'gray' }> = ({ children, color = 'gray' }) => {
    const colorStyles = {
        blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
        green: 'bg-green-50 text-green-700 ring-green-600/20',
        purple: 'bg-purple-50 text-purple-700 ring-purple-600/20',
        yellow: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
        orange: 'bg-orange-50 text-orange-700 ring-orange-600/20',
        gray: 'bg-gray-50 text-gray-600 ring-gray-500/10',
    };
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colorStyles[color]}`}>
            {children}
        </span>
    );
};

// ▲▲▲ ここまで再利用コンポーネント定義 ▲▲▲

const SupportPlanDetail: React.FC<SupportPlanDetailProps> = ({ supportPlan }) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const calculatedAge = useMemo(() => {
    if (supportPlan?.birth_date) {
      try {
        return calculateAge(supportPlan.birth_date)
      } 
      catch {
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
    } catch (err) {
      console.error('支援計画の削除エラー:', err);
      alert(err instanceof Error ? err.message : '支援計画の削除に失敗しました。');
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '未設定'
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '無効な日付';
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
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
    <div className="space-y-10">
      <div className="border-b border-gray-200 pb-5">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              支援計画
            </h1>
            <div className="mt-1 flex flex-col sm:mt-2 sm:flex-row sm:flex-wrap sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                氏名: {supportPlan.name}
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                作成日: {formatDate(supportPlan.creation_date)}
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                担当: {supportPlan.staff?.name || '未設定'}
              </div>
            </div>
          </div>
          <div className="mt-5 flex lg:ml-4 lg:mt-0">
            <span className="sm:ml-3">
              <Link
                href={`/support-plans/${supportPlan.id}/edit`}
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
                編集
              </Link>
            </span>
            <span className="ml-3">
              <button onClick={handleDelete} disabled={isDeleting} type="button" className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50">
                <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.576l.84-10.518.149.022a.75.75 0 10.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>
                {isDeleting ? '削除中...' : '削除'}
              </button>
            </span>
          </div>
        </div>
      </div>

      <DetailSection title="1. 基本情報" id="section-1">
        <DetailItem label="氏名">{supportPlan.name}</DetailItem>
        <DetailItem label="フリガナ">{supportPlan.furigana}</DetailItem>
        <DetailItem label="生年月日">
          {formatDate(supportPlan.birth_date)}
          {calculatedAge !== null && ` (満${calculatedAge}歳)`}
        </DetailItem>
        <DetailItem label="居住場所">{supportPlan.residence}</DetailItem>
        <DetailItem label="携帯電話番号">{supportPlan.phone_mobile}</DetailItem>
        <DetailItem label="LINE">{supportPlan.line_available ? '利用可能' : '利用不可'}</DetailItem>
      </DetailSection>

      <DetailSection title="2. 生活保護・介護保険" id="section-2">
        <DetailItem label="生活保護受給">{supportPlan.welfare_recipient ? '有' : '無'}</DetailItem>
        {supportPlan.welfare_recipient && (
            <>
                <DetailItem label="担当CW">{supportPlan.welfare_worker}</DetailItem>
                <DetailItem label="CW連絡先">{supportPlan.welfare_contact}</DetailItem>
            </>
        )}
        <DetailItem label="介護保険認定区分">
            <div className="flex flex-wrap gap-2">
              {getCareLevel().map(level => (
                <InfoTag key={level} color="blue">{level}</InfoTag>
              ))}
            </div>
        </DetailItem>
      </DetailSection>

      <DetailSection title="3. 医療状況" id="section-3">
        <DetailItem label="通院">
            {supportPlan.outpatient_care ? `有 (${supportPlan.outpatient_institution || '機関名未入力'})` : '無'}
        </DetailItem>
        <DetailItem label="訪問診療">
            {supportPlan.visiting_medical ? `有 (${supportPlan.visiting_medical_institution || '機関名未入力'})` : '無'}
        </DetailItem>
        <DetailItem label="在宅酸素">
            {supportPlan.home_oxygen ? '有' : '無'}
        </DetailItem>
      </DetailSection>

      <DetailSection title="4. 障がい状況" id="section-4">
        <DetailItem label="身体障がい（等級）">{supportPlan.physical_disability_level}</DetailItem>
        <DetailItem label="精神障がい（等級）">{supportPlan.mental_disability_level}</DetailItem>
        <DetailItem label="療育手帳（等級/区分）">{supportPlan.therapy_certificate_level}</DetailItem>
      </DetailSection>

      <DetailSection title="5. 年金状況" id="section-5">
        <DetailItem label="年金の種類">
            <div className="flex flex-wrap gap-2">
              {getPensionTypes().map(type => (
                <InfoTag key={type} color="purple">{type}</InfoTag>
              ))}
            </div>
        </DetailItem>
        {supportPlan.pension_other && (
             <DetailItem label="その他の年金 詳細">{supportPlan.pension_other_details}</DetailItem>
        )}
      </DetailSection>

      <DetailSection title="6. 生活支援サービス" id="section-6">
          <DetailItem label="見守りサービス（セコム）">
              {supportPlan.monitoring_secom ? `有 ${supportPlan.monitoring_secom_details ? `(${supportPlan.monitoring_secom_details})` : ''}` : '無'}
          </DetailItem>
          <DetailItem label="見守りサービス（ハローライト）">
              {supportPlan.monitoring_hello_light ? `有 ${supportPlan.monitoring_hello_light_details ? `(${supportPlan.monitoring_hello_light_details})` : ''}` : '無'}
          </DetailItem>
          <DetailItem label="生活支援サービス">
            <div className="flex flex-wrap gap-2">
                {getSupportServices().map(service => (
                  <InfoTag key={service} color="yellow">{service}</InfoTag>
                ))}
            </div>
          </DetailItem>
      </DetailSection>

      <DetailSection title="7. 支援計画" id="section-7">
        <DetailItem label="目標" fullWidth>
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{supportPlan.goals}</div>
        </DetailItem>
        <DetailItem label="ニーズ（課題）と対応：金銭" fullWidth>
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{supportPlan.needs_financial}</div>
        </DetailItem>
        <DetailItem label="ニーズ（課題）と対応：身体状況" fullWidth>
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{supportPlan.needs_physical}</div>
        </DetailItem>
        <DetailItem label="ニーズ（課題）と対応：精神状況" fullWidth>
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{supportPlan.needs_mental}</div>
        </DetailItem>
        <DetailItem label="ニーズ（課題）と対応：生活状況" fullWidth>
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{supportPlan.needs_lifestyle}</div>
        </DetailItem>
        <DetailItem label="ニーズ（課題）と対応：生活環境" fullWidth>
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{supportPlan.needs_environment}</div>
        </DetailItem>
      </DetailSection>

      <DetailSection title="8. 個別避難計画" id="section-8">
        <DetailItem label="別紙の対応">{supportPlan.evacuation_plan_completed ? '済' : '未了'}</DetailItem>
        <DetailItem label="その他の詳細" fullWidth>
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{supportPlan.evacuation_plan_other_details}</div>
        </DetailItem>
      </DetailSection>

      <DetailSection title="システム情報" id="section-9">
        <DetailItem label="作成日時">{formatDate(supportPlan.created_at)}</DetailItem>
        <DetailItem label="最終更新日時">{formatDate(supportPlan.updated_at)}</DetailItem>
        <DetailItem label="利用者ID">
          {supportPlan.user_id ? (
            <Link href={`/users/${supportPlan.user_id}`} className="text-indigo-600 hover:text-indigo-800 hover:underline">
              {supportPlan.user_id}
            </Link>
          ) : '未設定'}
        </DetailItem>
      </DetailSection>
    </div>
  )
}

export default SupportPlanDetail