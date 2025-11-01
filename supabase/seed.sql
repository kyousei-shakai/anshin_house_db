--
-- supabase/seed.sql (決定版 v4)
--
-- 目的: 開発用の初期データを、毎回まっさらな状態から投入する。
--

-- =================================================================
-- ★★★ 根本解決のためのコマンド ★★★
-- seedを実行する前に、関連テーブルのデータを全て削除し、まっさらな状態にする。
-- このコメントアウトを外して有効化することを推奨します。
-- =================================================================
TRUNCATE
    public.staff,
    public.users,
    public.consultations,
    public.support_plans,
    public.consultation_events
RESTART IDENTITY CASCADE;


-- =============================================
-- 1. マスターデータ: staff
-- =============================================
INSERT INTO public.staff (id, name, email, role)
VALUES
    ('8b1b2f76-9c4b-4c54-8a0c-7b7e2b7e1f1a', '三輪千加映', 'miwa@example.com', '相談員'),
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', '山田太郎', 'yamada@example.com', '管理者')
ON CONFLICT (name) DO NOTHING;


-- =============================================
-- 2. 利用者データ: users
-- =============================================
INSERT INTO public.users (id, uid, name, birth_date, gender, property_address, move_in_date)
VALUES
    ('a8b1c2d3-e4f5-a6b7-c8d9-e0f1a2b3c4d5', 'user-001', '鈴木一郎', '1960-04-15', 'male', '東京都新宿区西新宿2-8-1', '2023-05-10'),
    ('b9c2d3e4-f5a6-b7c8-d9e0-f1a2b3c4d5e6', 'user-002', '佐藤花子', '1955-11-20', 'female', '神奈川県横浜市中区日本大通1', '2022-08-01');


-- =============================================
-- 3. 相談記録データ: consultations
-- =============================================
INSERT INTO public.consultations (
    id, consultation_date, staff_id, user_id, name, gender,
    consultation_content, consultation_result, status
) VALUES (
    'c1d2e3f4-a5b6-c7d8-e9f0-a1b2c3d4e5f6', '2025-10-15',
    '8b1b2f76-9c4b-4c54-8a0c-7b7e2b7e1f1a', -- 三輪さんのID
    'a8b1c2d3-e4f5-a6b7-c8d9-e0f1a2b3c4d5', -- 鈴木さんのID
    '鈴木一郎', 'male', '今後の生活についての相談。', '支援計画の作成を提案。', '進行中'
);


-- =============================================
-- 4. 支援計画データ: support_plans
-- =============================================
INSERT INTO public.support_plans (
    id, user_id, creation_date, staff_id, name, furigana,
    birth_date, residence, goals
) VALUES (
    'd2e3f4a5-b6c7-d8e9-f0a1-b2c3d4e5f6a7',
    'b9c2d3e4-f5a6-b7c8-d9e0-f1a2b3c4d5e6', -- 佐藤さんのID
    '2025-10-20',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479', -- 山田さんのID
    '佐藤花子', 'サトウ ハナコ', '1955-11-20', '神奈川県横浜市中区日本大通1', '安心して日常生活を送れるようにする。'
);


-- =============================================
-- 5. 相談イベントデータ: consultation_events
-- =============================================
INSERT INTO public.consultation_events (
    id, consultation_id, staff_id, status, event_note
) VALUES (
    'e3f4a5b6-c7d8-e9f0-a1b2-c3d4e5f6a7b8',
    'c1d2e3f4-a5b6-c7d8-e9f0-a1b2c3d4e5f6', -- 鈴木さんの相談記録ID
    '8b1b2f76-9c4b-4c54-8a0c-7b7e2b7e1f1a', -- 三輪さんのID
    '進行中', '初回面談を実施。利用者様の状況をヒアリングした。'
);