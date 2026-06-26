-- ================================================================
-- スタッフ管理機能：物理スキーマ拡張 & 全方位参照整合性強化 (2026/06/26)
-- ================================================================
-- 1. スタッフテーブルの拡張
ALTER TABLE public.staff 
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

COMMENT ON COLUMN public.staff.is_active IS '有効フラグ：退職者はfalseにする（論理削除）';
COMMENT ON COLUMN public.staff.display_order IS '表示順：数値が小さいほど上位に表示';

-- 2. 全関連テーブルのFK制約をRESTRICTに一掃・再定義
DO $$ 
DECLARE
    target_tables text[][] := ARRAY[
        ['consultations', 'staff_id'],
        ['consultation_events', 'staff_id'],
        ['support_plans', 'staff_id'],
        ['daily_support_logs', 'performed_by_staff_id'],
        ['support_tasks', 'assigned_staff_id']
    ];
    t_name text; c_name text; v_constraint_name text;
BEGIN
    FOR i IN 1 .. array_length(target_tables, 1) LOOP
        t_name := target_tables[i][1]; c_name := target_tables[i][2];
        FOR v_constraint_name IN (
            SELECT tc.constraint_name FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = t_name AND kcu.column_name = c_name
        ) LOOP
            EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', t_name, v_constraint_name);
        END LOOP;
        EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES public.staff(id) ON DELETE RESTRICT', t_name, t_name || '_' || c_name || '_fkey_strict', c_name);
    END LOOP;
END $$;