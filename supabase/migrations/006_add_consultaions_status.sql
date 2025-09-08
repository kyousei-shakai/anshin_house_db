ALTER TABLE public.consultations ADD COLUMN status text DEFAULT '進行中';
ALTER TABLE public.consultations ALTER COLUMN status SET NOT NULL;