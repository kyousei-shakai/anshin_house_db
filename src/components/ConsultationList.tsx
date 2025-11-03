// src/components/ConsultationList.tsx
'use client'

import React, { useState, useMemo, Fragment } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ConsultationWithNextAction } from '@/types/consultation'
import { type Database } from '@/types/database'
import { calculateAge } from '@/utils/date'
import {
  STATUS_FILTERS,
  STATUS_COLORS,
  StatusFilter,
  ConsultationStatus,
} from '@/lib/consultationConstants'
import { type Staff } from '@/types/staff'
import {
  getDaysUntil,
} from '@/lib/dateUtils'

import SupportEventForm, { FormData as SupportEventFormData } from '@/components/forms/SupportEventForm'
import { createSupportEvent } from '@/app/actions/consultationEvents'
import { createUser } from '@/app/actions/users'

type UserInsert = Database['public']['Tables']['users']['Insert']

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 50,
}

const modalContentStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  width: '90%',
  maxWidth: '500px',
  maxHeight: '90vh',
  overflowY: 'auto',
}

type ConsultationListProps = {
  initialConsultations: ConsultationWithNextAction[]
  staffs: Pick<Staff, 'id' | 'name'>[]
}

const ConsultationList: React.FC<ConsultationListProps> = ({ 
  initialConsultations,
  staffs 
}) => {
  const [allConsultations, setAllConsultations] = useState<ConsultationWithNextAction[]>(initialConsultations);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState<StatusFilter>(null);
  const [showOnlyWithNextAction, setShowOnlyWithNextAction] = useState(false);
  const [staffFilter, setStaffFilter] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationWithNextAction | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter();

  const filteredConsultations = useMemo(() => {
    let filtered = allConsultations;
    if (activeFilter && activeFilter !== 'すべて表示') {
      if (activeFilter === '利用者登録済み') {
        filtered = filtered.filter(c => !!c.user_id);
      } else {
        filtered = filtered.filter(c => c.status === activeFilter && !c.user_id);
      }
    } else if (activeFilter === null) {
       const inactiveStatuses: string[] = ["支援終了", "対象外・辞退"];
       filtered = filtered.filter(c => !inactiveStatuses.includes(c.status || '') && !c.user_id);
    }
    
    if (staffFilter) {
      filtered = filtered.filter(consultation => consultation.staff_id === staffFilter);
    }

    if (searchTerm) {
      // ▼▼▼【ここからが唯一の修正点：検索ロジックの拡張】▼▼▼
      const lowercasedFilter = searchTerm.toLowerCase();
      const filterWithoutHyphen = lowercasedFilter.replace(/-/g, '');

      filtered = filtered.filter(consultation => {
        // --- 相談者本人の情報 ---
        if (consultation.name?.toLowerCase().includes(lowercasedFilter)) return true;
        if (consultation.phone_home?.replace(/-/g, '').includes(filterWithoutHyphen)) return true;
        if (consultation.phone_mobile?.replace(/-/g, '').includes(filterWithoutHyphen)) return true;
        if (consultation.address?.toLowerCase().includes(lowercasedFilter)) return true;
        
        // --- 緊急連絡先の情報 ---
        if (consultation.emergency_contact_name?.toLowerCase().includes(lowercasedFilter)) return true;
        if (consultation.emergency_contact_phone_home?.replace(/-/g, '').includes(filterWithoutHyphen)) return true;
        if (consultation.emergency_contact_phone_mobile?.replace(/-/g, '').includes(filterWithoutHyphen)) return true;

        // --- 関連機関の情報 ---
        if (consultation.care_manager?.toLowerCase().includes(lowercasedFilter)) return true;
        if (consultation.medical_institution_name?.toLowerCase().includes(lowercasedFilter)) return true;
        if (consultation.medical_institution_staff?.toLowerCase().includes(lowercasedFilter)) return true;

        // --- その他の情報（既存の検索範囲） ---
        if (consultation.staff_name?.toLowerCase().includes(lowercasedFilter)) return true;
        if (consultation.consultation_content?.toLowerCase().includes(lowercasedFilter)) return true;
        if (consultation.consultation_result?.toLowerCase().includes(lowercasedFilter)) return true;
        if (consultation.id.toLowerCase().includes(lowercasedFilter)) return true;

        return false;
      });
      // ▲▲▲【ここまでが唯一の修正点】▲▲▲
    }
    if (dateFilter) {
      filtered = filtered.filter(consultation =>
        consultation.consultation_date && consultation.consultation_date.startsWith(dateFilter)
      );
    }

    if (showOnlyWithNextAction) {
      filtered = filtered.filter(consultation => !!consultation.next_action_date);
    }

    return filtered;
  }, [allConsultations, activeFilter, searchTerm, dateFilter, staffFilter, showOnlyWithNextAction]);

  const statusCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    const defaultInactiveStatuses: string[] = ["支援終了", "対象外・辞退"];
    counts['active'] = allConsultations.filter(c => !defaultInactiveStatuses.includes(c.status || '') && !c.user_id).length;
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

  const handleOpenModal = (consultation: ConsultationWithNextAction) => {
    setSelectedConsultation(consultation);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedConsultation(null);
    setIsModalOpen(false);
  };

  const handleSaveEvent = async (formData: SupportEventFormData) => {
    if (!selectedConsultation) return;
    setIsSaving(true);

    const dataToSubmit = {
      ...formData,
      consultationId: selectedConsultation.id,
    };

    const result = await createSupportEvent(dataToSubmit);

    if (result.success && result.consultation) {
      alert('記録を保存しました。');
      handleCloseModal();
      router.refresh();
    } else {
      alert(`エラー: ${result.error}`);
    }
    setIsSaving(false);
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.');
  }

  const handleRegisterAsUser = async (consultation: ConsultationWithNextAction) => {
    if (!confirm(`「${consultation.name || '匿名'}」さんを利用者として登録しますか？`)) {
      return
    }
    setLoading(true)
    setError(null)

    try {
      const userData: Omit<UserInsert, 'uid'> = {
        name: consultation.name || '匿名利用者',
        birth_date: consultation.birth_year && consultation.birth_month && consultation.birth_day
          ? `${consultation.birth_year}-${String(consultation.birth_month).padStart(2, '0')}-${String(consultation.birth_day).padStart(2, '0')}`
          : undefined,
        gender: consultation.gender,
        property_address: consultation.address,
        resident_contact: consultation.phone_mobile || consultation.phone_home,
        line_available: false,
        proxy_payment_eligible: consultation.proxy_payment,
        welfare_recipient: consultation.welfare_recipient,
        posthumous_affairs: false,
      }

      const result = await createUser(userData, consultation.id)

      if (result.success) {
        alert('利用者として登録しました')
        router.refresh()
      } else {
        throw new Error(result.error || '利用者登録に失敗しました。')
      }
    } catch (err) {
      console.error('利用者登録エラー:', err)
      const errorMessage = err instanceof Error ? err.message : '予期せぬエラーが発生しました。'
      setError(errorMessage)
      alert(`利用者登録に失敗しました: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) { return ( <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div> ) }
  if (error) { return ( <div className="bg-red-50 border border-red-200 rounded-lg p-4"><div className="text-red-500 text-sm">エラーが発生しました: {error}</div></div> ) }
  return (
    <Fragment>
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">進捗ステータスで絞り込み</label>
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
                  <div>
                      <label htmlFor="staff-filter" className="block text-sm font-medium text-gray-700 mb-2">担当スタッフ</label>
                      <select 
                        id="staff-filter" 
                        value={staffFilter} 
                        onChange={(e) => setStaffFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">すべて</option>
                        {staffs.map(staff => (
                          <option key={staff.id} value={staff.id}>{staff.name}</option>
                        ))}
                      </select>
                  </div>
                  <div>
                      <label htmlFor="search-term" className="block text-sm font-medium text-gray-700 mb-2">キーワード検索</label>
                      <input id="search-term" type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="氏名, 電話番号, 住所, 関連機関名など" className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
                  </div>
                  <div>
                      <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-2">相談月で絞り込み</label>
                      <input id="date-filter" type="month" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
                  </div>
              </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id="next-action-filter"
                  aria-describedby="next-action-filter-description"
                  name="next-action-filter"
                  type="checkbox"
                  checked={showOnlyWithNextAction}
                  onChange={(e) => setShowOnlyWithNextAction(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="next-action-filter" className="font-medium text-gray-900">
                  次回予定ありのみ表示
                </label>
              </div>
            </div>
            
            <div className="flex items-center gap-x-4">
              <div className="text-sm text-gray-600">{filteredConsultations.length} 件表示</div>
              <button
                onClick={() => { setSearchTerm(''); setDateFilter(''); setActiveFilter(null); setShowOnlyWithNextAction(false); setStaffFilter(''); }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                フィルタをクリア
              </button>
            </div>
          </div>
        </div>

        {filteredConsultations.length === 0 ? (
          <div className="bg-white border rounded-lg p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" /></svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">{searchTerm || dateFilter || activeFilter !== null || showOnlyWithNextAction ? '該当する相談履歴が見つかりません' : '相談履歴はありません'}</h3>
            <p className="mt-1 text-sm text-gray-500">{searchTerm || dateFilter || activeFilter !== null || showOnlyWithNextAction ? '検索条件を変更してください。' : '新しい相談を登録してください。'}</p>
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
              
              const daysUntil = getDaysUntil(consultation.next_action_date);

              const cardStyle = daysUntil !== null && daysUntil < 0
                ? 'bg-gray-100 border-gray-200'
                : 'bg-rose-50 border-rose-200';

              const dateStyle = daysUntil !== null && daysUntil < 0
                ? 'text-gray-600 font-semibold'
                : 'text-rose-800 font-semibold';
              
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

                      {consultation.next_action_date && (
                        <div className={`mt-3 rounded-md border ${cardStyle}`}>
                          <div className="flex items-center gap-x-3 p-2 sm:p-2.5">
                            <span className="text-xl">📅</span>
                            <div className="flex-1 min-w-0">
                               <p className={`text-sm ${dateStyle}`}>
                                {formatDate(consultation.next_action_date)}
                              </p>
                              {consultation.next_action_memo && (
                                <p className="text-sm text-stone-700 truncate" title={consultation.next_action_memo}>
                                  {consultation.next_action_memo}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      {!consultation.user_id && (
                        <button
                          onClick={() => handleOpenModal(consultation)}
                          type="button"
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-x-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                        >
                          <svg className="-ml-0.5 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M16.88 9.124a7.5 7.5 0 01-1.125 9.75l-3.337-1.901a4.5 4.5 0 00-1.03-5.855l1.08-1.082a.75.75 0 000-1.06l-2.122-2.122a.75.75 0 00-1.06 0L8.12 7.752a4.5 4.5 0 00-5.855-1.03L.364 10.06a7.5 7.5 0 019.75-1.125l6.768-6.768a.75.75 0 011.06 0l2.122 2.122a.75.75 0 010 1.06l-6.768 6.768z" /></svg>
                          進捗を記録
                        </button>
                      )}
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

      {isModalOpen && selectedConsultation && (
        <div style={modalOverlayStyle} onClick={handleCloseModal}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <SupportEventForm
              currentStatus={selectedConsultation.status as ConsultationStatus}
              onSave={handleSaveEvent}
              onCancel={handleCloseModal}
              isSaving={isSaving}
            />
          </div>
        </div>
      )}
    </Fragment>
  )
}

export default ConsultationList