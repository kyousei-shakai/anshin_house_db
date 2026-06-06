-- 1. スタッフの登録（外部キー制約のため）
INSERT INTO public.staff (id, name, email)
VALUES ('00000000-0000-4000-a000-000000000001', 'テスト担当者A', 'test@example.com')
ON CONFLICT (id) DO NOTHING;

-- 2. 相談データの挿入（検索・期間テスト用）
INSERT INTO public.consultations (
    id, 
    consultation_date, 
    name, 
    furigana, 
    phone_mobile, 
    address, 
    consultation_content, 
    status, 
    staff_id,
    age_group
) VALUES 
-- A. 最近のデータ（田中さん：検索キーワード「田中」または「090」）
(
    gen_random_uuid(), 
    CURRENT_DATE, 
    '田中 太郎', 
    'タナカ タロウ', 
    '090-1111-2222', 
    '東京都新宿区西新宿1-1-1', 
    '新規の居住支援相談。家賃補助について。', 
    '進行中', 
    '00000000-0000-4000-a000-000000000001',
    '70代'
),
-- B. 1年以上前の古いデータ（鈴木さん：今までヒットしなかった可能性がある期間）
-- キーワード「鈴木」または「横浜」
(
    gen_random_uuid(), 
    '2023-01-15', 
    '鈴木 一郎', 
    'スズキ イチロウ', 
    '080-3333-4444', 
    '神奈川県横浜市中区山下町', 
    '以前の相談記録。更新手続きの確認。', 
    '支援終了', 
    '00000000-0000-4000-a000-000000000001',
    '80代以上'
),
-- C. 半年前のデータ（佐藤さん：キーワード「佐藤」または「アパート」）
(
    gen_random_uuid(), 
    CURRENT_DATE - INTERVAL '6 months', 
    '佐藤 花子', 
    'サトウ ハナコ', 
    '070-5555-6666', 
    '埼玉県さいたま市大宮区', 
    'アパートの退去に伴う相談。', 
    '支援検討中', 
    '00000000-0000-4000-a000-000000000001',
    '60代'
);

-- 3. 相談イベント（次回アクション）の紐付け
-- これにより、一覧画面にカレンダーアイコンが表示されるか確認できます
INSERT INTO public.consultation_events (
    id,
    consultation_id,
    status,
    next_action_date,
    next_action_memo,
    event_note
)
SELECT 
    gen_random_uuid(),
    id,
    '進行中',
    CURRENT_DATE + INTERVAL '7 days',
    '次回の面談予定（テスト）',
    'イベントの記録（テスト）'
FROM public.consultations
WHERE name = '田中 太郎';