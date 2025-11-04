// src/components/ConsultationTimeline.tsx
import { createClient } from '@/utils/supabase/server'
import { UserCircleIcon, CalendarIcon, CheckCircleIcon } from '@heroicons/react/24/solid'

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

  // ▼▼▼ デザイン改良: 日付フォーマット関数をシンプルに、時間表示を削除 ▼▼▼
  const formatDate = (dateString: string) => {
    // タイムゾーンの影響を受けないように、UTCとして日付を解釈し、年月日のみを取得
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; // getUTCMonthは0から始まる
    const day = date.getUTCDate();
    return `${year}年${month}月${day}日`;
  }
  
  const formatDateForNextAction = (dateString: string) => {
    const date = new Date(dateString);
     // next_action_dateはタイムゾーン情報を含まないYYYY-MM-DD形式の可能性を考慮
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  return (
    // ▼▼▼ デザイン改良: 全体のカードスタイルを他のページと統一 ▼▼▼
    <div id="timeline" className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg overflow-hidden">
      <div className="px-4 py-4 sm:px-6 bg-gray-50 border-b border-gray-200">
        <h2 className="text-base font-semibold leading-6 text-gray-800">支援タイムライン</h2>
      </div>
      <div className="border-t border-gray-200">
        <ul role="list" className="divide-y divide-gray-200">
          {events.map((event) => (
            // ▼▼▼ デザイン改良: 各イベントのレイアウトを全面的に刷新 ▼▼▼
            <li key={event.id} className="p-4 sm:p-6">
              <div className="flex items-start space-x-4">
                {/* アイコン */}
                <div className="flex-shrink-0">
                    <UserCircleIcon className="h-10 w-10 text-gray-400" aria-hidden="true" />
                </div>
                
                {/* メインコンテンツ */}
                <div className="min-w-0 flex-1">
                  {/* 担当者名と記録日 */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">
                      {event.staff?.name || '不明なスタッフ'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(event.created_at)}
                    </p>
                  </div>

                  {/* ステータスと次回予定日 */}
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
                  
                  {/* 内容 */}
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
  )
}

export default ConsultationTimeline