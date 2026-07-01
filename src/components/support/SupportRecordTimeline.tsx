//src/components/support/SupportRecordTimeline.tsx
'use client'

import React, { useTransition } from 'react' // ★ useTransition を追加
import { type DailySupportLogWithStaff } from '@/types/support'
import { deleteSupportLog } from '@/app/actions/support' // ★ 削除アクションをインポート

type Props = {
  logs: DailySupportLogWithStaff[]
}

export default function SupportRecordTimeline({ logs }: Props) {
  const [isPending, startTransition] = useTransition() // ★ 状態管理を追加

  if (!logs || logs.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed rounded-xl p-10 text-center mt-4">
        <p className="text-gray-400 text-sm font-medium">これまでの記録はありません</p>
      </div>
    )
  }

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('ja-JP', { 
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    }).replace(/\//g, '.');
  }

  // ★ 追加：削除ハンドラ
  const handleDelete = async (logId: string, userId: string) => {
    if (!window.confirm('この支援記録を完全に削除しますか？\nこの操作は取り消せません。')) return
    
    startTransition(async () => {
      const result = await deleteSupportLog(logId, userId)
      if (!result.success) alert(result.error)
    })
  }

  return (
    <div className="flow-root mt-8">
      <ul role="list" className="space-y-0">
        {logs.map((log, logIdx) => (
          <li key={log.id} className="relative group">
            {/* 縦線 (変更なし) */}
            {logIdx !== logs.length - 1 && (
              <span className="absolute left-[15px] top-8 -ml-px h-full w-[1px] bg-gray-200" aria-hidden="true" />
            )}
            
            <div className="relative flex items-start gap-x-4 pb-10">
              {/* タイムラインの「点」 (変更なし) */}
              <div className="relative flex h-8 w-8 items-center justify-center bg-white">
                <div className="h-3 w-3 rounded-full bg-gray-300 ring-4 ring-white group-hover:bg-blue-400 transition-colors" />
              </div>
              
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-x-3 mb-2 flex-wrap gap-y-2">
                  <time className="text-sm font-bold text-gray-900">
                    {formatDateTime(log.support_at)}
                  </time>
                  
                  {/* 主カテゴリー (変更なし) */}
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-[11px] font-bold text-gray-600 border border-gray-200 shadow-sm">
                    {log.category_name_snapshot}
                  </span>

                  {/* 副次カテゴリー (変更なし) */}
                  {log.sub_categories && log.sub_categories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {log.sub_categories.map((sub) => (
                        <span 
                          key={sub.category_id}
                          className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-gray-400 border border-gray-100"
                        >
                          {sub.category_name_snapshot}
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="text-[11px] text-gray-400 ml-auto flex items-center gap-4">
                    <span>担当: {log.staff?.name || '不明'}</span>
                    {/* ★ 追加：削除ボタン（シンプルさを維持するためテキスト形式） */}
                    <button
                      onClick={() => handleDelete(log.id, log.user_id)}
                      disabled={isPending}
                      className="text-gray-300 hover:text-red-600 transition-colors font-medium disabled:opacity-50"
                    >
                      削除
                    </button>
                  </span>
                </div>
                
                <div className="text-base text-gray-700 leading-relaxed pl-1 whitespace-pre-wrap">
                  {log.content}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}