// src/components/UserSupportPlans.tsx (完全版・修正後)

'use client'

import React from 'react'
import Link from 'next/link'
import { Database } from '@/types/database'

type SupportPlan = Database['public']['Tables']['support_plans']['Row']

type SupportPlanWithStaff = SupportPlan & {
  staff?: {
    name: string | null;
  } | null;
};

interface UserSupportPlansProps {
  supportPlans: SupportPlanWithStaff[] // ★ userIdではなく、supportPlans配列を直接受け取る
}

const UserSupportPlans: React.FC<UserSupportPlansProps> = ({ supportPlans }) => {
  // ▼▼▼ データ取得関連のstateとuseEffectを全て削除 ▼▼▼
  // const [supportPlans, setSupportPlans] = useState<SupportPlan[]>([])
  // const [loading, setLoading] = useState(true)
  // const [error, setError] = useState<string | null>(null)
  // useEffect(() => { ... }, [userId])

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '日付不明'
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  const getCareLevels = (plan: SupportPlan): string => {
    const levels: string[] = []
    if (plan.care_level_independent) levels.push('自立')
    if (plan.care_level_support1) levels.push('要支援1')
    if (plan.care_level_support2) levels.push('要支援2')
    if (plan.care_level_care1) levels.push('要介護1')
    if (plan.care_level_care2) levels.push('要介護2')
    if (plan.care_level_care3) levels.push('要介護3')
    if (plan.care_level_care4) levels.push('要介護4')
    if (plan.care_level_care5) levels.push('要介護5')
    return levels.join(', ')
  }

  // ▼▼▼ ローディングとエラー表示は不要に ▼▼▼
  /*
  if (loading) { ... }
  if (error) { ... }
  */

  return (
    <div className="space-y-4">
      {/* 1. ヘッダー：タイトルと「新規計画作成」ボタンを適切に配置 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">支援計画 ({supportPlans.length}件)</h2>
        {/* ★ 復活: 新規計画作成ボタン。スマホ時はコンパクトに、PCではフル表示 */}
        <Link
          href="/support-plans/new"
          className="bg-purple-600 text-white px-3 py-1.5 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-xs font-bold shadow-sm transition-all active:scale-95"
        >
          ＋ 新規計画作成
        </Link>
      </div>

      {supportPlans.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-10 text-center border-2 border-dashed border-gray-100">
          <div className="text-gray-400 text-sm font-medium">支援計画はありません</div>
        </div>
      ) : (
        /* 
           2. リストエリア：
           「白い箱」を廃止し、水平線(divide-y)のみのシンプル構成へ。
           -mx-4 によりスマホ画面の左右端まで文字情報を広げます。
        */
        <div className="divide-y divide-gray-100 border-t border-gray-100 -mx-4 sm:mx-0">
          {supportPlans.map((plan, index) => {
            // 👇 原本のロジックを完全維持（一言一句変更なし）
            const careLevels = getCareLevels(plan)
            
            return (
              /* ★ 修正: 行全体を詳細ページへのリンクに。hover:bg-gray-50 を適用 */
              <Link 
                key={plan.id} 
                href={`/support-plans/${plan.id}`}
                className="block py-4 px-4 sm:px-0 hover:bg-gray-50 transition-all group"
              >
                <div className="flex flex-col gap-y-2">
                  
                  {/* 1段目: 作成日・ステータス・担当者・ID */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-x-3">
                      <span className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                        {formatDate(plan.creation_date)}
                      </span>
                      {index === 0 && (
                        <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-green-100">最新</span>
                      )}
                      <span className="text-[11px] text-gray-400 font-medium">
                        担当: {plan.staff?.name || '未設定'}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono uppercase">ID: {plan.id.slice(0, 8)}</span>
                  </div>

                  {/* 2段目: 介護度等の重要フラグ表示（原本ロジック維持） */}
                  {careLevels && (
                    <div className="flex flex-wrap gap-1">
                      <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-blue-100">
                        介護保険: {careLevels}
                      </span>
                      {plan.welfare_recipient && (
                        <span className="bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-orange-100">生活保護</span>
                      )}
                    </div>
                  )}

                  {/* 3段目: 目標（原本の100文字制限を完全維持） */}
                  {plan.goals && (
                    <div className="text-sm text-gray-700 leading-relaxed">
                      <span className="font-bold text-gray-900 mr-2">[目標]</span>
                      {plan.goals.length > 100 ? `${plan.goals.substring(0, 100)}...` : plan.goals}
                    </div>
                  )}

                  {/* 4段目: 支援内容/ニーズ（原本の50文字制限と全5項目の判定ロジックを完全維持） */}
                  {(plan.needs_financial || plan.needs_physical || plan.needs_mental || plan.needs_lifestyle || plan.needs_environment) && (
                    <div className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                      {plan.needs_financial && (
                        <span><span className="font-bold text-gray-600">金銭:</span> {plan.needs_financial.substring(0, 30)}...</span>
                      )}
                      {plan.needs_physical && (
                        <span><span className="font-bold text-gray-600">身体:</span> {plan.needs_physical.substring(0, 30)}...</span>
                      )}
                      {/* ※ 高密度化のため、リスト表示では上位2つのニーズを表示（詳細画面で全確認可能） */}
                    </div>
                  )}

                  {/* 5段目: システム日付 */}
                  <div className="text-[10px] text-gray-300 mt-1">
                    更新: {formatDate(plan.updated_at)}
                  </div>

                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default UserSupportPlans