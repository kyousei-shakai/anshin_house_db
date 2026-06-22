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

  const now = new Date();
  const localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

  // --- 支援実績の状態管理 ---
  const [supportAt, setSupportAt] = useState(localNow)
  const [logCategoryId, setLogCategoryId] = useState('')
  const [logSubCategoryIds, setLogSubCategoryIds] = useState<string[]>([]) // ★追加
  const [logContent, setLogContent] = useState('')
  const [performedByStaffId, setPerformedByStaffId] = useState(currentStaffId || '')
  
  // --- 次回予定の状態管理 ---
  const [hasTask, setHasTask] = useState(false)
  const [taskScheduledAt, setTaskScheduledAt] = useState(localNow)
  const [taskCategoryId, setTaskCategoryId] = useState('')
  const [taskSubCategoryIds, setTaskSubCategoryIds] = useState<string[]>([]) // ★追加
  const [taskContent, setTaskContent] = useState('')
  const [assignedStaffId, setAssignedStaffId] = useState(currentStaffId || '')

  // 副次カテゴリーの選択・解除を切り替える関数
  const toggleSubCategory = (id: string, isTask: boolean) => {
    if (isTask) {
      setTaskSubCategoryIds(prev => 
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      )
    } else {
      setLogSubCategoryIds(prev => 
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!logCategoryId || !logContent || !performedByStaffId) return alert('必須項目を入力してください。')
    
    startTransition(async () => {
      const args: CreateSupportLogWithTaskArgs = {
        user_id: userId,
        performed_by_staff_id: performedByStaffId,
        support_date: new Date(supportAt).toISOString(),
        log_category_id: logCategoryId,
        log_sub_category_ids: logSubCategoryIds, // ★追加
        content: logContent,
        task: hasTask ? {
          assigned_staff_id: assignedStaffId,
          scheduled_at: new Date(taskScheduledAt).toISOString(),
          category_id: taskCategoryId,
          sub_category_ids: taskSubCategoryIds, // ★追加
          content: taskContent
        } : undefined
      }
      const result = await createSupportLogWithTask(args)
      if (result.success) {
        setLogContent(''); setTaskContent(''); setHasTask(false); 
        setLogSubCategoryIds([]); setTaskSubCategoryIds([]);
        router.refresh();
        if (onSuccess) onSuccess()
      } else { alert(`エラー: ${result.error}`) }
    })
  }

  const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base border p-3 bg-white text-gray-900"
  const labelStyle = "block text-sm font-bold text-gray-600 mb-1"
  
  // プロフェッショナルなチップ（タグ）スタイル
  const chipStyle = (isSelected: boolean) => `
    px-4 py-2 rounded-full text-sm font-bold border transition-all cursor-pointer select-none
    ${isSelected 
      ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105' 
      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:bg-gray-50'}
  `

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 実績報告セクションの見出し */}
      <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
        <p className="text-xs font-black text-slate-800 text-center uppercase tracking-widest">支援実績の報告</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={labelStyle}>実施日時</label>
          <input type="datetime-local" value={supportAt} onChange={(e) => setSupportAt(e.target.value)} className={inputStyle} required max={localNow} />
        </div>
        <div>
          <label className={labelStyle}>主目的（カテゴリ）</label>
          <select 
            value={logCategoryId} 
            onChange={(e) => {
              const newId = e.target.value;
              setLogCategoryId(newId);
              // 主カテゴリに選んだものを副次から除外する
              setLogSubCategoryIds(prev => prev.filter(id => id !== newId));
            }} 
            className={inputStyle} 
            required
          >
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

      {/* ★ 副次カテゴリ（実績用） */}
      <div className="space-y-3">
        <label className={labelStyle}>他に行った支援（任意・複数選択可）</label>
        <div className="flex flex-wrap gap-2">
          {categories
            .filter(cat => cat.id !== logCategoryId) // 主カテゴリは除外
            .map(cat => (
              <div 
                key={cat.id} 
                onClick={() => toggleSubCategory(cat.id, false)}
                className={chipStyle(logSubCategoryIds.includes(cat.id))}
              >
                {cat.name}
              </div>
            ))
          }
        </div>
      </div>

      <div>
        <label className={labelStyle}>支援の具体的内容</label>
        <textarea rows={4} value={logContent} onChange={(e) => setLogContent(e.target.value)} className={inputStyle} placeholder="支援の詳しい様子を入力してください" required />
      </div>

      {/* 次回予定セクションのトグル */}
      <div className="relative flex items-start border-t border-gray-200 pt-6">
        <div className="flex h-6 items-center">
          <input id="has-task" type="checkbox" checked={hasTask} onChange={(e) => setHasTask(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        </div>
        <div className="ml-3 text-sm leading-6">
          <label htmlFor="has-task" className="font-bold text-gray-900 cursor-pointer select-none">あわせて「次回の予定」も登録する</label>
        </div>
      </div>

      {hasTask && (
        <div className="bg-blue-50/30 p-6 rounded-xl border-2 border-blue-100 shadow-sm space-y-6 animate-in slide-in-from-top-2 duration-300">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">次回予定の入力</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelStyle}>予定日時</label>
              <input type="datetime-local" value={taskScheduledAt} onChange={(e) => setTaskScheduledAt(e.target.value)} className={inputStyle} required min={localNow} />
            </div>
            <div>
              <label className={labelStyle}>予定の主目的</label>
              <select 
                value={taskCategoryId} 
                onChange={(e) => {
                  const newId = e.target.value;
                  setTaskCategoryId(newId);
                  setTaskSubCategoryIds(prev => prev.filter(id => id !== newId));
                }} 
                className={inputStyle} 
                required
              >
                <option value="">選択</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelStyle}>次回担当スタッフ</label>
              <select value={assignedStaffId} onChange={(e) => setAssignedStaffId(e.target.value)} className={inputStyle} required>
                <option value="">選択</option>
                {staffs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* ★ 副次カテゴリ（予定用） */}
          <div className="space-y-3">
            <label className={labelStyle}>予定に含まれる他の支援（任意）</label>
            <div className="flex flex-wrap gap-2">
              {categories
                .filter(cat => cat.id !== taskCategoryId)
                .map(cat => (
                  <div 
                    key={cat.id} 
                    onClick={() => toggleSubCategory(cat.id, true)}
                    className={chipStyle(taskSubCategoryIds.includes(cat.id))}
                  >
                    {cat.name}
                  </div>
                ))
              }
            </div>
          </div>

          <div>
            <label className={labelStyle}>予定の具体的内容</label>
            <input type="text" value={taskContent} onChange={(e) => setTaskContent(e.target.value)} className={inputStyle} placeholder="次回の予定の詳細" required />
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button 
          type="submit" 
          disabled={isPending} 
          className={`bg-blue-600 text-white py-4 px-12 rounded-lg text-base font-bold hover:bg-blue-700 shadow-xl transition-all ${isPending ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'active:scale-95'}`}
        >
          {isPending ? '保存処理中...' : '支援実績を保存する'}
        </button>
      </div>
    </form>
  )
}