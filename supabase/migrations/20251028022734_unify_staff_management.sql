-- supabase/migrations/YYYYMMDDHHMMSS_unify_staff_management.sql

-- =============================================================
-- スタッフ管理の統一化マイグレーション (決定版)
-- 目的: スキーマ変更と、それに伴う既存データの移行
-- =============================================================

-- ステップ1: staff.name カラムに UNIQUE 制約を追加
ALTER TABLE public.staff
ADD CONSTRAINT staff_name_unique UNIQUE (name);


-- ステップ2: データ移行に必要なスタッフ '三輪千加映' が存在することを保証する
-- (このマイグレーションが本番環境で実行される際、既存データ移行に必須)
INSERT INTO public.staff (name, email, role)
VALUES ('三輪千加映', 'miwa@example.com', '相談員')
ON CONFLICT (name) DO NOTHING;


-- ステップ3: support_plans テーブルに staff_id カラムを追加
ALTER TABLE public.support_plans
ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL;


-- ステップ4: 既存の consultations テーブルのデータを移行
UPDATE public.consultations
SET staff_id = (
    SELECT id FROM public.staff WHERE name = '三輪千加映' LIMIT 1
)
WHERE
    staff_name = '三輪千加映' AND staff_id IS NULL;


-- ステップ5: 既存の support_plans テーブルのデータを移行
UPDATE public.support_plans
SET staff_id = (
    SELECT id FROM public.staff WHERE name = '三輪千加映' LIMIT 1
)
WHERE
    staff_name = '三輪千加映' AND staff_id IS NULL;


-- ステップ6: 不要になった古い staff_name カラムを削除
ALTER TABLE public.consultations
DROP COLUMN IF EXISTS staff_name;

ALTER TABLE public.support_plans
DROP COLUMN IF EXISTS staff_name;


-- ステップ7: パフォーマンス向上のためのインデックスを作成
CREATE INDEX IF NOT EXISTS idx_consultations_staff_id ON public.consultations(staff_id);
CREATE INDEX IF NOT EXISTS idx_support_plans_staff_id ON public.support_plans(staff_id);