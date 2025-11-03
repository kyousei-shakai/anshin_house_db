// src/lib/dateUtils.ts

/**
 * NOTE:
 * date-fnsライブラリは、日付操作をより安全かつ簡単に行うための優れたツールです。
 * ターミナルで `npm install date-fns` または `yarn add date-fns` を実行してプロジェクトに追加してください。
 */
import { differenceInCalendarDays } from 'date-fns'

/**
 * ターゲット日と今日の差を日数で返します。
 * @param dateString - 'YYYY-MM-DD' 形式の日付文字列
 * @returns 今日からの日数 (未来は正、過去は負、今日なら0)
 */
export const getDaysUntil = (dateString: string | null): number | null => {
  if (!dateString) return null
  try {
    const targetDate = new Date(dateString)
    const today = new Date()
    // タイムゾーンの問題を避けるため、時刻部分をリセット
    today.setHours(0, 0, 0, 0)
    targetDate.setHours(0, 0, 0, 0)
    return differenceInCalendarDays(targetDate, today)
  } catch (e) {
    console.error('Invalid date string for getDaysUntil:', dateString)
    return null
  }
}

/**
 * 日付が過去かどうかで、統一されたTailwind CSSのクラス文字列を返します。
 * @param days - 日数
 * @returns badge用のTailwind CSSクラス
 */
export const getNextActionBadgeStyle = (days: number | null): string => {
  if (days === null) return ''

  // 期限超過の場合
  if (days < 0) {
    return 'bg-gray-100 text-gray-700 ring-gray-600/20'
  }
  
  // 未来または今日の予定の場合（アポイントメント・パープル）
  return 'bg-rose-100 text-rose-700 ring-rose-600/20'
}