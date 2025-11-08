//src/components/ConsultationForm/Section4_Relocation.tsx
'use client'

import React from 'react'
import { ConsultationFormData } from './types'

// このコンポーネントが親から受け取るpropsの型を定義します
interface Section4_RelocationProps {
  formData: ConsultationFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleRadioChange: (name: keyof ConsultationFormData, value: string) => void;
}

const Section4_Relocation: React.FC<Section4_RelocationProps> = ({
  formData,
  handleChange,
  handleRadioChange,
}) => {
  return (
    <div id="section-4" className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 scroll-mt-24">
      <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-4 mb-6">4. 他市区町村への転居</h2>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">現在の住所以外の市区町村への転居を希望されていますか？</label>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <label className="flex items-center">
            <input type="radio" name="is_relocation_to_other_city_desired" value="yes" checked={formData.is_relocation_to_other_city_desired === 'yes'} onChange={(e) => handleRadioChange('is_relocation_to_other_city_desired', e.target.value)} className="mr-1" />
            <span className="text-gray-700">はい</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="is_relocation_to_other_city_desired" value="no" checked={formData.is_relocation_to_other_city_desired === 'no'} onChange={(e) => handleRadioChange('is_relocation_to_other_city_desired', e.target.value)} className="mr-1" />
            <span className="text-gray-700">いいえ</span>
          </label>
        </div>
      </div>
      {formData.is_relocation_to_other_city_desired === 'yes' && (
        <div className="mt-6 border-t pt-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">引越しの実現可能性について、行政からの見解</label>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <label className="flex items-center">
                <input type="radio" name="relocation_admin_opinion" value="possible" checked={formData.relocation_admin_opinion === 'possible'} onChange={(e) => handleRadioChange('relocation_admin_opinion', e.target.value)} className="mr-1" />
                <span className="text-gray-700">可</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="relocation_admin_opinion" value="impossible" checked={formData.relocation_admin_opinion === 'impossible'} onChange={(e) => handleRadioChange('relocation_admin_opinion', e.target.value)} className="mr-1" />
                <span className="text-gray-700">否</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="relocation_admin_opinion" value="pending" checked={formData.relocation_admin_opinion === 'pending'} onChange={(e) => handleRadioChange('relocation_admin_opinion', e.target.value)} className="mr-1" />
                <span className="text-gray-700">確認中</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="relocation_admin_opinion" value="other" checked={formData.relocation_admin_opinion === 'other'} onChange={(e) => handleRadioChange('relocation_admin_opinion', e.target.value)} className="mr-1" />
                <span className="text-gray-700">その他</span>
              </label>
            </div>
            {formData.relocation_admin_opinion === 'other' && (
              <textarea name="relocation_admin_opinion_details" value={formData.relocation_admin_opinion_details} onChange={handleChange} rows={3} className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm" placeholder="その他の詳細" />
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">転居に伴う費用負担</label>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <label className="flex items-center">
                <input type="radio" name="relocation_cost_bearer" value="previous_city" checked={formData.relocation_cost_bearer === 'previous_city'} onChange={(e) => handleRadioChange('relocation_cost_bearer', e.target.value)} className="mr-1" />
                <span className="text-gray-700">転居前の市区町村が負担</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="relocation_cost_bearer" value="next_city" checked={formData.relocation_cost_bearer === 'next_city'} onChange={(e) => handleRadioChange('relocation_cost_bearer', e.target.value)} className="mr-1" />
                <span className="text-gray-700">転居先の市区町村が負担</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="relocation_cost_bearer" value="self" checked={formData.relocation_cost_bearer === 'self'} onChange={(e) => handleRadioChange('relocation_cost_bearer', e.target.value)} className="mr-1" />
                <span className="text-gray-700">利用者本人の負担</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="relocation_cost_bearer" value="pending" checked={formData.relocation_cost_bearer === 'pending'} onChange={(e) => handleRadioChange('relocation_cost_bearer', e.target.value)} className="mr-1" />
                <span className="text-gray-700">確認中</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="relocation_cost_bearer" value="other" checked={formData.relocation_cost_bearer === 'other'} onChange={(e) => handleRadioChange('relocation_cost_bearer', e.target.value)} className="mr-1" />
                <span className="text-gray-700">その他</span>
              </label>
            </div>
            {formData.relocation_cost_bearer === 'other' && (
              <textarea name="relocation_cost_bearer_details" value={formData.relocation_cost_bearer_details} onChange={handleChange} rows={3} className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm" placeholder="その他の詳細" />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">その他の特記事項、今後の課題など</label>
            <textarea name="relocation_notes" value={formData.relocation_notes} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" placeholder="例：〇〇市△△課の□□様へ確認。生活保護の移管手続きについて、来週再度連絡予定。" />
          </div>
        </div>
      )}
    </div>
  )
}

export default Section4_Relocation