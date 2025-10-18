-- 相談記録(consultations)テーブルに新しいカラムを追加する
-- 既存のデータは保持されたまま、新しい空のカラムが追加されます。

ALTER TABLE public.consultations
  
  -- 「他市区町村への転居」セクション用のカラム
  ADD COLUMN is_relocation_to_other_city_desired boolean,
  ADD COLUMN relocation_admin_opinion text,
  ADD COLUMN relocation_admin_opinion_details text,
  ADD COLUMN relocation_cost_bearer text,
  ADD COLUMN relocation_cost_bearer_details text,
  ADD COLUMN relocation_notes text,
  
  -- 「現在の住まい」セクション用のカラム
  ADD COLUMN rent_arrears_status text,
  ADD COLUMN rent_arrears_duration text,
  ADD COLUMN rent_arrears_details text,
  ADD COLUMN pet_status text,
  ADD COLUMN pet_details text,
  
  -- 「車両」用のカラム (チェックボックスは各々booleanで管理)
  ADD COLUMN vehicle_car boolean NOT NULL DEFAULT false,
  ADD COLUMN vehicle_motorcycle boolean NOT NULL DEFAULT false,
  ADD COLUMN vehicle_bicycle boolean NOT NULL DEFAULT false,
  ADD COLUMN vehicle_none boolean NOT NULL DEFAULT false, -- 「なし」も選択肢の一つとして追加
  
  -- 「現在の住まい」の続き
  ADD COLUMN current_floor_plan text,
  ADD COLUMN current_rent integer,
  ADD COLUMN eviction_date date,
  ADD COLUMN eviction_date_notes text;