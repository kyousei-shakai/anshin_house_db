//src/components/support/CareDashboard.tsx 
'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  type UserCareDashboardRow, 
  type UpcomingTaskRow, 
  type SupportCategory,
  type TeamRecentHistoryRow,
  type CareDashboardItem
} from '@/types/support'
import { type Staff } from '@/types/staff'
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Search, 
  ChevronRight, 
  Users, 
  CalendarDays, 
  Edit3, 
  X, 
  CalendarPlus,
  History 
} from 'lucide-react'
import SupportRecordForm from './SupportRecordForm'
import SupportTaskFormOnly from './SupportTaskFormOnly'

type Props = {
  dashboardData: UserCareDashboardRow[]
  upcomingTasks: UpcomingTaskRow[]
  teamHistory: TeamRecentHistoryRow[]
  categories: SupportCategory[]
  staffs: Pick<Staff, 'id' | 'name'>[]
  currentStaffId?: string
}

type FilterMode = 'today' | 'future' | 'urgent' | 'recent' | 'pending'

export default function CareDashboard({ 
  dashboardData, 
  upcomingTasks, 
  teamHistory, 
  categories, 
  staffs, 
  currentStaffId 
}: Props) {
  const router = useRouter()
  const [filterMode, setFilterMode] = useState<FilterMode>('today')
  const [searchQuery, setSearchTerm] = useState('')
  const [recordingUser, setRecordingUser] = useState<{id: string, name: string, uid: string} | null>(null)
  const [inputMode, setInputMode] = useState<'record' | 'task'>('record')

  const processed = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime()

    const userItems: CareDashboardItem[] = dashboardData.map(d => ({ ...d, kind: 'user' }))
    const taskItems: CareDashboardItem[] = upcomingTasks.map(t => ({ ...t, kind: 'task' }))
    const historyItems: CareDashboardItem[] = teamHistory.map(h => ({ ...h, kind: 'history' }))

    const stats = {
      today: upcomingTasks.filter(t => {
        const d = new Date(t.scheduled_at).getTime()
        return d >= todayStart && d <= todayEnd
      }).length,
      future: upcomingTasks.filter(t => new Date(t.scheduled_at).getTime() > todayEnd).length,
      urgent: dashboardData.filter(d => d.is_overdue || d.is_neglected).length,
      recent: teamHistory.length,
      pending: dashboardData.filter(d => d.has_no_log).length,
      total: dashboardData.length
    }

    let list: CareDashboardItem[] = []
    if (filterMode === 'today') {
      list = taskItems.filter(t => {
        if (t.kind !== 'task') return false
        const d = new Date(t.scheduled_at).getTime()
        return d >= todayStart && d <= todayEnd
      })
    } else if (filterMode === 'future') {
      list = taskItems.filter(t => t.kind === 'task' && new Date(t.scheduled_at).getTime() > todayEnd)
    } else if (filterMode === 'urgent') {
      list = userItems.filter(u => u.kind === 'user' && (u.is_overdue || u.is_neglected))
    } else if (filterMode === 'recent') {
      list = historyItems
    } else if (filterMode === 'pending') {
      list = userItems.filter(u => u.kind === 'user' && u.has_no_log)
    }

    if (searchQuery) {
      list = list.filter(i => (i.user_name || '').includes(searchQuery))
    }

    return { list, stats }
  }, [dashboardData, upcomingTasks, teamHistory, filterMode, searchQuery])

  const { list, stats } = processed

  const handleCloseForm = () => {
    if (window.confirm('入力中の内容は保存されませんが、よろしいですか？')) {
      setRecordingUser(null); setInputMode('record');
    }
  }

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '.')
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')
  }

  return (
    <div className="space-y-4 mb-12 text-gray-900">
      
      {/* 1. サマリーカード：ラベルのサイズを text-sm に変更 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm -mx-4 sm:mx-0 px-4 sm:px-0">
        <button onClick={() => setFilterMode('today')} className={`flex items-center gap-3 py-2.5 px-4 rounded-xl border-2 transition-all ${filterMode === 'today' ? 'border-blue-600 bg-blue-50 shadow-inner' : 'border-gray-200 bg-white hover:border-blue-300 shadow-sm'}`}>
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
          <div className="text-left text-sm font-bold text-gray-500 uppercase leading-tight"><p>本日</p><p className="text-lg font-black text-gray-900">{stats.today}</p></div>
        </button>
        <button onClick={() => setFilterMode('future')} className={`flex items-center gap-3 py-2.5 px-4 rounded-xl border-2 transition-all ${filterMode === 'future' ? 'border-indigo-600 bg-indigo-50 shadow-inner' : 'border-gray-200 bg-white hover:border-indigo-300 shadow-sm'}`}>
          <CalendarDays className="w-5 h-5 text-indigo-600 shrink-0" />
          <div className="text-left text-sm font-bold text-gray-500 uppercase leading-tight"><p>今後</p><p className="text-lg font-black text-gray-900">{stats.future}</p></div>
        </button>
        <button onClick={() => setFilterMode('urgent')} className={`flex items-center gap-3 py-2.5 px-4 rounded-xl border-2 transition-all ${filterMode === 'urgent' ? 'border-red-600 bg-red-50/50 shadow-inner' : 'border-gray-200 bg-white hover:border-red-200 shadow-sm'}`}>
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div className="text-left text-sm font-bold text-gray-500 uppercase leading-tight"><p>未完了タスク/要フォロー</p><p className="text-xl font-black text-red-600">{stats.urgent}</p></div>
        </button>
        <button onClick={() => setFilterMode('recent')} className={`flex items-center gap-3 py-2.5 px-4 rounded-xl border-2 transition-all ${filterMode === 'recent' ? 'border-emerald-600 bg-emerald-50/50 shadow-inner' : 'border-gray-200 bg-white hover:border-emerald-300 shadow-sm'}`}>
          <History className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-left text-sm font-bold text-gray-500 uppercase leading-tight"><p>直近60日</p><p className="text-xl font-black text-emerald-700">{stats.recent}</p></div>
        </button>
      </div>

      {/* 2. 操作バー */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="名前で検索..." value={searchQuery} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm shadow-sm outline-none focus:ring-2 focus:ring-gray-100" />
        </div>
        <button onClick={() => setFilterMode('pending')} className={`text-xs font-bold flex items-center gap-1.5 transition-colors ${filterMode === 'pending' ? 'text-gray-900 underline' : 'text-gray-400 hover:text-gray-600'}`}>
          <Users className="w-3.5 h-3.5" /> 未入力者の整理 ({stats.pending}名)
        </button>
      </div>

      {/* 3. メインリスト（エクセル風テーブル） */}
      <div className="bg-white -mx-4 sm:mx-0 border-y sm:border border-gray-200 sm:rounded-xl shadow-sm overflow-hidden">
        
        {/* 【PC版：テーブル】 ヘッダーを text-sm に拡大 */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <tr>
                <th className="px-4 py-2.5 w-32">日時</th>
                <th className="px-4 py-2.5 w-40">利用者名</th>
                <th className="px-4 py-2.5">内容・担当者</th>
                <th className="px-4 py-2.5 w-32">実績状況</th>
                <th className="px-4 py-2.5 text-right w-24">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-xs">該当するデータはありません。</td></tr>
              ) : (
                list.map((row) => {
                  {/* ★ 型安全のためのガード：kind が history 以外の場合のみ is_overdue を評価 */}
                  const isOverdue = row.kind !== 'history' && row.is_overdue;

                  return (
                    <tr 
                      key={row.kind === 'task' ? row.task_id : row.kind === 'history' ? row.log_id : row.user_id} 
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                      onClick={() => router.push(`/users/${row.user_uid}?tab=support-records&from=dashboard`)}
                    >
                      {/* 1. 日時：text-sm に拡大 */}
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <div className={`text-sm font-bold ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                          {formatDateTime(row.kind === 'history' ? row.support_at : (row.kind === 'task' ? row.scheduled_at : row.next_scheduled_at))}
                        </div>
                      </td>

                      {/* 2. 利用者名：既存 text-sm */}
                      <td className="px-4 py-3 align-top">
                        <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate">{row.user_name}</div>
                        <div className="text-[9px] text-gray-400 font-mono uppercase">ID: {row.user_uid}</div>
                      </td>

                      {/* 3. 内容・担当：text-sm に拡大 */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-gray-700 line-clamp-1 leading-relaxed">
                            <span className="font-bold text-gray-900 mr-2">[{row.kind === 'history' ? row.category_name : (row.kind === 'task' ? row.category_name : row.next_category_name || '未設定')}]</span>
                            {row.kind === 'history' ? row.content : (row.kind === 'task' ? row.content : row.next_task_content || '-')}
                          </p>
                          <div className="text-sm text-gray-400 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {row.kind === 'task' ? row.staff_name : (row.kind === 'history' ? row.staff_name : row.next_staff_name || '未定')}
                          </div>
                        </div>
                      </td>

                      {/* 4. 状況 */}
                      <td className="px-4 py-3 align-top">
                        {row.kind !== 'history' && (
                          <div className={`flex items-center gap-1.5 text-[10px] font-bold ${
                            row.kind === 'user' && row.is_neglected ? 'text-red-600' : 
                            (row.has_no_log || row.elapsed_days === undefined) ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                               row.kind === 'user' && row.is_neglected ? 'bg-red-600 animate-pulse' : 
                               (row.has_no_log || row.elapsed_days === undefined) ? 'bg-gray-300' : 'bg-gray-400'
                            }`} />
                            {(row.has_no_log || row.elapsed_days === undefined) ? '未入力' : `${row.elapsed_days}日前`}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-4 py-3 text-right align-top">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setRecordingUser({ id: row.user_id, name: row.user_name, uid: row.user_uid });
                          }}
                          className="px-3 py-1 bg-gray-900 text-white text-[10px] font-bold rounded hover:bg-black transition-all shadow-sm"
                        >
                          記録
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 【スマホ版：高密度リスト】 日時を text-xs、内容を text-sm に拡大 */}
        <div className="sm:hidden divide-y divide-gray-100">
          {list.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 text-xs">該当するデータはありません。</div>
          ) : (
            list.map((row) => {
              const isOverdue = row.kind !== 'history' && row.is_overdue;
              return (
                <div 
                  key={`mobile-${row.kind === 'task' ? row.task_id : row.kind === 'history' ? row.log_id : row.user_id}`}
                  className="p-3 active:bg-gray-50 transition-colors"
                  onClick={() => router.push(`/users/${row.user_uid}?tab=support-records&from=dashboard`)}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm truncate">{row.user_name}</span>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${isOverdue ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                           {formatDateTime(row.kind === 'history' ? row.support_at : (row.kind === 'task' ? row.scheduled_at : row.next_scheduled_at))}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setRecordingUser({ id: row.user_id, name: row.user_name, uid: row.user_uid });
                      }}
                      className="flex-shrink-0 px-3 py-1 bg-gray-900 text-white text-[10px] font-bold rounded shadow-sm"
                    >
                      記録
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-gray-600 line-clamp-1 flex-1">
                      <span className="font-bold text-gray-800 mr-1">[{row.kind === 'history' ? row.category_name : (row.kind === 'task' ? row.category_name : row.next_category_name || '予定')}]</span>
                      {row.kind === 'history' ? row.content : (row.kind === 'task' ? row.content : row.next_task_content || '-')}
                    </p>
                    {row.kind !== 'history' && (
                      <span className={`text-[9px] font-black whitespace-nowrap ${row.kind === 'user' && row.is_neglected ? 'text-red-600' : 'text-gray-400'}`}>
                        {(row.has_no_log || row.elapsed_days === undefined) ? '未入力' : `${row.elapsed_days}日前`}
                      </span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* --- クイック記録モーダル (既存維持) --- */}
      {recordingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
          <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-gray-50 px-8 py-5 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-gray-900 text-white rounded-lg shadow-lg">{inputMode === 'record' ? <Edit3 className="w-5 h-5" /> : <CalendarPlus className="w-5 h-5" />}</div>
                <div><h3 className="text-lg font-black text-gray-900 uppercase">対応内容の入力</h3><p className="text-sm text-gray-500 font-medium">対象: <span className="text-gray-900 font-bold">{recordingUser.name}</span></p></div>
              </div>
              <button onClick={handleCloseForm} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"><X className="w-7 h-7" /></button>
            </div>
            
            <div className="px-8 py-4 bg-white border-b border-gray-200 flex gap-2 shrink-0">
              <button onClick={() => setInputMode('record')} className={`px-6 py-2 text-xs font-black rounded-full transition-all ${inputMode === 'record' ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>実績を報告する</button>
              <button onClick={() => setInputMode('task')} className={`px-6 py-2 text-xs font-black rounded-full transition-all ${inputMode === 'task' ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>予定のみ登録</button>
            </div>

            <div className="p-8 overflow-y-auto bg-white flex-1 custom-scrollbar">
              {inputMode === 'record' ? (
                <SupportRecordForm userId={recordingUser.id} categories={categories} staffs={staffs} currentStaffId={currentStaffId} onSuccess={() => { setRecordingUser(null); alert('実績を保存しました'); }} />
              ) : (
                <SupportTaskFormOnly userId={recordingUser.id} categories={categories} staffs={staffs} currentStaffId={currentStaffId} onSuccess={() => { setRecordingUser(null); alert('予定を保存しました'); }} />
              )}
            </div>

            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
              <button onClick={handleCloseForm} className="text-sm font-bold text-gray-400 hover:text-red-600 transition-colors uppercase tracking-widest">入力を破棄して閉じる</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}