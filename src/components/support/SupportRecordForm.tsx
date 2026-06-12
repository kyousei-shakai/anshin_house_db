//src/components/support/SupportRecordForm.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { type SupportCategory, type CreateSupportLogWithTaskArgs } from '@/types/support'
import { type Staff } from '@/types/staff'
import { createSupportLogWithTask } from '@/app/actions/support'

type Props = {
  userId: string
  categories: SupportCategory[]
  staffs: Pick<Staff, 'id' | 'name'>[]
  currentStaffId?: string
  onSuccess?: () => void
}

export default function SupportRecordForm({ userId, categories, staffs, currentStaffId, onSuccess }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // 今日の日時（分単位まで）を制限用と初期値用に取得
  const now = new Date();
  const localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

  const [supportAt, setSupportAt] = useState(localNow)
  const [logCategoryId, setLogCategoryId] = useState('')
  const [logContent, setLogContent] = useState('')
  const [performedByStaffId, setPerformedByStaffId] = useState(currentStaffId || '')
  
  const [hasTask, setHasTask] = useState(false)
  const [taskScheduledAt, setTaskScheduledAt] = useState(localNow)
  const [taskCategoryId, setTaskCategoryId] = useState('')
  const [taskContent, setTaskContent] = useState('')
  const [assignedStaffId, setAssignedStaffId] = useState(currentStaffId || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!logCategoryId || !logContent || !performedByStaffId) return alert('必須項目を入力してください。')
    
    startTransition(async () => {
      const args: CreateSupportLogWithTaskArgs = {
        user_id: userId,
        performed_by_staff_id: performedByStaffId,
        support_date: new Date(supportAt).toISOString(),
        log_category_id: logCategoryId,
        content: logContent,
        task: hasTask ? {
          assigned_staff_id: assignedStaffId,
          scheduled_at: new Date(taskScheduledAt).toISOString(),
          category_id: taskCategoryId,
          content: taskContent
        } : undefined
      }
      const result = await createSupportLogWithTask(args)
      if (result.success) {
        setLogContent(''); setTaskContent(''); setHasTask(false); router.refresh();
        if (onSuccess) onSuccess()
      } else { alert(`エラー: ${result.error}`) }
    })
  }

  const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base border p-3 bg-white text-gray-900"
  const labelStyle = "block text-sm font-bold text-gray-600 mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* モード明示エリア */}
      <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
        <p className="text-sm font-bold text-slate-800 text-center">【実施済み】支援実績の報告フォーム</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className={labelStyle}>実施日時（本日以前）</label>
          <input 
            type="datetime-local" 
            value={supportAt} 
            onChange={(e) => setSupportAt(e.target.value)} 
            className={inputStyle} 
            required 
            max={localNow} // ★未来の日付を選択不可にする
          />
        </div>
        <div>
          <label className={labelStyle}>カテゴリ</label>
          <select value={logCategoryId} onChange={(e) => setLogCategoryId(e.target.value)} className={inputStyle} required>
            <option value="">選択</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelStyle}>対応スタッフ</label>
          <select value={performedByStaffId} onChange={(e) => setPerformedByStaffId(e.target.value)} className={inputStyle} required>
            <option value="">選択</option>
            {staffs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelStyle}>支援の具体的内容</label>
        <textarea rows={3} value={logContent} onChange={(e) => setLogContent(e.target.value)} className={inputStyle} placeholder="どのような支援を行い、どのような様子だったかを入力してください" required />
      </div>

      {/* 次回予定のセクション */}
      <div className="relative flex items-start border-t border-gray-200 pt-6">
        <div className="flex h-6 items-center">
          <input id="has-task" type="checkbox" checked={hasTask} onChange={(e) => setHasTask(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        </div>
        <div className="ml-3 text-sm leading-6">
          <label htmlFor="has-task" className="font-bold text-gray-900 cursor-pointer select-none">
            あわせて「次回の予定」も登録する
          </label>
        </div>
      </div>

      {hasTask && (
        <div className="bg-blue-50/50 p-5 rounded-xl border-2 border-blue-100 shadow-sm space-y-4 animate-in slide-in-from-top-2 duration-300">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">次回予定の入力</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelStyle}>予定日時（本日以降）</label>
              <input 
                type="datetime-local" 
                value={taskScheduledAt} 
                onChange={(e) => setTaskScheduledAt(e.target.value)} 
                className={inputStyle} 
                required 
                min={localNow} // ★過去の日付を選択不可にする
              />
            </div>
            <div>
              <label className={labelStyle}>予定カテゴリ</label>
              <select value={taskCategoryId} onChange={(e) => setTaskCategoryId(e.target.value)} className={inputStyle} required>
                <option value="">選択</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelStyle}>次回担当</label>
              <select value={assignedStaffId} onChange={(e) => setAssignedStaffId(e.target.value)} className={inputStyle} required>
                <option value="">選択</option>
                {staffs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div><label className={labelStyle}>予定の内容</label><input type="text" value={taskContent} onChange={(e) => setTaskContent(e.target.value)} className={inputStyle} placeholder="次回の予定内容" required /></div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={isPending} 
          className={`bg-blue-600 text-white py-3 px-10 rounded-lg text-base font-bold hover:bg-blue-700 shadow-lg transition-all ${isPending ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'active:scale-95'}`}
        >
          {isPending ? '保存処理中...' : '実績を保存する'}
        </button>
      </div>
    </form>
  )
}