-- 利用者データ連携における「フリガナ」不整合の解消のため実行
-- 事実: consultations と support_plans テーブルには furigana カラムが存在するが、users テーブルには物理的にカラムが存在していない。

-- 1. usersテーブルにフリガナカラムを安全に追加
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS furigana text;

-- 2. 既存の相談データがある場合、可能な限り利用者にフリガナを同期（バックフィル）
UPDATE public.users u
SET furigana = c.furigana
FROM public.consultations c
WHERE c.user_id = u.id 
  AND u.furigana IS NULL 
  AND c.furigana IS NOT NULL;