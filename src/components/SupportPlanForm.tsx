'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supportPlansApi, usersApi } from '@/lib/api'
import { User } from '@/types/database'

const SupportPlanForm: React.FC = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  
  const [formData, setFormData] = useState({
    // 1. 基本情報
    user_id: '',
    creation_date: new Date().toISOString().split('T')[0],
    staff_name: '',
    name: '',
    furigana: '',
    birth_date: '',
    residence: '',
    phone_mobile: '',
    line_available: false,
    
    // 2. 生活保護・介護保険
    welfare_recipient: false,
    welfare_worker: '',
    welfare_contact: '',
    
    care_level_independent: false,
    care_level_support1: false,
    care_level_support2: false,
    care_level_care1: false,
    care_level_care2: false,
    care_level_care3: false,
    care_level_care4: false,
    care_level_care5: false,
    
    // 3. 医療状況
    outpatient_care: false,
    outpatient_institution: '',
    visiting_medical: false,
    visiting_medical_institution: '',
    home_oxygen: false,
    
    // 4. 障がい状況
    physical_disability_level: '',
    mental_disability_level: '',
    therapy_certificate_level: '',
    
    // 5. 年金状況
    pension_national: false,
    pension_employee: false,
    pension_disability: false,
    pension_survivor: false,
    pension_corporate: false,
    pension_other: false,
    pension_other_details: '',
    
    // 6. 生活支援サービス
    monitoring_secom: false,
    monitoring_secom_details: '',
    monitoring_hello_light: false,
    monitoring_hello_light_details: '',
    
    support_shopping: false,
    support_bank_visit: false,
    support_cleaning: false,
    support_bulb_change: false,
    support_garbage_disposal: false,
    
    // 7. 支援計画
    goals: '',
    needs_financial: '',
    needs_physical: '',
    needs_mental: '',
    needs_lifestyle: '',
    needs_environment: '',
    
    // 8. 個別避難計画
    evacuation_plan_completed: false,
    evacuation_plan_other_details: ''
  })

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await usersApi.getAll()
        setUsers(usersData)
      } catch (error) {
        console.error('利用者データの取得に失敗しました:', error)
      }
    }
    fetchUsers()
  }, [])

  const handleUserChange = (userId: string) => {
    const selectedUser = users.find(user => user.id === userId)
    if (selectedUser) {
      setFormData(prev => ({
        ...prev,
        user_id: userId,
        name: selectedUser.name,
        furigana: selectedUser.name,
        birth_date: selectedUser.birth_date || new Date().toISOString().split('T')[0],
        residence: selectedUser.property_address || '',
        phone_mobile: selectedUser.resident_contact || ''
      }))
    }
  }

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.user_id) {
      setError('利用者を選択してください')
      return
    }
    
    if (!formData.staff_name.trim()) {
      setError('担当スタッフ名を入力してください')
      return
    }
    
    if (!formData.name.trim()) {
      setError('利用者名を入力してください')
      return
    }
    
    if (!formData.furigana.trim()) {
      setError('フリガナを入力してください')
      return
    }
    
    if (!formData.birth_date) {
      setError('生年月日を入力してください')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const age = calculateAge(formData.birth_date)
      
      const supportPlanData = {
        ...formData,
        age,
        staff_name: formData.staff_name.trim(),
        name: formData.name.trim(),
        furigana: formData.furigana.trim(),
        residence: formData.residence.trim() || null,
        phone_mobile: formData.phone_mobile.trim() || null,
        welfare_worker: formData.welfare_worker.trim() || null,
        welfare_contact: formData.welfare_contact.trim() || null,
        outpatient_institution: formData.outpatient_institution.trim() || null,
        visiting_medical_institution: formData.visiting_medical_institution.trim() || null,
        physical_disability_level: formData.physical_disability_level.trim() || null,
        mental_disability_level: formData.mental_disability_level.trim() || null,
        therapy_certificate_level: formData.therapy_certificate_level.trim() || null,
        pension_other_details: formData.pension_other_details.trim() || null,
        monitoring_secom_details: formData.monitoring_secom_details.trim() || null,
        monitoring_hello_light_details: formData.monitoring_hello_light_details.trim() || null,
        goals: formData.goals.trim() || null,
        needs_financial: formData.needs_financial.trim() || null,
        needs_physical: formData.needs_physical.trim() || null,
        needs_mental: formData.needs_mental.trim() || null,
        needs_lifestyle: formData.needs_lifestyle.trim() || null,
        needs_environment: formData.needs_environment.trim() || null,
        evacuation_plan_other_details: formData.evacuation_plan_other_details.trim() || null
      }
      
      await supportPlansApi.create(supportPlanData)
      router.push('/support-plans')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-500 text-sm">{error}</div>
        </div>
      )}

      {/* 1. 基本情報 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">1. 基本情報</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              利用者選択 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.user_id}
              onChange={(e) => handleUserChange(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">利用者を選択してください</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} (UID: {user.uid})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              作成日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.creation_date}
              onChange={(e) => setFormData(prev => ({ ...prev, creation_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              担当スタッフ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.staff_name}
              onChange={(e) => setFormData(prev => ({ ...prev, staff_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              氏名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              フリガナ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.furigana}
              onChange={(e) => setFormData(prev => ({ ...prev, furigana: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              生年月日 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {formData.birth_date && (
                <span className="text-gray-600">年齢: {calculateAge(formData.birth_date)}歳</span>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              居住場所 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.residence}
              onChange={(e) => setFormData(prev => ({ ...prev, residence: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-md font-medium text-gray-800 mb-2">連絡先</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                携帯電話番号
              </label>
              <input
                type="tel"
                value={formData.phone_mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, phone_mobile: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.line_available}
                  onChange={(e) => setFormData(prev => ({ ...prev, line_available: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">LINE</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 生活保護・介護保険 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">2. 生活保護・介護保険</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              生活保護受給
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="welfare_recipient"
                  checked={formData.welfare_recipient === true}
                  onChange={() => setFormData(prev => ({ ...prev, welfare_recipient: true }))}
                  className="mr-1"
                />
                <span>有</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="welfare_recipient"
                  checked={formData.welfare_recipient === false}
                  onChange={() => setFormData(prev => ({ ...prev, welfare_recipient: false }))}
                  className="mr-1"
                />
                <span>無</span>
              </label>
            </div>
          </div>
          
          {formData.welfare_recipient && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  担当CW
                </label>
                <input
                  type="text"
                  value={formData.welfare_worker}
                  onChange={(e) => setFormData(prev => ({ ...prev, welfare_worker: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CW連絡先
                </label>
                <input
                  type="text"
                  value={formData.welfare_contact}
                  onChange={(e) => setFormData(prev => ({ ...prev, welfare_contact: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              介護保険認定区分（複数選択可）
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { key: 'care_level_independent', label: '自立' },
                { key: 'care_level_support1', label: '要支援1' },
                { key: 'care_level_support2', label: '要支援2' },
                { key: 'care_level_care1', label: '要介護1' },
                { key: 'care_level_care2', label: '要介護2' },
                { key: 'care_level_care3', label: '要介護3' },
                { key: 'care_level_care4', label: '要介護4' },
                { key: 'care_level_care5', label: '要介護5' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData[key as keyof typeof formData] as boolean}
                    onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-800">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. 医療状況 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">3. 医療状況</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              通院・訪問診療
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.outpatient_care}
                    onChange={(e) => setFormData(prev => ({ ...prev, outpatient_care: e.target.checked }))}
                    className="mr-2"
                  />
                  <span>通院</span>
                </label>
                {formData.outpatient_care && (
                  <input
                    type="text"
                    value={formData.outpatient_institution}
                    onChange={(e) => setFormData(prev => ({ ...prev, outpatient_institution: e.target.value }))}
                    placeholder="医療機関名（通院）"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.visiting_medical}
                    onChange={(e) => setFormData(prev => ({ ...prev, visiting_medical: e.target.checked }))}
                    className="mr-2"
                  />
                  <span>訪問診療</span>
                </label>
                {formData.visiting_medical && (
                  <input
                    type="text"
                    value={formData.visiting_medical_institution}
                    onChange={(e) => setFormData(prev => ({ ...prev, visiting_medical_institution: e.target.value }))}
                    placeholder="医療機関名（訪問診療）"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                )}
              </div>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.home_oxygen}
                  onChange={(e) => setFormData(prev => ({ ...prev, home_oxygen: e.target.checked }))}
                  className="mr-2"
                />
                <span>在宅酸素</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 障がい状況 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">4. 障がい状況</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              身体障がい（等級）
            </label>
            <input
              type="text"
              value={formData.physical_disability_level}
              onChange={(e) => setFormData(prev => ({ ...prev, physical_disability_level: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              精神障がい（等級）
            </label>
            <input
              type="text"
              value={formData.mental_disability_level}
              onChange={(e) => setFormData(prev => ({ ...prev, mental_disability_level: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              療育手帳（等級/区分）
            </label>
            <input
              type="text"
              value={formData.therapy_certificate_level}
              onChange={(e) => setFormData(prev => ({ ...prev, therapy_certificate_level: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 5. 年金状況 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">5. 年金状況</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              年金の種類（複数選択可）
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { key: 'pension_national', label: '国民年金' },
                { key: 'pension_employee', label: '厚生年金' },
                { key: 'pension_disability', label: '障害年金' },
                { key: 'pension_survivor', label: '遺族年金' },
                { key: 'pension_corporate', label: '企業年金' },
                { key: 'pension_other', label: 'その他' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData[key as keyof typeof formData] as boolean}
                    onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-800">{label}</span>
                </label>
              ))}
            </div>
          </div>
          
          {formData.pension_other && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                その他の年金 詳細
              </label>
              <input
                type="text"
                value={formData.pension_other_details}
                onChange={(e) => setFormData(prev => ({ ...prev, pension_other_details: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* 6. 生活支援サービス */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">6. 生活支援サービス</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              見守りサービス
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.monitoring_secom}
                    onChange={(e) => setFormData(prev => ({ ...prev, monitoring_secom: e.target.checked }))}
                    className="mr-2"
                  />
                  <span>セコム</span>
                </label>
                {formData.monitoring_secom && (
                  <input
                    type="text"
                    value={formData.monitoring_secom_details}
                    onChange={(e) => setFormData(prev => ({ ...prev, monitoring_secom_details: e.target.value }))}
                    placeholder="具体的なサービス名（セコム）"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.monitoring_hello_light}
                    onChange={(e) => setFormData(prev => ({ ...prev, monitoring_hello_light: e.target.checked }))}
                    className="mr-2"
                  />
                  <span>ハローライト</span>
                </label>
                {formData.monitoring_hello_light && (
                  <input
                    type="text"
                    value={formData.monitoring_hello_light_details}
                    onChange={(e) => setFormData(prev => ({ ...prev, monitoring_hello_light_details: e.target.value }))}
                    placeholder="詳細（ハローライト）"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                )}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              生活支援サービス（必要なものにチェック）
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { key: 'support_shopping', label: '買い物' },
                { key: 'support_bank_visit', label: '外出支援（金融機関）' },
                { key: 'support_cleaning', label: '掃除・片付け' },
                { key: 'support_bulb_change', label: '電球交換' },
                { key: 'support_garbage_disposal', label: 'ゴミ捨て' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData[key as keyof typeof formData] as boolean}
                    onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-800">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 7. 支援計画 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">7. 支援計画</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              目標
            </label>
            <textarea
              value={formData.goals}
              onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">ニーズ（課題）と対応</h3>
            <div className="space-y-4">
              {[
                { key: 'needs_financial', label: '金銭' },
                { key: 'needs_physical', label: '身体状況' },
                { key: 'needs_mental', label: '精神状況' },
                { key: 'needs_lifestyle', label: '生活状況' },
                { key: 'needs_environment', label: '生活環境' }
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <textarea
                    value={formData[key as keyof typeof formData] as string}
                    onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                    rows={2}
                    placeholder={`${label}に関する課題や対応策を入力してください`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 8. 個別避難計画 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">8. 個別避難計画</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              別紙の対応
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="evacuation_plan_completed"
                  checked={formData.evacuation_plan_completed === true}
                  onChange={() => setFormData(prev => ({ ...prev, evacuation_plan_completed: true }))}
                  className="mr-1"
                />
                <span>済</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="evacuation_plan_completed"
                  checked={formData.evacuation_plan_completed === false}
                  onChange={() => setFormData(prev => ({ ...prev, evacuation_plan_completed: false }))}
                  className="mr-1"
                />
                <span>未了</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              その他の詳細
            </label>
            <textarea
              value={formData.evacuation_plan_other_details}
              onChange={(e) => setFormData(prev => ({ ...prev, evacuation_plan_other_details: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 送信ボタン */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {loading ? '作成中...' : '作成'}
        </button>
      </div>
    </form>
  )
}

export default SupportPlanForm