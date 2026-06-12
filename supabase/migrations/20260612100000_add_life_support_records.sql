-- ================================================================
-- 生活支援記録・管理・ダッシュボード (Phase 1-3 統合)
-- 特徴: 原子性担保、冪等性確保、パフォーマンス索引、SSOT対応
-- ================================================================

-- 1. 基本テーブル定義
CREATE TABLE IF NOT EXISTS public.support_categories (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid,
    name text NOT NULL,
    description text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT support_categories_pkey PRIMARY KEY (id),
    CONSTRAINT support_categories_org_name_unique UNIQUE (organization_id, name)
);
ALTER TABLE public.support_categories ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.daily_support_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid,
    user_id uuid NOT NULL,
    performed_by_staff_id uuid NOT NULL,
    support_at timestamptz NOT NULL,
    category_id uuid NOT NULL,
    category_name_snapshot text NOT NULL,
    content text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT daily_support_logs_pkey PRIMARY KEY (id),
    CONSTRAINT daily_support_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT,
    CONSTRAINT daily_support_logs_staff_id_fkey FOREIGN KEY (performed_by_staff_id) REFERENCES public.staff(id) ON DELETE RESTRICT,
    CONSTRAINT daily_support_logs_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.support_categories(id) ON DELETE RESTRICT
);
ALTER TABLE public.daily_support_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.support_tasks (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    organization_id uuid,
    user_id uuid NOT NULL,
    assigned_staff_id uuid NOT NULL,
    scheduled_at timestamptz NOT NULL,
    category_id uuid NOT NULL,
    category_name_snapshot text NOT NULL,
    content text NOT NULL,
    status text NOT NULL,
    completed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT support_tasks_pkey PRIMARY KEY (id),
    CONSTRAINT support_tasks_status_check CHECK (status IN ('open', 'completed', 'cancelled')),
    CONSTRAINT support_tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT,
    CONSTRAINT support_tasks_staff_id_fkey FOREIGN KEY (assigned_staff_id) REFERENCES public.staff(id) ON DELETE RESTRICT,
    CONSTRAINT support_tasks_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.support_categories(id) ON DELETE RESTRICT
);
ALTER TABLE public.support_tasks ENABLE ROW LEVEL SECURITY;

-- 2. パフォーマンス最適化（C-2 対策）
CREATE INDEX IF NOT EXISTS idx_daily_support_logs_user_at ON public.daily_support_logs (user_id, support_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_support_logs_support_at ON public.daily_support_logs (support_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tasks_open_scheduled ON public.support_tasks (scheduled_at ASC) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_support_categories_is_active ON public.support_categories (is_active);

-- 3. RLS ポリシー (service_role)
CREATE POLICY "Allow ALL for service_role" ON public.support_categories FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL for service_role" ON public.daily_support_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL for service_role" ON public.support_tasks FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. 業務ルール自動化 (completed_at)
CREATE OR REPLACE FUNCTION public.set_task_completed_at() RETURNS trigger AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN NEW.completed_at = now(); END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_set_task_completed_at BEFORE UPDATE ON public.support_tasks FOR EACH ROW EXECUTE FUNCTION public.set_task_completed_at();

-- 5. 【致命的 C-1 & 罠B 対策】完了処理の原子化 RPC
-- クライアント引数に頼らず、DB内の行データから実績を生成する防弾設計
CREATE OR REPLACE FUNCTION public.complete_support_task(p_task_id uuid)
RETURNS void AS $$
DECLARE
    t public.support_tasks%ROWTYPE;
BEGIN
    -- status='open' 条件により二重完了（二重送信）を物理的に阻止
    UPDATE public.support_tasks 
    SET status = 'completed'
    WHERE id = p_task_id AND status = 'open'
    RETURNING * INTO t;
    
    IF NOT FOUND THEN RETURN; END IF; -- 既に完了済みなら静かに終了（冪等性）

    INSERT INTO public.daily_support_logs (
        organization_id, user_id, performed_by_staff_id, support_at, 
        category_id, category_name_snapshot, content
    )
    VALUES (
        t.organization_id, t.user_id, t.assigned_staff_id, now(), 
        t.category_id, t.category_name_snapshot, '【予定完了】' || t.content
    );
END;
$$ LANGUAGE plpgsql;

-- 6. 窓口①：【監視用】利用者ケア状況 (SSOT)
CREATE OR REPLACE FUNCTION public.get_user_care_dashboard()
RETURNS TABLE (
    user_id uuid, user_name text, user_uid text, last_support_at timestamptz, elapsed_days integer, last_category_name text, last_staff_name text, next_scheduled_at timestamptz, next_category_name text, next_task_content text, next_staff_name text, is_overdue boolean, is_neglected boolean, has_no_log boolean
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id, u.name, u.uid, latest_log.support_at,
        CASE WHEN latest_log.support_at IS NOT NULL THEN (CURRENT_DATE - latest_log.support_at::date)::integer ELSE NULL END,
        latest_log.category_name, latest_log.staff_name, next_task.scheduled_at, next_task.category_name, next_task.content, next_task.staff_name,
        CASE WHEN next_task.scheduled_at IS NOT NULL AND next_task.scheduled_at < now() THEN true ELSE false END,
        CASE WHEN latest_log.support_at IS NOT NULL AND (CURRENT_DATE - latest_log.support_at::date) >= 90 THEN true ELSE false END,
        CASE WHEN latest_log.support_at IS NULL THEN true ELSE false END
    FROM public.users u
    LEFT JOIN LATERAL (
        SELECT l.support_at, l.category_name_snapshot AS category_name, s.name AS staff_name FROM public.daily_support_logs l
        LEFT JOIN public.staff s ON l.performed_by_staff_id = s.id WHERE l.user_id = u.id ORDER BY l.support_at DESC LIMIT 1
    ) AS latest_log ON true
    LEFT JOIN LATERAL (
        SELECT t.scheduled_at, t.category_name_snapshot AS category_name, t.content, s.name AS staff_name FROM public.support_tasks t
        LEFT JOIN public.staff s ON t.assigned_staff_id = s.id WHERE t.user_id = u.id AND t.status = 'open' ORDER BY t.scheduled_at ASC LIMIT 1
    ) AS next_task ON true
    WHERE u.status = '利用中'
    ORDER BY CASE WHEN next_task.scheduled_at IS NOT NULL AND next_task.scheduled_at < now() THEN 1 ELSE 0 END DESC, CASE WHEN latest_log.support_at IS NOT NULL AND (CURRENT_DATE - latest_log.support_at::date) >= 90 THEN 1 ELSE 0 END DESC, u.name ASC;
END;
$$;

-- 7. 窓口②：【実行用】全スケジュール視点 (SSOT・型不整合 W-2 対策版)
CREATE OR REPLACE FUNCTION public.get_all_upcoming_tasks(p_limit integer DEFAULT 100, p_offset integer DEFAULT 0)
RETURNS TABLE (
    task_id uuid, user_id uuid, user_name text, user_uid text, scheduled_at timestamptz, category_name text, content text, staff_name text, is_overdue boolean, elapsed_days integer, has_no_log boolean
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id, u.id, u.name, u.uid, t.scheduled_at, t.category_name_snapshot, t.content, s.name, (t.scheduled_at < now()),
        (SELECT (CURRENT_DATE - MAX(l.support_at)::date)::integer FROM public.daily_support_logs l WHERE l.user_id = u.id),
        NOT EXISTS (SELECT 1 FROM public.daily_support_logs l WHERE l.user_id = u.id)
    FROM public.support_tasks t JOIN public.users u ON t.user_id = u.id LEFT JOIN public.staff s ON t.assigned_staff_id = s.id
    WHERE t.status = 'open' ORDER BY t.scheduled_at ASC LIMIT p_limit OFFSET p_offset;
END;
$$;

-- 8. 窓口③：【文脈用】特定の利用者の直近履歴 (60日)
CREATE OR REPLACE FUNCTION public.get_user_recent_history(p_user_id uuid)
RETURNS TABLE (log_id uuid, support_at timestamptz, category_name text, content text, staff_name text) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT l.id, l.support_at, l.category_name_snapshot, l.content, s.name
    FROM public.daily_support_logs l LEFT JOIN public.staff s ON l.performed_by_staff_id = s.id
    WHERE l.user_id = p_user_id AND l.support_at >= (now() - interval '60 days')
    ORDER BY l.support_at DESC LIMIT 100;
END;
$$;

-- 9. 窓口④：【活動証明】チーム全体の直近履歴 (60日)
CREATE OR REPLACE FUNCTION public.get_team_recent_history(p_limit integer DEFAULT 100)
RETURNS TABLE (log_id uuid, user_id uuid, user_name text, user_uid text, support_at timestamptz, category_name text, content text, staff_name text) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT l.id, u.id, u.name, u.uid, l.support_at, l.category_name_snapshot, l.content, s.name
    FROM public.daily_support_logs l JOIN public.users u ON l.user_id = u.id LEFT JOIN public.staff s ON l.performed_by_staff_id = s.id
    WHERE l.support_at >= (now() - interval '60 days') ORDER BY l.support_at DESC LIMIT p_limit;
END;
$$;

-- 10. 保存用 RPC (W-3 対策版)
CREATE OR REPLACE FUNCTION public.save_support_log_with_task(
    p_user_id uuid, p_performed_by_staff_id uuid, p_support_date timestamptz, p_log_category_id uuid, p_content text, p_organization_id uuid DEFAULT NULL,
    p_task_assigned_staff_id uuid DEFAULT NULL, p_task_scheduled_at timestamptz DEFAULT NULL, p_task_category_id uuid DEFAULT NULL, p_task_content text DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE v_log_id uuid; v_task_id uuid; v_log_category_name text; v_task_category_name text; v_task_provided boolean;
BEGIN
    v_task_provided := (p_task_assigned_staff_id IS NOT NULL AND p_task_scheduled_at IS NOT NULL AND p_task_category_id IS NOT NULL AND p_task_content IS NOT NULL);
    
    -- W-3対策：is_active条件を除去しつつ存在確認は維持
    SELECT name INTO v_log_category_name FROM public.support_categories WHERE id = p_log_category_id;
    IF v_log_category_name IS NULL THEN RAISE EXCEPTION 'カテゴリが存在しません。'; END IF;
    
    INSERT INTO public.daily_support_logs (organization_id, user_id, performed_by_staff_id, support_at, category_id, category_name_snapshot, content)
    VALUES (p_organization_id, p_user_id, p_performed_by_staff_id, p_support_date, p_log_category_id, v_log_category_name, p_content) RETURNING id INTO v_log_id;
    
    IF v_task_provided THEN
        SELECT name INTO v_task_category_name FROM public.support_categories WHERE id = p_task_category_id;
        IF v_task_category_name IS NULL THEN RAISE EXCEPTION '予定カテゴリが存在しません。'; END IF;
        INSERT INTO public.support_tasks (organization_id, user_id, assigned_staff_id, scheduled_at, category_id, category_name_snapshot, content, status)
        VALUES (p_organization_id, p_user_id, p_task_assigned_staff_id, p_task_scheduled_at, p_task_category_id, v_task_category_name, p_task_content, 'open') RETURNING id INTO v_task_id;
    END IF;
    RETURN jsonb_build_object('log_id', v_log_id, 'task_id', v_task_id);
END;
$$ LANGUAGE plpgsql;