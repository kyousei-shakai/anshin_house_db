-- マイグレーション: consultation_eventsテーブルにステータス遷移カラムを追加
-- 作成日: 2025年11月1日
-- 目的: 相談イベントのステータス変更履歴と次回アクション詳細を記録

ALTER TABLE "public"."consultation_events"
ADD COLUMN IF NOT EXISTS "status_from" text,
ADD COLUMN IF NOT EXISTS "status_to" text,
ADD COLUMN IF NOT EXISTS "next_action_memo" text;

-- カラムの説明:
-- status_from: 遷移前のステータス（例: "初回面談"）
-- status_to: 遷移後のステータス（例: "支援検討中"）
-- next_action_memo: 次回アクション内容の詳細メモ
