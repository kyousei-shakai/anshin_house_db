'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supportPlansApi, usersApi } from '@/lib/api'
// 👇 1. インポートを 'Database' 型に変更
import { Database } from '@/types/database'

// 👇 2. 新しい型定義から型エイリアスを作成
type User = Database['public']['Tables']['users']['Row']
type SupportPlanInsert = Database['public']['Tables']['support_plans']['Insert']
type SupportPlanUpdate = Partial<Database['public']['Tables']['support_plans']['Update']>


interface SupportPlanFormProps {
  editMode?: boolean
  supportPlanId?: string
}

const SupportPlanForm: React.FC<SupportPlanFormProps> = ({ editMode = false, supportPlanId }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  
  // フォームで扱うデータの state (文字列と boolean で管理)
  const [formData, setFormData] = useState({
    user_id: '',
    creation_date: new Date().toISOString().split('T')[0],
    staff_name: '',
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

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const usersData = await usersApi.getAll();
        setUsers(usersData);

        if (editMode && supportPlanId) {
          const planData = await supportPlansApi.getById(supportPlanId);
          // 👇 3. データベースから取得したデータでフォームを初期化
          if (planData) {
            setFormData({
              user_id: planData.user_id,
              creation_date: planData.creation_date.split('T')[0],
              staff_name: planData.staff_name,
              name: planData.name,
              furigana: planData.furigana,
              birth_date: planData.birth_date.split('T')[0],
              residence: planData.residence,
              phone_mobile: planData.phone_mobile || '',
              line_available: planData.line_available || false,
              welfare_recipient: planData.welfare_recipient || false,
              welfare_worker: planData.welfare_worker || '',
              welfare_contact: planData.welfare_contact || '',
              care_level_independent: planData.care_level_independent || false,
              care_level_support1: planData.care_level_support1 || false,
              care_level_support2: planData.care_level_support2 || false,
              care_level_care1: planData.care_level_care1 || false,
              care_level_care2: planData.care_level_care2 || false,
              care_level_care3: planData.care_level_care3 || false,
              care_level_care4: planData.care_level_care4 || false,
              care_level_care5: planData.care_level_care5 || false,
              outpatient_care: planData.outpatient_care || false,
              outpatient_institution: planData.outpatient_institution || '',
              visiting_medical: planData.visiting_medical || false,
              visiting_medical_institution: planData.visiting_medical_institution || '',
              home_oxygen: planData.home_oxygen || false,
              physical_disability_level: planData.physical_disability_level || '',
              mental_disability_level: planData.mental_disability_level || '',
              therapy_certificate_level: planData.therapy_certificate_level || '',
              pension_national: planData.pension_national || false,
              pension_employee: planData.pension_employee || false,
              pension_disability: planData.pension_disability || false,
              pension_survivor: planData.pension_survivor || false,
              pension_corporate: planData.pension_corporate || false,
              pension_other: planData.pension_other || false,
              pension_other_details: planData.pension_other_details || '',
              monitoring_secom: planData.monitoring_secom || false,
              monitoring_secom_details: planData.monitoring_secom_details || '',
              monitoring_hello_light: planData.monitoring_hello_light || false,
              monitoring_hello_light_details: planData.monitoring_hello_light_details || '',
              support_shopping: planData.support_shopping || false,
              support_bank_visit: planData.support_bank_visit || false,
              support_cleaning: planData.support_cleaning || false,
              support_bulb_change: planData.support_bulb_change || false,
              support_garbage_disposal: planData.support_garbage_disposal || false,
              goals: planData.goals || '',
              needs_financial: planData.needs_financial || '',
              needs_physical: planData.needs_physical || '',
              needs_mental: planData.needs_mental || '',
              needs_lifestyle: planData.needs_lifestyle || '',
              needs_environment: planData.needs_environment || '',
              evacuation_plan_completed: planData.evacuation_plan_completed || false,
              evacuation_plan_other_details: planData.evacuation_plan_other_details || '',
            });
          }
        }
      } catch (err) {
        console.error('データ取得に失敗しました:', err);
        setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [editMode, supportPlanId]);

  const handleUserChange = (userId: string) => {
    if (editMode) return;
    
    const selectedUser = users.find(user => user.id === userId)
    if (selectedUser) {
      setFormData(prev => ({
        ...prev,
        user_id: userId,
        name: selectedUser.name,
        furigana: selectedUser.name,
        birth_date: selectedUser.birth_date ? selectedUser.birth_date.split('T')[0] : '',
        residence: selectedUser.property_address || '',
        phone_mobile: selectedUser.resident_contact || ''
      }))
    }
  }

  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.user_id) { setError('利用者を選択してください'); return; }
    if (!formData.staff_name.trim()) { setError('担当スタッフ名を入力してください'); return; }
    if (!formData.name.trim()) { setError('利用者名を入力してください'); return; }
    if (!formData.furigana.trim()) { setError('フリガナを入力してください'); return; }
    if (!formData.birth_date) { setError('生年月日を入力してください'); return; }

    try {
      setLoading(true);
      setError(null);
      
      const age = calculateAge(formData.birth_date);
      
      // 👇 4. 送信データの方を SupportPlanInsert または Update に指定
      const commonData = {
        ...formData,
        age,
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
      };
      
      if (editMode && supportPlanId) {
        const updatePayload: SupportPlanUpdate = commonData;
        delete (updatePayload as Partial<SupportPlanInsert>).user_id; // user_idは更新しない
        
        await supportPlansApi.update(supportPlanId, updatePayload);
        router.push(`/support-plans/${supportPlanId}`);
      } else {
        const createPayload: SupportPlanInsert = { ...commonData, user_id: formData.user_id, age };
        await supportPlansApi.create(createPayload);
        router.push('/support-plans');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }

  if (loading && !formData.user_id && !editMode) { 
    return <div>読み込み中...</div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">担当スタッフ <span className="text-red-500">*</span></label>
            <input type="text" name="staff_name" value={formData.staff_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" required />
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
              {formData.birth_date && (<span className="text-gray-600">年齢: {calculateAge(formData.birth_date)}歳</span>)}
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