-- 1. Create user_status enum type
-- 利用者の状態を管理するENUM型を作成
CREATE TYPE user_status AS ENUM ('利用中', '逝去', '解約');

-- 2. Add columns to users table
-- usersテーブルにステータスと終了日のカラムを追加
ALTER TABLE "public"."users"
ADD COLUMN "status" user_status NOT NULL DEFAULT '利用中',
ADD COLUMN "end_date" date;

-- 3. Add comment for clarity
COMMENT ON COLUMN "public"."users"."status" IS '利用者の現在の状態 (利用中/逝去/解約)';
COMMENT ON COLUMN "public"."users"."end_date" IS '利用終了日または逝去日';