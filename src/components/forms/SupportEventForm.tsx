//src/components/forms/SupportEventForm.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { CONSULTATION_STATUSES, ConsultationStatus } from '@/lib/consultationConstants'
import { getStaffForSelection } from '@/app/actions/staff'

type StaffMember = {
  id: string
  name: string | null
}

// ▼▼▼ 変更点: 型定義をServer Actionのzodスキーマと完全に一致させる ▼▼▼
export type SupportEventFormData = {
  status: ConsultationStatus
  event_note?: string | null
  next_action_date?: string | null
  staff_id: string
}

type InitialData = SupportEventFormData & {
    id: string;
}
// ▲▲▲ 変更点 ▲▲▲

type SupportEventFormProps = {
  currentStatus?: ConsultationStatus
  initialData?: InitialData | null
  onSave: (formData: SupportEventFormData) => Promise<void>
  onCancel: () => void
  isSaving: boolean
}

const SupportEventForm: React.FC<SupportEventFormProps> = ({
  currentStatus,
  initialData,
  onSave,
  onCancel,
  isSaving,
}) => {
  
  const isEditing = !!initialData;

  const [formData, setFormData] = useState<SupportEventFormData>({
    status: initialData?.status || currentStatus || CONSULTATION_STATUSES[0],
    event_note: initialData?.event_note || '',
    next_action_date: initialData?.next_action_date ? new Date(initialData.next_action_date).toISOString().split('T')[0] : '',
    staff_id: initialData?.staff_id || '',
  })

  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [staffError, setStaffError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const result = await getStaffForSelection()
        if (result.success && result.data) {
          setStaffList(result.data)
          if (!isEditing && result.data.length > 0 && !formData.staff_id) {
            setFormData((prev) => ({ ...prev, staff_id: result.data[0].id }))
          }
        } else {
          throw new Error(result.error || '担当者リストの取得に失敗しました。')
        }
      } catch (err) {
        setStaffError(err instanceof Error ? err.message : '担当者リストの読み込みに失敗しました。')
      }
    }
    fetchStaff()
  }, [isEditing, formData.staff_id])

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value === '' ? null : value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {isEditing ? '進捗記録の編集' : '進捗記録の追加'}
        </h2>

        <div className="mt-4">
          <label htmlFor="staff_id" className="block text-sm font-medium text-gray-700">
            担当者 <span className="text-red-500">*</span>
          </label>
          <select
            id="staff_id"
            name="staff_id"
            value={formData.staff_id}
            onChange={handleChange}
            required
            disabled={staffList.length === 0}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="" disabled>選択してください</option>
            {staffList.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.name}
              </option>
            ))}
          </select>
          {staffError && <p className="mt-1 text-sm text-red-500">{staffError}</p>}
        </div>

        <div className="mt-4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            進捗ステータス <span className="text-red-500">*</span>
          </label>
          <select id="status" name="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
            {CONSULTATION_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label htmlFor="next_action_date" className="block text-sm font-medium text-gray-700">
            次回アクション予定日
          </label>
          <input type="date" id="next_action_date" name="next_action_date" value={formData.next_action_date || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>

        <div className="mt-4">
          <label htmlFor="event_note" className="block text-sm font-medium text-gray-700">
            内容 
          </label>
          <textarea id="event_note" name="event_note" value={formData.event_note || ''} onChange={handleChange} rows={5} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="次回予定など" />
        </div>

      </div>

      <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
        <button type="submit" disabled={isSaving || !formData.staff_id} className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
          {isSaving ? '保存中...' : (isEditing ? '記録を更新する' : '記録を保存する')}
        </button>
        <button type="button" onClick={onCancel} className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm">
          キャンセル
        </button>
      </div>
    </form>
  )
}

export default SupportEventForm