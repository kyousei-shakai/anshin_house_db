-- users テーブルに緊急連絡先住所を追加
ALTER TABLE public.users 
ADD COLUMN emergency_contact_address TEXT;

-- 保守用コメントの追加
COMMENT ON COLUMN public.users.emergency_contact_address IS '緊急連絡先の住所（相談データから初回登録時にコピーされる）';