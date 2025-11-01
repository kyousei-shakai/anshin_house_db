-- ========== RLSポリシーの最終形 ==========

-- Step 1: 既存のポリシーを全てクリーンアップする
-- (テーブルごとに存在する可能性のある古いポリシーを全て削除)
DROP POLICY IF EXISTS "Enable all operations for all users" ON public.consultations;
DROP POLICY IF EXISTS "ログイン済みユーザーに全ての操作を許可" ON public.consultations;
DROP POLICY IF EXISTS "Enable all operations for all users" ON public.support_plans;
DROP POLICY IF EXISTS "Enable all operations for all users" ON public.users;
DROP POLICY IF EXISTS "Enable all operations for all users" ON public.staff;
-- (これまでに作成した他の名前のポリシーも念のため削除)
DROP POLICY IF EXISTS "Allow service-role to perform all actions on consultations" ON public.consultations;
DROP POLICY IF EXISTS "Allow service-role to insert into consultations" ON public.consultations;
DROP POLICY IF EXISTS "Allow service-role to perform all actions on events" ON public.consultation_events;


-- Step 2: 全ての主要テーブルに、統一された「service_role」ポリシーを再作成する
-- これにより、アプリケーションサーバーからのアクセスのみが許可される
CREATE POLICY "Allow ALL for service_role" ON public.consultations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL for service_role" ON public.consultation_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL for service_role" ON public.users FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL for service_role" ON public.support_plans FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow ALL for service_role" ON public.staff FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Step 3: 新規テーブル'consultation_events'のRLSを有効化する
-- (他のテーブルは初期マイグレーションで有効化済みのため、これだけで良い)
ALTER TABLE public.consultation_events ENABLE ROW LEVEL SECURITY;