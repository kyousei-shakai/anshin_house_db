//src/components/support/CategoryManagement.tsx 
'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { type SupportCategory } from '@/types/support'
import { createSupportCategory, toggleCategoryActive } from '@/app/actions/support'
import { Plus, Trash2, RotateCcw } from 'lucide-react'

type Props = {
  initialCategories: SupportCategory[]
}

export default function CategoryManagement({ initialCategories }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [isAdding, setIsAdding] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    startTransition(async () => {
      const res = await createSupportCategory(name, description)
      if (res.success) {
        setIsAdding(false); setName(''); setDescription(''); router.refresh();
      } else { alert(res.error) }
    })
  }

  const handleToggleActive = async (id: string, currentStatus: boolean, categoryName: string) => {
    const actionText = currentStatus ? '非表示（削除）' : '再表示'
    if (!confirm(`カテゴリ「${categoryName}」を${actionText}にしますか？`)) return
    
    startTransition(async () => {
      const res = await toggleCategoryActive(id, !currentStatus)
      if (res.success) router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* 
        ★ 修正: コンポーネント内の独自ヘッダーを排除し、
        新規追加ボタンの配置を支援計画ページのルール（w-full sm:w-auto）に合わせる
      */}
      {!isAdding && (
        <div className="flex justify-end mb-4">
          <button 
            onClick={() => { setIsAdding(true); setName(''); setDescription(''); }}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-all shadow-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" /> 新規カテゴリを追加
          </button>
        </div>
      )}

      {/* 追加フォーム：二重枠にならないよう bg-gray-50 のみを適用 */}
      {isAdding && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 mb-6 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-sm font-bold text-gray-900 mb-4">新規カテゴリの登録</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">名称</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例：買い物支援" className="w-full text-base border-gray-300 rounded-md p-3 border outline-none focus:ring-2 focus:ring-gray-200" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">説明（任意）</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="例：日用品の購入代行など" className="w-full text-base border-gray-300 rounded-md p-3 border outline-none focus:ring-2 focus:ring-gray-200" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 sm:flex-none px-5 py-3 sm:py-2 text-sm font-bold text-gray-500 hover:bg-gray-200 rounded-md">キャンセル</button>
              <button type="submit" disabled={isPending} className="flex-1 sm:flex-none px-8 py-3 sm:py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-md disabled:opacity-50">
                登録する
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 
        一覧エリア：
        親ページが「白いカード」を提供しているため、ここでは二重の枠を作らず、
        リスト（テーブル/カード）のみを展開。
      */}
      <div className="overflow-hidden">
        
        {/* PC版：テーブル表示 (余計な border-t を追加して見出しとの境界を明確化) */}
        <table className="hidden sm:table min-w-full divide-y divide-gray-200 border-t border-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">名称</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">説明</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">状態</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm font-normal">
            {initialCategories.map((cat) => (
              <tr key={cat.id} className={`hover:bg-gray-50 transition-colors ${!cat.is_active ? 'bg-gray-50/50' : ''}`}>
                <td className="px-6 py-5 whitespace-nowrap font-bold text-gray-900">{cat.name}</td>
                <td className="px-6 py-5 text-gray-600">{cat.description || <span className="text-gray-300 italic">未設定</span>}</td>
                <td className="px-6 py-5 whitespace-nowrap text-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {cat.is_active ? '有効' : '非表示'}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-right">
                  <button onClick={() => handleToggleActive(cat.id, cat.is_active, cat.name)} className={`p-2 rounded-md transition-all ${cat.is_active ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                    {cat.is_active ? <Trash2 className="w-5 h-5" /> : <RotateCcw className="w-5 h-5" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* スマホ版：カード形式表示 */}
        <div className="sm:hidden divide-y divide-gray-100 text-sm border-t border-gray-100">
          {initialCategories.map((cat) => (
            <div key={cat.id} className={`py-4 transition-colors ${!cat.is_active ? 'bg-gray-50/50' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-gray-900 text-base break-all pr-2">{cat.name}</div>
                <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                  {cat.is_active ? '有効' : '非表示'}
                </span>
              </div>
              <p className="text-gray-600 mb-4 break-all leading-relaxed">
                {cat.description || <span className="text-gray-300 italic">説明未設定</span>}
              </p>
              <div className="flex justify-end">
                <button onClick={() => handleToggleActive(cat.id, cat.is_active, cat.name)} className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold transition-all border ${cat.is_active ? 'text-red-600 bg-red-50 border-red-100' : 'text-green-600 bg-green-50 border-green-100'}`}>
                  {cat.is_active ? <><Trash2 className="w-4 h-4" /> 非表示</> : <><RotateCcw className="w-4 h-4" /> 再表示</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}