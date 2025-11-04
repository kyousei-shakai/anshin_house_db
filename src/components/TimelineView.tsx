'use client'

import { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { UserCircleIcon, CalendarIcon, CheckCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid'
import { type Database } from '@/types/database'
import SupportEventForm, { type SupportEventFormData } from '@/components/forms/SupportEventForm'
import { updateSupportEvent, deleteSupportEvent } from '@/app/actions/consultationEvents'

type ConsultationEvent = Database['public']['Tables']['consultation_events']['Row'] & {
  staff: { name: string | null } | null
}

interface TimelineViewProps {
  initialEvents: ConsultationEvent[]
  consultationId: string
}

const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 };
const modalContentStyle: React.CSSProperties = { backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' };

const TimelineView: React.FC<TimelineViewProps> = ({ initialEvents, consultationId }) => {
  const router = useRouter()

  const [events, setEvents] = useState<ConsultationEvent[]>(initialEvents)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ConsultationEvent | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null)

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  // ▼▼▼ ここからが変更箇所です ▼▼▼
  const handleOpenModal = (event: ConsultationEvent) => {
    // staff_id が null または undefined の場合はフォームを開かない
    if (!event.staff_id) {
      alert('担当者情報が存在しないため、この記録は編集できません。');
      return;
    }
    setEditingEvent(event)
    setIsModalOpen(true)
  }
  // ▲▲▲ ここまでが変更箇所です ▲▲▲

  const handleCloseModal = () => {
    setEditingEvent(null)
    setIsModalOpen(false)
  }

  const handleSaveEvent = async (formData: SupportEventFormData) => {
    if (!editingEvent) return;
    setIsSaving(true)

    if (!formData.staff_id) {
        alert("担当者が選択されていません。");
        setIsSaving(false);
        return;
    }
    const result = await updateSupportEvent(editingEvent.id, consultationId, {
        ...formData,
        staff_id: formData.staff_id,
    });

    if (result.success) {
      alert('記録を更新しました。')
      handleCloseModal()
      router.refresh()
    } else {
      alert(`エラー: ${result.error}`)
    }
    setIsSaving(false)
  }

  const handleDeleteEvent = async (event: ConsultationEvent) => {
    if (!window.confirm('この記録を本当に削除しますか？\nこの操作は元に戻せません。')) {
      return;
    }
    setDeletingEventId(event.id);

    const result = await deleteSupportEvent(event.id, consultationId);

    if (result.success) {
      alert('記録を削除しました。');
      router.refresh(); 
    } else {
      alert(`エラー: ${result.error}`);
    }

    setDeletingEventId(null);
  }
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    return `${year}年${month}月${day}日`;
  }
  const formatDateForNextAction = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  if (!events || events.length === 0) {
    return (
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6 text-center">
        <h3 className="text-sm font-semibold text-gray-900">記録された支援履歴はありません</h3>
        <p className="mt-1 text-sm text-gray-500">「対応を記録する」ボタンから最初の記録を追加してください。</p>
      </div>
    )
  }

  return (
    <Fragment>
      <div id="timeline" className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg overflow-hidden">
        <div className="px-4 py-4 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h2 className="text-base font-semibold leading-6 text-gray-800">支援タイムライン</h2>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {events.map((event) => (
              <li key={event.id} className={`p-4 sm:p-6 ${deletingEventId === event.id ? 'opacity-50' : ''}`}>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                      <UserCircleIcon className="h-10 w-10 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">
                        {event.staff?.name || '不明なスタッフ'}
                      </p>
                      <div className="flex items-center gap-x-3">
                        <p className="text-xs text-gray-500">
                          {formatDate(event.created_at)}
                        </p>
                        <button onClick={() => handleOpenModal(event)} type="button" className="text-gray-400 hover:text-gray-600 disabled:opacity-30" disabled={!!deletingEventId}>
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">編集</span>
                        </button>
                        <button onClick={() => handleDeleteEvent(event)} type="button" className="text-gray-400 hover:text-red-600 disabled:opacity-30" disabled={!!deletingEventId}>
                          <TrashIcon className="h-4 w-4" />
                          <span className="sr-only">削除</span>
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div className="flex items-center gap-1.5">
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        <p className="text-sm font-semibold text-gray-700">{event.status}</p>
                      </div>
                      {event.next_action_date && (
                          <div className="flex items-center gap-1.5">
                              <CalendarIcon className="h-4 w-4 text-orange-500" />
                              <p className="text-sm font-medium text-gray-600">
                                  <span className="text-gray-500">次回予定: </span>
                                  {formatDateForNextAction(event.next_action_date)}
                              </p>
                          </div>
                      )}
                    </div>
                    {event.event_note && (
                      <div className="mt-3 whitespace-pre-wrap rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
                          <p>{event.event_note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {isModalOpen && (
        <div style={modalOverlayStyle} onClick={handleCloseModal}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            {/* ▼▼▼ 変更点: editingEventがnullでないことを型ガードで保証 ▼▼▼ */}
            {editingEvent && editingEvent.staff_id && (
              <SupportEventForm
                initialData={{
                  ...editingEvent,
                  staff_id: editingEvent.staff_id, // ここでstaff_idはstring型であることが保証される
                }}
                onSave={handleSaveEvent}
                onCancel={handleCloseModal}
                isSaving={isSaving}
              />
            )}
            {/* ▲▲▲ 変更点 ▲▲▲ */}
          </div>
        </div>
      )}
    </Fragment>
  )
}

export default TimelineView