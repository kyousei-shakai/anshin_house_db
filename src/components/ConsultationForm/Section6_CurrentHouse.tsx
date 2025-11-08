//src/components/ConsultationForm/Section6_CurrentHouse.tsx
'use client'

import React from 'react'
import { ConsultationFormData } from './types'

// このコンポーネントが親から受け取るpropsの型を定義します
interface Section6_CurrentHouseProps {
  formData: ConsultationFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleRadioChange: (name: keyof ConsultationFormData, value: string) => void;
}

const Section6_CurrentHouse: React.FC<Section6_CurrentHouseProps> = ({
  formData,
  handleChange,
  handleRadioChange,
}) => {
  return (
    <div id="section-6" className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 scroll-mt-24">
      <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-4 mb-6">6. 現在の住まい</h2>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">家賃滞納</label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <label className="flex items-center">
              <input type="radio" name="rent_arrears_status" value="yes" checked={formData.rent_arrears_status === 'yes'} onChange={(e) => handleRadioChange('rent_arrears_status', e.target.value)} className="mr-1" />
              <span className="text-gray-700">有</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="rent_arrears_status" value="no" checked={formData.rent_arrears_status === 'no'} onChange={(e) => handleRadioChange('rent_arrears_status', e.target.value)} className="mr-1" />
              <span className="text-gray-700">無</span>
            </label>
          </div>
          {formData.rent_arrears_status === 'yes' && (
            <div className="mt-4 pl-6 border-l-2 border-gray-200 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">滞納期間</label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="rent_arrears_duration" value="1_month" checked={formData.rent_arrears_duration === '1_month'} onChange={(e) => handleRadioChange('rent_arrears_duration', e.target.value)} className="mr-1" />
                    <span className="text-gray-700">1ヶ月</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="rent_arrears_duration" value="2_to_3_months" checked={formData.rent_arrears_duration === '2_to_3_months'} onChange={(e) => handleRadioChange('rent_arrears_duration', e.target.value)} className="mr-1" />
                    <span className="text-gray-700">2〜3ヶ月</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="rent_arrears_duration" value="half_year_or_more" checked={formData.rent_arrears_duration === 'half_year_or_more'} onChange={(e) => handleRadioChange('rent_arrears_duration', e.target.value)} className="mr-1" />
                    <span className="text-gray-700">半年以上</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="rent_arrears_duration" value="other" checked={formData.rent_arrears_duration === 'other'} onChange={(e) => handleRadioChange('rent_arrears_duration', e.target.value)} className="mr-1" />
                    <span className="text-gray-700">その他</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">滞納の理由や状況</label>
                <textarea name="rent_arrears_details" value={formData.rent_arrears_details} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" />
              </div>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">ペット</label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <label className="flex items-center">
              <input type="radio" name="pet_status" value="yes" checked={formData.pet_status === 'yes'} onChange={(e) => handleRadioChange('pet_status', e.target.value)} className="mr-1" />
              <span className="text-gray-700">有</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="pet_status" value="no" checked={formData.pet_status === 'no'} onChange={(e) => handleRadioChange('pet_status', e.target.value)} className="mr-1" />
              <span className="text-gray-700">無</span>
            </label>
          </div>
          {formData.pet_status === 'yes' && (
            <div className="mt-2">
              <input type="text" name="pet_details" value={formData.pet_details} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm" placeholder="例：小型犬（チワワ）1匹、猫2匹" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">車両</label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <label className="flex items-center">
              <input type="checkbox" name="vehicle_car" checked={formData.vehicle_car} onChange={handleChange} className="mr-2" />
              <span className="text-gray-700">車</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="vehicle_motorcycle" checked={formData.vehicle_motorcycle} onChange={handleChange} className="mr-2" />
              <span className="text-gray-700">バイク</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="vehicle_bicycle" checked={formData.vehicle_bicycle} onChange={handleChange} className="mr-2" />
              <span className="text-gray-700">自転車</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" name="vehicle_none" checked={formData.vehicle_none} onChange={handleChange} className="mr-2" />
              <span className="text-gray-700">なし</span>
            </label>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">現在の間取り</label>
            <input type="text" name="current_floor_plan" value={formData.current_floor_plan} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">現在の家賃</label>
            <input type="number" name="current_rent" value={formData.current_rent} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" placeholder="円" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">退去期限</label>
          <input type="date" name="eviction_date" value={formData.eviction_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white" />
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">補足</label>
            <input type="text" name="eviction_date_notes" value={formData.eviction_date_notes} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Section6_CurrentHouse