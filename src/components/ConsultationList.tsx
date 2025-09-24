'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { consultationsApi, usersApi } from '@/lib/api'
import { generateNewUID } from '@/utils/uid'
import { Database } from '@/types/database'
import { calculateAge } from '@/utils/date'
import { CONSULTATION_STATUSES, STATUS_FILTERS, STATUS_COLORS, StatusFilter } from '@/lib/consultationConstants'

type Consultation = Database['public']['Tables']['consultations']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']

const ConsultationList: React.FC = () => {
  const [allConsultations, setAllConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState<StatusFilter>(null);
  const [showOnlyWithNextAppointment, setShowOnlyWithNextAppointment] = useState(false);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await consultationsApi.getAll({ status: null });
      setAllConsultations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      setAllConsultations([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllData();
  }, []);

  const filteredConsultations = useMemo(() => {
    let filtered = allConsultations;
    if (activeFilter && activeFilter !== 'すべて表示') {
      if (activeFilter === '利用者登録済み') {
        filtered = filtered.filter(c => !!c.user_id);
      } else {
        filtered = filtered.filter(c => c.status === activeFilter && !c.user_id);
      }
    } else if (activeFilter === null) { 
       const inactiveStatuses: (string | null)[] = ["支援終了", "対象外・辞退"];
       filtered = filtered.filter(c => !inactiveStatuses.includes(c.status) && !c.user_id);
    }
    if (showOnlyWithNextAppointment) {
      filtered = filtered.filter(c => c.next_appointment_scheduled === true);
    }
    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      filtered = filtered.filter(consultation =>
        consultation.name?.toLowerCase().includes(lowercasedFilter) ||
        consultation.staff_name?.toLowerCase().includes(lowercasedFilter) ||
        consultation.id.toLowerCase().includes(lowercasedFilter) ||
        consultation.consultation_content?.toLowerCase().includes(lowercasedFilter) ||
        consultation.consultation_result?.toLowerCase().includes(lowercasedFilter) ||
        consultation.next_appointment_details?.toLowerCase().includes(lowercasedFilter)
      );
    }
    if (dateFilter) {
      filtered = filtered.filter(consultation =>
        consultation.consultation_date && consultation.consultation_date.startsWith(dateFilter)
      );
    }
    return filtered;
  }, [allConsultations, activeFilter, searchTerm, dateFilter, showOnlyWithNextAppointment]);

  const statusCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    const defaultInactiveStatuses: (string | null)[] = ["支援終了", "対象外・辞退"];
    counts['active'] = allConsultations.filter(c => !defaultInactiveStatuses.includes(c.status) && !c.user_id).length;
    for (const filter of STATUS_FILTERS) {
      if(filter === null) continue;
      if (filter === 'すべて表示') {
        counts[filter] = allConsultations.length;
      } else if (filter === '利用者登録済み') {
        counts[filter] = allConsultations.filter(c => !!c.user_id).length;
      } else {
        counts[filter] = allConsultations.filter(c => c.status === filter && !c.user_id).length;
      }
    }
    return counts;
  }, [allConsultations]);

  const handleStatusChange = async (consultationId: string, newStatus: string) => {
    if (!confirm(`ステータスを「${newStatus}」に変更しますか？`)) { return; }
    try {
      const updatedConsultation = await consultationsApi.updateStatus(consultationId, newStatus);
      setAllConsultations(prev => prev.map(c => c.id === consultationId ? updatedConsultation : c));
    } catch (err) {
      console.error('ステータス更新エラー:', err);
      alert('ステータスの更新に失敗しました。');
      fetchAllData();
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const handleRegisterAsUser = async (consultation: Consultation) => {
    if (!confirm(`「${consultation.name || '匿名'}」さんを利用者として登録しますか？`)) { return; }
    try {
      const newUID = await generateNewUID();
      const userData: UserInsert = {
        uid: newUID, name: consultation.name || '匿名利用者',
        birth_date: consultation.birth_year && consultation.birth_month && consultation.birth_day ? `${consultation.birth_year}-${String(consultation.birth_month).padStart(2, '0')}-${String(consultation.birth_day).padStart(2, '0')}` : undefined,
        gender: consultation.gender, property_address: consultation.address, resident_contact: consultation.phone_mobile || consultation.phone_home,
        line_available: false, proxy_payment_eligible: consultation.proxy_payment, welfare_recipient: consultation.welfare_recipient, posthumous_affairs: false,
      };
      const newUser = await usersApi.create(userData);
      const updatedConsultation = await consultationsApi.update(consultation.id, { user_id: newUser.id });
      setAllConsultations(prev => prev.map(c => c.id === consultation.id ? updatedConsultation : c));
      alert('利用者として登録しました');
    } catch (err) {
      console.error('利用者登録エラー:', err);
      if (err instanceof Error) {
        console.error('エラーメッセージ:', err.message);
        console.error('エラースタック:', err.stack);
      }
      alert('利用者登録に失敗しました');
    }
  }

  if (loading) { return ( <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div> ) }
  if (error) { return ( <div className="bg-red-50 border border-red-200 rounded-lg p-4"><div className="text-red-500 text-sm">エラーが発生しました: {error}</div></div> ) }

  return (
    <div className="space-y-6">
      {/* ▼▼▼ フィルターパネルの構造を全面的に修正 ▼▼▼ */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* --- 1. 進捗ステータスフィルター --- */}
            <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">進捗ステータスで絞り込み</label>
                {/* PC表示 (ボタン) */}
                <div className="hidden sm:flex flex-wrap gap-2">
                    {STATUS_FILTERS.map(filter => (
                    <button key={filter || 'active'} onClick={() => setActiveFilter(filter)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-x-2 ${ activeFilter === filter ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-200 ring-1 ring-inset ring-gray-300'}`}>
                        {filter || 'アクティブ'}
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${ activeFilter === filter ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-600' }`}>
                        {statusCounts[filter || 'active'] ?? 0}
                        </span>
                    </button>
                    ))}
                </div>
                {/* スマホ表示 (プルダウン) */}
                <div className="sm:hidden">
                    <select
                        value={activeFilter === null ? 'active' : activeFilter}
                        onChange={(e) => {
                            const value = e.target.value;
                            setActiveFilter(value === 'active' ? null : value as StatusFilter);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="active">アクティブ ({statusCounts['active'] ?? 0})</option>
                        {STATUS_FILTERS.filter(f => f !== null).map(filter => (
                            <option key={filter} value={filter}>{filter} ({statusCounts[filter] ?? 0})</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="lg:col-span-3 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                 {/* --- 2. クイックフィルター --- */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">クイックフィルター</label>
                    <div className="flex items-center">
                        <input id="next-appointment-filter" type="checkbox" checked={showOnlyWithNextAppointment} onChange={(e) => setShowOnlyWithNextAppointment(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                        <label htmlFor="next-appointment-filter" className="ml-2 text-sm text-gray-700">📅 次回予定あり</label>
                    </div>
                </div>
                {/* --- 3. キーワード検索 --- */}
                <div>
                    <label htmlFor="search-term" className="block text-sm font-medium text-gray-700 mb-2">キーワード検索</label>
                    <input id="search-term" type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="氏名、相談内容など" className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
                </div>
                {/* --- 4. 相談月 --- */}
                <div>
                    <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-2">相談月で絞り込み</label>
                    <input id="date-filter" type="month" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
                </div>
            </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
          <div className="text-sm text-gray-600">{filteredConsultations.length} 件表示</div>
          <button
            onClick={() => { setSearchTerm(''); setDateFilter(''); setActiveFilter(null); setShowOnlyWithNextAppointment(false); }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            フィルタをクリア
          </button>
        </div>
      </div>
      {/* ▲▲▲ フィルターパネルの修正はここまで ▲▲▲ */}

      {filteredConsultations.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" /></svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">{searchTerm || dateFilter || activeFilter !== null || showOnlyWithNextAppointment ? '該当する相談履歴が見つかりません' : '相談履歴はありません'}</h3>
          <p className="mt-1 text-sm text-gray-500">{searchTerm || dateFilter || activeFilter !== null || showOnlyWithNextAppointment ? '検索条件を変更してください。' : '新しい相談を登録してください。'}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200">
          {filteredConsultations.map((consultation) => {
            let age = null;
            if (consultation.birth_year && consultation.birth_month && consultation.birth_day) {
                try {
                    const birthDateStr = `${consultation.birth_year}-${String(consultation.birth_month).padStart(2, '0')}-${String(consultation.birth_day).padStart(2, '0')}`;
                    if (!isNaN(new Date(birthDateStr).getTime())) {
                        age = calculateAge(birthDateStr);
                    }
                } catch {}
            }
            const displayStatus = consultation.user_id ? '利用者登録済み' : consultation.status;
            const statusColor = STATUS_COLORS[displayStatus as keyof typeof STATUS_COLORS] || STATUS_COLORS['進行中'];
            
            return (
              <div key={consultation.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-x-3 flex-wrap">
                      <span className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColor}`}>{displayStatus}</span>
                      <p className="text-sm font-semibold leading-6 text-gray-900">{consultation.name || '匿名'}</p>
                    </div>
                    <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                      <p>相談日: {formatDate(consultation.consultation_date)}</p>
                      <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current"><circle cx={1} cy={1} r={1} /></svg>
                      {age !== null && <p>年齢: {age}歳</p>}
                    </div>
                    {consultation.consultation_content && (<p className="mt-2 text-sm text-gray-600 line-clamp-2">{consultation.consultation_content}</p>)}
                    {consultation.next_appointment_scheduled === true && (
                      <div className="mt-2 flex items-center gap-x-2 text-sm text-sky-600">
                        <svg className="h-4 w-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zM4.5 6.5A1.25 1.25 0 015.75 5.25h8.5A1.25 1.25 0 0115.5 6.5v1.75H4.5V6.5zM4.5 9.75v5.5A1.25 1.25 0 005.75 16.5h8.5A1.25 1.25 0 0015.5 15.25v-5.5H4.5z" clipRule="evenodd" /></svg>
                        <p className="font-medium">次回予定:</p>
                        <p>{consultation.next_appointment_details}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div>
                        <select
                          value={consultation.status}
                          onChange={(e) => handleStatusChange(consultation.id, e.target.value)}
                          data-id={consultation.id}
                          className="w-full sm:w-auto rounded-md bg-white px-2.5 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:opacity-75"
                          disabled={!!consultation.user_id}
                        >
                          {CONSULTATION_STATUSES.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                    </div>
                    <Link
                      href={`/consultations/${consultation.id}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-x-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      <svg className="-ml-0.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.18l.88-1.84a1.65 1.65 0 011.695-1.075l1.62.29a1.65 1.65 0 011.444 1.443l.29 1.621a1.65 1.65 0 01-1.075 1.695l-1.84.879a1.65 1.65 0 01-1.18 0l-1.839-.88a1.65 1.65 0 01-1.075-1.695l.29-1.621a1.65 1.65 0 011.444-1.443l1.62.29a1.65 1.65 0 011.695 1.075l.88 1.84a1.65 1.65 0 010 1.18l-.88 1.84a1.65 1.65 0 01-1.695 1.075l-1.62-.29a1.65 1.65 0 01-1.444-1.443l-.29-1.621a1.65 1.65 0 011.075-1.695l1.839-.88zM10 15a5 5 0 100-10 5 5 0 000 10z" clipRule="evenodd" /></svg>
                      詳細
                    </Link>
                    {!consultation.user_id && (
                      <button
                        onClick={() => handleRegisterAsUser(consultation)}
                        type="button"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-x-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                      >
                         <svg className="-ml-0.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M11 5a3 3 0 11-6 0 3 3 0 016 0zM2.047 14.5a.75.75 0 001.06 1.061l4.94-4.939a.75.75 0 00-1.06-1.06l-4.94 4.938zM17.953 14.5a.75.75 0 01-1.06 1.061l-4.94-4.939a.75.75 0 111.06-1.06l4.94 4.938z" /></svg>
                        利用者登録
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ConsultationList