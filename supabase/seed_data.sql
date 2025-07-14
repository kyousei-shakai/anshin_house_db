-- サンプルスタッフデータ
INSERT INTO staff (name, email, role) VALUES 
('田中 太郎', 'tanaka@example.com', '相談員'),
('佐藤 花子', 'sato@example.com', '支援員'),
('山田 次郎', 'yamada@example.com', '管理者');

-- サンプル利用者データ
INSERT INTO users (uid, name, furigana, birth_date, gender, postal_code, address, phone_mobile) VALUES 
('2024-0001', '鈴木 一郎', 'スズキ イチロウ', '1960-04-15', 'male', '123-4567', '東京都新宿区1-1-1', '090-1234-5678'),
('2024-0002', '田中 美子', 'タナカ ヨシコ', '1955-08-22', 'female', '567-8901', '東京都渋谷区2-2-2', '080-9876-5432'),
('2024-0003', '佐藤 健', 'サトウ ケン', '1970-12-03', 'male', '345-6789', '東京都港区3-3-3', '070-1111-2222');

-- サンプル相談データ
INSERT INTO consultations (
    consultation_date, 
    consultation_route, 
    attributes, 
    name, 
    furigana, 
    gender, 
    age,
    consultation_content,
    consultation_result,
    user_id
) VALUES 
(
    '2024-01-15',
    ARRAY['本人'],
    ARRAY['高齢', '生活困窮'],
    '鈴木 一郎',
    'スズキ イチロウ',
    'male',
    64,
    '家賃の支払いが困難になっており、住居確保の相談をしたい。',
    '住宅確保給付金の申請手続きを支援することとした。',
    (SELECT id FROM users WHERE uid = '2024-0001')
),
(
    '2024-01-20',
    ARRAY['家族'],
    ARRAY['高齢', '障がい'],
    '田中 美子',
    'タナカ ヨシコ',
    'female',
    69,
    '母親の認知症が進行し、一人暮らしが困難になってきた。',
    'ケアマネージャーと連携し、適切な住環境を検討することとした。',
    (SELECT id FROM users WHERE uid = '2024-0002')
);

-- サンプル支援計画データ
INSERT INTO support_plans (
    user_id,
    creation_date,
    staff_name,
    name,
    furigana,
    birth_date,
    age,
    residence,
    welfare_recipient,
    goals,
    contact_info
) VALUES 
(
    (SELECT id FROM users WHERE uid = '2024-0001'),
    '2024-01-16',
    '田中 太郎',
    '鈴木 一郎',
    'スズキ イチロウ',
    '1960-04-15',
    64,
    '東京都新宿区1-1-1',
    false,
    '安定した住居の確保と自立した生活の維持',
    '{"mobile_phone": "090-1234-5678", "line": true}'::jsonb
);