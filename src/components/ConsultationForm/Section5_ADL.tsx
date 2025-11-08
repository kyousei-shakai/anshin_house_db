//src/components/ConsultationForm/Section5_ADL.tsx
'use client'

import React from 'react'
import { ConsultationFormData } from './types'

// このコンポーネントが親から受け取るpropsの型を定義します
interface Section5_ADLProps {
  formData: ConsultationFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleRadioChange: (name: keyof ConsultationFormData, value: string) => void;
  // このセクションでは true/false を直接セットする箇所があるため、setFormData自体を渡します
  setFormData: React.Dispatch<React.SetStateAction<ConsultationFormData>>;
}

const Section5_ADL: React.FC<Section5_ADLProps> = ({
  formData,
  handleChange,
  handleRadioChange,
  setFormData,
}) => {
  return (
    <div id="section-5" className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 scroll-mt-24">
      <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-4 mb-6">5. ADL/IADL</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">認知症</label><input type="text" name="dementia" value={formData.dementia} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">病院名</label><input type="text" name="dementia_hospital" value={formData.dementia_hospital} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
      </div>
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">通院支援</label>
          <div className="flex space-x-4">
            <label className="flex items-center"><input type="radio" name="hospital_support_required" checked={formData.hospital_support_required === true} onChange={() => setFormData(prev => ({ ...prev, hospital_support_required: true }))} className="mr-1" /><span className="text-gray-700">要</span></label>
            <label className="flex items-center"><input type="radio" name="hospital_support_required" checked={formData.hospital_support_required === false} onChange={() => setFormData(prev => ({ ...prev, hospital_support_required: false }))} className="mr-1" /><span className="text-gray-700">不要</span></label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">内服管理の必要性</label>
          <div className="flex space-x-4">
            <label className="flex items-center"><input type="radio" name="medication_management_needed" checked={formData.medication_management_needed === true} onChange={() => setFormData(prev => ({ ...prev, medication_management_needed: true }))} className="mr-1" /><span className="text-gray-700">有</span></label>
            <label className="flex items-center"><input type="radio" name="medication_management_needed" checked={formData.medication_management_needed === false} onChange={() => setFormData(prev => ({ ...prev, medication_management_needed: false }))} className="mr-1" /><span className="text-gray-700">無</span></label>
          </div>
        </div>
      </div>
      <div className="mt-6 border-t pt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">移動</label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <label className="flex items-center"><input type="radio" name="mobility_status" value="independent" checked={formData.mobility_status === 'independent'} onChange={(e) => handleRadioChange('mobility_status', e.target.value)} className="mr-1" /><span className="text-gray-700">自立</span></label>
            <label className="flex items-center"><input type="radio" name="mobility_status" value="partial_assist" checked={formData.mobility_status === 'partial_assist'} onChange={(e) => handleRadioChange('mobility_status', e.target.value)} className="mr-1" /><span className="text-gray-700">一部介助</span></label>
            <label className="flex items-center"><input type="radio" name="mobility_status" value="full_assist" checked={formData.mobility_status === 'full_assist'} onChange={(e) => handleRadioChange('mobility_status', e.target.value)} className="mr-1" /><span className="text-gray-700">全介助</span></label>
            <label className="flex items-center"><input type="radio" name="mobility_status" value="other" checked={formData.mobility_status === 'other'} onChange={(e) => handleRadioChange('mobility_status', e.target.value)} className="mr-1" /><span className="text-gray-700">その他</span></label>
          </div>
          {formData.mobility_status === 'other' && (
            <input type="text" name="mobility_other_text" value={formData.mobility_other_text} onChange={handleChange} placeholder="その他の詳細" className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">移動補助具・福祉用具</label>
          <input type="text" name="mobility_aids" value={formData.mobility_aids} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">食事</label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <label className="flex items-center"><input type="radio" name="eating_status" value="independent" checked={formData.eating_status === 'independent'} onChange={(e) => handleRadioChange('eating_status', e.target.value)} className="mr-1" /><span className="text-gray-700">自立</span></label>
            <label className="flex items-center"><input type="radio" name="eating_status" value="partial_assist" checked={formData.eating_status === 'partial_assist'} onChange={(e) => handleRadioChange('eating_status', e.target.value)} className="mr-1" /><span className="text-gray-700">一部介助</span></label>
            <label className="flex items-center"><input type="radio" name="eating_status" value="full_assist" checked={formData.eating_status === 'full_assist'} onChange={(e) => handleRadioChange('eating_status', e.target.value)} className="mr-1" /><span className="text-gray-700">全介助</span></label>
            <label className="flex items-center"><input type="radio" name="eating_status" value="other" checked={formData.eating_status === 'other'} onChange={(e) => handleRadioChange('eating_status', e.target.value)} className="mr-1" /><span className="text-gray-700">その他</span></label>
          </div>
          {formData.eating_status === 'other' && (
            <input type="text" name="eating_other_text" value={formData.eating_other_text} onChange={handleChange} placeholder="その他の詳細" className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">買物</label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <label className="flex items-center"><input type="radio" name="shopping_status" value="possible" checked={formData.shopping_status === 'possible'} onChange={(e) => handleRadioChange('shopping_status', e.target.value)} className="mr-1" /><span className="text-gray-700">可</span></label>
            <label className="flex items-center"><input type="radio" name="shopping_status" value="support_needed" checked={formData.shopping_status === 'support_needed'} onChange={(e) => handleRadioChange('shopping_status', e.target.value)} className="mr-1" /><span className="text-gray-700">支援必要</span></label>
          </div>
          {formData.shopping_status === 'support_needed' && (
            <input type="text" name="shopping_support_text" value={formData.shopping_support_text} onChange={handleChange} placeholder="支援内容の詳細" className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ゴミ出し</label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <label className="flex items-center"><input type="radio" name="garbage_disposal_status" value="independent" checked={formData.garbage_disposal_status === 'independent'} onChange={(e) => handleRadioChange('garbage_disposal_status', e.target.value)} className="mr-1" /><span className="text-gray-700">自立</span></label>
            <label className="flex items-center"><input type="radio" name="garbage_disposal_status" value="support_needed" checked={formData.garbage_disposal_status === 'support_needed'} onChange={(e) => handleRadioChange('garbage_disposal_status', e.target.value)} className="mr-1" /><span className="text-gray-700">支援必要</span></label>
          </div>
          {formData.garbage_disposal_status === 'support_needed' && (
            <input type="text" name="garbage_disposal_support_text" value={formData.garbage_disposal_support_text} onChange={handleChange} placeholder="支援内容の詳細" className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">排泄</label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <label className="flex items-center"><input type="radio" name="excretion_status" value="independent" checked={formData.excretion_status === 'independent'} onChange={(e) => handleRadioChange('excretion_status', e.target.value)} className="mr-1" /><span className="text-gray-700">自立</span></label>
            <label className="flex items-center"><input type="radio" name="excretion_status" value="partial_assist" checked={formData.excretion_status === 'partial_assist'} onChange={(e) => handleRadioChange('excretion_status', e.target.value)} className="mr-1" /><span className="text-gray-700">一部介助</span></label>
            <label className="flex items-center"><input type="radio" name="excretion_status" value="full_assist" checked={formData.excretion_status === 'full_assist'} onChange={(e) => handleRadioChange('excretion_status', e.target.value)} className="mr-1" /><span className="text-gray-700">全介助</span></label>
            <label className="flex items-center"><input type="radio" name="excretion_status" value="other" checked={formData.excretion_status === 'other'} onChange={(e) => handleRadioChange('excretion_status', e.target.value)} className="mr-1" /><span className="text-gray-700">その他</span></label>
          </div>
          {formData.excretion_status === 'other' && (
            <input type="text" name="excretion_other_text" value={formData.excretion_other_text} onChange={handleChange} placeholder="その他の詳細" className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">2階への移動</label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <label className="flex items-center"><input type="radio" name="second_floor_possible" value="possible" checked={formData.second_floor_possible === 'possible'} onChange={(e) => handleRadioChange('second_floor_possible', e.target.value)} className="mr-1" /><span className="text-gray-700">可</span></label>
            <label className="flex items-center"><input type="radio" name="second_floor_possible" value="impossible" checked={formData.second_floor_possible === 'impossible'} onChange={(e) => handleRadioChange('second_floor_possible', e.target.value)} className="mr-1" /><span className="text-gray-700">不可</span></label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">入浴</label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <label className="flex items-center"><input type="radio" name="bathing_status" value="independent" checked={formData.bathing_status === 'independent'} onChange={(e) => handleRadioChange('bathing_status', e.target.value)} className="mr-1" /><span className="text-gray-700">自立</span></label>
            <label className="flex items-center"><input type="radio" name="bathing_status" value="partial_assist" checked={formData.bathing_status === 'partial_assist'} onChange={(e) => handleRadioChange('bathing_status', e.target.value)} className="mr-1" /><span className="text-gray-700">一部介助</span></label>
            <label className="flex items-center"><input type="radio" name="bathing_status" value="full_assist" checked={formData.bathing_status === 'full_assist'} onChange={(e) => handleRadioChange('bathing_status', e.target.value)} className="mr-1" /><span className="text-gray-700">全介助</span></label>
            <label className="flex items-center"><input type="radio" name="bathing_status" value="other" checked={formData.bathing_status === 'other'} onChange={(e) => handleRadioChange('bathing_status', e.target.value)} className="mr-1" /><span className="text-gray-700">その他</span></label>
          </div>
          {formData.bathing_status === 'other' && (
            <input type="text" name="bathing_other_text" value={formData.bathing_other_text} onChange={handleChange} placeholder="その他の詳細" className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">金銭管理支援者</label>
          <input type="text" name="money_management_supporter" value={formData.money_management_supporter} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">代理納付サービスの利用</label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <label className="flex items-center"><input type="radio" name="uses_proxy_payment_service" value="yes" checked={formData.uses_proxy_payment_service === 'yes'} onChange={(e) => handleRadioChange('uses_proxy_payment_service', e.target.value)} className="mr-1" /><span className="text-gray-700">有</span></label>
            <label className="flex items-center"><input type="radio" name="uses_proxy_payment_service" value="no" checked={formData.uses_proxy_payment_service === 'no'} onChange={(e) => handleRadioChange('uses_proxy_payment_service', e.target.value)} className="mr-1" /><span className="text-gray-700">無</span></label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">家賃納入方法</label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <label className="flex items-center"><input type="radio" name="rent_payment_method" value="transfer" checked={formData.rent_payment_method === 'transfer'} onChange={(e) => handleRadioChange('rent_payment_method', e.target.value)} className="mr-1" /><span className="text-gray-700">振込</span></label>
            <label className="flex items-center"><input type="radio" name="rent_payment_method" value="collection" checked={formData.rent_payment_method === 'collection'} onChange={(e) => handleRadioChange('rent_payment_method', e.target.value)} className="mr-1" /><span className="text-gray-700">集金</span></label>
            <label className="flex items-center"><input type="radio" name="rent_payment_method" value="automatic" checked={formData.rent_payment_method === 'automatic'} onChange={(e) => handleRadioChange('rent_payment_method', e.target.value)} className="mr-1" /><span className="text-gray-700">口座振替</span></label>
          </div>
        </div>
      </div>
      <div className="mt-4"><label className="block text-sm font-medium text-gray-700 mb-1">その他特記事項</label><textarea name="other_notes" value={formData.other_notes} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" placeholder="例：聴力、視力、喫煙" /></div>
    </div>
  )
}

export default Section5_ADL