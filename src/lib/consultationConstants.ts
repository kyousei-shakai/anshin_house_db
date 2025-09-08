// src/lib/consultationConstants.ts

export const CONSULTATION_STATUSES = [
  '進行中',
  '初回面談',
  '支援検討中',
  '物件探し中',
  '申込・審査中',
  '入居後フォロー中',
  '支援終了',
  '対象外・辞退',
] as const;

export type ConsultationStatus = typeof CONSULTATION_STATUSES[number];

// ▼▼▼ 'アクティブ'を削除し、'すべて表示'を先頭に移動 ▼▼▼
export const STATUS_FILTERS = [
  'すべて表示',
  ...CONSULTATION_STATUSES,
  '利用者登録済み',
];
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

// ▼▼▼ null（どのフィルターも選択されていない状態）を許容する型に変更 ▼▼▼
export type StatusFilter = typeof STATUS_FILTERS[number] | null;

// ステータスの色定義（Tailwind CSSのクラス名）
export const STATUS_COLORS: { [key in ConsultationStatus | '利用者登録済み']: string } = {
  '進行中': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  '初回面談': 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  '支援検討中': 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  '物件探し中': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  '申込・審査中': 'bg-orange-50 text-orange-700 ring-orange-600/20',
  '入居後フォロー中': 'bg-lime-50 text-lime-700 ring-lime-600/20',
  '支援終了': 'bg-gray-50 text-gray-600 ring-gray-500/10',
  '対象外・辞退': 'bg-pink-50 text-pink-700 ring-pink-600/10',
  '利用者登録済み': 'bg-green-50 text-green-700 ring-green-600/10',
};