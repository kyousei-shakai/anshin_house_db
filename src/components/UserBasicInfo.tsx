// src/components/UserBasicInfo.tsx

import React from 'react'
import { Database } from '@/types/database'
import { calculateAge } from '@/utils/date' // ★★★ インポートを追加 ★★★

// 型エイリアス
type User = Database['public']['Tables']['users']['Row']

interface UserBasicInfoProps {
  user: User
}

const UserBasicInfo: React.FC<UserBasicInfoProps> = ({ user }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const formatCurrency = (amount: number | null) => {
    return amount != null ? `${amount.toLocaleString()}円` : '-'
  }

  const formatBoolean = (value: boolean | null) => {
    if (value === null || value === undefined) return '-'
    return value ? 'はい' : 'いいえ'
  }

  const fullAddress = [user.property_address, user.property_name, user.room_number].filter(Boolean).join(' ')

  const handleCopyAddress = () => {
    if (fullAddress) {
      navigator.clipboard.writeText(fullAddress).then(() => {
        alert('物件情報をコピーしました！')
      }).catch(err => {
        console.error('コピーに失敗しました:', err)
        alert('コピーに失敗しました。')
      })
    }
  }

  const InfoItem: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className }) => (
    <div className={className}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-gray-900">{children || '-'}</p>
    </div>
  );

  // ★★★ 動的に年齢を計算 ★★★
  const age = calculateAge(user.birth_date);

  return (
      <div className="space-y-10 pb-20">
      
      {/* セクション1: 基本情報 */}
      <section>
        <h2 className="text-base font-bold text-gray-900 border-l-4 border-gray-900 pl-3 mb-4">基本情報</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8">
          <InfoItem label="UID"><span className="font-mono text-xs">{user.uid}</span></InfoItem>
          <InfoItem label="氏名">{user.name}</InfoItem>
          <InfoItem label="フリガナ">{user.furigana}</InfoItem>
          <InfoItem label="性別">
            {user.gender === 'male' ? '男性' : user.gender === 'female' ? '女性' : user.gender === 'other' ? 'その他' : '-'}
          </InfoItem>
          <InfoItem label="生年月日">{formatDate(user.birth_date)}</InfoItem>
          <InfoItem label="年齢">{age != null ? `${age}歳` : '-'}</InfoItem>
          <InfoItem label="登録日">{formatDate(user.registered_at)}</InfoItem>
          <InfoItem label="最終更新">{formatDate(user.updated_at)}</InfoItem>
        </div>
      </section>

      {/* セクション2: 物件・費用情報 */}
      <section>
        <div className="flex items-center justify-between border-l-4 border-gray-900 pl-3 mb-4">
          <h2 className="text-base font-bold text-gray-900">物件・費用情報</h2>
          <button onClick={handleCopyAddress} disabled={!fullAddress} className="text-xs font-bold text-blue-600 border border-blue-200 px-3 py-1 rounded hover:bg-blue-50">住所をコピー</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8">
          <InfoItem label="物件住所・部屋番号" className="md:col-span-3">{fullAddress}</InfoItem>
          <InfoItem label="仲介">{user.intermediary}</InfoItem>
          <InfoItem label="家賃">{formatCurrency(user.rent)}</InfoItem>
          <InfoItem label="共益費">{formatCurrency(user.common_fee)}</InfoItem>
          <InfoItem label="家賃差額">{formatCurrency(user.rent_difference)}</InfoItem>
          <InfoItem label="火災保険">{formatCurrency(user.fire_insurance)}</InfoItem>
          <InfoItem label="敷金">{user.deposit != null ? `${user.deposit.toLocaleString()}円` : '-'}</InfoItem>
          <InfoItem label="礼金">{user.key_money != null ? `${user.key_money.toLocaleString()}円` : '-'}</InfoItem>
          <InfoItem label="大家家賃">{formatCurrency(user.landlord_rent)}</InfoItem>
          <InfoItem label="大家共益費">{formatCurrency(user.landlord_common_fee)}</InfoItem>
        </div>
      </section>

      {/* セクション3: 入居・連絡先 */}
      <section>
        <h2 className="text-base font-bold text-gray-900 border-l-4 border-gray-900 pl-3 mb-4">入居・連絡先</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8">
          <InfoItem label="入居日">{formatDate(user.move_in_date)}</InfoItem>
          <InfoItem label="次回更新年月日">{formatDate(user.next_renewal_date)}</InfoItem>
          <InfoItem label="更新回数">{user.renewal_count != null ? `${user.renewal_count}回` : '-'}</InfoItem>
          <div className="border-b border-gray-100 hidden md:block" />
          <InfoItem label="入居者連絡先">{user.resident_contact}</InfoItem>
          <InfoItem label="LINE利用可否">{formatBoolean(user.line_available)}</InfoItem>
        </div>
      </section>

      {/* セクション4: 緊急連絡先 */}
      <section>
        <h2 className="text-base font-bold text-gray-900 border-l-4 border-gray-900 pl-3 mb-4">緊急連絡先</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8">
          <InfoItem label="氏名">{user.emergency_contact_name}</InfoItem>
          <InfoItem label="続柄">{user.relationship}</InfoItem>
          <InfoItem label="電話番号" className="md:col-span-2">{user.emergency_contact}</InfoItem>
          <InfoItem label="緊急連絡先住所" className="md:col-span-4">{user.emergency_contact_address}</InfoItem>
        </div>
      </section>

      {/* セクション5: サポート情報 */}
      <section>
        <h2 className="text-base font-bold text-gray-900 border-l-4 border-gray-900 pl-3 mb-4">サポート状況</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8">
          <InfoItem label="見守りシステム">{user.monitoring_system}</InfoItem>
          <InfoItem label="支援・医療機関">{user.support_medical_institution}</InfoItem>
          <InfoItem label="代理納付該当">{formatBoolean(user.proxy_payment_eligible)}</InfoItem>
          <InfoItem label="生活保護受給">{formatBoolean(user.welfare_recipient)}</InfoItem>
          <InfoItem label="死後事務委任" className="col-span-2">{formatBoolean(user.posthumous_affairs)}</InfoItem>
        </div>
      </section>

      {/* セクション6: 備考 */}
      <section>
        <h2 className="text-base font-bold text-gray-900 border-l-4 border-gray-900 pl-3 mb-4">備考</h2>
        <div className="bg-gray-50 p-4 rounded border border-gray-200 min-h-[100px] text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {user.notes || '特記事項なし'}
        </div>
      </section>

    </div>
  )
}

export default UserBasicInfo