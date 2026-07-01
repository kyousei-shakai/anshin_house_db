-- ================================================================
-- 生活支援記録：完了処理ロジックの適正化 (2026/06/30)
-- 1. 実績日時(support_at)を「操作時(now)」から「予定日時(scheduled_at)」へ変更
-- 2. 副次カテゴリー(sub_categories)のコピー漏れを完全に解消（トラブルシューティング #12 への最終回答）
-- ================================================================

CREATE OR REPLACE FUNCTION public.complete_support_task(p_task_id uuid)
RETURNS void AS $$
DECLARE
    v_log_id uuid;
    t public.support_tasks%ROWTYPE;
BEGIN
    -- 1. status='open' 条件により、二重完了（二重送信）を物理的に阻止してステータス更新
    UPDATE public.support_tasks 
    SET status = 'completed'
    WHERE id = p_task_id AND status = 'open'
    RETURNING * INTO t;
    
    -- 既に完了済み、または存在しない場合は、何もしない（冪等性の確保）
    IF NOT FOUND THEN RETURN; END IF;

    -- 2. 支援実績(daily_support_logs)を作成
    -- 修正点: support_at に t.scheduled_at（その予定が本来行われるはずだった日時）を注入
    INSERT INTO public.daily_support_logs (
        organization_id, 
        user_id, 
        performed_by_staff_id, 
        support_at, 
        category_id, 
        category_name_snapshot, 
        content
    )
    VALUES (
        t.organization_id, 
        t.user_id, 
        t.assigned_staff_id, 
        t.scheduled_at, -- ★ここを now() から予定日時に変更
        t.category_id, 
        t.category_name_snapshot, 
        '【予定完了】' || t.content
    )
    RETURNING id INTO v_log_id;

    -- 3. ★重要：中間テーブル（副次カテゴリー）の物理コピー
    -- 予定(task_sub)に紐付いていた情報を、今作成した実績(log_sub)へ一括転送
    INSERT INTO public.daily_support_log_sub_categories (log_id, category_id, category_name_snapshot)
    SELECT v_log_id, category_id, category_name_snapshot
    FROM public.support_task_sub_categories
    WHERE task_id = p_task_id;

END;
$$ LANGUAGE plpgsql;