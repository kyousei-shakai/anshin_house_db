-- Add text detail columns for specific consultation routes to the consultations table.
-- These columns will store additional information when a corresponding route checkbox is checked.
-- They are nullable as they will only contain data when the route is selected.
--
-- 特定の相談ルートに関する詳細テキストを保存するため、consultationsテーブルに新しいカラムを追加します。
-- これらのカラムは、対応するチェックボックスがオンになった際の追加情報を格納するために使用されます。
-- ルートが選択された場合にのみデータが入力されるため、NULL値を許容します。

ALTER TABLE public.consultations
ADD COLUMN consultation_route_family_text TEXT,
ADD COLUMN consultation_route_care_manager_text TEXT,
ADD COLUMN consultation_route_elderly_center_text TEXT,
ADD COLUMN consultation_route_disability_center_text TEXT;

-- Enable Row Level Security on the consultations table if it's not already enabled.
-- This ensures that the new columns are also protected by RLS policies.
-- The alter policy command will apply existing policies to these new columns.
--
-- consultationsテーブルでRLS(行単位セキュリティ)が有効でない場合に有効化します。
-- これにより、新しく追加されたカラムも既存のRLSポリシーによって保護されることが保証されます。
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Note: No new policies are needed at this time.
-- The existing policies for SELECT, INSERT, UPDATE on the 'consultations' table
-- will automatically apply to these new columns.
--
-- 注: この時点では、新しいポリシーを追加する必要はありません。
-- 'consultations'テーブルに対する既存のSELECT, INSERT, UPDATEポリシーが、
-- これらの新しいカラムにも自動的に適用されます。