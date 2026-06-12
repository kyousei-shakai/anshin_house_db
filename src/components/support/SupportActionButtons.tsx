//src/components/support/SupportActionButtons.tsx
'use client'

import React, { useState } from 'react'
import { type SupportCategory } from '@/types/support'
import { type Staff } from '@/types/staff'
import SupportRecordForm from './SupportRecordForm'
import SupportTaskFormOnly from './SupportTaskFormOnly'
import { Edit3, CalendarPlus } from 'lucide-react'

type Props = {
  userId: string
  categories: SupportCategory[]
  staffs: Pick<Staff, 'id' | 'name'>[]
  currentStaffId?: string
}

export default function SupportActionButtons({ userId, categories, staffs, currentStaffId }: Props) {
  const [activeForm, setActiveForm] = useState<'none' | 'record' | 'task'>('none')

  const toggleForm = (formType: 'record' | 'task') => {
    setActiveForm(prev => prev === formType ? 'none' : formType)
  }

  const handleSuccess = () => {
    setActiveForm('none')
  }

  return (
    <div className="space-y-4 mb-6">
      {/* ツールバー形式のアクションエリア */}
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 pb-2">
        
        <button
          onClick={() => toggleForm('record')}
          className={`group flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-bold
            ${activeForm === 'record' 
              ? 'bg-gray-900 text-white shadow-md' 
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm'}`}
        >
          <Edit3 className={`w-4 h-4 ${activeForm === 'record' ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
          生活支援の記録
        </button>

        <button
          onClick={() => toggleForm('task')}
          className={`group flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-bold
            ${activeForm === 'task' 
              ? 'bg-gray-900 text-white shadow-md' 
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm'}`}
        >
          <CalendarPlus className={`w-4 h-4 ${activeForm === 'task' ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
          予定の追加
        </button>

        {activeForm !== 'none' && (
          <button 
            onClick={() => setActiveForm('none')}
            className="ml-auto text-xs font-bold text-gray-400 hover:text-gray-600 px-2 transition-colors"
          >
            閉じる
          </button>
        )}
      </div>

      {/* 展開されるフォームエリア：ボタンのデザインに合わせて枠線を細く、背景をフラットに */}
      {activeForm !== 'none' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="mb-4 flex items-center justify-between border-b border-gray-50 pb-3">
             <h4 className="text-sm font-black text-gray-800 uppercase tracking-widest">
               {activeForm === 'record' ? '支援記録の入力' : '新規予定の登録'}
             </h4>
          </div>
          
          {activeForm === 'record' && (
            <SupportRecordForm userId={userId} categories={categories} staffs={staffs} currentStaffId={currentStaffId} onSuccess={handleSuccess} />
          )}
          {activeForm === 'task' && (
            <SupportTaskFormOnly userId={userId} categories={categories} staffs={staffs} currentStaffId={currentStaffId} onSuccess={handleSuccess} />
          )}
        </div>
      )}
    </div>
  )
}