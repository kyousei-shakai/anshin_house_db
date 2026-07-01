//src/components/support/SupportTaskList.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { type SupportTaskWithStaff, type SupportCategory } from '@/types/support'
import { type Staff } from '@/types/staff'
// ★ 修正：deleteSupportTask をインポートに追加
import { completeSupportTask, cancelSupportTask, updateSupportTask, deleteSupportTask } from '@/app/actions/support'
import { Clock } from 'lucide-react'

type Props = {
  userId: string
  tasks: SupportTaskWithStaff[]
  staffs: Pick<Staff, 'id' | 'name'>[]
  categories: SupportCategory[]
}

export default function SupportTaskList({ userId, tasks, staffs, categories }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // --- 編集用ステート ---
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editAt, setEditAt] = useState('')
  const [editCategoryId, setEditCategoryId] = useState('')
  const [editSubCategoryIds, setEditSubCategoryIds] = useState<string[]>([]) // ★復活
  const [editContent, setEditContent] = useState('')
  const [editStaffId, setEditStaffId] = useState('')

  if (!tasks || tasks.length === 0) {
    return (
      <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-lg">
        <p className="text-sm text-gray-400 font-medium">現在、予定されているタスクはありません。</p>
      </div>
    )
  }

  const toggleEditSubCategory = (id: string) => {
    setEditSubCategoryIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const startEdit = (task: SupportTaskWithStaff) => {
    const localAt = new Date(new Date(task.scheduled_at).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
    setEditAt(localAt)
    setEditCategoryId(task.category_id)
    // 既存の副次カテゴリーIDをステートにセット
    setEditSubCategoryIds(task.sub_categories?.map(s => s.category_id) || [])
    setEditContent(task.content)
    setEditStaffId(task.assigned_staff_id)
    setEditingTaskId(task.id)
  }

  const handleUpdate = async (taskId: string) => {
    if (!editCategoryId || !editContent) return alert('必須項目を入力してください。')
    startTransition(async () => {
      const result = await updateSupportTask(taskId, userId, {
        scheduled_at: new Date(editAt).toISOString(),
        category_id: editCategoryId,
        sub_category_ids: editSubCategoryIds, // ★正しく送信
        content: editContent,
        assigned_staff_id: editStaffId
      })
      if (result.success) { setEditingTaskId(null); router.refresh(); }
      else { alert(result.error) }
    })
  }

  const handleComplete = async (task: SupportTaskWithStaff) => {
    if (!confirm('この予定を完了とし、実績として記録しますか？')) return
    startTransition(async () => {
      const result = await completeSupportTask(task)
      if (result.success) router.refresh()
      else alert(result.error)
    })
  }

  const handleCancel = async (taskId: string) => {
    if (!confirm('この予定を取り消しますか？')) return
    startTransition(async () => {
      const result = await cancelSupportTask(taskId, userId)
      if (result.success) router.refresh()
    })
  }

  // ★ 追加：削除ハンドラ
  const handleDelete = async (taskId: string) => {
    if (!confirm('この予定を完全に削除しますか？\n削除すると一覧から消え、元に戻せません。')) return
    startTransition(async () => {
      const result = await deleteSupportTask(taskId, userId)
      if (result.success) router.refresh()
      else alert(result.error)
    })
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('ja-JP', { 
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
    }).replace(/\//g, '.')
  }

  const inputStyle = "w-full text-base border-gray-300 rounded-md shadow-sm focus:ring-gray-200 focus:border-gray-400 border p-2.5 bg-white text-gray-900"
  const labelStyle = "block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider"
  const chipStyle = (isSelected: boolean) => `
    px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer select-none
    ${isSelected ? 'bg-gray-800 text-white border-gray-800 shadow-sm' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'}
  `

  return (
    <div className="bg-white">
      <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
        {tasks.map((task) => {
          const isOverdue = new Date(task.scheduled_at) < new Date()

          return (
            <div key={task.id} className={`py-5 transition-colors ${isOverdue ? 'bg-red-50/30' : ''}`}>
              {editingTaskId === task.id ? (
                /* --- 編集モード --- */
                <div className="space-y-4 px-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelStyle}>予定日時</label>
                      <input type="datetime-local" value={editAt} onChange={(e) => setEditAt(e.target.value)} className={inputStyle} />
                    </div>
                    <div>
                      <label className={labelStyle}>主目的</label>
                      <select 
                        value={editCategoryId} 
                        onChange={(e) => {
                          const newId = e.target.value;
                          setEditCategoryId(newId);
                          setEditSubCategoryIds(prev => prev.filter(id => id !== newId));
                        }} 
                        className={inputStyle}
                      >
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelStyle}>担当</label>
                      <select value={editStaffId} onChange={(e) => setEditStaffId(e.target.value)} className={inputStyle}>
                        {staffs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* 副次カテゴリ編集 */}
                  <div className="space-y-2">
                    <label className={labelStyle}>他の内容（任意）</label>
                    <div className="flex flex-wrap gap-2">
                      {categories
                        .filter(cat => cat.id !== editCategoryId)
                        .map(cat => (
                          <div 
                            key={cat.id} 
                            onClick={() => toggleEditSubCategory(cat.id)}
                            className={chipStyle(editSubCategoryIds.includes(cat.id))}
                          >
                            {cat.name}
                          </div>
                        ))
                      }
                    </div>
                  </div>

                  <div>
                    <label className={labelStyle}>内容</label>
                    <input type="text" value={editContent} onChange={(e) => setEditContent(e.target.value)} className={inputStyle} />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button onClick={() => setEditingTaskId(null)} className="text-sm font-bold text-gray-500 hover:text-gray-700 px-4 py-2">キャンセル</button>
                    <button onClick={() => handleUpdate(task.id)} disabled={isPending} className="bg-gray-900 text-white px-6 py-2 rounded text-sm font-bold hover:bg-black transition-all shadow-md">変更を保存</button>
                  </div>
                </div>
              ) : (
                /* --- 通常表示 --- */
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 px-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-x-3 mb-2 flex-wrap gap-y-2">
                      <span className={`text-base font-bold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatDateTime(task.scheduled_at)}
                      </span>
                      <span className="text-[11px] font-bold text-gray-500 border border-gray-200 px-2 py-0.5 rounded bg-gray-50">{task.category_name_snapshot}</span>
                      {/* 副次バッジ表示 */}
                      {task.sub_categories?.map(sub => (
                        <span key={sub.category_id} className="text-[10px] font-medium text-gray-400 border border-gray-100 px-1.5 py-0.5 rounded bg-white">
                          {sub.category_name_snapshot}
                        </span>
                      ))}
                      {isOverdue && ( <span className="flex items-center gap-1 text-[11px] font-black text-red-600 uppercase tracking-tighter"><Clock className="w-3 h-3" /> 期限超過</span> )}
                    </div>
                    <p className="text-base text-gray-700 leading-relaxed font-medium">{task.content}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">担当: {task.assigned_staff?.name || '未定'}</span>
                      <button onClick={() => startEdit(task)} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">変更・リスケ</button>
                    </div>
                  </div>
                  <div className="flex flex-row items-center gap-4 shrink-0 self-end md:self-center">
                    {/* ★ 追加：削除ボタン */}
                    <button onClick={() => handleDelete(task.id)} disabled={isPending} className="text-xs font-bold text-gray-400 hover:text-red-600 transition-colors px-2 py-1">削除</button>
                    <button onClick={() => handleCancel(task.id)} disabled={isPending} className="text-xs font-bold text-gray-400 hover:text-red-600 transition-colors px-2 py-1">取消</button>
                    <button onClick={() => handleComplete(task)} disabled={isPending} className="bg-white border-2 border-blue-600 text-blue-600 px-5 py-2 rounded text-sm font-black hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50">完了にして記録</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}