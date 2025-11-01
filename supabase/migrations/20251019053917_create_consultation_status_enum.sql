CREATE TYPE "public"."consultation_status" AS ENUM (
  '進行中',
  '初回面談',
  '支援検討中',
  '物件探し中',
  '申込・審査中',
  '入居後フォロー中',
  '支援終了',
  '対象外・辞退'
);