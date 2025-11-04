// src/components/ConsultationDetail.tsx
'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { createUser } from '@/app/actions/users'
import { deleteConsultation } from '@/app/actions/consultations'
import { Database } from '@/types/database'
import { calculateAge } from '@/utils/date'

type Consultation = Database['public']['Tables']['consultations']['Row'] & {
  staff: {
    name: string | null
  } | null
}
type UserInsert = Omit<Database['public']['Tables']['users']['Insert'], 'uid' | 'id' | 'created_at' | 'updated_at'>

interface ConsultationDetailProps {
  consultation: Consultation
}

// ▼▼▼ ここからデザイン改良 ▼▼▼

// DetailItem: ラベルの視認性を向上
const DetailItem: React.FC<{ label: string; children: React.ReactNode; fullWidth?: boolean }> = ({ label, children, fullWidth = false }) => {
  if (children === null || children === undefined || children === '' || children === false) return null;

  if (fullWidth) {
    return (
      <div className="px-4 py-3 sm:px-6">
        <dt className="text-sm font-semibold text-gray-700">{label}</dt> {/* 変更: font-medium->semibold, text-gray-600->700 */}
        <dd className="mt-2 text-base text-gray-900">{children}</dd> {/* 変更: mt-1->mt-2, font-mediumを削除 */}
      </div>
    );
  }

  return (
    <div className="px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
      <dt className="text-sm font-semibold text-gray-700 flex items-center">{label}</dt> {/* 変更: font-medium->semibold, text-gray-600->700 */}
      <dd className="mt-1 text-base text-gray-900 sm:col-span-2 sm:mt-0">{children}</dd> {/* 変更: font-mediumを削除 */}
    </div>
  );
};

// DetailSection: ヘッダーに背景色を追加し、カードとしてのまとまりを強化
const DetailSection: React.FC<{ title: string; children: React.ReactNode; id: string }> = ({ title, children, id }) => (
    <div id={id} className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg scroll-mt-24 overflow-hidden"> {/* 変更: rounded-xl -> rounded-lg */}
        <div className="px-4 py-4 sm:px-6 bg-gray-50 border-b border-gray-200"> {/* 変更: 背景色と下罫線を追加, padding調整 */}
            <h2 className="text-base font-semibold leading-6 text-gray-800">{title}</h2> {/* 変更: text-lg->text-base, text-gray-900->800 */}
        </div>
        <div className="border-t border-gray-200">
            <dl className="divide-y divide-gray-200">
                {children}
            </dl>
        </div>
    </div>
);

// タグ用のスタイルを統一するためのコンポーネント
const InfoTag: React.FC<{ children: React.ReactNode; color?: 'blue' | 'green' | 'purple' | 'yellow' | 'gray' }> = ({ children, color = 'gray' }) => {
    const colorStyles = {
        blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
        green: 'bg-green-50 text-green-700 ring-green-600/20',
        purple: 'bg-purple-50 text-purple-700 ring-purple-600/20',
        yellow: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
        gray: 'bg-gray-50 text-gray-600 ring-gray-500/10',
    };
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colorStyles[color]}`}>
            {children}
        </span>
    );
};


// ▲▲▲ ここまでデザイン改良 ▲▲▲


const ConsultationDetail: React.FC<ConsultationDetailProps> = ({ consultation }) => {
  // ... (ロジック部分は変更なし、長いため省略)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

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

  const handleDelete = async () => {
    if (!consultation) return;

    const isConfirmed = window.confirm(`本当にこの相談履歴を削除しますか？\n（相談日: ${formatDate(consultation.consultation_date)}, 相談者: ${consultation.name || '匿名'}）\nこの操作は元に戻せません。`)
    if (!isConfirmed) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteConsultation(consultation.id)
      if (result && !result.success) {
        throw new Error(result.error || '削除に失敗しました。')
      }
      // 成功時はServer Action内でredirectされる
    } catch (err) {
      console.error('相談履歴の削除エラー:', err)
      alert(err instanceof Error ? err.message : '相談履歴の削除に失敗しました。')
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
    if (!consultation || isRegistering) return

    setIsRegistering(true)
    try {
      const userData: UserInsert = {
        name: consultation.name || '匿名利用者',
        birth_date: consultation.birth_year && consultation.birth_month && consultation.birth_day
          ? `${consultation.birth_year}-${String(consultation.birth_month).padStart(2, '0')}-${String(consultation.birth_day).padStart(2, '0')}`
          : null,
        gender: consultation.gender,
        property_address: consultation.address,
        resident_contact: consultation.phone_mobile || consultation.phone_home,
        line_available: false,
        proxy_payment_eligible: consultation.proxy_payment,
        welfare_recipient: consultation.welfare_recipient,
        posthumous_affairs: false,
      }
      
      const result = await createUser(userData, consultation.id)
      
      if (!result.success) {
        throw new Error(result.error || '利用者登録に失敗しました。')
      }
      
      alert('利用者として登録しました。ページを更新します。');
      window.location.reload();

    } catch (err) {
      console.error('利用者登録エラー:', err)
      alert(err instanceof Error ? err.message : '利用者登録に失敗しました')
    } finally {
      setIsRegistering(false)
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
  
  const getRelocationAdminOpinionLabel = (opinion: string | null | undefined, details: string | null | undefined): string => {
    if (!opinion) return '未設定';
    const detailText = details ? ` (${details})` : '';
    switch (opinion) {
      case 'possible': return '可';
      case 'impossible': return '否';
      case 'pending': return '確認中';
      case 'other': return `その他${detailText}`;
      default: return opinion;
    }
  };

  const getRelocationCostBearerLabel = (bearer: string | null | undefined, details: string | null | undefined): string => {
    if (!bearer) return '未設定';
    const detailText = details ? ` (${details})` : '';
    switch (bearer) {
      case 'previous_city': return '転居前の市区町村が負担';
      case 'next_city': return '転居先の市区町村が負担';
      case 'self': return '利用者本人の負担';
      case 'pending': return '確認中';
      case 'other': return `その他${detailText}`;
      default: return bearer;
    }
  };
  
  const getRentArrearsDurationLabel = (duration: string | null | undefined, details: string | null | undefined): string => {
      if (!duration) return '未設定';
      const detailText = details ? ` (${details})` : '';
      switch (duration) {
          case '1_month': return '1ヶ月';
          case '2_to_3_months': return '2〜3ヶ月';
          case 'half_year_or_more': return '半年以上';
          case 'other': return `その他${detailText}`;
          default: return duration;
      }
  };


  return (
    <div className="space-y-10">
      {/* ▼▼▼ ページヘッダーのデザインを改良 ▼▼▼ */}
      <div className="border-b border-gray-200 pb-5">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              相談詳細
            </h1>
            <div className="mt-1 flex flex-col sm:mt-2 sm:flex-row sm:flex-wrap sm:space-x-6"> {/* 変更: mt-0->mt-2 */}
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
            {/* ボタン群は変更なし */}
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
                <button onClick={handleRegisterAsUser} type="button" disabled={isRegistering} className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50">
                    <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 8a3 3 0 100-6 3 3 0 000 6zM12 8a5 5 0 11-10 0 5 5 0 0110 0zM12 15a4 4 0 01-4 4H4a4 4 0 01-4-4v-1.382a3 3 0 01.99-2.121l4-4a3 3 0 014.242 0l4 4A3 3 0 0116 13.618V15z" /></svg>
                    {isRegistering ? '登録中...' : '利用者登録'}
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
      </div>
      
      <DetailSection title="1. 基本情報" id="section-1">
        <DetailItem label="相談日">{formatDate(consultation.consultation_date)}</DetailItem>
        <DetailItem label="担当スタッフ">{consultation.staff?.name || '未設定'}</DetailItem>
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
        {/* ▼▼▼ タグのデザインを改良 ▼▼▼ */}
        <DetailItem label="相談ルート" fullWidth>
          <div className="flex flex-wrap gap-2">
            {consultation.consultation_route_self && <InfoTag color="blue">本人</InfoTag>}
            {consultation.consultation_route_family && <InfoTag color="blue">家族</InfoTag>}
            {consultation.consultation_route_care_manager && <InfoTag color="blue">ケアマネ</InfoTag>}
            {consultation.consultation_route_elderly_center && <InfoTag color="blue">支援センター（高齢者）</InfoTag>}
            {consultation.consultation_route_disability_center && <InfoTag color="blue">支援センター（障害者）</InfoTag>}
            {consultation.consultation_route_government && <InfoTag color="blue">行政機関{consultation.consultation_route_government_other && `: ${consultation.consultation_route_government_other}`}</InfoTag>}
            {consultation.consultation_route_other && <InfoTag color="blue">その他{consultation.consultation_route_other_text && `: ${consultation.consultation_route_other_text}`}</InfoTag>}
          </div>
        </DetailItem>
        <DetailItem label="属性" fullWidth>
          <div className="flex flex-wrap gap-2">
            {consultation.attribute_elderly && <InfoTag color="green">高齢</InfoTag>}
            {consultation.attribute_disability && <InfoTag color="green">障がい {[consultation.attribute_disability_mental && '精神', consultation.attribute_disability_physical && '身体', consultation.attribute_disability_intellectual && '知的'].filter(Boolean).join('・')}</InfoTag>}
            {consultation.attribute_childcare && <InfoTag color="green">子育て</InfoTag>}
            {consultation.attribute_single_parent && <InfoTag color="green">ひとり親</InfoTag>}
            {consultation.attribute_dv && <InfoTag color="green">DV</InfoTag>}
            {consultation.attribute_foreigner && <InfoTag color="green">外国人</InfoTag>}
            {consultation.attribute_poverty && <InfoTag color="green">生活困窮</InfoTag>}
            {consultation.attribute_low_income && <InfoTag color="green">低所得者</InfoTag>}
            {consultation.attribute_lgbt && <InfoTag color="green">LGBT</InfoTag>}
            {consultation.attribute_welfare && <InfoTag color="green">生保</InfoTag>}
          </div>
        </DetailItem>
        <DetailItem label="世帯構成" fullWidth>
          <div className="flex flex-wrap gap-2">
            {consultation.household_single && <InfoTag color="purple">独居</InfoTag>}
            {consultation.household_couple && <InfoTag color="purple">夫婦</InfoTag>}
            {consultation.household_common_law && <InfoTag color="purple">内縁夫婦</InfoTag>}
            {consultation.household_parent_child && <InfoTag color="purple">親子</InfoTag>}
            {consultation.household_siblings && <InfoTag color="purple">兄弟姉妹</InfoTag>}
            {consultation.household_acquaintance && <InfoTag color="purple">知人</InfoTag>}
            {consultation.household_other && <InfoTag color="purple">その他{consultation.household_other_text && `: ${consultation.household_other_text}`}</InfoTag>}
          </div>
        </DetailItem>
      </DetailSection>

      <DetailSection title="2. 身体状況・利用サービス" id="section-2">
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
            {consultation.service_day_service && <InfoTag color="yellow">デイサービス</InfoTag>}
            {consultation.service_visiting_nurse && <InfoTag color="yellow">訪問看護</InfoTag>}
            {consultation.service_visiting_care && <InfoTag color="yellow">訪問介護</InfoTag>}
            {consultation.service_home_medical && <InfoTag color="yellow">在宅診療</InfoTag>}
            {consultation.service_short_stay && <InfoTag color="yellow">短期入所施設</InfoTag>}
            {consultation.service_other && <InfoTag color="yellow">その他{consultation.service_other_text && `: ${consultation.service_other_text}`}</InfoTag>}
          </div>
        </DetailItem>
        <DetailItem label="サービス提供事業所">{consultation.service_provider || '未設定'}</DetailItem>
        <DetailItem label="居宅介護支援事業所">{consultation.care_support_office || '未設定'}</DetailItem>
        <DetailItem label="担当ケアマネージャー">{consultation.care_manager || '未設定'}</DetailItem>
        <DetailItem label="既往症及び病歴" fullWidth><div className="whitespace-pre-wrap">{consultation.medical_history || '記載なし'}</div></DetailItem>
      </DetailSection>

      <DetailSection title="3. 医療・収入" id="section-3">
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
      
      {consultation.is_relocation_to_other_city_desired === true && (
        <DetailSection title="4. 他市区町村への転居" id="section-4">
          <DetailItem label="転居希望">
            {consultation.is_relocation_to_other_city_desired === true ? 'はい' : 'いいえ'}
          </DetailItem>
          <DetailItem label="行政からの見解">
            {getRelocationAdminOpinionLabel(consultation.relocation_admin_opinion, consultation.relocation_admin_opinion_details)}
          </DetailItem>
          <DetailItem label="費用負担">
            {getRelocationCostBearerLabel(consultation.relocation_cost_bearer, consultation.relocation_cost_bearer_details)}
          </DetailItem>
          <DetailItem label="特記事項・課題" fullWidth>
            <div className="whitespace-pre-wrap">{consultation.relocation_notes || '記載なし'}</div>
          </DetailItem>
        </DetailSection>
      )}

      <DetailSection title="5. ADL/IADL" id="section-5">
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

      <DetailSection title="6. 現在の住まい" id="section-6">
        <DetailItem label="家賃滞納">
          {consultation.rent_arrears_status === 'yes' ? (
            <div>
              <span className="font-bold text-red-600">有り</span>
              <div className="mt-2 pl-4 text-sm space-y-1">
                {consultation.rent_arrears_duration && <div><strong>期間:</strong> {getRentArrearsDurationLabel(consultation.rent_arrears_duration, null)}</div>}
                {consultation.rent_arrears_details && <div><strong>状況:</strong> <span className="whitespace-pre-wrap">{consultation.rent_arrears_details}</span></div>}
              </div>
            </div>
          ) : consultation.rent_arrears_status === 'no' ? '無し' : '未設定'}
        </DetailItem>
        <DetailItem label="ペット">
          {consultation.pet_status === 'yes' ? `有り (${consultation.pet_details || '詳細未入力'})` : consultation.pet_status === 'no' ? '無し' : '未設定'}
        </DetailItem>
        <DetailItem label="車両" fullWidth>
          <div className="flex flex-wrap gap-2">
            {consultation.vehicle_car && <InfoTag>車</InfoTag>}
            {consultation.vehicle_motorcycle && <InfoTag>バイク</InfoTag>}
            {consultation.vehicle_bicycle && <InfoTag>自転車</InfoTag>}
            {consultation.vehicle_none && <InfoTag>なし</InfoTag>}
          </div>
        </DetailItem>
        <DetailItem label="間取り">{consultation.current_floor_plan}</DetailItem>
        <DetailItem label="家賃">{consultation.current_rent ? `${consultation.current_rent.toLocaleString()}円` : ''}</DetailItem>
        <DetailItem label="退去期限" fullWidth>
          {formatDate(consultation.eviction_date)}
          {consultation.eviction_date_notes && <div className="mt-1 text-sm text-gray-600">補足: {consultation.eviction_date_notes}</div>}
        </DetailItem>
      </DetailSection>

      <DetailSection title="7. 相談内容等" id="section-7">
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
      </DetailSection>

      <DetailSection title="システム情報" id="section-8">
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