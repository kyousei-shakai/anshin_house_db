// src/components/ConsultationTimeline.tsx
import { createClient } from '@/utils/supabase/server'
import TimelineView from './TimelineView' // ★ 新しいClient Componentをインポート
import { type Database } from '@/types/database'

// 型定義をサーバーコンポーネント側でも使用
type ConsultationEvent = Database['public']['Tables']['consultation_events']['Row'] & {
  staff: { name: string | null } | null
}

interface ConsultationTimelineProps {
  consultationId: string
}

// データ取得を担当する親となるServer Component
const ConsultationTimeline = async ({ consultationId }: ConsultationTimelineProps) => {
  const supabase = createClient()

  const { data: events, error } = await supabase
    .from('consultation_events')
    .select(`*, staff ( name )`)
    .eq('consultation_id', consultationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching timeline events:", error.message)
    return <div className="text-red-500">タイムラインの読み込みに失敗しました。</div>
  }
  
  // 取得したデータをClient Componentにpropsとして渡す
  return <TimelineView initialEvents={events as ConsultationEvent[]} consultationId={consultationId} />
}

export default ConsultationTimeline