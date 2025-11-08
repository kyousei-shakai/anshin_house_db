//src/components/ConsultationForm/Section2_PhysicalStatus.tsx
'use client'

import React from 'react'
import { ConsultationFormData } from './types'

// このコンポーネントが親から受け取るpropsの型を定義します
interface Section2_PhysicalStatusProps {
  formData: ConsultationFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const Section2_PhysicalStatus: React.FC<Section2_PhysicalStatusProps> = ({
  formData,
  handleChange,
}) => {
  return (
    <div id="section-2" className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 scroll-mt-24">
      <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-4 mb-6">2. 身体状況・利用サービス</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">身体状況</label>
          <div className="space-y-1">
            {[{ value: 'independent', label: '自立' }, { value: 'support1', label: '要支援１' }, { value: 'support2', label: '要支援２' }, { value: 'care1', label: '要介護１' }, { value: 'care2', label: '要介護２' }, { value: 'care3', label: '要介護３' }, { value: 'care4', label: '要介護４' }, { value: 'care5', label: '要介護５' }].map(option => (<label key={option.value} className="flex items-center"><input type="radio" name="physical_condition" value={option.value} checked={formData.physical_condition === option.value} onChange={handleChange} className="mr-2" /><span className="text-gray-700">{option.label}</span></label>))}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">手帳</label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2"><input type="checkbox" name="mental_disability_certificate" checked={formData.mental_disability_certificate} onChange={handleChange} className="mr-2" /><span className="text-gray-700">精神障害者保健福祉手帳</span>{formData.mental_disability_certificate && (<input type="text" name="mental_disability_level" value={formData.mental_disability_level} onChange={handleChange} placeholder="等級" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700" />)}</div>
          <div className="flex items-center space-x-2"><input type="checkbox" name="physical_disability_certificate" checked={formData.physical_disability_certificate} onChange={handleChange} className="mr-2" /><span className="text-gray-700">身体障害者手帳</span>{formData.physical_disability_certificate && (<input type="text" name="physical_disability_level" value={formData.physical_disability_level} onChange={handleChange} placeholder="等級" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700" />)}</div>
          <div className="flex items-center space-x-2"><input type="checkbox" name="therapy_certificate" checked={formData.therapy_certificate} onChange={handleChange} className="mr-2" /><span className="text-gray-700">療育手帳</span>{formData.therapy_certificate && (<input type="text" name="therapy_level" value={formData.therapy_level} onChange={handleChange} placeholder="区分" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700" />)}</div>
        </div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">利用中の支援サービス</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <label className="flex items-center"><input type="checkbox" name="service_day_service" checked={formData.service_day_service} onChange={handleChange} className="mr-2" /><span className="text-gray-700">デイサービス</span></label>
          <label className="flex items-center"><input type="checkbox" name="service_visiting_nurse" checked={formData.service_visiting_nurse} onChange={handleChange} className="mr-2" /><span className="text-gray-700">訪問看護</span></label>
          <label className="flex items-center"><input type="checkbox" name="service_visiting_care" checked={formData.service_visiting_care} onChange={handleChange} className="mr-2" /><span className="text-gray-700">訪問介護</span></label>
          <label className="flex items-center"><input type="checkbox" name="service_home_medical" checked={formData.service_home_medical} onChange={handleChange} className="mr-2" /><span className="text-gray-800">在宅診療</span></label>
          <label className="flex items-center"><input type="checkbox" name="service_short_stay" checked={formData.service_short_stay} onChange={handleChange} className="mr-2" /><span className="text-gray-800">短期入所施設</span></label>
          <div>
            <label className="flex items-center"><input type="checkbox" name="service_other" checked={formData.service_other} onChange={handleChange} className="mr-2" /><span className="text-gray-800">その他</span></label>
            {formData.service_other && (<input type="text" name="service_other_text" value={formData.service_other_text} onChange={handleChange} placeholder="詳細" className="mt-1 w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-700" />)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">サービス提供事業所</label><input type="text" name="service_provider" value={formData.service_provider} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">居宅介護支援事業所</label><input type="text" name="care_support_office" value={formData.care_support_office} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">担当</label><input type="text" name="care_manager" value={formData.care_manager} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
      </div>
      <div className="mt-4"><label className="block text-sm font-medium text-gray-700 mb-1">既往症及び病歴</label><textarea name="medical_history" value={formData.medical_history} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
    </div>
  )
}

export default Section2_PhysicalStatus