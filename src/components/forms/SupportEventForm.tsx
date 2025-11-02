//src/components/forms/SupportEventForm.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { CONSULTATION_STATUSES, ConsultationStatus } from '@/lib/consultationConstants'
import { getStaffForSelection } from '@/app/actions/staff' // ★ 変更点: staffApiの代わりにServer Actionをインポート

type StaffMember = {
  id: string
  name: string | null
}

type SupportEventFormProps = {
  // consultationId: string // ★ 修正点: この行を削除
  currentStatus: ConsultationStatus
  onSave: (formData: FormData) => Promise<void>
  onCancel: () => void
  isSaving: boolean
}

export type FormData = {
  status: ConsultationStatus
  event_note: string
  next_action_date: string
  staff_id: string
}

const SupportEventForm: React.FC<SupportEventFormProps> = ({
  // consultationId,
  currentStatus,
  onSave,
  onCancel,
  isSaving,
}) => {
  const [formData, setFormData] = useState<FormData>({
    status: currentStatus,
    event_note: '',
    next_action_date: '',
    staff_id: '',
  })

  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [staffError, setStaffError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        // ★ 変更点: staffApiの代わりにServer Actionを呼び出す
        const result = await getStaffForSelection()
        if (result.success && result.data) {
          setStaffList(result.data)
          if (result.data.length > 0) {
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
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">進捗記録の追加</h2>

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
          <input type="date" id="next_action_date" name="next_action_date" value={formData.next_action_date} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>

        <div className="mt-4">
          <label htmlFor="event_note" className="block text-sm font-medium text-gray-700">
            内容 
          </label>
          <textarea id="event_note" name="event_note" value={formData.event_note} onChange={handleChange} rows={5} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="次回予定など" />
        </div>

      </div>

      <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
        <button type="submit" disabled={isSaving || !formData.staff_id} className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
          {isSaving ? '保存中...' : '記録を保存する'}
        </button>
        <button type="button" onClick={onCancel} className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm">
          キャンセル
        </button>
      </div>
    </form>
  )
}

export default SupportEventForm