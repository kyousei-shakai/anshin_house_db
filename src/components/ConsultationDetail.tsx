'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { consultationsApi, usersApi } from '@/lib/api'
import { generateNewUID } from '@/utils/uid'
import { Database } from '@/types/database'
import { calculateAge } from '@/utils/date'

// 型エイリアス
type Consultation = Database['public']['Tables']['consultations']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']

interface ConsultationDetailProps {
  consultationId: string
}

// ★★ 視認性向上のための小さなコンポーネントを追加 ★★
const DetailItem: React.FC<{ label: string; children: React.ReactNode; fullWidth?: boolean }> = ({ label, children, fullWidth = false }) => {
  if (!children) return null; // 子要素がなければ何も表示しない

  return (
    <div className={`py-4 sm:py-5 ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <dt className="text-sm font-medium text-gray-600">{label}</dt>
      <dd className="mt-1 text-base font-medium text-gray-900">{children}</dd>
    </div>
  );
};

const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-semibold leading-6 text-gray-900">{title}</h2>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                {children}
            </dl>
        </div>
    </div>
);


const ConsultationDetail: React.FC<ConsultationDetailProps> = ({ consultationId }) => {
  const router = useRouter()
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const calculatedAge = useMemo(() => {
    if (consultation?.birth_year && consultation?.birth_month && consultation?.birth_day) {
      try {
        const birthDate = `${consultation.birth_year}-${String(consultation.birth_month).padStart(2, '0')}-${String(consultation.birth_day).padStart(2, '0')}`;
        if (!isNaN(new Date(birthDate).getTime())) {
          return calculateAge(birthDate);
        }
      } catch {
        return null;
      }
    }
    return null;
  }, [consultation]);

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
      router.push('/consultations')
      router.refresh()
    } catch (err) {
      console.error('相談履歴の削除エラー:', err)
      alert('相談履歴の削除に失敗しました。')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '未設定'
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '無効な日付';
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
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

  const getAdlStatusLabel = (independent: boolean | null, partial: boolean | null, full: boolean | null, other: boolean | null, otherText: string | null): string => {
    if (independent) return '自立';
    if (partial) return '一部介助';
    if (full) return '全介助';
    if (other) return `その他${otherText ? ` (${otherText})` : ''}`;
    return '未設定';
  };

  const getBinaryStatusLabel = (positive: boolean | null, negative: boolean | null, positiveLabel: string, negativeLabel: string, detailText?: string | null): string => {
    if (positive) return positiveLabel;
    if (negative) return `${negativeLabel}${detailText ? ` (${detailText})` : ''}`;
    return '未設定';
  }

  const getRentPaymentMethodLabel = (method: string | null | undefined): string => {
    if (!method) return '未設定';
    switch (method) {
        case 'transfer': return '振込';
        case 'collection': return '集金';
        case 'automatic': return '口座振替';
        default: return method;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p className="font-bold">エラー</p>
        <p>データの読み込みに失敗しました: {error}</p>
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
        <p className="font-bold">情報</p>
        <p>指定された相談データは見つかりませんでした。</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* ★★ ヘッダー部分のデザインを修正 ★★ */}
      <div className="lg:flex lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            相談詳細
          </h1>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <svg className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75v1.5h6.5v-1.5a.75.75 0 011.5 0v1.5h.75a3.25 3.25 0 013.25 3.25v6.5a3.25 3.25 0 01-3.25 3.25H4.75a3.25 3.25 0 01-3.25-3.25v-6.5A3.25 3.25 0 014.75 4h.75V2.75A.75.75 0 015.75 2zM4 9.75a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75a.75.75 0 01-.75-.75z" clipRule="evenodd" /></svg>
              相談日: {formatDate(consultation.consultation_date)}
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <svg className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.095a1.23 1.23 0 00.41-1.412A9.957 9.957 0 0010 12c-2.31 0-4.438.784-6.131 2.095z" /></svg>
              相談者: {consultation.name || '匿名'}
            </div>
          </div>
        </div>
        <div className="mt-5 flex lg:ml-4 lg:mt-0">
          <span className="sm:ml-3">
            <Link
              href={`/consultations/${consultation.id}/edit`}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
              編集
            </Link>
          </span>
          {!consultation.user_id && (
            <span className="ml-3">
              <button onClick={handleRegisterAsUser} type="button" className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600">
                <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 8a3 3 0 100-6 3 3 0 000 6zM12 8a5 5 0 11-10 0 5 5 0 0110 0zM12 15a4 4 0 01-4 4H4a4 4 0 01-4-4v-1.382a3 3 0 01.99-2.121l4-4a3 3 0 014.242 0l4 4A3 3 0 0116 13.618V15z" /></svg>
                利用者登録
              </button>
            </span>
          )}
          <span className="ml-3">
            <button onClick={handleDelete} disabled={isDeleting} type="button" className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50">
              <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.576l.84-10.518.149.022a.75.75 0 10.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>
              {isDeleting ? '削除中...' : '削除'}
            </button>
          </span>
        </div>
      </div>
      
      {/* ★★ 各セクションを DetailSection と DetailItem で再構築 ★★ */}
      <DetailSection title="1. 基本情報">
        <DetailItem label="相談日">{formatDate(consultation.consultation_date)}</DetailItem>
        <DetailItem label="お名前">{consultation.name ? `${consultation.name}様` : '匿名'}</DetailItem>
        <DetailItem label="フリガナ">{consultation.furigana}</DetailItem>
        <DetailItem label="性別">{getGenderLabel(consultation.gender)}</DetailItem>
        <DetailItem label="生年月日">
          {consultation.birth_year && `${consultation.birth_year}年`}
          {consultation.birth_month && ` ${consultation.birth_month}月`}
          {consultation.birth_day && ` ${consultation.birth_day}日`}
          {calculatedAge != null && ` (満${calculatedAge}歳)`}
        </DetailItem>
        <DetailItem label="住所">
          {consultation.postal_code && `〒${consultation.postal_code} `}
          {consultation.address}
        </DetailItem>
        <DetailItem label="連絡先">
          {consultation.phone_home && <div>自宅: {consultation.phone_home}</div>}
          {consultation.phone_mobile && <div>携帯: {consultation.phone_mobile}</div>}
        </DetailItem>
        <DetailItem label="相談ルート" fullWidth>
          <div className="flex flex-wrap gap-2">
            {consultation.consultation_route_self && <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-medium">本人</span>}
            {consultation.consultation_route_family && <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-medium">家族</span>}
            {consultation.consultation_route_care_manager && <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-medium">ケアマネ</span>}
            {consultation.consultation_route_elderly_center && <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-medium">支援センター（高齢者）</span>}
            {consultation.consultation_route_disability_center && <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-medium">支援センター（障害者）</span>}
            {consultation.consultation_route_government && <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-medium">行政機関{consultation.consultation_route_government_other && `: ${consultation.consultation_route_government_other}`}</span>}
            {consultation.consultation_route_other && <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-medium">その他{consultation.consultation_route_other_text && `: ${consultation.consultation_route_other_text}`}</span>}
          </div>
        </DetailItem>
        <DetailItem label="属性" fullWidth>
          <div className="flex flex-wrap gap-2">
            {consultation.attribute_elderly && <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium">高齢</span>}
            {consultation.attribute_disability && <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium">障がい {[consultation.attribute_disability_mental && '精神', consultation.attribute_disability_physical && '身体', consultation.attribute_disability_intellectual && '知的'].filter(Boolean).join('・')}</span>}
            {consultation.attribute_childcare && <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium">子育て</span>}
            {consultation.attribute_single_parent && <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium">ひとり親</span>}
            {consultation.attribute_dv && <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium">DV</span>}
            {consultation.attribute_foreigner && <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium">外国人</span>}
            {consultation.attribute_poverty && <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium">生活困窮</span>}
            {consultation.attribute_low_income && <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium">低所得者</span>}
            {consultation.attribute_lgbt && <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium">LGBT</span>}
            {consultation.attribute_welfare && <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-xs font-medium">生保</span>}
          </div>
        </DetailItem>
        <DetailItem label="世帯構成" fullWidth>
          <div className="flex flex-wrap gap-2">
            {consultation.household_single && <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-xs font-medium">独居</span>}
            {consultation.household_couple && <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-xs font-medium">夫婦</span>}
            {consultation.household_common_law && <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-xs font-medium">内縁夫婦</span>}
            {consultation.household_parent_child && <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-xs font-medium">親子</span>}
            {consultation.household_siblings && <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-xs font-medium">兄弟姉妹</span>}
            {consultation.household_acquaintance && <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-xs font-medium">知人</span>}
            {consultation.household_other && <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-xs font-medium">その他{consultation.household_other_text && `: ${consultation.household_other_text}`}</span>}
          </div>
        </DetailItem>
      </DetailSection>

      <DetailSection title="2. 身体状況・利用サービス">
        <DetailItem label="身体状況">{getPhysicalConditionLabel(consultation.physical_condition)}</DetailItem>
        <DetailItem label="手帳" fullWidth>
          <div className="space-y-1">
            {consultation.mental_disability_certificate && <div>精神障害者保健福祉手帳 {consultation.mental_disability_level && ` (${consultation.mental_disability_level})`}</div>}
            {consultation.physical_disability_certificate && <div>身体障害者手帳 {consultation.physical_disability_level && ` (${consultation.physical_disability_level})`}</div>}
            {consultation.therapy_certificate && <div>療育手帳 {consultation.therapy_level && ` (${consultation.therapy_level})`}</div>}
            {!consultation.mental_disability_certificate && !consultation.physical_disability_certificate && !consultation.therapy_certificate && <div className="text-gray-500">なし</div>}
          </div>
        </DetailItem>
        <DetailItem label="利用中の支援サービス" fullWidth>
          <div className="flex flex-wrap gap-2">
            {consultation.service_day_service && <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-medium">デイサービス</span>}
            {consultation.service_visiting_nurse && <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-medium">訪問看護</span>}
            {consultation.service_visiting_care && <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-medium">訪問介護</span>}
            {consultation.service_home_medical && <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-medium">在宅診療</span>}
            {consultation.service_short_stay && <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-medium">短期入所施設</span>}
            {consultation.service_other && <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-xs font-medium">その他{consultation.service_other_text && `: ${consultation.service_other_text}`}</span>}
          </div>
        </DetailItem>
        <DetailItem label="サービス提供事業所">{consultation.service_provider || '未設定'}</DetailItem>
        <DetailItem label="居宅介護支援事業所">{consultation.care_support_office || '未設定'}</DetailItem>
        <DetailItem label="担当ケアマネージャー">{consultation.care_manager || '未設定'}</DetailItem>
        <DetailItem label="既往症及び病歴" fullWidth><div className="whitespace-pre-wrap">{consultation.medical_history || '記載なし'}</div></DetailItem>
      </DetailSection>

      <DetailSection title="3. 医療・収入">
        <DetailItem label="かかりつけ医療機関">
            {consultation.medical_institution_name || '未設定'}
            {consultation.medical_institution_staff && ` (担当: ${consultation.medical_institution_staff})`}
        </DetailItem>
        <DetailItem label="収入">
          <div className="space-y-1">
            {consultation.income_salary && <div>給与: {Number(consultation.income_salary).toLocaleString()}円</div>}
            {consultation.income_injury_allowance && <div>傷病手当: {Number(consultation.income_injury_allowance).toLocaleString()}円</div>}
            {consultation.income_pension && <div>年金振込額: {Number(consultation.income_pension).toLocaleString()}円</div>}
            {consultation.welfare_recipient && <div>生活保護受給 {consultation.welfare_staff && ` (担当: ${consultation.welfare_staff})`}</div>}
            {consultation.savings && <div>預金: {Number(consultation.savings).toLocaleString()}円</div>}
          </div>
        </DetailItem>
      </DetailSection>

      <DetailSection title="4. ADL/IADL">
        <DetailItem label="認知症">
            {consultation.dementia || '未設定'}
            {consultation.dementia_hospital && ` (病院: ${consultation.dementia_hospital})`}
        </DetailItem>
        <DetailItem label="通院支援">{consultation.hospital_support_required ? '要' : '不要'}</DetailItem>
        <DetailItem label="内服管理の必要性">{consultation.medication_management_needed ? '有' : '無'}</DetailItem>
        <DetailItem label="移動">{getAdlStatusLabel(consultation.mobility_independent, consultation.mobility_partial_assist, consultation.mobility_full_assist, consultation.mobility_other, consultation.mobility_other_text)}</DetailItem>
        <DetailItem label="移動補助具・福祉用具">{consultation.mobility_aids || '未設定'}</DetailItem>
        <DetailItem label="食事">{getAdlStatusLabel(consultation.eating_independent, consultation.eating_partial_assist, consultation.eating_full_assist, consultation.eating_other, consultation.eating_other_text)}</DetailItem>
        <DetailItem label="買物">{getBinaryStatusLabel(consultation.shopping_possible, consultation.shopping_support_needed, '可', '支援必要', consultation.shopping_support_text)}</DetailItem>
        <DetailItem label="ゴミ出し">{getBinaryStatusLabel(consultation.garbage_disposal_independent, consultation.garbage_disposal_support_needed, '自立', '支援必要', consultation.garbage_disposal_support_text)}</DetailItem>
        <DetailItem label="排泄">{getAdlStatusLabel(consultation.excretion_independent, consultation.excretion_partial_assist, consultation.excretion_full_assist, consultation.excretion_other, consultation.excretion_other_text)}</DetailItem>
        <DetailItem label="2階への移動">{consultation.second_floor_possible === true ? '可' : consultation.second_floor_possible === false ? '不可' : '未設定'}</DetailItem>
        <DetailItem label="入浴">{getAdlStatusLabel(consultation.bathing_independent, consultation.bathing_partial_assist, consultation.bathing_full_assist, consultation.bathing_other, consultation.bathing_other_text)}</DetailItem>
        <DetailItem label="金銭管理支援者">{consultation.money_management_supporter || '未設定'}</DetailItem>
        <DetailItem label="代理納付サービスの利用">{consultation.proxy_payment === true ? '有' : consultation.proxy_payment === false ? '無' : '未設定'}</DetailItem>
        <DetailItem label="家賃納入方法">{getRentPaymentMethodLabel(consultation.rent_payment_method)}</DetailItem>
        <DetailItem label="その他特記事項" fullWidth><div className="whitespace-pre-wrap">{consultation.other_notes || '記載なし'}</div></DetailItem>
      </DetailSection>

      <DetailSection title="5. 相談内容等">
        <DetailItem label="相談内容（困りごと、何が大変でどうしたいか、等）" fullWidth>
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{consultation.consultation_content || '記載なし'}</div>
        </DetailItem>
        <DetailItem label="転居理由" fullWidth>
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{consultation.relocation_reason || '記載なし'}</div>
        </DetailItem>
        <DetailItem label="緊急連絡先" fullWidth>
            <div className="space-y-2">
                <div><span className="font-medium">氏名:</span> {consultation.emergency_contact_name || '未設定'} {consultation.emergency_contact_relationship && `(${consultation.emergency_contact_relationship})`}</div>
                <div><span className="font-medium">住所:</span> {consultation.emergency_contact_postal_code && `〒${consultation.emergency_contact_postal_code} `}{consultation.emergency_contact_address || '未設定'}</div>
                <div><span className="font-medium">連絡先:</span> {consultation.emergency_contact_phone_home && `自宅: ${consultation.emergency_contact_phone_home}`}{consultation.emergency_contact_phone_mobile && ` 携帯: ${consultation.emergency_contact_phone_mobile}`}</div>
                <div><span className="font-medium">Email:</span> {consultation.emergency_contact_email || '未設定'}</div>
            </div>
        </DetailItem>
        <DetailItem label="相談結果" fullWidth>
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">{consultation.consultation_result || '記載なし'}</div>
        </DetailItem>
        <DetailItem label="次回予定" fullWidth>
          {consultation.next_appointment_scheduled ? (
            <div>あり{consultation.next_appointment_details && <div className="mt-1 text-sm text-gray-600">詳細: {consultation.next_appointment_details}</div>}</div>
          ) : 'なし'}
        </DetailItem>
      </DetailSection>

      <DetailSection title="システム情報">
        <DetailItem label="作成日時">{formatDate(consultation.created_at)}</DetailItem>
        <DetailItem label="最終更新日時">{formatDate(consultation.updated_at)}</DetailItem>
        <DetailItem label="利用者ID">
            {consultation.user_id ? (
                <Link href={`/users/${consultation.user_id}`} className="text-indigo-600 hover:text-indigo-800 hover:underline">
                  {consultation.user_id}
                </Link>
            ) : '未登録'}
        </DetailItem>
      </DetailSection>
    </div>
  )
}

export default ConsultationDetail