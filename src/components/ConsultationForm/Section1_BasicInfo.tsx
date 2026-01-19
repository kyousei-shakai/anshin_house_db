//src/components/ConsultationForm/Section1_BasicInfo.tsx
'use client'

import React from 'react'
import { ConsultationFormData } from './types'
import { AGE_GROUP_OPTIONS, getAgeGroupLabel } from '@/utils/age-utils'

// このコンポーネントが親から受け取るpropsの型を定義します
interface Section1_BasicInfoProps {
  formData: ConsultationFormData;
  staffList: { id: string; name: string | null }[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  calculateAge: () => number | null;
}

const Section1_BasicInfo: React.FC<Section1_BasicInfoProps> = ({
  formData,
  staffList,
  handleChange,
  calculateAge,
}) => {
  // 生年月日（年）の入力状況に基づき、表示すべき年代を決定する
  // 年が入っていれば自動計算値を優先し、なければ手動入力値を表示する
  const autoAgeGroup = getAgeGroupLabel(formData.birth_year, formData.birth_month, formData.birth_day);
  const isAgeGroupLocked = !!formData.birth_year; // 生年月日(年)があれば手動入力をロックする
  const displayAgeGroup = isAgeGroupLocked ? autoAgeGroup : formData.age_group;


  // 生年月日の選択肢用の配列は、このコンポーネント内で定義するのが適切です
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <div id="section-1" className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 scroll-mt-24">
      <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-4 mb-6">1. 基本情報</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">相談日 <span className="text-red-500">*</span></label>
          <input type="date" name="consultation_date" value={formData.consultation_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white" required />
        </div>
        <div>
          <label htmlFor="staff_id" className="block text-sm font-medium text-gray-700 mb-1">担当スタッフ <span className="text-red-500">*</span></label>
          <select
            id="staff_id"
            name="staff_id"
            value={formData.staff_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white"
          >
            <option value="" disabled>担当者を選択してください</option>
            {staffList.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">相談ルート</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          {/* 本人 */}
          <label className="flex items-center col-span-1 md:col-span-2">
            <input type="checkbox" name="consultation_route_self" checked={formData.consultation_route_self} onChange={handleChange} className="mr-2" />
            <span className="text-gray-800">本人</span>
          </label>

          {/* 家族 */}
          <div className="flex items-center">
            <label className="flex items-center flex-shrink-0 mr-2">
              <input type="checkbox" name="consultation_route_family" checked={formData.consultation_route_family} onChange={handleChange} className="mr-2" />
              <span className="text-gray-800 whitespace-nowrap">家族</span>
            </label>
            {formData.consultation_route_family && (
              <input type="text" name="consultation_route_family_text" value={formData.consultation_route_family_text} onChange={handleChange} placeholder="続柄、氏名など" className="flex-1 w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-700" />
            )}
          </div>

          {/* ケアマネ */}
          <div className="flex items-center">
            <label className="flex items-center flex-shrink-0 mr-2">
              <input type="checkbox" name="consultation_route_care_manager" checked={formData.consultation_route_care_manager} onChange={handleChange} className="mr-2" />
              <span className="text-gray-800 whitespace-nowrap">ケアマネ</span>
            </label>
            {formData.consultation_route_care_manager && (
              <input type="text" name="consultation_route_care_manager_text" value={formData.consultation_route_care_manager_text} onChange={handleChange} placeholder="氏名、事業所名など" className="flex-1 w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-700" />
            )}
          </div>

          {/* 支援センター（高齢者） */}
          <div className="flex items-center">
            <label className="flex items-center flex-shrink-0 mr-2">
              <input type="checkbox" name="consultation_route_elderly_center" checked={formData.consultation_route_elderly_center} onChange={handleChange} className="mr-2" />
              <span className="text-gray-800 whitespace-nowrap">支援センター（高齢者）</span>
            </label>
            {formData.consultation_route_elderly_center && (
              <input type="text" name="consultation_route_elderly_center_text" value={formData.consultation_route_elderly_center_text} onChange={handleChange} placeholder="名称、担当者名など" className="flex-1 w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-700" />
            )}
          </div>

          {/* 支援センター（障害者） */}
          <div className="flex items-center">
            <label className="flex items-center flex-shrink-0 mr-2">
              <input type="checkbox" name="consultation_route_disability_center" checked={formData.consultation_route_disability_center} onChange={handleChange} className="mr-2" />
              <span className="text-gray-800 whitespace-nowrap">支援センター（障害者）</span>
            </label>
            {formData.consultation_route_disability_center && (
              <input type="text" name="consultation_route_disability_center_text" value={formData.consultation_route_disability_center_text} onChange={handleChange} placeholder="名称、担当者名など" className="flex-1 w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-700" />
            )}
          </div>

          {/* 行政機関 */}
          <div className="flex items-center">
            <label className="flex items-center flex-shrink-0 mr-2">
              <input type="checkbox" name="consultation_route_government" checked={formData.consultation_route_government} onChange={handleChange} className="mr-2" />
              <span className="text-gray-800 whitespace-nowrap">行政機関</span>
            </label>
            {formData.consultation_route_government && (
              <input type="text" name="consultation_route_government_other" value={formData.consultation_route_government_other} onChange={handleChange} placeholder="課名、担当者名など" className="flex-1 w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-700" />
            )}
          </div>

          {/* その他 */}
          <div className="flex items-center">
            <label className="flex items-center flex-shrink-0 mr-2">
              <input type="checkbox" name="consultation_route_other" checked={formData.consultation_route_other} onChange={handleChange} className="mr-2" />
              <span className="text-gray-800 whitespace-nowrap">その他</span>
            </label>
            {formData.consultation_route_other && (
              <input type="text" name="consultation_route_other_text" value={formData.consultation_route_other_text} onChange={handleChange} placeholder="詳細を入力" className="flex-1 w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-700" />
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">属性</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <label className="flex items-center"><input type="checkbox" name="attribute_elderly" checked={formData.attribute_elderly} onChange={handleChange} className="mr-2" /><span className="text-gray-800">高齢</span></label>
          <div>
            <label className="flex items-center"><input type="checkbox" name="attribute_disability" checked={formData.attribute_disability} onChange={handleChange} className="mr-2" /><span className="text-gray-800">障がい</span></label>
            {formData.attribute_disability && (
              <div className="ml-6 mt-1 space-y-1">
                <label className="flex items-center text-sm"><input type="checkbox" name="attribute_disability_mental" checked={formData.attribute_disability_mental} onChange={handleChange} className="mr-1" /><span className="text-gray-800">精神</span></label>
                <label className="flex items-center text-sm"><input type="checkbox" name="attribute_disability_physical" checked={formData.attribute_disability_physical} onChange={handleChange} className="mr-1" /><span className="text-gray-800">身体</span></label>
                <label className="flex items-center text-sm"><input type="checkbox" name="attribute_disability_intellectual" checked={formData.attribute_disability_intellectual} onChange={handleChange} className="mr-1" /><span className="text-gray-800">知的</span></label>
              </div>
            )}
          </div>
          <label className="flex items-center"><input type="checkbox" name="attribute_childcare" checked={formData.attribute_childcare} onChange={handleChange} className="mr-2" /><span className="text-gray-800">子育て</span></label>
          <label className="flex items-center"><input type="checkbox" name="attribute_single_parent" checked={formData.attribute_single_parent} onChange={handleChange} className="mr-2" /><span className="text-gray-800">ひとり親</span></label>
          <label className="flex items-center"><input type="checkbox" name="attribute_dv" checked={formData.attribute_dv} onChange={handleChange} className="mr-2" /><span className="text-gray-800">DV</span></label>
          <label className="flex items-center"><input type="checkbox" name="attribute_foreigner" checked={formData.attribute_foreigner} onChange={handleChange} className="mr-2" /><span className="text-gray-800">外国人</span></label>
          <label className="flex items-center"><input type="checkbox" name="attribute_poverty" checked={formData.attribute_poverty} onChange={handleChange} className="mr-2" /><span className="text-gray-800">生活困窮</span></label>
          <label className="flex items-center"><input type="checkbox" name="attribute_low_income" checked={formData.attribute_low_income} onChange={handleChange} className="mr-2" /><span className="text-gray-800">低所得者</span></label>
          <label className="flex items-center"><input type="checkbox" name="attribute_lgbt" checked={formData.attribute_lgbt} onChange={handleChange} className="mr-2" /><span className="text-gray-800">LGBT</span></label>
          <label className="flex items-center"><input type="checkbox" name="attribute_welfare" checked={formData.attribute_welfare} onChange={handleChange} className="mr-2" /><span className="text-gray-800">生保</span></label>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">お名前</label><div className="flex items-center"><input type="text" name="name" value={formData.name} onChange={handleChange} className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white" placeholder="匿名の場合は空欄" /><span className="ml-2 text-gray-600">様</span></div></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">フリガナ</label><input type="text" name="furigana" value={formData.furigana} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white" /></div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
          <div className="flex space-x-4">
            <label className="flex items-center"><input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} className="mr-1" /><span className="text-gray-800">男</span></label>
            <label className="flex items-center"><input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} className="mr-1" /><span className="text-gray-800">女</span></label>
            <label className="flex items-center"><input type="radio" name="gender" value="other" checked={formData.gender === 'other'} onChange={handleChange} className="mr-1" /><span className="text-gray-800">その他</span></label>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">世帯構成</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <label className="flex items-center"><input type="checkbox" name="household_single" checked={formData.household_single} onChange={handleChange} className="mr-2" /><span className="text-gray-800">独居</span></label>
          <label className="flex items-center"><input type="checkbox" name="household_couple" checked={formData.household_couple} onChange={handleChange} className="mr-2" /><span className="text-gray-800">夫婦</span></label>
          <label className="flex items-center"><input type="checkbox" name="household_common_law" checked={formData.household_common_law} onChange={handleChange} className="mr-2" /><span className="text-gray-800">内縁夫婦</span></label>
          <label className="flex items-center"><input type="checkbox" name="household_parent_child" checked={formData.household_parent_child} onChange={handleChange} className="mr-2" /><span className="text-gray-800">親子</span></label>
          <label className="flex items-center"><input type="checkbox" name="household_siblings" checked={formData.household_siblings} onChange={handleChange} className="mr-2" /><span className="text-gray-800">兄弟姉妹</span></label>
          <label className="flex items-center"><input type="checkbox" name="household_acquaintance" checked={formData.household_acquaintance} onChange={handleChange} className="mr-2" /><span className="text-gray-800">知人</span></label>
          <div><label className="flex items-center"><input type="checkbox" name="household_other" checked={formData.household_other} onChange={handleChange} className="mr-2" /><span className="text-gray-800">その他</span></label>{formData.household_other && (<input type="text" name="household_other_text" value={formData.household_other_text} onChange={handleChange} placeholder="詳細を入力" className="mt-1 w-full px-2 py-1 border border-gray-300 rounded text-sm" />)}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">郵便番号</label><input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800" placeholder="123-4567" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">都道府県・市区町村・番地等</label><input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">自宅電話番号</label><input type="tel" name="phone_home" value={formData.phone_home} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">携帯電話番号</label><input type="tel" name="phone_mobile" value={formData.phone_mobile} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800" /></div>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 左側：既存の生年月日入力（変更なし） */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">生年月日</label>
          <div className="flex space-x-2 items-center">
            <select name="birth_year" value={formData.birth_year} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white">
              <option value="">年</option>
              {years.map(year => (<option key={year} value={year}>{year}</option>))}
            </select>
            <span className="text-gray-700">年</span>
            <select name="birth_month" value={formData.birth_month} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white">
              <option value="">月</option>
              {months.map(month => (<option key={month} value={month}>{month}</option>))}
            </select>
            <span className="text-gray-700">月</span>
            <select name="birth_day" value={formData.birth_day} onChange={handleChange} className="px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white">
              <option value="">日</option>
              {days.map(day => (<option key={day} value={day}>{day}</option>))}
            </select>
            <span className="text-gray-700">日</span>
            {calculateAge() !== null && (<span className="text-gray-600">（満{calculateAge()}歳）</span>)}
          </div>
        </div>

        {/* 右側：【新規追加】年代選択項目 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            年代
            {isAgeGroupLocked && <span className="ml-2 text-blue-600 text-xs font-normal animate-pulse">※自動計算中</span>}
          </label>
          <select
            name="age_group"
            value={displayAgeGroup}
            onChange={handleChange}
            disabled={isAgeGroupLocked}
            className={`w-full px-3 py-2 border rounded-md text-gray-800 transition-colors ${isAgeGroupLocked ? 'bg-gray-100 border-blue-200 cursor-not-allowed' : 'bg-white border-gray-300'
              }`}
          >
            <option value="">年代を選択（生年月日不明時）</option>
            {AGE_GROUP_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {!isAgeGroupLocked && (
            <p className="mt-1 text-xs text-gray-500">生年月日が分からない場合はこちらを選択してください。</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Section1_BasicInfo