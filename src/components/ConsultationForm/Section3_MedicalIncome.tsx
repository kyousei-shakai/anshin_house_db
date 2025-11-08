//src/components/ConsultationForm/Section3_MedicalIncome.tsx
'use client'

import React from 'react'
import { ConsultationFormData } from './types'

// このコンポーネントが親から受け取るpropsの型を定義します
interface Section3_MedicalIncomeProps {
  formData: ConsultationFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const Section3_MedicalIncome: React.FC<Section3_MedicalIncomeProps> = ({
  formData,
  handleChange,
}) => {
  return (
    <div id="section-3" className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 scroll-mt-24">
      <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-4 mb-6">3. 医療・収入</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">かかりつけ医療機関 - 名称</label><input type="text" name="medical_institution_name" value={formData.medical_institution_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">かかりつけ医療機関 - 担当</label><input type="text" name="medical_institution_staff" value={formData.medical_institution_staff} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" /></div>
      </div>
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">収入</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="block text-sm text-gray-600 mb-1">給与</label><input type="number" name="income_salary" value={formData.income_salary} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" placeholder="円" /></div>
          <div><label className="block text-sm text-gray-600 mb-1">傷病手当</label><input type="number" name="income_injury_allowance" value={formData.income_injury_allowance} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" placeholder="円" /></div>
          <div><label className="block text-sm text-gray-600 mb-1">年金振込額</label><input type="number" name="income_pension" value={formData.income_pension} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700" placeholder="円" /></div>
        </div>
        <div className="mt-2 flex items-center space-x-4">
          <label className="flex items-center"><input type="checkbox" name="welfare_recipient" checked={formData.welfare_recipient} onChange={handleChange} className="mr-2" /><span className="text-gray-700">生活保護受給</span></label>
          {formData.welfare_recipient && (<input type="text" name="welfare_staff" value={formData.welfare_staff} onChange={handleChange} placeholder="生保担当者" className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700" />)}
        </div>
        <div className="mt-2"><label className="block text-sm text-gray-600 mb-1">預金</label><input type="number" name="savings" value={formData.savings} onChange={handleChange} className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md text-gray-700" placeholder="円" /></div>
      </div>
    </div>
  )
}

export default Section3_MedicalIncome