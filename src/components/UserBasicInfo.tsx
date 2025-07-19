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
    <div className="space-y-6">
      {/* 基本情報セクション */}
      <div className="bg-gray-50/70 rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-semibold leading-7 text-gray-900">基本情報</h2>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5">
          <InfoItem label="UID" className="col-span-2 md:col-span-1"><span className="font-mono">{user.uid}</span></InfoItem>
          <InfoItem label="氏名">{user.name}</InfoItem>
          <InfoItem label="生年月日">{formatDate(user.birth_date)}</InfoItem>
          <InfoItem label="性別">
            {user.gender === 'male' ? '男性' : 
             user.gender === 'female' ? '女性' : 
             user.gender === 'other' ? 'その他' : '-'}
          </InfoItem>
          {/* ★★★ user.age を計算した age に置き換え ★★★ */}
          <InfoItem label="年齢">{age != null ? `${age}歳` : '-'}</InfoItem>
        </div>
      </div>

      {/* 物件情報セクション */}
      <div className="bg-gray-50/70 rounded-lg p-4 sm:p-6">
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold leading-7 text-gray-900">物件情報</h2>
            <button
                onClick={handleCopyAddress}
                className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
                disabled={!fullAddress}
                >
                コピー
            </button>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5">
          <InfoItem label="物件住所・部屋番号" className="col-span-2 md:col-span-3">{fullAddress}</InfoItem>
          <InfoItem label="仲介">{user.intermediary}</InfoItem>
        </div>
      </div>

      {/* 費用情報セクション */}
      <div className="bg-gray-50/70 rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-semibold leading-7 text-gray-900">費用情報</h2>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-5">
          <InfoItem label="敷金">{user.deposit != null ? user.deposit.toLocaleString() : '-'}</InfoItem>
          <InfoItem label="礼金">{user.key_money != null ? user.key_money.toLocaleString() : '-'}</InfoItem>
          <InfoItem label="家賃" className="font-bold">{formatCurrency(user.rent)}</InfoItem>
          <InfoItem label="火災保険">{formatCurrency(user.fire_insurance)}</InfoItem>
          <InfoItem label="共益費">{formatCurrency(user.common_fee)}</InfoItem>
          <InfoItem label="大家家賃">{formatCurrency(user.landlord_rent)}</InfoItem>
          <InfoItem label="大家共益費">{formatCurrency(user.landlord_common_fee)}</InfoItem>
          <InfoItem label="家賃差額">{formatCurrency(user.rent_difference)}</InfoItem>
        </div>
      </div>

      {/* 入居情報セクション */}
      <div className="bg-gray-50/70 rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-semibold leading-7 text-gray-900">入居情報</h2>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5">
          <InfoItem label="入居日">{formatDate(user.move_in_date)}</InfoItem>
          <InfoItem label="次回更新年月日">{formatDate(user.next_renewal_date)}</InfoItem>
          <InfoItem label="更新回数">{user.renewal_count != null ? `${user.renewal_count}回` : '-'}</InfoItem>
        </div>
      </div>

      {/* 連絡先情報セクション */}
      <div className="bg-gray-50/70 rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-semibold leading-7 text-gray-900">連絡先情報</h2>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5">
          <InfoItem label="入居者連絡先">{user.resident_contact}</InfoItem>
          <InfoItem label="LINE利用可否">{formatBoolean(user.line_available)}</InfoItem>
          <InfoItem label="緊急連絡先">{user.emergency_contact}</InfoItem>
          <InfoItem label="緊急連絡先氏名">{user.emergency_contact_name}</InfoItem>
          <InfoItem label="続柄">{user.relationship}</InfoItem>
        </div>
      </div>

      {/* サポート情報セクション */}
      <div className="bg-gray-50/70 rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-semibold leading-7 text-gray-900">サポート情報</h2>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5">
          <InfoItem label="見守りシステム">{user.monitoring_system}</InfoItem>
          <InfoItem label="支援機関/医療機関">{user.support_medical_institution}</InfoItem>
          <InfoItem label="代理納付該当">{formatBoolean(user.proxy_payment_eligible)}</InfoItem>
          <InfoItem label="生活保護受給者">{formatBoolean(user.welfare_recipient)}</InfoItem>
          <InfoItem label="死後事務委任">{formatBoolean(user.posthumous_affairs)}</InfoItem>
        </div>
      </div>

      {/* 備考セクション */}
      {user.notes && (
        <div className="bg-gray-50/70 rounded-lg p-4 sm:p-6">
          <h2 className="text-lg font-semibold leading-7 text-gray-900">備考</h2>
          <div className="mt-2 text-base text-gray-900 whitespace-pre-wrap">{user.notes}</div>
        </div>
      )}

      {/* システム情報セクション */}
      <div className="bg-gray-50/70 rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-semibold leading-7 text-gray-900">システム情報</h2>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5">
          <InfoItem label="登録日時">{formatDate(user.created_at)}</InfoItem>
          <InfoItem label="最終更新日時">{formatDate(user.updated_at)}</InfoItem>
        </div>
      </div>
    </div>
  )
}

export default UserBasicInfo