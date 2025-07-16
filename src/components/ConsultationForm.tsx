'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { consultationsApi } from '@/lib/api'

const ConsultationForm: React.FC = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    // 1. 基本情報
    consultation_date: new Date().toISOString().split('T')[0],
    consultation_route_self: false,
    consultation_route_family: false,
    consultation_route_care_manager: false,
    consultation_route_elderly_center: false,
    consultation_route_disability_center: false,
    consultation_route_government: false,
    consultation_route_government_other: '',
    consultation_route_other: false,
    consultation_route_other_text: '',

    attribute_elderly: false,
    attribute_disability: false,
    attribute_disability_mental: false,
    attribute_disability_physical: false,
    attribute_disability_intellectual: false,
    attribute_childcare: false,
    attribute_single_parent: false,
    attribute_dv: false,
    attribute_foreigner: false,
    attribute_poverty: false,
    attribute_low_income: false,
    attribute_lgbt: false,
    attribute_welfare: false,

    name: '',
    furigana: '',
    gender: '' as 'male' | 'female' | 'other' | '',

    household_single: false,
    household_couple: false,
    household_common_law: false,
    household_parent_child: false,
    household_siblings: false,
    household_acquaintance: false,
    household_other: false,
    household_other_text: '',

    postal_code: '',
    address: '',
    phone_home: '',
    phone_mobile: '',
    birth_year: undefined as number | undefined,
    birth_month: undefined as number | undefined,
    birth_day: undefined as number | undefined,

    // 2. 身体状況・利用サービス
    physical_condition: '' as 'independent' | 'support1' | 'support2' | 'care1' | 'care2' | 'care3' | 'care4' | 'care5' | '',

    mental_disability_certificate: false,
    mental_disability_level: '',
    physical_disability_certificate: false,
    physical_disability_level: '',
    therapy_certificate: false,
    therapy_level: '',

    service_day_service: false,
    service_visiting_nurse: false,
    service_visiting_care: false,
    service_home_medical: false,
    service_short_stay: false,
    service_other: false,
    service_other_text: '',

    service_provider: '',
    care_support_office: '',
    care_manager: '',
    medical_history: '',

    // 3. 医療・収入
    medical_institution_name: '',
    medical_institution_staff: '',

    income_salary: undefined as number | undefined,
    income_injury_allowance: undefined as number | undefined,
    income_pension: undefined as number | undefined,
    welfare_recipient: false,
    welfare_staff: '',
    savings: undefined as number | undefined,

    // 4. ADL/IADL
    dementia: '',
    dementia_hospital: '',
    hospital_support_required: false,
    medication_management_needed: false,

    mobility_independent: false,
    mobility_partial_assist: false,
    mobility_full_assist: false,
    mobility_other: false,
    mobility_other_text: '',

    eating_independent: false,
    eating_partial_assist: false,
    eating_full_assist: false,
    eating_other: false,
    eating_other_text: '',

    shopping_possible: false,
    shopping_support_needed: false,
    shopping_support_text: '',
    cooking_possible: false,
    cooking_support_needed: false,
    cooking_support_text: '',

    excretion_independent: false,
    excretion_partial_assist: false,
    excretion_full_assist: false,
    excretion_other: false,
    excretion_other_text: '',

    diaper_usage: false,
    garbage_disposal_independent: false,
    garbage_disposal_support_needed: false,
    garbage_disposal_support_text: '',

    stairs_independent: false,
    stairs_partial_assist: false,
    stairs_full_assist: false,
    stairs_other: false,
    stairs_other_text: '',

    second_floor_possible: false,
    bed_or_futon: '' as 'bed' | 'futon' | '',

    bathing_independent: false,
    bathing_partial_assist: false,
    bathing_full_assist: false,
    bathing_other: false,
    bathing_other_text: '',

    unit_bath_possible: false,

    money_management: '',
    supporter_available: false,
    supporter_text: '',
    proxy_payment: false,
    rent_payment_method: '' as 'transfer' | 'collection' | 'automatic' | '',

    other_notes: '',

    // 5. 相談内容等
    consultation_content: '',
    relocation_reason: '',

    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_postal_code: '',
    emergency_contact_address: '',
    emergency_contact_phone_home: '',
    emergency_contact_phone_mobile: '',
    emergency_contact_email: '',

    consultation_result: '',
    next_appointment_scheduled: false,
    next_appointment_details: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)

      const consultationData = {
        ...formData,
        birth_year: formData.birth_year || null,
        birth_month: formData.birth_month || null,
        birth_day: formData.birth_day || null,
        income_salary: formData.income_salary || null,
        income_injury_allowance: formData.income_injury_allowance || null,
        income_pension: formData.income_pension || null,
        savings: formData.savings || null,
        name: formData.name.trim() || null,
        furigana: formData.furigana.trim() || null,
        gender: formData.gender || null,
        postal_code: formData.postal_code.trim() || null,
        address: formData.address.trim() || null,
        phone_home: formData.phone_home.trim() || null,
        phone_mobile: formData.phone_mobile.trim() || null,
        physical_condition: formData.physical_condition || null,
        service_provider: formData.service_provider.trim() || null,
        care_support_office: formData.care_support_office.trim() || null,
        care_manager: formData.care_manager.trim() || null,
        medical_history: formData.medical_history.trim() || null,
        medical_institution_name: formData.medical_institution_name.trim() || null,
        medical_institution_staff: formData.medical_institution_staff.trim() || null,
        welfare_staff: formData.welfare_staff.trim() || null,
        dementia: formData.dementia.trim() || null,
        dementia_hospital: formData.dementia_hospital.trim() || null,
        mobility_other_text: formData.mobility_other_text.trim() || null,
        eating_other_text: formData.eating_other_text.trim() || null,
        shopping_support_text: formData.shopping_support_text.trim() || null,
        cooking_support_text: formData.cooking_support_text.trim() || null,
        excretion_other_text: formData.excretion_other_text.trim() || null,
        garbage_disposal_support_text: formData.garbage_disposal_support_text.trim() || null,
        stairs_other_text: formData.stairs_other_text.trim() || null,
        bathing_other_text: formData.bathing_other_text.trim() || null,
        money_management: formData.money_management.trim() || null,
        supporter_text: formData.supporter_text.trim() || null,
        rent_payment_method: formData.rent_payment_method || null,
        other_notes: formData.other_notes.trim() || null,
        consultation_content: formData.consultation_content.trim() || null,
        relocation_reason: formData.relocation_reason.trim() || null,
        emergency_contact_name: formData.emergency_contact_name.trim() || null,
        emergency_contact_relationship: formData.emergency_contact_relationship.trim() || null,
        emergency_contact_postal_code: formData.emergency_contact_postal_code.trim() || null,
        emergency_contact_address: formData.emergency_contact_address.trim() || null,
        emergency_contact_phone_home: formData.emergency_contact_phone_home.trim() || null,
        emergency_contact_phone_mobile: formData.emergency_contact_phone_mobile.trim() || null,
        emergency_contact_email: formData.emergency_contact_email.trim() || null,
        consultation_result: formData.consultation_result.trim() || null,
        next_appointment_details: formData.next_appointment_details.trim() || null,
        consultation_route_government_other: formData.consultation_route_government_other.trim() || null,
        consultation_route_other_text: formData.consultation_route_other_text.trim() || null,
        household_other_text: formData.household_other_text.trim() || null,
        mental_disability_level: formData.mental_disability_level.trim() || null,
        physical_disability_level: formData.physical_disability_level.trim() || null,
        therapy_level: formData.therapy_level.trim() || null,
        service_other_text: formData.service_other_text.trim() || null,
        bed_or_futon: formData.bed_or_futon || null
      }

      await consultationsApi.create(consultationData)
      router.push('/consultations')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  const calculateAge = () => {
    if (formData.birth_year && formData.birth_month && formData.birth_day) {
      const birthDate = new Date(formData.birth_year, formData.birth_month - 1, formData.birth_day)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    }
    return null
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
              相談日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.consultation_date}
              onChange={(e) => setFormData(prev => ({ ...prev, consultation_date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            相談ルート
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.consultation_route_self}
                onChange={(e) => setFormData(prev => ({ ...prev, consultation_route_self: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-800">本人</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.consultation_route_family}
                onChange={(e) => setFormData(prev => ({ ...prev, consultation_route_family: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-800">家族</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.consultation_route_care_manager}
                onChange={(e) => setFormData(prev => ({ ...prev, consultation_route_care_manager: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-800">ケアマネ</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.consultation_route_elderly_center}
                onChange={(e) => setFormData(prev => ({ ...prev, consultation_route_elderly_center: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-800">支援センター（高齢者）</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.consultation_route_disability_center}
                onChange={(e) => setFormData(prev => ({ ...prev, consultation_route_disability_center: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-800">支援センター（障害者）</span>
            </label>
          </div>

          <div className="mt-2 space-y-2">
            <div>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="consultation_route_extra"
                  checked={formData.consultation_route_government}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    consultation_route_government: e.target.checked,
                    consultation_route_other: false
                  }))}
                  className="mr-2"
                />
                <span className="text-gray-800 mr-2">行政機関</span>
                {formData.consultation_route_government && (
                  <input
                    type="text"
                    value={formData.consultation_route_government_other}
                    onChange={(e) => setFormData(prev => ({ ...prev, consultation_route_government_other: e.target.value }))}
                    placeholder="詳細を入力"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                )}
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="consultation_route_extra"
                  checked={formData.consultation_route_other}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    consultation_route_other: e.target.checked,
                    consultation_route_government: false
                  }))}
                  className="mr-2"
                />
                <span className="text-gray-800 mr-2">その他</span>
                {formData.consultation_route_other && (
                  <input
                    type="text"
                    value={formData.consultation_route_other_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, consultation_route_other_text: e.target.value }))}
                    placeholder="詳細を入力"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                )}
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            属性
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.attribute_elderly}
                onChange={(e) => setFormData(prev => ({ ...prev, attribute_elderly: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-800">高齢</span>
            </label>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.attribute_disability}
                  onChange={(e) => setFormData(prev => ({ ...prev, attribute_disability: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-gray-800">障がい</span>
              </label>
              {formData.attribute_disability && (
                <div className="ml-6 mt-1 space-y-1">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={formData.attribute_disability_mental}
                      onChange={(e) => setFormData(prev => ({ ...prev, attribute_disability_mental: e.target.checked }))}
                      className="mr-1"
                    />
                    <span>精神</span>
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={formData.attribute_disability_physical}
                      onChange={(e) => setFormData(prev => ({ ...prev, attribute_disability_physical: e.target.checked }))}
                      className="mr-1"
                    />
                    <span>身体</span>
                  </label>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={formData.attribute_disability_intellectual}
                      onChange={(e) => setFormData(prev => ({ ...prev, attribute_disability_intellectual: e.target.checked }))}
                      className="mr-1"
                    />
                    <span>知的</span>
                  </label>
                </div>
              )}
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.attribute_childcare}
                onChange={(e) => setFormData(prev => ({ ...prev, attribute_childcare: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-800">子育て</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.attribute_single_parent}
                onChange={(e) => setFormData(prev => ({ ...prev, attribute_single_parent: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-800">ひとり親</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.attribute_dv}
                onChange={(e) => setFormData(prev => ({ ...prev, attribute_dv: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-800">DV</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.attribute_foreigner}
                onChange={(e) => setFormData(prev => ({ ...prev, attribute_foreigner: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-800">外国人</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.attribute_poverty}
                onChange={(e) => setFormData(prev => ({ ...prev, attribute_poverty: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-800">生活困窮</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.attribute_low_income}
                onChange={(e) => setFormData(prev => ({ ...prev, attribute_low_income: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-800">低所得者</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.attribute_lgbt}
                onChange={(e) => setFormData(prev => ({ ...prev, attribute_lgbt: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-800">LGBT</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.attribute_welfare}
                onChange={(e) => setFormData(prev => ({ ...prev, attribute_welfare: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-800">生保</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              お名前
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="匿名の場合は空欄"
              />
              <span className="ml-2 text-gray-600">様</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              フリガナ
            </label>
            <input
              type="text"
              value={formData.furigana}
              onChange={(e) => setFormData(prev => ({ ...prev, furigana: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              性別
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'male' }))}
                  className="mr-1"
                />
                <span className="text-gray-700">男</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'female' }))}
                  className="mr-1"
                />
                <span className="text-gray-700">女</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="other"
                  checked={formData.gender === 'other'}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'other' }))}
                  className="mr-1"
                />
                <span className="text-gray-700">その他</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            世帯構成
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.household_single}
                onChange={(e) => setFormData(prev => ({ ...prev, household_single: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-800">独居</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.household_couple}
                onChange={(e) => setFormData(prev => ({ ...prev, household_couple: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-800">夫婦</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.household_common_law}
                onChange={(e) => setFormData(prev => ({ ...prev, household_common_law: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-800">内縁夫婦</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.household_parent_child}
                onChange={(e) => setFormData(prev => ({ ...prev, household_parent_child: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-800">親子</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.household_siblings}
                onChange={(e) => setFormData(prev => ({ ...prev, household_siblings: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-800">兄弟姉妹</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.household_acquaintance}
                onChange={(e) => setFormData(prev => ({ ...prev, household_acquaintance: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-800">知人</span>
            </label>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.household_other}
                  onChange={(e) => setFormData(prev => ({ ...prev, household_other: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-gray-800">その他</span>
              </label>
              {formData.household_other && (
                <input
                  type="text"
                  value={formData.household_other_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, household_other_text: e.target.value }))}
                  placeholder="詳細を入力"
                  className="mt-1 w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              郵便番号
            </label>
            <input
              type="text"
              value={formData.postal_code}
              onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              都道府県・市区町村・番地等
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              自宅電話番号
            </label>
            <input
              type="tel"
              value={formData.phone_home}
              onChange={(e) => setFormData(prev => ({ ...prev, phone_home: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              携帯電話番号
            </label>
            <input
              type="tel"
              value={formData.phone_mobile}
              onChange={(e) => setFormData(prev => ({ ...prev, phone_mobile: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            生年月日
          </label>
          <div className="flex space-x-2 items-center">
            <select
              value={formData.birth_year || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, birth_year: e.target.value ? parseInt(e.target.value) : undefined }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">年</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <span>年</span>
            <select
              value={formData.birth_month || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, birth_month: e.target.value ? parseInt(e.target.value) : undefined }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">月</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <span>月</span>
            <select
              value={formData.birth_day || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, birth_day: e.target.value ? parseInt(e.target.value) : undefined }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">日</option>
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <span>日</span>
            {calculateAge() !== null && (
              <span className="text-gray-600">（満{calculateAge()}歳）</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. 身体状況・利用サービス */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">2. 身体状況・利用サービス</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              身体状況
            </label>
            <div className="space-y-1">
              {[
                { value: 'independent', label: '自立' },
                { value: 'support1', label: '要支援１' },
                { value: 'support2', label: '要支援２' },
                { value: 'care1', label: '要介護１' },
                { value: 'care2', label: '要介護２' },
                { value: 'care3', label: '要介護３' },
                { value: 'care4', label: '要介護４' },
                { value: 'care5', label: '要介護５' }
              ].map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="physical_condition"
                    value={option.value}
                    checked={formData.physical_condition === option.value}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      // e.target.valueを、formData.physical_conditionが持つ型だと明示する
                      physical_condition: e.target.value as typeof formData.physical_condition
                    }))}
                    className="mr-2"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            手帳
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.mental_disability_certificate}
                onChange={(e) => setFormData(prev => ({ ...prev, mental_disability_certificate: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-700">精神障害者保健福祉手帳</span>
              {formData.mental_disability_certificate && (
                <input
                  type="text"
                  value={formData.mental_disability_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, mental_disability_level: e.target.value }))}
                  placeholder="等級"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.physical_disability_certificate}
                onChange={(e) => setFormData(prev => ({ ...prev, physical_disability_certificate: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-700">身体障害者手帳</span>
              {formData.physical_disability_certificate && (
                <input
                  type="text"
                  value={formData.physical_disability_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, physical_disability_level: e.target.value }))}
                  placeholder="等級"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.therapy_certificate}
                onChange={(e) => setFormData(prev => ({ ...prev, therapy_certificate: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-700">療育手帳</span>
              {formData.therapy_certificate && (
                <input
                  type="text"
                  value={formData.therapy_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, therapy_level: e.target.value }))}
                  placeholder="区分"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            利用中の支援サービス
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.service_day_service}
                onChange={(e) => setFormData(prev => ({ ...prev, service_day_service: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-700">デイサービス</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.service_visiting_nurse}
                onChange={(e) => setFormData(prev => ({ ...prev, service_visiting_nurse: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-700">訪問看護</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.service_visiting_care}
                onChange={(e) => setFormData(prev => ({ ...prev, service_visiting_care: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-700">訪問介護</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.service_home_medical}
                onChange={(e) => setFormData(prev => ({ ...prev, service_home_medical: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-700">在宅診療</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.service_short_stay}
                onChange={(e) => setFormData(prev => ({ ...prev, service_short_stay: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-700">短期入所施設</span>
            </label>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.service_other}
                  onChange={(e) => setFormData(prev => ({ ...prev, service_other: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-gray-700">その他</span>
              </label>
              {formData.service_other && (
                <input
                  type="text"
                  value={formData.service_other_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, service_other_text: e.target.value }))}
                  placeholder="詳細"
                  className="mt-1 w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              サービス提供事業所
            </label>
            <input
              type="text"
              value={formData.service_provider}
              onChange={(e) => setFormData(prev => ({ ...prev, service_provider: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              居宅介護支援事業所
            </label>
            <input
              type="text"
              value={formData.care_support_office}
              onChange={(e) => setFormData(prev => ({ ...prev, care_support_office: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              担当
            </label>
            <input
              type="text"
              value={formData.care_manager}
              onChange={(e) => setFormData(prev => ({ ...prev, care_manager: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            既往症及び病歴
          </label>
          <textarea
            value={formData.medical_history}
            onChange={(e) => setFormData(prev => ({ ...prev, medical_history: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="一般的な病名の選択項目があるととても便利です"
          />
        </div>
      </div>

      {/* 3. 医療・収入 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">3. 医療・収入</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              かかりつけ医療機関 - 名称
            </label>
            <input
              type="text"
              value={formData.medical_institution_name}
              onChange={(e) => setFormData(prev => ({ ...prev, medical_institution_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              かかりつけ医療機関 - 担当
            </label>
            <input
              type="text"
              value={formData.medical_institution_staff}
              onChange={(e) => setFormData(prev => ({ ...prev, medical_institution_staff: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            収入
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">給与</label>
              <input
                type="number"
                value={formData.income_salary || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, income_salary: e.target.value ? parseInt(e.target.value) : undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="円"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">傷病手当</label>
              <input
                type="number"
                value={formData.income_injury_allowance || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, income_injury_allowance: e.target.value ? parseInt(e.target.value) : undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="円"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">年金振込額</label>
              <input
                type="number"
                value={formData.income_pension || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, income_pension: e.target.value ? parseInt(e.target.value) : undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="円"
              />
            </div>
          </div>

          <div className="mt-2 flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.welfare_recipient}
                onChange={(e) => setFormData(prev => ({ ...prev, welfare_recipient: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-gray-700">生活保護受給</span>
            </label>
            {formData.welfare_recipient && (
              <input
                type="text"
                value={formData.welfare_staff}
                onChange={(e) => setFormData(prev => ({ ...prev, welfare_staff: e.target.value }))}
                placeholder="生保担当者"
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            )}
          </div>

          <div className="mt-2">
            <label className="block text-sm text-gray-600 mb-1">預金</label>
            <input
              type="number"
              value={formData.savings || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, savings: e.target.value ? parseInt(e.target.value) : undefined }))}
              className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="円"
            />
          </div>
        </div>
      </div>

      {/* 4. ADL/IADL */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">4. ADL/IADL</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              認知症
            </label>
            <input
              type="text"
              value={formData.dementia}
              onChange={(e) => setFormData(prev => ({ ...prev, dementia: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              病院名
            </label>
            <input
              type="text"
              value={formData.dementia_hospital}
              onChange={(e) => setFormData(prev => ({ ...prev, dementia_hospital: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              通院支援
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hospital_support"
                  checked={formData.hospital_support_required === true}
                  onChange={() => setFormData(prev => ({ ...prev, hospital_support_required: true }))}
                  className="mr-1"
                />
                <span className="text-gray-700">要</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hospital_support"
                  checked={formData.hospital_support_required === false}
                  onChange={() => setFormData(prev => ({ ...prev, hospital_support_required: false }))}
                  className="mr-1"
                />
                <span className="text-gray-700">不要</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              内服管理の必要性
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="medication_management"
                  checked={formData.medication_management_needed === true}
                  onChange={() => setFormData(prev => ({ ...prev, medication_management_needed: true }))}
                  className="mr-1"
                />
                <span className="text-gray-700">有</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="medication_management"
                  checked={formData.medication_management_needed === false}
                  onChange={() => setFormData(prev => ({ ...prev, medication_management_needed: false }))}
                  className="mr-1"
                />
                <span className="text-gray-700">無</span>
              </label>
            </div>
          </div>
        </div>

        {/* その他のADL/IADL項目は省略し、最重要項目のみ表示 */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            その他特記事項
          </label>
          <textarea
            value={formData.other_notes}
            onChange={(e) => setFormData(prev => ({ ...prev, other_notes: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="例：聴力、視力、喫煙"
          />
        </div>
      </div>

      {/* 5. 相談内容等 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">5. 相談内容等</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              相談内容（困りごと、何が大変でどうしたいか、等）
            </label>
            <textarea
              value={formData.consultation_content}
              onChange={(e) => setFormData(prev => ({ ...prev, consultation_content: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              転居理由
            </label>
            <textarea
              value={formData.relocation_reason}
              onChange={(e) => setFormData(prev => ({ ...prev, relocation_reason: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-md font-medium text-gray-800 mb-2">緊急連絡先</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                氏名
              </label>
              <input
                type="text"
                value={formData.emergency_contact_name}
                onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                当事者との関係
              </label>
              <input
                type="text"
                value={formData.emergency_contact_relationship}
                onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_relationship: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                郵便番号
              </label>
              <input
                type="text"
                value={formData.emergency_contact_postal_code}
                onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_postal_code: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                住所
              </label>
              <input
                type="text"
                value={formData.emergency_contact_address}
                onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                自宅電話
              </label>
              <input
                type="tel"
                value={formData.emergency_contact_phone_home}
                onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone_home: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                携帯電話
              </label>
              <input
                type="tel"
                value={formData.emergency_contact_phone_mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone_mobile: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mail
              </label>
              <input
                type="email"
                value={formData.emergency_contact_email}
                onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            相談結果
          </label>
          <textarea
            value={formData.consultation_result}
            onChange={(e) => setFormData(prev => ({ ...prev, consultation_result: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            次回予定
          </label>
          <div className="space-y-2">
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="next_appointment"
                  checked={formData.next_appointment_scheduled === true}
                  onChange={() => setFormData(prev => ({ ...prev, next_appointment_scheduled: true }))}
                  className="mr-1"
                />
                <span className="text-gray-700">あり</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="next_appointment"
                  checked={formData.next_appointment_scheduled === false}
                  onChange={() => setFormData(prev => ({ ...prev, next_appointment_scheduled: false }))}
                  className="mr-1"
                />
                <span className="text-gray-700">なし</span>
              </label>
            </div>
            {formData.next_appointment_scheduled && (
              <input
                type="text"
                value={formData.next_appointment_details}
                onChange={(e) => setFormData(prev => ({ ...prev, next_appointment_details: e.target.value }))}
                placeholder="次回予定の詳細"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
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
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  )
}

export default ConsultationForm