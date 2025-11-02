CREATE TABLE "public"."consultation_events" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "consultation_id" uuid NOT NULL,
    "staff_id" uuid,
    "status" public.consultation_status NOT NULL,
    "event_note" text,
    "next_action_date" date,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT "consultation_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "consultation_events_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE CASCADE,
    CONSTRAINT "consultation_events_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE SET NULL
);

-- パフォーマンス向上のためのインデックス設定
CREATE INDEX "idx_consultation_events_consultation_id" ON "public"."consultation_events" USING btree ("consultation_id");
CREATE INDEX "idx_consultation_events_created_at" ON "public"."consultation_events" USING btree ("created_at" DESC);