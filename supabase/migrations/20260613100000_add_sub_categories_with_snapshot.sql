-- ================================================================
-- 生活支援記録機能 拡張 (2026/06/13)
-- 追加内容: 副次カテゴリ（複数選択）用の中間テーブル（スナップショット対応版）
-- ================================================================

-- 1. 支援ログの副次カテゴリ中間テーブル
CREATE TABLE IF NOT EXISTS public.daily_support_log_sub_categories (
    log_id      uuid REFERENCES public.daily_support_logs(id) ON DELETE CASCADE,
    category_id uuid REFERENCES public.support_categories(id) ON DELETE RESTRICT,
    category_name_snapshot text NOT NULL, -- ★ 過去の名称を保護
    PRIMARY KEY (log_id, category_id)
);

-- 2. 支援予定の副次カテゴリ中間テーブル
CREATE TABLE IF NOT EXISTS public.support_task_sub_categories (
    task_id     uuid REFERENCES public.support_tasks(id) ON DELETE CASCADE,
    category_id uuid REFERENCES public.support_categories(id) ON DELETE RESTRICT,
    category_name_snapshot text NOT NULL, -- ★ 過去の名称を保護
    PRIMARY KEY (task_id, category_id)
);

-- RLS設定
ALTER TABLE public.daily_support_log_sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_task_sub_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow ALL for service_role" ON public.daily_support_log_sub_categories FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL for service_role" ON public.support_task_sub_categories FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. 保存用 RPC の高度化（スナップショット同期ロジック搭載）
CREATE OR REPLACE FUNCTION public.save_support_log_with_task(
    p_user_id                uuid,
    p_performed_by_staff_id  uuid,
    p_support_date           timestamptz,
    p_log_category_id        uuid,
    p_content                text,
    p_log_sub_category_ids   uuid[]      DEFAULT '{}',
    p_organization_id        uuid        DEFAULT NULL,
    p_task_assigned_staff_id uuid        DEFAULT NULL,
    p_task_scheduled_at      timestamptz DEFAULT NULL,
    p_task_category_id       uuid        DEFAULT NULL,
    p_task_content           text        DEFAULT NULL,
    p_task_sub_category_ids  uuid[]      DEFAULT '{}'
)
RETURNS jsonb AS $$
DECLARE
    v_log_id             uuid;
    v_task_id            uuid;
    v_log_category_name  text;
    v_task_category_name text;
    v_sub_id             uuid;
    v_sub_name           text;
BEGIN
    -- 1. ログ主カテゴリSnapshot取得
    SELECT name INTO v_log_category_name FROM public.support_categories WHERE id = p_log_category_id;
    IF v_log_category_name IS NULL THEN RAISE EXCEPTION '主カテゴリが存在しません。'; END IF;

    -- 2. 支援ログの保存
    INSERT INTO public.daily_support_logs (organization_id, user_id, performed_by_staff_id, support_at, category_id, category_name_snapshot, content)
    VALUES (p_organization_id, p_user_id, p_performed_by_staff_id, p_support_date, p_log_category_id, v_log_category_name, p_content)
    RETURNING id INTO v_log_id;

    -- 3. ログの副次カテゴリをSnapshot付きで保存
    FOREACH v_sub_id IN ARRAY p_log_sub_category_ids LOOP
        SELECT name INTO v_sub_name FROM public.support_categories WHERE id = v_sub_id;
        IF v_sub_name IS NOT NULL THEN
            INSERT INTO public.daily_support_log_sub_categories (log_id, category_id, category_name_snapshot) 
            VALUES (v_log_id, v_sub_id, v_sub_name);
        END IF;
    END LOOP;

    -- 4. 予定の保存（存在時のみ）
    IF p_task_assigned_staff_id IS NOT NULL AND p_task_scheduled_at IS NOT NULL AND p_task_category_id IS NOT NULL THEN
        SELECT name INTO v_task_category_name FROM public.support_categories WHERE id = p_task_category_id;
        INSERT INTO public.support_tasks (organization_id, user_id, assigned_staff_id, scheduled_at, category_id, category_name_snapshot, content, status)
        VALUES (p_organization_id, p_user_id, p_task_assigned_staff_id, p_task_scheduled_at, p_task_category_id, v_task_category_name, p_task_content, 'open')
        RETURNING id INTO v_task_id;

        -- 5. 予定の副次カテゴリをSnapshot付きで保存
        FOREACH v_sub_id IN ARRAY p_task_sub_category_ids LOOP
            SELECT name INTO v_sub_name FROM public.support_categories WHERE id = v_sub_id;
            IF v_sub_name IS NOT NULL THEN
                INSERT INTO public.support_task_sub_categories (task_id, category_id, category_name_snapshot) 
                VALUES (v_task_id, v_sub_id, v_sub_name);
            END IF;
        END LOOP;
    END IF;

    RETURN jsonb_build_object('log_id', v_log_id, 'task_id', v_task_id);
END;
$$ LANGUAGE plpgsql;