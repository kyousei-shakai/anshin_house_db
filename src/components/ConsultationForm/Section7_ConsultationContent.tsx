'use client'

import React from 'react'
import { ConsultationFormData } from './types'

// このコンポーネントが親から受け取るpropsの型を定義します
interface Section7_ConsultationContentProps {
  formData: ConsultationFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const Section7_ConsultationContent: React.FC<Section7_ConsultationContentProps> = ({
  formData,
  handleChange,
}) => {
  return (
    <div id="section-7" className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 scroll-mt-24">
      <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-4 mb-6">7. 相談内容等</h2>
      <div className="space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">相談内容（困りごと、何が大変でどうしたいか、等）</label><textarea name="consultation_content" value={formData.consultation_content} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">転居理由</label><textarea name="relocation_reason" value={formData.relocation_reason} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
      </div>
      <div className="mt-4">
        <h3 className="text-md font-medium text-gray-800 mb-2">緊急連絡先</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">氏名</label><input type="text" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">当事者との関係</label><input type="text" name="emergency_contact_relationship" value={formData.emergency_contact_relationship} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">郵便番号</label><input type="text" name="emergency_contact_postal_code" value={formData.emergency_contact_postal_code} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">住所</label><input type="text" name="emergency_contact_address" value={formData.emergency_contact_address} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">自宅電話</label><input type="tel" name="emergency_contact_phone_home" value={formData.emergency_contact_phone_home} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">携帯電話</label><input type="tel" name="emergency_contact_phone_mobile" value={formData.emergency_contact_phone_mobile} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Mail</label><input type="email" name="emergency_contact_email" value={formData.emergency_contact_email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
        </div>
      </div>
      <div className="mt-4"><label className="block text-sm font-medium text-gray-700 mb-1">相談結果</label><textarea name="consultation_result" value={formData.consultation_result} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
    </div>
  )
}

export default Section7_ConsultationContent