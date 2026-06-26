//src/components/settings/StaffManagement.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database'
import { upsertStaff, toggleStaffActive } from '@/app/actions/staff'
import { Plus, User, RotateCcw, EyeOff, Edit2 } from 'lucide-react'

type Staff = Database['public']['Tables']['staff']['Row']

type Props = {
  initialStaff: Staff[]
}

export default function StaffManagement({ initialStaff }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // フォーム状態
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [displayOrder, setDisplayOrder] = useState(0)

  // 登録・更新処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    startTransition(async () => {
      const res = await upsertStaff({
        id: editingId || undefined, // IDがあれば更新、なければ新規
        name,
        role: role || null,
        display_order: displayOrder,
        is_active: true // 新規・更新時は常に有効として保存
      })

      if (res.success) {
        resetForm()
        router.refresh()
      } else {
        alert(res.error)
      }
    })
  }

  // 有効・無効（論理削除）切り替え
  const handleToggleActive = async (id: string, currentStatus: boolean, staffName: string) => {
    const actionText = currentStatus ? '非表示（無効化）' : '再表示（有効化）'
    // シニアエンジニアの指摘に基づき、証跡保護の重要性を再確認するメッセージ
    const confirmMsg = currentStatus 
      ? `スタッフ「${staffName}」を非表示にしますか？\n（過去の相談記録の証跡は維持されます）`
      : `スタッフ「${staffName}」を再度有効にしますか？`
    
    if (!confirm(confirmMsg)) return
    
    startTransition(async () => {
      const res = await toggleStaffActive(id, !currentStatus)
      if (res.success) router.refresh()
      else alert(res.error)
    })
  }

  const resetForm = () => {
    setIsEditing(false)
    setEditingId(null)
    setName('')
    setRole('')
    setDisplayOrder(0)
  }

  const startEdit = (staff: Staff) => {
    setEditingId(staff.id)
    setName(staff.name)
    setRole(staff.role || '')
    setDisplayOrder(staff.display_order || 0)
    setIsEditing(true)
  }

  return (
    <div className="space-y-6">
      {/* 新規登録・編集ボタン */}
      {!isEditing && (
        <div className="flex justify-end mb-4">
          <button 
            onClick={() => { resetForm(); setIsEditing(true); }}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-all shadow-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" /> 新規スタッフを追加
          </button>
        </div>
      )}

      {/* 入力フォーム */}
      {isEditing && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 mb-6 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-sm font-bold text-gray-900 mb-4">
            {editingId ? 'スタッフ情報の修正' : '新規スタッフの登録'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">氏名</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例：山田 太郎" className="w-full text-base border-gray-300 rounded-md p-3 border outline-none focus:ring-2 focus:ring-gray-200" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">役割・役職</label>
                <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="例：相談員、管理者など" className="w-full text-base border-gray-300 rounded-md p-3 border outline-none focus:ring-2 focus:ring-gray-200" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">表示順（数値が小さいほど上）</label>
                <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} className="w-full text-base border-gray-300 rounded-md p-3 border outline-none focus:ring-2 focus:ring-gray-200" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="flex-1 sm:flex-none px-5 py-3 sm:py-2 text-sm font-bold text-gray-500 hover:bg-gray-200 rounded-md">キャンセル</button>
              <button type="submit" disabled={isPending} className="flex-1 sm:flex-none px-8 py-3 sm:py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-md disabled:opacity-50">
                {editingId ? '更新する' : '登録する'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 一覧エリア */}
      <div className="overflow-hidden">
        {/* PC版：テーブル */}
        <table className="hidden sm:table min-w-full divide-y divide-gray-200 border-t border-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">氏名</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">役割</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">表示順</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">状態</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {initialStaff.map((staff) => (
              <tr key={staff.id} className={`hover:bg-gray-50 transition-colors ${!staff.is_active ? 'bg-gray-50/50 opacity-60' : ''}`}>
                <td className="px-6 py-5 whitespace-nowrap font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" /> {staff.name}
                </td>
                <td className="px-6 py-5 text-gray-600">{staff.role || <span className="text-gray-300 italic">未設定</span>}</td>
                <td className="px-6 py-5 text-center text-gray-500 font-mono">{staff.display_order}</td>
                <td className="px-6 py-5 whitespace-nowrap text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${staff.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {staff.is_active ? '有効' : '非表示'}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-right space-x-2">
                  <button onClick={() => startEdit(staff)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all" title="編集">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleToggleActive(staff.id, staff.is_active || false, staff.name)} className={`p-2 rounded-md transition-all ${staff.is_active ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                    {staff.is_active ? <EyeOff className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* スマホ版：カード */}
        <div className="sm:hidden divide-y divide-gray-100 text-sm border-t border-gray-100">
          {initialStaff.map((staff) => (
            <div key={staff.id} className={`py-4 transition-colors ${!staff.is_active ? 'bg-gray-50/50 opacity-60' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-gray-900 text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" /> {staff.name}
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5">{staff.role || '役割未設定'} / 表示順: {staff.display_order}</div>
                </div>
                <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${staff.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                  {staff.is_active ? '有効' : '非表示'}
                </span>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => startEdit(staff)} className="flex items-center gap-2 px-4 py-2 rounded-md font-bold transition-all border border-gray-200 text-gray-600 bg-white hover:bg-gray-50">
                  <Edit2 className="w-4 h-4" /> 編集
                </button>
                <button onClick={() => handleToggleActive(staff.id, staff.is_active || false, staff.name)} className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold transition-all border ${staff.is_active ? 'text-orange-600 bg-orange-50 border-orange-100' : 'text-green-600 bg-green-50 border-green-100'}`}>
                  {staff.is_active ? <><EyeOff className="w-4 h-4" /> 非表示</> : <><RotateCcw className="w-4 h-4" /> 再表示</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}