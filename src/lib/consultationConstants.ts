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

export const STATUS_FILTERS = [
  'すべて表示',
  ...CONSULTATION_STATUSES,
  '利用者登録済み',
];

export type StatusFilter = typeof STATUS_FILTERS[number] | null;

// ▼▼▼ ステータスの色定義を、よりコントラストの高い配色に修正 ▼▼▼
export const STATUS_COLORS: { [key in ConsultationStatus | '利用者登録済み']: string } = {
  // --- アクティブなプロセス ---
  '進行中':           'bg-blue-100 text-blue-800 ring-blue-700/20',
  '初回面談':         'bg-cyan-100 text-cyan-800 ring-cyan-700/20',
  '支援検討中':       'bg-indigo-100 text-indigo-800 ring-indigo-700/20',
  
  // --- ユーザーのアクションが重要なプロセス ---
  '物件探し中':       'bg-yellow-100 text-yellow-800 ring-yellow-700/20',
  '申込・審査中':     'bg-orange-100 text-orange-800 ring-orange-700/20',
  
  // --- 長期的なプロセス ---
  '入居後フォロー中': 'bg-lime-100 text-lime-800 ring-lime-700/20',

  // --- 完了・非アクティブなプロセス ---
  '支援終了':         'bg-gray-200 text-gray-800 ring-gray-700/10',
  '対象外・辞退':     'bg-pink-100 text-pink-800 ring-pink-700/10',
  
  // --- 特別な完了ステータス ---
  '利用者登録済み':   'bg-green-100 text-green-800 ring-green-700/20',
};
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲