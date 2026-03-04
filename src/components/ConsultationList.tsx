'use client'

import React, { useState, useMemo, Fragment, useTransition } from 'react'
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

import SupportEventForm, { type SupportEventFormData } from '@/components/forms/SupportEventForm'
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
  statusCounts: { [key: string]: number }
}

const ConsultationList: React.FC<ConsultationListProps> = ({
  initialConsultations,
  staffs,
  statusCounts
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition(); 
  const [navigatingId, setNavigatingId] = useState<string | null>(null);

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

  const filteredConsultations = useMemo(() => {
    let filtered = initialConsultations;
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

        // --- その他の情報 ---
        if (consultation.staff_name?.toLowerCase().includes(lowercasedFilter)) return true;
        if (consultation.consultation_content?.toLowerCase().includes(lowercasedFilter)) return true;
        if (consultation.consultation_result?.toLowerCase().includes(lowercasedFilter)) return true;
        if (consultation.id.toLowerCase().includes(lowercasedFilter)) return true;

        return false;
      });
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
  }, [initialConsultations, activeFilter, searchTerm, dateFilter, staffFilter, showOnlyWithNextAction]);

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

  const handleRowClick = (id: string) => {
    if (navigatingId) return;
    setNavigatingId(id);
    router.push(`/consultations/${id}`);
  };

  if (loading) { return (<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>) }
  if (error) { return (<div className="bg-red-50 border border-red-200 rounded-lg p-4"><div className="text-red-500 text-sm">エラーが発生しました: {error}</div></div>) }

  const isThinking = isPending || navigatingId !== null;

  return (
    <Fragment>
      <div className="space-y-6">
        {/* フィルターセクション */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">進捗ステータスで絞り込み</label>
              <div className="hidden sm:flex flex-wrap gap-2">
                {STATUS_FILTERS.map(filter => (
                  <button key={filter || 'active'} 
                    onClick={() => startTransition(() => setActiveFilter(filter))}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center gap-x-2 ${activeFilter === filter ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-300'}`}>
                    {filter || 'アクティブ'}
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${activeFilter === filter ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-600'}`}>
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
                    startTransition(() => setActiveFilter(value === 'active' ? null : value as StatusFilter));
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
                <select id="staff-filter" value={staffFilter} 
                  onChange={(e) => startTransition(() => setStaffFilter(e.target.value))} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="">すべて</option>
                  {staffs.map(staff => (
                    <option key={staff.id} value={staff.id}>{staff.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="search-term" className="block text-sm font-medium text-gray-700 mb-2">キーワード検索</label>
                <div className="relative">
                  {/* 【修正】打ち込み不具合の解消：onChangeをstartTransitionから外して即時反映させる */}
                  <input id="search-term" type="text" value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    placeholder="氏名, 電話番号, 住所, 関連機関名など" className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  {isPending && (
                    <div className="absolute right-3 top-2.5">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-2">相談月で絞り込み</label>
                <input id="date-filter" type="month" value={dateFilter} 
                  onChange={(e) => startTransition(() => setDateFilter(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-200 mt-4 gap-4">
            <div className="relative flex items-start self-start sm:self-center">
              <div className="flex h-6 items-center">
                <input id="next-action-filter" name="next-action-filter" type="checkbox" checked={showOnlyWithNextAction} 
                  onChange={(e) => startTransition(() => setShowOnlyWithNextAction(e.target.checked))} 
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="next-action-filter" className="font-medium text-gray-900">次回予定ありのみ表示</label>
              </div>
            </div>
            <div className="flex items-center gap-x-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-sm text-gray-600">{filteredConsultations.length} 件表示</div>
              
              <button 
                onClick={() => startTransition(() => { setSearchTerm(''); setDateFilter(''); setActiveFilter(null); setShowOnlyWithNextAction(false); setStaffFilter(''); })} 
                className="flex items-center gap-x-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                フィルタをクリア
              </button>
            </div>
          </div>
        </div>

        <div className="relative min-h-[200px]">
          {isThinking && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-lg">
              <div className="flex flex-col items-center gap-2 px-6 py-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-xs font-bold text-gray-600">読み込み中...</span>
              </div>
            </div>
          )}

          {filteredConsultations.length === 0 ? (
            <div className="bg-white border rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" /></svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">{searchTerm || dateFilter || activeFilter !== null || showOnlyWithNextAction ? '該当する相談履歴が見つかりません' : '相談履歴はありません'}</h3>
              <p className="mt-1 text-sm text-gray-500">{searchTerm || dateFilter || activeFilter !== null || showOnlyWithNextAction ? '検索条件を変更してください。' : '新しい相談を登録してください。'}</p>
            </div>
          ) : (
            <div className={`bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 transition-opacity duration-200 ${isThinking ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              {filteredConsultations.map((consultation) => {
                let age = null;
                if (consultation.birth_year && consultation.birth_month && consultation.birth_day) {
                  try {
                    const birthDateStr = `${consultation.birth_year}-${String(consultation.birth_month).padStart(2, '0')}-${String(consultation.birth_day).padStart(2, '0')}`;
                    if (!isNaN(new Date(birthDateStr).getTime())) {
                      age = calculateAge(birthDateStr);
                    }
                  } catch { }
                }
                const isNavigating = navigatingId === consultation.id;
                const displayStatus = consultation.user_id ? '利用者登録済み' : consultation.status;
                const statusColor = STATUS_COLORS[displayStatus as keyof typeof STATUS_COLORS] || STATUS_COLORS['進行中'];
                const daysUntil = getDaysUntil(consultation.next_action_date);
                const cardStyle = daysUntil !== null && daysUntil < 0 ? 'bg-gray-100 border-gray-200' : 'bg-rose-50 border-rose-200';
                const dateStyle = daysUntil !== null && daysUntil < 0 ? 'text-gray-600 font-semibold' : 'text-rose-800 font-semibold';

                return (
                  <div 
                    key={consultation.id} 
                    className={`p-4 sm:p-6 transition-colors duration-150 group cursor-pointer ${isNavigating ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                    onClick={() => handleRowClick(consultation.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRowClick(consultation.id); } }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-x-3 flex-wrap">
                          <span className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColor}`}>{displayStatus}</span>
                          <p className="text-sm font-semibold leading-6 text-gray-900">{consultation.name || '匿名'}</p>
                          <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            <svg className="w-3 h-3 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            {consultation.staff_name || '担当未定'}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                          <p>相談日: {formatDate(consultation.consultation_date)}</p>

                          {(age !== null || consultation.age_group) && (
                            <>
                              <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current"><circle cx={1} cy={1} r={1} /></svg>
                              <p>
                                {age !== null
                                  ? `年齢: ${age}歳`
                                  : `年代: ${consultation.age_group}`}
                              </p>
                            </>
                          )}
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

                      <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 flex items-center gap-4">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {!consultation.user_id && (
                            <button
                              onClick={() => handleOpenModal(consultation)}
                              type="button"
                              className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                            >
                              進捗を記録
                            </button>
                          )}
                          {!consultation.user_id && (
                            <button
                              onClick={() => handleRegisterAsUser(consultation)}
                              type="button"
                              className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-colors"
                            >
                              利用者登録
                            </button>
                          )}
                        </div>
                        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                          {isNavigating ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                          ) : (
                            <svg className="h-6 w-6 text-gray-300 group-hover:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
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