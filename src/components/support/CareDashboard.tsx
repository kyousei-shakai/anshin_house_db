//src/components/support/CareDashboard.tsx 
'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  type UserCareDashboardRow, 
  type UpcomingTaskRow, 
  type SupportCategory,
  type TeamRecentHistoryRow,
  type CareDashboardItem // 第2回で定義した判別可能ユニオン型
} from '@/types/support'
import { type Staff } from '@/types/staff'
import { AlertCircle, Clock, CheckCircle2, Search, ChevronRight, Users, CalendarDays, Edit3, X, History, CalendarPlus } from 'lucide-react'
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
  const [filterMode, setFilterMode] = useState<FilterMode>('today')
  const [searchQuery, setSearchTerm] = useState('')
  const [recordingUser, setRecordingUser] = useState<{id: string, name: string, uid: string} | null>(null)
  const [inputMode, setInputMode] = useState<'record' | 'task'>('record')

  // --- 1. データの高度な仕分けと正規化（判別可能ユニオンの適用） ---
  const processed = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime()

    // 全てのデータを「kind（種別）」付きの共通型に変換（anyを追放）
    const userItems: CareDashboardItem[] = dashboardData.map(d => ({ ...d, kind: 'user' }))
    const taskItems: CareDashboardItem[] = upcomingTasks.map(t => ({ ...t, kind: 'task' }))
    const historyItems: CareDashboardItem[] = teamHistory.map(h => ({ ...h, kind: 'history' }))

    // サマリー数値の計算
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

    // 表示リストの決定
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

    // 検索フィルタ
    if (searchQuery) {
      list = list.filter(i => {
        const name = i.kind === 'user' ? i.user_name : i.user_name
        return (name || '').includes(searchQuery)
      })
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
    <div className="space-y-6 mb-12 text-gray-900">
      
      {/* 1. サマリーカード：4枚の司令塔 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button onClick={() => setFilterMode('today')} className={`flex items-center gap-3 py-3 px-4 rounded-xl border-2 transition-all ${filterMode === 'today' ? 'border-blue-600 bg-blue-50 shadow-inner' : 'border-gray-200 bg-white hover:border-blue-300 shadow-sm'}`}>
          <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
          <div className="text-left text-xs font-bold text-gray-500 uppercase"><p>本日</p><p className="text-xl font-black text-gray-900">{stats.today}</p></div>
        </button>
        <button onClick={() => setFilterMode('future')} className={`flex items-center gap-3 py-3 px-4 rounded-xl border-2 transition-all ${filterMode === 'future' ? 'border-indigo-600 bg-indigo-50 shadow-inner' : 'border-gray-200 bg-white hover:border-indigo-300 shadow-sm'}`}>
          <CalendarDays className="w-5 h-5 text-indigo-600 shrink-0" />
          <div className="text-left text-xs font-bold text-gray-500 uppercase"><p>今後</p><p className="text-xl font-black text-gray-900">{stats.future}</p></div>
        </button>
        <button onClick={() => setFilterMode('urgent')} className={`flex items-center gap-3 py-3 px-4 rounded-xl border-2 transition-all ${filterMode === 'urgent' ? 'border-red-600 bg-red-50/50 shadow-inner' : 'border-gray-200 bg-white hover:border-red-200 shadow-sm'}`}>
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div className="text-left text-xs font-bold text-gray-500 uppercase"><p>要フォロー</p><p className="text-xl font-black text-red-600">{stats.urgent}</p></div>
        </button>
        <button onClick={() => setFilterMode('recent')} className={`flex items-center gap-3 py-3 px-4 rounded-xl border-2 transition-all ${filterMode === 'recent' ? 'border-emerald-600 bg-emerald-50/50 shadow-inner' : 'border-gray-200 bg-white hover:border-emerald-300 shadow-sm'}`}>
          <History className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-left text-xs font-bold text-gray-500 uppercase"><p>直近60日</p><p className="text-xl font-black text-emerald-700">{stats.recent}</p></div>
        </button>
      </div>

      {/* 2. 操作バー */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="名前で検索..." value={searchQuery} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm outline-none focus:ring-2 focus:ring-gray-100" />
        </div>
        <button onClick={() => setFilterMode('pending')} className={`text-sm font-bold flex items-center gap-1.5 transition-colors ${filterMode === 'pending' ? 'text-gray-900 underline' : 'text-gray-400 hover:text-gray-600'}`}>
          <Users className="w-4 h-4" /> 未入力者の整理 ({stats.pending}名)
        </button>
      </div>

      {/* 3. メインリスト：テーブル形式に完全統一 */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">対象利用者</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">実績・日時</th>
                <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">内容・予定</th>
                <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-16 text-center text-gray-400 font-medium tracking-wide">該当するデータはありません。</td></tr>
              ) : (
                list.map((row) => (
                  <tr key={row.kind === 'task' ? row.task_id : row.kind === 'history' ? row.log_id : row.user_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-5 align-top">
                      <div className="font-black text-gray-900">{row.user_name}</div>
                      <div className="text-[10px] text-gray-400 font-mono tracking-tighter mt-1">ID: {row.user_uid}</div>
                    </td>

                    <td className="px-6 py-5 align-top whitespace-nowrap">
                      {row.kind === 'history' ? (
                        <div className="flex flex-col gap-1.5">
                          <span className="font-bold text-emerald-700">{formatDateTime(row.support_at)}</span>
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded w-fit border border-emerald-100">{row.category_name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className={`w-28 text-center py-1 rounded text-[10px] font-black border ${
                            row.kind === 'user' && row.is_neglected ? 'bg-red-50 text-red-700 border-red-100' : 
                            row.has_no_log ? 'bg-gray-50 text-gray-400 border-gray-100' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {row.has_no_log ? 'システム未入力' : `${row.elapsed_days}日前`}
                          </div>
                          {row.kind === 'user' && !row.has_no_log && row.last_support_at && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] text-gray-700 font-bold">{row.last_category_name}</span>
                              <span className="text-[10px] text-gray-400">{formatDate(row.last_support_at)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-5 align-top">
                      {row.kind === 'history' ? (
                        <div className="space-y-1.5">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words max-w-sm font-medium">{row.content}</p>
                          <p className="text-[10px] text-gray-400">— 担当: {row.staff_name}</p>
                        </div>
                      ) : (
                        (row.kind === 'task' ? row.scheduled_at : row.next_scheduled_at) ? (
                          <div className="flex flex-col">
                            <span className={`font-black flex items-center gap-1.5 mb-1.5 ${row.is_overdue ? 'text-red-600' : (row.kind === 'task' && filterMode === 'today') || (row.kind === 'user' && row.next_scheduled_at?.startsWith(new Date().toISOString().slice(0,10).replace(/-/g,'.'))) ? 'text-blue-700' : 'text-gray-900'}`}>
                              {row.is_overdue && <Clock className="w-3.5 h-3.5" />}
                              {formatDateTime(row.kind === 'task' ? row.scheduled_at : row.next_scheduled_at)}
                            </span>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words max-w-sm font-medium">{row.kind === 'task' ? row.content : row.next_task_content}</p>
                            <span className="text-[10px] text-gray-400 mt-2">担当: {row.kind === 'task' ? row.staff_name : row.next_staff_name || '未定'}</span>
                          </div>
                        ) : ( <span className="text-xs text-gray-300 italic font-medium">予定なし</span> )
                      )}
                    </td>
                    
                    <td className="px-6 py-5 text-right align-top">
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button onClick={() => setRecordingUser({ id: row.user_id, name: row.user_name, uid: row.user_uid })}
                          className="px-4 py-2 bg-gray-900 text-white text-[11px] font-bold rounded-lg hover:bg-black transition-all shadow-md active:scale-95">記録</button>
                        <Link href={`/users/${row.user_uid}`} className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"><ChevronRight className="w-5 h-5" /></Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- クイック入力モーダル (垂直積層・防弾仕様) --- */}
      {recordingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
          <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-gray-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-gray-900 text-white rounded-lg shadow-lg">{inputMode === 'record' ? <Edit3 className="w-5 h-5" /> : <CalendarPlus className="w-5 h-5" />}</div>
                <div><h3 className="text-lg font-black text-gray-900">対応内容の入力</h3><p className="text-sm text-gray-500 font-medium">対象: <span className="text-gray-900 font-bold">{recordingUser.name}</span></p></div>
              </div>
              <button onClick={handleCloseForm} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"><X className="w-7 h-7" /></button>
            </div>
            <div className="px-6 py-4 bg-white border-b border-gray-100 flex gap-2 shrink-0">
              <button onClick={() => setInputMode('record')} className={`px-6 py-2 text-xs font-black rounded-full transition-all ${inputMode === 'record' ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>実績を報告</button>
              <button onClick={() => setInputMode('task')} className={`px-6 py-2 text-xs font-black rounded-full transition-all ${inputMode === 'task' ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>予定を登録</button>
            </div>
            <div className="p-8 overflow-y-auto bg-white flex-1 custom-scrollbar">
              {inputMode === 'record' ? (
                <SupportRecordForm userId={recordingUser.id} categories={categories} staffs={staffs} currentStaffId={currentStaffId} onSuccess={() => { setRecordingUser(null); alert('実績を保存しました'); }} />
              ) : (
                <SupportTaskFormOnly userId={recordingUser.id} categories={categories} staffs={staffs} currentStaffId={currentStaffId} onSuccess={() => { setRecordingUser(null); alert('予定を保存しました'); }} />
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center shrink-0">
              <button onClick={handleCloseForm} className="text-sm font-bold text-gray-400 hover:text-red-600 transition-colors">入力を破棄して閉じる</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}