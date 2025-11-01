//src/components/SupportPlanForm.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createSupportPlan, updateSupportPlan } from '@/app/actions/supportPlans'
import { getStaffForSelection } from '@/app/actions/staff' // ★ 変更点: スタッフ取得用のServer Actionをインポート
import { Database } from '@/types/database'
import { calculateAge } from '@/utils/date'

// 型エイリアス
type User = Database['public']['Tables']['users']['Row']
type SupportPlan = Database['public']['Tables']['support_plans']['Row']
type SupportPlanInsert = Database['public']['Tables']['support_plans']['Insert']
type SupportPlanUpdate = Partial<Database['public']['Tables']['support_plans']['Update']>
type Staff = { id: string; name: string | null } // ★ 変更点: Staffの型を定義

interface SupportPlanFormProps {
  editMode?: boolean
  supportPlan?: SupportPlan
  users: User[]
}

const SupportPlanForm: React.FC<SupportPlanFormProps> = ({ editMode = false, supportPlan, users }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [staffList, setStaffList] = useState<Staff[]>([]) // ★ 変更点: スタッフリスト用のstateを追加
  
  // ★ 変更点: フォームのstateから staff_name を削除し、staff_id を追加
  const [formData, setFormData] = useState({
    user_id: '',
    creation_date: new Date().toISOString().split('T')[0],
    staff_id: '', // staff_name から staff_id へ変更
    name: '',
    furigana: '',
    birth_date: '',
    residence: '',
    phone_mobile: '',
    line_available: false,
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
    outpatient_care: false,
    outpatient_institution: '',
    visiting_medical: false,
    visiting_medical_institution: '',
    home_oxygen: false,
    physical_disability_level: '',
    mental_disability_level: '',
    therapy_certificate_level: '',
    pension_national: false,
    pension_employee: false,
    pension_disability: false,
    pension_survivor: false,
    pension_corporate: false,
    pension_other: false,
    pension_other_details: '',
    monitoring_secom: false,
    monitoring_secom_details: '',
    monitoring_hello_light: false,
    monitoring_hello_light_details: '',
    support_shopping: false,
    support_bank_visit: false,
    support_cleaning: false,
    support_bulb_change: false,
    support_garbage_disposal: false,
    goals: '',
    needs_financial: '',
    needs_physical: '',
    needs_mental: '',
    needs_lifestyle: '',
    needs_environment: '',
    evacuation_plan_completed: false,
    evacuation_plan_other_details: ''
  })

  // ★ 変更点: スタッフリストを取得するuseEffectを追加
  useEffect(() => {
    const fetchStaff = async () => {
      const result = await getStaffForSelection();
      if (result.success && result.data) {
        if (result.data.length > 0) {
          setStaffList(result.data);
        } else {
          setError('担当者が登録されていません。');
        }
      } else {
        console.error('Failed to fetch staff list:', result.error);
        setError('担当者リストの読み込み中にエラーが発生しました。');
      }
    };
    fetchStaff();
  }, []);

  // ★ 変更点: 既存のuseEffectを、staff_idを扱うように修正
  useEffect(() => {
    if (editMode && supportPlan) {
      setFormData({
        user_id: supportPlan.user_id,
        creation_date: supportPlan.creation_date.split('T')[0],
        staff_id: supportPlan.staff_id || '', // staff_name を staff_id に変更
        name: supportPlan.name,
        furigana: supportPlan.furigana,
        birth_date: supportPlan.birth_date.split('T')[0],
        residence: supportPlan.residence,
        phone_mobile: supportPlan.phone_mobile || '',
        line_available: supportPlan.line_available || false,
        welfare_recipient: supportPlan.welfare_recipient || false,
        welfare_worker: supportPlan.welfare_worker || '',
        welfare_contact: supportPlan.welfare_contact || '',
        care_level_independent: supportPlan.care_level_independent || false,
        care_level_support1: supportPlan.care_level_support1 || false,
        care_level_support2: supportPlan.care_level_support2 || false,
        care_level_care1: supportPlan.care_level_care1 || false,
        care_level_care2: supportPlan.care_level_care2 || false,
        care_level_care3: supportPlan.care_level_care3 || false,
        care_level_care4: supportPlan.care_level_care4 || false,
        care_level_care5: supportPlan.care_level_care5 || false,
        outpatient_care: supportPlan.outpatient_care || false,
        outpatient_institution: supportPlan.outpatient_institution || '',
        visiting_medical: supportPlan.visiting_medical || false,
        visiting_medical_institution: supportPlan.visiting_medical_institution || '',
        home_oxygen: supportPlan.home_oxygen || false,
        physical_disability_level: supportPlan.physical_disability_level || '',
        mental_disability_level: supportPlan.mental_disability_level || '',
        therapy_certificate_level: supportPlan.therapy_certificate_level || '',
        pension_national: supportPlan.pension_national || false,
        pension_employee: supportPlan.pension_employee || false,
        pension_disability: supportPlan.pension_disability || false,
        pension_survivor: supportPlan.pension_survivor || false,
        pension_corporate: supportPlan.pension_corporate || false,
        pension_other: supportPlan.pension_other || false,
        pension_other_details: supportPlan.pension_other_details || '',
        monitoring_secom: supportPlan.monitoring_secom || false,
        monitoring_secom_details: supportPlan.monitoring_secom_details || '',
        monitoring_hello_light: supportPlan.monitoring_hello_light || false,
        monitoring_hello_light_details: supportPlan.monitoring_hello_light_details || '',
        support_shopping: supportPlan.support_shopping || false,
        support_bank_visit: supportPlan.support_bank_visit || false,
        support_cleaning: supportPlan.support_cleaning || false,
        support_bulb_change: supportPlan.support_bulb_change || false,
        support_garbage_disposal: supportPlan.support_garbage_disposal || false,
        goals: supportPlan.goals || '',
        needs_financial: supportPlan.needs_financial || '',
        needs_physical: supportPlan.needs_physical || '',
        needs_mental: supportPlan.needs_mental || '',
        needs_lifestyle: supportPlan.needs_lifestyle || '',
        needs_environment: supportPlan.needs_environment || '',
        evacuation_plan_completed: supportPlan.evacuation_plan_completed || false,
        evacuation_plan_other_details: supportPlan.evacuation_plan_other_details || '',
      });
    }
  }, [editMode, supportPlan]);

  const handleUserChange = (userId: string) => {
    if (editMode) return;
    
    const selectedUser = users.find(user => user.id === userId)
    if (selectedUser) {
      setFormData(prev => ({
        ...prev,
        user_id: userId,
        name: selectedUser.name,
        furigana: selectedUser.name, // 暫定で名前を入れる
        birth_date: selectedUser.birth_date ? selectedUser.birth_date.split('T')[0] : '',
        residence: selectedUser.property_address || '',
        phone_mobile: selectedUser.resident_contact || ''
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        user_id: '',
        name: '',
        furigana: '',
        birth_date: '',
        residence: '',
        phone_mobile: ''
      }))
    }
  }

  const calculatedAge = useMemo(() => {
    if (formData.birth_date) {
      try {
        return calculateAge(formData.birth_date)
      } 
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      catch (e) {
        return null
      }
    }
    return null
  }, [formData.birth_date])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  // ★ 変更点: handleSubmitを、staff_idを扱うように修正
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.user_id) { setError('利用者を選択してください'); return; }
    if (!formData.staff_id) { setError('担当スタッフを選択してください'); return; } // staff_name を staff_id に変更
    if (!formData.name.trim()) { setError('利用者名を入力してください'); return; }

    setLoading(true);
    setError(null);
      
    try {
      // ★ 変更点: commonDataから staff_name を削除し、staff_id を追加
      const commonData: Omit<SupportPlanInsert, 'user_id' | 'id' | 'created_at' | 'updated_at' | 'staff_name'> & { staff_id: string } = {
        creation_date: formData.creation_date,
        staff_id: formData.staff_id, // staff_name を staff_id に変更
        name: formData.name,
        furigana: formData.furigana,
        birth_date: formData.birth_date,
        residence: formData.residence,
        phone_mobile: formData.phone_mobile.trim() || null,
        line_available: formData.line_available,
        welfare_recipient: formData.welfare_recipient,
        welfare_worker: formData.welfare_worker.trim() || null,
        welfare_contact: formData.welfare_contact.trim() || null,
        care_level_independent: formData.care_level_independent,
        care_level_support1: formData.care_level_support1,
        care_level_support2: formData.care_level_support2,
        care_level_care1: formData.care_level_care1,
        care_level_care2: formData.care_level_care2,
        care_level_care3: formData.care_level_care3,
        care_level_care4: formData.care_level_care4,
        care_level_care5: formData.care_level_care5,
        outpatient_care: formData.outpatient_care,
        outpatient_institution: formData.outpatient_institution.trim() || null,
        visiting_medical: formData.visiting_medical,
        visiting_medical_institution: formData.visiting_medical_institution.trim() || null,
        home_oxygen: formData.home_oxygen,
        physical_disability_level: formData.physical_disability_level.trim() || null,
        mental_disability_level: formData.mental_disability_level.trim() || null,
        therapy_certificate_level: formData.therapy_certificate_level.trim() || null,
        pension_national: formData.pension_national,
        pension_employee: formData.pension_employee,
        pension_disability: formData.pension_disability,
        pension_survivor: formData.pension_survivor,
        pension_corporate: formData.pension_corporate,
        pension_other: formData.pension_other,
        pension_other_details: formData.pension_other_details.trim() || null,
        monitoring_secom: formData.monitoring_secom,
        monitoring_secom_details: formData.monitoring_secom_details.trim() || null,
        monitoring_hello_light: formData.monitoring_hello_light,
        monitoring_hello_light_details: formData.monitoring_hello_light_details.trim() || null,
        support_shopping: formData.support_shopping,
        support_bank_visit: formData.support_bank_visit,
        support_cleaning: formData.support_cleaning,
        support_bulb_change: formData.support_bulb_change,
        support_garbage_disposal: formData.support_garbage_disposal,
        goals: formData.goals.trim() || null,
        needs_financial: formData.needs_financial.trim() || null,
        needs_physical: formData.needs_physical.trim() || null,
        needs_mental: formData.needs_mental.trim() || null,
        needs_lifestyle: formData.needs_lifestyle.trim() || null,
        needs_environment: formData.needs_environment.trim() || null,
        evacuation_plan_completed: formData.evacuation_plan_completed,
        evacuation_plan_other_details: formData.evacuation_plan_other_details.trim() || null
      };
      
      if (editMode && supportPlan) {
        const updatePayload: SupportPlanUpdate = commonData;
        const result = await updateSupportPlan(supportPlan.id, updatePayload);
        if (!result.success) {
          throw new Error(result.error || '更新に失敗しました。');
        }
        router.push(`/support-plans/${supportPlan.id}`);
      } else {
        const createPayload: SupportPlanInsert = { ...commonData, user_id: formData.user_id };
        const result = await createSupportPlan(createPayload);
        if (!result.success) {
          throw new Error(result.error || '作成に失敗しました。');
        }
        router.push('/support-plans');
      }

    } catch (err) {
      console.error("保存エラー詳細:", err);
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
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
            <label className="block text-sm font-medium text-gray-700 mb-1">利用者選択 <span className="text-red-500">*</span></label>
            <select
              name="user_id"
              value={formData.user_id}
              onChange={(e) => handleUserChange(e.target.value)}
              required
              disabled={editMode || loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">利用者を選択してください</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name} (UID: {user.uid})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">作成日 <span className="text-red-500">*</span></label>
            <input type="date" name="creation_date" value={formData.creation_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            {/* ★ 変更点: input を select に完全に置換 */}
            <label htmlFor="staff_id" className="block text-sm font-medium text-gray-700 mb-1">担当スタッフ <span className="text-red-500">*</span></label>
            <select
              id="staff_id"
              name="staff_id"
              value={formData.staff_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>担当者を選択してください</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">氏名 <span className="text-red-500">*</span></label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">フリガナ <span className="text-red-500">*</span></label>
            <input type="text" name="furigana" value={formData.furigana} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">生年月日 <span className="text-red-500">*</span></label>
            <div className="flex items-center space-x-2">
              <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              {calculatedAge !== null && (<span className="text-gray-600">年齢: {calculatedAge}歳</span>)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">居住場所 <span className="text-red-500">*</span></label>
            <input type="text" name="residence" value={formData.residence} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-md font-medium text-gray-800 mb-2">連絡先</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">携帯電話番号</label>
              <input type="tel" name="phone_mobile" value={formData.phone_mobile} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center">
                <input type="checkbox" name="line_available" checked={formData.line_available} onChange={handleChange} className="mr-2" />
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
            <label className="block text-sm font-medium text-gray-700 mb-2">生活保護受給</label>
            <div className="flex space-x-4">
              <label className="flex items-center"><input type="radio" name="welfare_recipient" checked={formData.welfare_recipient === true} onChange={() => setFormData(prev => ({ ...prev, welfare_recipient: true }))} className="mr-1" /><span className="text-gray-700">有</span></label>
              <label className="flex items-center"><input type="radio" name="welfare_recipient" checked={formData.welfare_recipient === false} onChange={() => setFormData(prev => ({ ...prev, welfare_recipient: false }))} className="mr-1" /><span className="text-gray-700">無</span></label>
            </div>
          </div>
          {formData.welfare_recipient && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">担当CW</label>
                <input type="text" name="welfare_worker" value={formData.welfare_worker} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CW連絡先</label>
                <input type="text" name="welfare_contact" value={formData.welfare_contact} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">介護保険認定区分（複数選択可）</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { key: 'care_level_independent', label: '自立' }, { key: 'care_level_support1', label: '要支援1' }, { key: 'care_level_support2', label: '要支援2' }, { key: 'care_level_care1', label: '要介護1' }, { key: 'care_level_care2', label: '要介護2' }, { key: 'care_level_care3', label: '要介護3' }, { key: 'care_level_care4', label: '要介護4' }, { key: 'care_level_care5', label: '要介護5' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center">
                  <input type="checkbox" name={key} checked={formData[key as keyof typeof formData] as boolean} onChange={handleChange} className="mr-2" />
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
            <label className="block text-sm font-medium text-gray-700 mb-2">通院・訪問診療</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <label className="flex items-center"><input type="checkbox" name="outpatient_care" checked={formData.outpatient_care} onChange={handleChange} className="mr-2" /><span className="text-gray-700">通院</span></label>
                {formData.outpatient_care && (<input type="text" name="outpatient_institution" value={formData.outpatient_institution} onChange={handleChange} placeholder="医療機関名（通院）" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700" />)}
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center"><input type="checkbox" name="visiting_medical" checked={formData.visiting_medical} onChange={handleChange} className="mr-2" /><span className="text-gray-700">訪問診療</span></label>
                {formData.visiting_medical && (<input type="text" name="visiting_medical_institution" value={formData.visiting_medical_institution} onChange={handleChange} placeholder="医療機関名（訪問診療）" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700" />)}
              </div>
              <label className="flex items-center"><input type="checkbox" name="home_oxygen" checked={formData.home_oxygen} onChange={handleChange} className="mr-2" /><span className="text-gray-700">在宅酸素</span></label>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 障がい状況 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">4. 障がい状況</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">身体障がい（等級）</label>
            <input type="text" name="physical_disability_level" value={formData.physical_disability_level} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">精神障がい（等級）</label>
            <input type="text" name="mental_disability_level" value={formData.mental_disability_level} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">療育手帳（等級/区分）</label>
            <input type="text" name="therapy_certificate_level" value={formData.therapy_certificate_level} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* 5. 年金状況 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">5. 年金状況</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">年金の種類（複数選択可）</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { key: 'pension_national', label: '国民年金' }, { key: 'pension_employee', label: '厚生年金' }, { key: 'pension_disability', label: '障害年金' }, { key: 'pension_survivor', label: '遺族年金' }, { key: 'pension_corporate', label: '企業年金' }, { key: 'pension_other', label: 'その他' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center">
                  <input type="checkbox" name={key} checked={formData[key as keyof typeof formData] as boolean} onChange={handleChange} className="mr-2" />
                  <span className="text-sm text-gray-800">{label}</span>
                </label>
              ))}
            </div>
          </div>
          {formData.pension_other && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">その他の年金 詳細</label>
              <input type="text" name="pension_other_details" value={formData.pension_other_details} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
        </div>
      </div>

      {/* 6. 生活支援サービス */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">6. 生活支援サービス</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">見守りサービス</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <label className="flex items-center"><input type="checkbox" name="monitoring_secom" checked={formData.monitoring_secom} onChange={handleChange} className="mr-2" /><span className="text-gray-700">セコム</span></label>
                {formData.monitoring_secom && (<input type="text" name="monitoring_secom_details" value={formData.monitoring_secom_details} onChange={handleChange} placeholder="具体的なサービス名（セコム）" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" />)}
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center"><input type="checkbox" name="monitoring_hello_light" checked={formData.monitoring_hello_light} onChange={handleChange} className="mr-2" /><span className="text-gray-700">ハローライト</span></label>
                {formData.monitoring_hello_light && (<input type="text" name="monitoring_hello_light_details" value={formData.monitoring_hello_light_details} onChange={handleChange} placeholder="詳細（ハローライト）" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm" />)}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">生活支援サービス（必要なものにチェック）</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { key: 'support_shopping', label: '買い物' }, { key: 'support_bank_visit', label: '外出支援（金融機関）' }, { key: 'support_cleaning', label: '掃除・片付け' }, { key: 'support_bulb_change', label: '電球交換' }, { key: 'support_garbage_disposal', label: 'ゴミ捨て' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center">
                  <input type="checkbox" name={key} checked={formData[key as keyof typeof formData] as boolean} onChange={handleChange} className="mr-2" />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">目標</label>
            <textarea name="goals" value={formData.goals} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-3">ニーズ（課題）と対応</h3>
            <div className="space-y-4">
              {[
                { key: 'needs_financial', label: '金銭' }, { key: 'needs_physical', label: '身体状況' }, { key: 'needs_mental', label: '精神状況' }, { key: 'needs_lifestyle', label: '生活状況' }, { key: 'needs_environment', label: '生活環境' }
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <textarea name={key} value={formData[key as keyof typeof formData] as string} onChange={handleChange} rows={2} placeholder={`${label}に関する課題や対応策を入力してください`} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
            <label className="block text-sm font-medium text-gray-700 mb-2">別紙の対応</label>
            <div className="flex space-x-4">
              <label className="flex items-center"><input type="radio" name="evacuation_plan_completed" checked={formData.evacuation_plan_completed === true} onChange={() => setFormData(prev => ({ ...prev, evacuation_plan_completed: true }))} className="mr-1" /><span className="text-gray-700">済</span></label>
              <label className="flex items-center"><input type="radio" name="evacuation_plan_completed" checked={formData.evacuation_plan_completed === false} onChange={() => setFormData(prev => ({ ...prev, evacuation_plan_completed: false }))} className="mr-1" /><span className="text-gray-700">未了</span></label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">その他の詳細</label>
            <textarea name="evacuation_plan_other_details" value={formData.evacuation_plan_other_details} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* 送信ボタン */}
      <div className="flex justify-end space-x-3">
        <button type="button" onClick={() => router.back()} className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500">キャンセル</button>
        <button type="submit" disabled={loading} className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50">
          {loading ? (editMode ? '更新中...' : '作成中...') : (editMode ? '更新' : '作成')}
        </button>
      </div>
    </form>
  )
}

export default SupportPlanForm