// src/components/UserConsultationHistory.tsx (完全版・修正後)

'use client'

import React from 'react'
import Link from 'next/link'
import { Database } from '@/types/database'

type Consultation = Database['public']['Tables']['consultations']['Row']

interface UserConsultationHistoryProps {
  consultations: Consultation[] // ★ userIdではなく、consultations配列を直接受け取る
}

const UserConsultationHistory: React.FC<UserConsultationHistoryProps> = ({ consultations }) => {
  // ▼▼▼ データ取得関連のstateとuseEffectを全て削除 ▼▼▼
  // const [consultations, setConsultations] = useState<Consultation[]>([])
  // const [loading, setLoading] = useState(true)
  // const [error, setError] = useState<string | null>(null)
  // useEffect(() => { ... }, [userId])

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  // ▼▼▼ ローディングとエラー表示は不要に（親コンポーネントで処理されるため）▼▼▼
  /*
  if (loading) { ... }
  if (error) { ... }
  */

  return (
    <div className="space-y-4">
      {/* 1. ヘッダー：余白の適正化 */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-gray-900">相談履歴 ({consultations.length}件)</h2>
      </div>

      {consultations.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-10 text-center border-2 border-dashed border-gray-100">
          <div className="text-gray-400 text-sm font-medium">相談履歴はありません</div>
        </div>
      ) : (
        /* 
           2. リストエリア：
           装飾（箱、影、アイコン）を一切排除。
           -mx-4 によりスマホ画面の左右端まで文字情報を広げ、水平線のみで構成。
        */
        <div className="divide-y divide-gray-100 border-t border-gray-100 -mx-4 sm:mx-0">
          {consultations.map((consultation) => {
            // 👇 原本の表示ロジックを完全維持（一言一句変更なし）
            const consultationRoutes = [
              consultation.consultation_route_self && '本人',
              consultation.consultation_route_family && '家族',
              consultation.consultation_route_care_manager && 'ケアマネ',
              consultation.consultation_route_elderly_center && '支援センター（高齢者）',
              consultation.consultation_route_disability_center && '支援センター（障害者）',
              consultation.consultation_route_government && '行政機関',
              consultation.consultation_route_other && 'その他',
            ].filter(Boolean) as string[]

            const attributes = [
              consultation.attribute_elderly && '高齢',
              consultation.attribute_disability && '障がい',
              consultation.attribute_childcare && '子育て',
              consultation.attribute_single_parent && 'ひとり親',
              consultation.attribute_dv && 'DV',
              consultation.attribute_foreigner && '外国人',
              consultation.attribute_poverty && '生活困窮',
              consultation.attribute_low_income && '低所得者',
              consultation.attribute_lgbt && 'LGBT',
              consultation.attribute_welfare && '生保',
            ].filter(Boolean) as string[]

            return (
              /* 
                 ★ 修正: div を Link に変更し、行全体を遷移対象に。
                 hover:bg-gray-50 と transition で「押せること」を視覚的に伝えます。
              */
              <Link 
                key={consultation.id} 
                href={`/consultations/${consultation.id}`}
                className="block py-4 px-4 sm:px-0 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex flex-col gap-y-2">
                  {/* 日時・ID：詳細リンクは削除し、タイトル色をグループホバーで変化させる */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {formatDate(consultation.consultation_date)}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono uppercase tracking-tighter">ID: {consultation.id.slice(0, 8)}</span>
                    </div>
                  </div>
                  
                  {/* バッジ */}
                  {(consultationRoutes.length > 0 || attributes.length > 0) && (
                    <div className="flex flex-wrap gap-1">
                      {consultationRoutes.map((route, index) => (
                        <span key={`route-${index}`} className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-blue-100">{route}</span>
                      ))}
                      {attributes.map((attr, index) => (
                        <span key={`attr-${index}`} className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-green-100">{attr}</span>
                      ))}
                    </div>
                  )}
                  
                  {/* 相談内容：原本の200文字制限ロジックを完全維持 */}
                  {consultation.consultation_content && (
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <span className="font-bold text-gray-900 mr-2">[内容]</span>
                      {consultation.consultation_content.length > 200 
                        ? `${consultation.consultation_content.substring(0, 200)}...` 
                        : consultation.consultation_content}
                    </div>
                  )}
                  
                  {/* 相談結果：原本の200文字制限ロジックを完全維持 */}
                  {consultation.consultation_result && (
                    <div className="text-sm text-gray-600 leading-relaxed">
                      <span className="font-bold text-gray-800 mr-2">[結果]</span>
                      {consultation.consultation_result.length > 200 
                        ? `${consultation.consultation_result.substring(0, 200)}...` 
                        : consultation.consultation_result}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
export default UserConsultationHistory