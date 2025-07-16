import React from 'react'
// 👇 1. インポートを 'Database' 型に変更
import { Database } from '@/types/database'

// 👇 2. 新しい型定義から型エイリアスを作成
type User = Database['public']['Tables']['users']['Row']

interface UserBasicInfoProps {
  user: User
}

const UserBasicInfo: React.FC<UserBasicInfoProps> = ({ user }) => {
  const formatDate = (dateString: string | null) => {
    // 👇 3. nullチェックを追加
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const formatCurrency = (amount: number | null) => {
    return amount != null ? `${amount.toLocaleString()}円` : '-'
  }

  const formatBoolean = (value: boolean | null) => {
    // 👇 4. nullチェックを追加
    if (value === null || value === undefined) return '-'
    return value ? 'はい' : 'いいえ'
  }

  return (
    <div className="space-y-8">
      {/* 基本情報セクション */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">UID</label>
            <div className="text-gray-900 font-mono">{user.uid}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">氏名</label>
            <div className="text-lg font-semibold text-gray-900">{user.name}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">生年月日</label>
            <div className="text-gray-900">{formatDate(user.birth_date)}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
            <div className="text-gray-900">
              {user.gender === 'male' ? '男性' : 
               user.gender === 'female' ? '女性' : 
               user.gender === 'other' ? 'その他' : '-'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">年齢</label>
            <div className="text-gray-900">{user.age ? `${user.age}歳` : '-'}</div>
          </div>
        </div>
      </div>

      {/* 物件情報セクション */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">物件情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">物件住所</label><div className="text-gray-900">{user.property_address || '-'}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">物件名</label><div className="text-gray-900">{user.property_name || '-'}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">部屋番号</label><div className="text-gray-900">{user.room_number || '-'}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">仲介</label><div className="text-gray-900">{user.intermediary || '-'}</div></div>
        </div>
      </div>

      {/* 費用情報セクション */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">費用情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">敷金</label><div className="text-gray-900">{formatCurrency(user.deposit)}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">礼金</label><div className="text-gray-900">{formatCurrency(user.key_money)}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">家賃</label><div className="text-gray-900 font-semibold">{formatCurrency(user.rent)}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">火災保険</label><div className="text-gray-900">{formatCurrency(user.fire_insurance)}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">共益費</label><div className="text-gray-900">{formatCurrency(user.common_fee)}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">大家家賃</label><div className="text-gray-900">{formatCurrency(user.landlord_rent)}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">大家共益費</label><div className="text-gray-900">{formatCurrency(user.landlord_common_fee)}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">家賃差額</label><div className="text-gray-900">{formatCurrency(user.rent_difference)}</div></div>
        </div>
      </div>

      {/* 入居情報セクション */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">入居情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">入居日</label><div className="text-gray-900">{formatDate(user.move_in_date)}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">次回更新年月日</label><div className="text-gray-900">{formatDate(user.next_renewal_date)}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">更新回数</label><div className="text-gray-900">{user.renewal_count ? `${user.renewal_count}回` : '-'}</div></div>
        </div>
      </div>

      {/* 連絡先情報セクション */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">連絡先情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">入居者連絡先</label><div className="text-gray-900">{user.resident_contact || '-'}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">LINE利用可否</label><div className="text-gray-900">{formatBoolean(user.line_available)}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">緊急連絡先</label><div className="text-gray-900">{user.emergency_contact || '-'}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">緊急連絡先氏名</label><div className="text-gray-900">{user.emergency_contact_name || '-'}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">続柄</label><div className="text-gray-900">{user.relationship || '-'}</div></div>
        </div>
      </div>

      {/* サポート情報セクション */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">サポート情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">見守りシステム</label><div className="text-gray-900">{user.monitoring_system || '-'}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">支援機関/医療機関</label><div className="text-gray-900">{user.support_medical_institution || '-'}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">代理納付該当</label><div className="text-gray-900">{formatBoolean(user.proxy_payment_eligible)}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">生活保護受給者</label><div className="text-gray-900">{formatBoolean(user.welfare_recipient)}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">死後事務委任</label><div className="text-gray-900">{formatBoolean(user.posthumous_affairs)}</div></div>
        </div>
      </div>

      {/* 備考セクション */}
      {user.notes && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">備考</h2>
          <div className="text-gray-900 whitespace-pre-wrap">{user.notes}</div>
        </div>
      )}

      {/* システム情報セクション */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">システム情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">登録日時</label><div className="text-gray-900">{formatDate(user.created_at)}</div></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">最終更新日時</label><div className="text-gray-900">{formatDate(user.updated_at)}</div></div>
        </div>
      </div>
    </div>
  )
}

export default UserBasicInfo