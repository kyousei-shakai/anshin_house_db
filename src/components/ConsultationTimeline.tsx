// src/components/ConsultationTimeline.tsx
import { createClient } from '@/utils/supabase/server'
import { UserCircleIcon } from '@heroicons/react/24/solid'

interface ConsultationTimelineProps {
  consultationId: string
}

const ConsultationTimeline = async ({ consultationId }: ConsultationTimelineProps) => {
  const supabase = await createClient()

  const { data: events, error } = await supabase
    .from('consultation_events')
    .select(`
      *,
      staff ( name )
    `)
    .eq('consultation_id', consultationId)
    .order('created_at', { ascending: false })

  if (error) {
    return <div className="text-red-500">タイムラインの読み込みに失敗しました。</div>
  }
  
  if (!events || events.length === 0) {
    return (
      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6 text-center">
        <h3 className="text-sm font-semibold text-gray-900">記録された支援履歴はありません</h3>
        <p className="mt-1 text-sm text-gray-500">「対応を記録する」ボタンから最初の記録を追加してください。</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-lg font-semibold leading-6 text-gray-900">支援タイムライン</h2>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <ul className="space-y-8">
          {events.map((event, eventIdx) => (
            <li key={event.id}>
              <div className="relative pb-8">
                {eventIdx !== events.length - 1 && (
                  <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                )}
                <div className="relative flex items-start space-x-3">
                  <div>
                    <div className="relative px-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
                        <UserCircleIcon className="h-6 w-6 text-gray-500" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{event.staff?.name || '不明なスタッフ'}</p>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">{formatDate(event.created_at)}</p>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      <div className="mb-2">
                        <span className="font-semibold">ステータス変更: </span>
                        <span className="font-bold text-blue-700">{event.status}</span>
                      </div>
                      <div className="mb-2 whitespace-pre-wrap rounded-md border border-gray-200 bg-gray-50 p-3">
                        <p>{event.event_note}</p>
                      </div>
                      {event.next_action_date && (
                        <p className="text-sm font-medium text-orange-600">
                          <span className="font-semibold">次回アクション予定日: </span>
                          {/* ★ 変更点: toLocaleDateDateString -> toLocaleDateString に修正 */}
                          {new Date(event.next_action_date).toLocaleDateString('ja-JP')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ConsultationTimeline