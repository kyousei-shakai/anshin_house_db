// src/components/UserEditForm.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateUser, createUser } from '@/app/actions/users'
import { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']
// type UserUpdate = Partial<Database['public']['Tables']['users']['Update']> // ★ 修正点: この行を削除
type UserInsert = Omit<Database['public']['Tables']['users']['Insert'], 'uid' | 'id' | 'created_at' | 'updated_at'>

interface UserEditFormProps {
  user?: User
  editMode: boolean
}

const UserEditForm: React.FC<UserEditFormProps> = ({ user, editMode }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    gender: '' as 'male' | 'female' | 'other' | '',
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
    posthumous_affairs: false,
    registered_at: ''
  })

  useEffect(() => {
    if (editMode && user) {
      setFormData({
        name: user.name || '',
        birth_date: user.birth_date?.split('T')[0] || '',
        gender: user.gender as 'male' | 'female' | 'other' | '' || '',
        property_address: user.property_address || '',
        property_name: user.property_name || '',
        room_number: user.room_number || '',
        intermediary: user.intermediary || '',
        deposit: user.deposit?.toString() || '',
        key_money: user.key_money?.toString() || '',
        rent: user.rent?.toString() || '',
        fire_insurance: user.fire_insurance?.toString() || '',
        common_fee: user.common_fee?.toString() || '',
        landlord_rent: user.landlord_rent?.toString() || '',
        landlord_common_fee: user.landlord_common_fee?.toString() || '',
        rent_difference: user.rent_difference?.toString() || '',
        move_in_date: user.move_in_date?.split('T')[0] || '',
        next_renewal_date: user.next_renewal_date?.split('T')[0] || '',
        renewal_count: user.renewal_count?.toString() || '',
        resident_contact: user.resident_contact || '',
        line_available: user.line_available || false,
        emergency_contact: user.emergency_contact || '',
        emergency_contact_name: user.emergency_contact_name || '',
        relationship: user.relationship || '',
        monitoring_system: user.monitoring_system || '',
        support_medical_institution: user.support_medical_institution || '',
        notes: user.notes || '',
        proxy_payment_eligible: user.proxy_payment_eligible || false,
        welfare_recipient: user.welfare_recipient || false,
        posthumous_affairs: user.posthumous_affairs || false,
        registered_at: user.registered_at?.split('T')[0] || ''
      })
    } else if (!editMode) {
      setFormData(prev => ({ ...prev, registered_at: new Date().toISOString().split('T')[0] }));
    }
  }, [user, editMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('氏名は必須です')
      return
    }

    setLoading(true)
    setError(null)
      
    try {
      const userData = {
        name: formData.name.trim(),
        birth_date: formData.birth_date || null,
        gender: formData.gender || null,
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
        posthumous_affairs: formData.posthumous_affairs,
        registered_at: formData.registered_at || undefined
      }
      
      if (editMode && user) {
        const result = await updateUser(user.uid, userData);
        if (!result.success) {
          throw new Error(result.error || '更新に失敗しました。');
        }
        alert('利用者情報を更新しました。');
        router.push(`/users/${user.uid}`);
      } else {
        const result = await createUser(userData as UserInsert, null);
        if (!result.success || !result.data) {
          throw new Error(result.error || '作成に失敗しました。');
        }
        alert('新規利用者を登録しました。');
        router.push(`/users/${result.data.uid}`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
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
  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          {editMode ? '利用者情報編集' : '新規利用者追加'}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {editMode ? '利用者の基本情報を編集します。' : '新しい利用者をシステムに登録します。'}
        </p>
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
            {editMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UID</label>
                <input type="text" value={user?.uid || ''} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-gray-100 focus:outline-none" />
              </div>
            )}
            <div className={editMode ? '' : 'md:col-span-1'}>
              <label className="block text-sm font-medium text-gray-700 mb-1">氏名 <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">生年月日</label>
              <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">選択してください</option>
                <option value="male">男性</option>
                <option value="female">女性</option>
                <option value="other">その他</option>
              </select>
            </div>
          </div>
        </div>

        {/* 物件情報 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">物件情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">物件住所</label><input type="text" name="property_address" value={formData.property_address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">物件名</label><input type="text" name="property_name" value={formData.property_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">部屋番号</label><input type="text" name="room_number" value={formData.room_number} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">仲介</label><input type="text" name="intermediary" value={formData.intermediary} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
        </div>

        {/* 費用情報 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">費用情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">敷金（円）</label><input type="number" name="deposit" value={formData.deposit} onChange={handleChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">礼金（円）</label><input type="number" name="key_money" value={formData.key_money} onChange={handleChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">家賃（円）</label><input type="number" name="rent" value={formData.rent} onChange={handleChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">火災保険（円）</label><input type="number" name="fire_insurance" value={formData.fire_insurance} onChange={handleChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">共益費（円）</label><input type="number" name="common_fee" value={formData.common_fee} onChange={handleChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">大家家賃（円）</label><input type="number" name="landlord_rent" value={formData.landlord_rent} onChange={handleChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">大家共益費（円）</label><input type="number" name="landlord_common_fee" value={formData.landlord_common_fee} onChange={handleChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">家賃差額（円）</label><input type="number" name="rent_difference" value={formData.rent_difference} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
        </div>

        {/* 入居情報 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">入居情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">入居日</label><input type="date" name="move_in_date" value={formData.move_in_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">次回更新年月日</label><input type="date" name="next_renewal_date" value={formData.next_renewal_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">更新回数</label><input type="number" name="renewal_count" value={formData.renewal_count} onChange={handleChange} min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
        </div>

        {/* 連絡先情報 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">連絡先情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">入居者連絡先</label><input type="tel" name="resident_contact" value={formData.resident_contact} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div className="pt-7"><label className="flex items-center"><input type="checkbox" name="line_available" checked={formData.line_available} onChange={handleChange} className="mr-2" /><span className="text-sm font-medium text-gray-700">LINE利用可能</span></label></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">緊急連絡先</label><input type="tel" name="emergency_contact" value={formData.emergency_contact} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">緊急連絡先氏名</label><input type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">続柄</label><input type="text" name="relationship" value={formData.relationship} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          </div>
        </div>

        {/* サポート情報 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">サポート情報</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">見守りシステム</label><input type="text" name="monitoring_system" value={formData.monitoring_system} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">支援機関/医療機関</label><input type="text" name="support_medical_institution" value={formData.support_medical_institution} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div className="pt-7"><label className="flex items-center"><input type="checkbox" name="proxy_payment_eligible" checked={formData.proxy_payment_eligible} onChange={handleChange} className="mr-2" /><span className="text-sm font-medium text-gray-700">代理納付該当</span></label></div>
            <div className="pt-7"><label className="flex items-center"><input type="checkbox" name="welfare_recipient" checked={formData.welfare_recipient} onChange={handleChange} className="mr-2" /><span className="text-sm font-medium text-gray-700">生活保護受給者</span></label></div>
            <div className="pt-7"><label className="flex items-center"><input type="checkbox" name="posthumous_affairs" checked={formData.posthumous_affairs} onChange={handleChange} className="mr-2" /><span className="text-sm font-medium text-gray-700">死後事務委任</span></label></div>
          </div>
        </div>

        {/* 備考 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">備考</h3>
          <div><textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="その他の備考事項があれば記入してください" /></div>
        </div>

        {/* システム情報 */}
        <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">システム情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        登録日
                    </label>
                    <input
                        type="date"
                        name="registered_at"
                        value={formData.registered_at}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                {editMode && (
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                          最終更新日時
                      </label>
                      <input 
                          type="text" 
                          value={user?.updated_at ? new Date(user.updated_at).toLocaleString('ja-JP') : '-'} 
                          readOnly 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-gray-100 focus:outline-none"
                      />
                  </div>
                )}
            </div>
        </div>

        {/* ボタン */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <button type="button" onClick={() => router.back()} className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm md:text-base">キャンセル</button>
          <button type="submit" disabled={loading} className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm md:text-base">
            {loading ? (editMode ? '保存中...' : '作成中...') : (editMode ? '保存' : '作成')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserEditForm