//src/components/support/SupportTaskFormOnly.tsx 
'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { type SupportCategory } from '@/types/support'
import { type Staff } from '@/types/staff'
import { createSupportTaskOnly } from '@/app/actions/support'

type Props = {
  userId: string
  categories: SupportCategory[]
  staffs: Pick<Staff, 'id' | 'name'>[]
  currentStaffId?: string
  onSuccess?: () => void
}

export default function SupportTaskFormOnly({ userId, categories, staffs, currentStaffId, onSuccess }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const now = new Date()
  const localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
  
  // --- 予定の状態管理 ---
  const [scheduledAt, setScheduledAt] = useState(localNow)
  const [categoryId, setCategoryId] = useState('')
  const [subCategoryIds, setSubCategoryIds] = useState<string[]>([]) // ★追加
  const [content, setContent] = useState('')
  const [assignedStaffId, setAssignedStaffId] = useState(currentStaffId || '')

  // 副次カテゴリーの選択トグル
  const toggleSubCategory = (id: string) => {
    setSubCategoryIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!scheduledAt || !categoryId || !content || !assignedStaffId) return alert('必須項目を入力してください。')
    
    startTransition(async () => {
      const result = await createSupportTaskOnly({
        user_id: userId,
        scheduled_at: new Date(scheduledAt).toISOString(),
        category_id: categoryId,
        sub_category_ids: subCategoryIds, // ★追加
        content,
        assigned_staff_id: assignedStaffId
      })
      if (result.success) {
        setScheduledAt(localNow); setContent(''); setCategoryId(''); setSubCategoryIds([]); 
        router.refresh();
        if (onSuccess) onSuccess()
      } else { alert(result.error) }
    })
  }

  const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-gray-200 focus:border-gray-400 text-base border p-3 bg-white text-gray-900"
  const labelStyle = "block text-sm font-bold text-gray-600 mb-1"
  const chipStyle = (isSelected: boolean) => `
    px-4 py-2 rounded-full text-sm font-bold border transition-all cursor-pointer select-none
    ${isSelected 
      ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105' 
      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:bg-gray-50'}
  `

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* モード明示 */}
      <div className="bg-teal-50 p-3 rounded-lg border border-teal-200">
        <p className="text-xs font-black text-teal-800 text-center uppercase tracking-widest">予定（次回予約）の登録</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={labelStyle}>予定日時（本日以降）</label>
          <input 
            type="datetime-local" 
            value={scheduledAt} 
            onChange={(e) => setScheduledAt(e.target.value)} 
            className={inputStyle} 
            required 
            min={localNow} 
          />
        </div>
        <div>
          <label className={labelStyle}>予定の主目的</label>
          <select 
            value={categoryId} 
            onChange={(e) => {
              const newId = e.target.value;
              setCategoryId(newId);
              // 主目的と副次が重複しないように除外
              setSubCategoryIds(prev => prev.filter(id => id !== newId));
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

      {/* ★ 副次カテゴリ（予定用チップ選択） */}
      <div className="space-y-3">
        <label className={labelStyle}>予定に含まれる他の内容（任意・複数選択可）</label>
        <div className="flex flex-wrap gap-2">
          {categories
            .filter(cat => cat.id !== categoryId) // 主目的を除外
            .map(cat => (
              <div 
                key={cat.id} 
                onClick={() => toggleSubCategory(cat.id)}
                className={chipStyle(subCategoryIds.includes(cat.id))}
              >
                {cat.name}
              </div>
            ))
          }
        </div>
        {categories.length === 0 && <p className="text-xs text-gray-400 italic">選択できるカテゴリがありません。先にマスタ設定を行ってください。</p>}
      </div>

      <div>
        <label className={labelStyle}>予定の具体的内容</label>
         <textarea 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          className={`${inputStyle} min-h-[120px] resize-none`} 
          placeholder="誰と、どこで、何をするか等を入力してください" 
          required 
          rows={4}
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button 
          type="submit" 
          disabled={isPending} 
          className={`bg-gray-900 text-white py-4 px-12 rounded-lg text-base font-bold hover:bg-black shadow-xl transition-all ${isPending ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'active:scale-95'}`}
        >
          {isPending ? '保存処理中...' : '予定を保存する'}
        </button>
      </div>
    </form>
  )
}