'use client'

import React, { useState } from 'react'
import { usersApi } from '@/lib/api'
import { generateNewUID } from '@/utils/uid'
// 👇 1. インポートを 'Database' 型に変更
import { Database } from '@/types/database'

// 👇 2. 新しい型定義から型エイリアスを作成
type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']

interface NewUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: User) => void
}

const NewUserModal: React.FC<NewUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  // 👇 3. フォームのstateの型を文字列とbooleanに限定 (DBの型とは別)
  const initialFormData = {
    name: '',
    birth_date: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    age: '',
    property_address: '',
    property_name: '',
    room_number: '',
    intermediary: '',
    deposit: '',
    key_money: '',
    rent: '',
    fire_insurance: '',
    common_fee: '',
    landlord_rent: '',
    landlord_common_fee: '',
    rent_difference: '',
    move_in_date: '',
    next_renewal_date: '',
    renewal_count: '',
    resident_contact: '',
    line_available: false,
    emergency_contact: '',
    emergency_contact_name: '',
    relationship: '',
    monitoring_system: '',
    support_medical_institution: '',
    notes: '',
    proxy_payment_eligible: false,
    welfare_recipient: false,
    posthumous_affairs: false
  }
  const [formData, setFormData] = useState(initialFormData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('氏名は必須です')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const newUID = await generateNewUID()

      // 👇 4. フォームの文字列データを、DB保存用の正しい型(UserInsert)に変換
      const userData: UserInsert = {
        uid: newUID,
        name: formData.name.trim(),
        birth_date: formData.birth_date || null,
        gender: formData.gender || null,
        age: formData.age ? parseInt(formData.age, 10) : null,
        property_address: formData.property_address.trim() || null,
        property_name: formData.property_name.trim() || null,
        room_number: formData.room_number.trim() || null,
        intermediary: formData.intermediary.trim() || null,
        deposit: formData.deposit ? parseFloat(formData.deposit) : null,
        key_money: formData.key_money ? parseFloat(formData.key_money) : null,
        rent: formData.rent ? parseFloat(formData.rent) : null,
        fire_insurance: formData.fire_insurance ? parseFloat(formData.fire_insurance) : null,
        common_fee: formData.common_fee ? parseFloat(formData.common_fee) : null,
        landlord_rent: formData.landlord_rent ? parseFloat(formData.landlord_rent) : null,
        landlord_common_fee: formData.landlord_common_fee ? parseFloat(formData.landlord_common_fee) : null,
        rent_difference: formData.rent_difference ? parseFloat(formData.rent_difference) : null,
        move_in_date: formData.move_in_date || null,
        next_renewal_date: formData.next_renewal_date || null,
        renewal_count: formData.renewal_count ? parseInt(formData.renewal_count, 10) : null,
        resident_contact: formData.resident_contact.trim() || null,
        line_available: formData.line_available,
        emergency_contact: formData.emergency_contact.trim() || null,
        emergency_contact_name: formData.emergency_contact_name.trim() || null,
        relationship: formData.relationship.trim() || null,
        monitoring_system: formData.monitoring_system.trim() || null,
        support_medical_institution: formData.support_medical_institution.trim() || null,
        notes: formData.notes.trim() || null,
        proxy_payment_eligible: formData.proxy_payment_eligible,
        welfare_recipient: formData.welfare_recipient,
        posthumous_affairs: formData.posthumous_affairs
      }
      
      // 👇 5. `as any` を削除。`usersApi.create` は `UserInsert` 型を受け取るように修正済み
      const newUser = await usersApi.create(userData)
      onSuccess(newUser)
      onClose()

      setFormData(initialFormData) // フォームをリセット
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const isCheckbox = type === 'checkbox'
    
    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">新規利用者追加</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 flex items-start p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <svg className="flex-shrink-0 w-5 h-5 text-blue-600 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="ml-2">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">ヒント:</span> 必須項目は氏名のみです。内容は後からいつでも編集可能です。
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-500 text-sm">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本情報 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  生年月日
                </label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  性別
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  年齢
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 物件情報 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">物件情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">物件住所</label>
                <input type="text" name="property_address" value={formData.property_address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">物件名</label>
                <input type="text" name="property_name" value={formData.property_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">部屋番号</label>
                <input type="text" name="room_number" value={formData.room_number} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">仲介</label>
                <input type="text" name="intermediary" value={formData.intermediary} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
          
          {/* 費用情報 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">費用情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">敷金（円）</label>
                <input type="number" name="deposit" value={formData.deposit} onChange={handleChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">礼金（円）</label>
                <input type="number" name="key_money" value={formData.key_money} onChange={handleChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">家賃（円）</label>
                <input type="number" name="rent" value={formData.rent} onChange={handleChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">火災保険（円）</label>
                <input type="number" name="fire_insurance" value={formData.fire_insurance} onChange={handleChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">共益費（円）</label>
                <input type="number" name="common_fee" value={formData.common_fee} onChange={handleChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">大家家賃（円）</label>
                <input type="number" name="landlord_rent" value={formData.landlord_rent} onChange={handleChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">大家共益費（円）</label>
                <input type="number" name="landlord_common_fee" value={formData.landlord_common_fee} onChange={handleChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">家賃差額（円）</label>
                <input type="number" name="rent_difference" value={formData.rent_difference} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
          
          {/* 入居情報 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">入居情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">入居日</label>
                <input type="date" name="move_in_date" value={formData.move_in_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">次回更新年月日</label>
                <input type="date" name="next_renewal_date" value={formData.next_renewal_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">更新回数</label>
                <input type="number" name="renewal_count" value={formData.renewal_count} onChange={handleChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
          
          {/* 連絡先情報 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">連絡先情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">入居者連絡先</label>
                <input type="tel" name="resident_contact" value={formData.resident_contact} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex items-center pt-7">
                <label className="flex items-center">
                  <input type="checkbox" name="line_available" checked={formData.line_available} onChange={handleChange} className="mr-2" />
                  <span className="text-sm font-medium text-gray-700">LINE利用可能</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">緊急連絡先</label>
                <input type="tel" name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">緊急連絡先氏名</label>
                <input type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">続柄</label>
                <input type="text" name="relationship" value={formData.relationship} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
          
          {/* サポート情報 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">サポート情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">見守りシステム</label>
                <input type="text" name="monitoring_system" value={formData.monitoring_system} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">支援機関/医療機関</label>
                <input type="text" name="support_medical_institution" value={formData.support_medical_institution} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="flex items-center"><input type="checkbox" name="proxy_payment_eligible" checked={formData.proxy_payment_eligible} onChange={handleChange} className="mr-2" /><span className="text-sm font-medium text-gray-700">代理納付該当</span></label>
              </div>
              <div>
                <label className="flex items-center"><input type="checkbox" name="welfare_recipient" checked={formData.welfare_recipient} onChange={handleChange} className="mr-2" /><span className="text-sm font-medium text-gray-700">生活保護受給者</span></label>
              </div>
              <div>
                <label className="flex items-center"><input type="checkbox" name="posthumous_affairs" checked={formData.posthumous_affairs} onChange={handleChange} className="mr-2" /><span className="text-sm font-medium text-gray-700">死後事務委任</span></label>
              </div>
            </div>
          </div>
          
          {/* 備考 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">備考</h3>
            <div>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="その他の備考事項があれば記入してください" />
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? '作成中...' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewUserModal