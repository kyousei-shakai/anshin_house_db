-- consultationsテーブルのUPDATEを全員に許可する暫定ポリシー
CREATE POLICY "Allow anyone to update consultations TEMPORARY"
ON public.consultations
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);