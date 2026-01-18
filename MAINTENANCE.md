# 居住支援管理マスター - 保守管理ドキュメント

最終更新: 2026年1月17日

---

## 目次

1. [システム概要](#システム概要)
2. [技術スタック](#技術スタック)
3. [環境構成](#環境構成)
4. [ディレクトリ構造](#ディレクトリ構造)
5. [データベース構造](#データベース構造)
6. [開発フロー](#開発フロー)
7. [デプロイフロー](#デプロイフロー)
8. [今回実施した作業（2026年1月17日）](#今回実施した作業2026年1月17日)
9. [トラブルシューティング](#トラブルシューティング)
10. [今後の注意事項](#今後の注意事項)

---

## システム概要

### プロジェクト名
**居住支援管理マスター（Anshin House DB）**

### 目的
住宅確保要配慮者への居住支援活動を管理するためのWebアプリケーション。相談履歴、支援計画、利用者情報を一元管理し、スタッフ間での情報共有と効率的な支援活動を実現する。

### 主要機能

1. **相談管理**
   - 相談記録の登録・編集・削除
   - 相談ステータスの管理（初回面談、支援検討中、物件探し中など）
   - 相談履歴の一覧表示とフィルタリング

2. **利用者管理**
   - 利用者基本情報の登録・編集
   - 身体状況、介護度、医療情報の管理
   - 居住情報（物件名、住所、家賃等）の記録
   - **【NEW】利用者ステータス管理（利用中/逝去/解約）**

3. **支援計画管理**
   - 個別支援計画の作成・編集
   - 支援目標、内容、期間の設定
   - 支援履歴の記録

4. **データ管理**
   - Excel/CSV形式でのエクスポート・インポート
   - 月次データの抽出
   - バックアップ機能

5. **ダッシュボード**
   - 統計情報の可視化
   - ステータス別の相談件数表示
   - 月次推移グラフ

---

## 技術スタック

### フロントエンド
- **Next.js**: 14.2.18 (App Router)
- **React**: 18.3.1
- **TypeScript**: ^5
- **Tailwind CSS**: ^3.4.1

### バックエンド/データベース
- **Supabase**: ローカル開発 + 本番環境
  - `@supabase/ssr`: 0.3.0
  - `@supabase/supabase-js`: 2.42.7
- **PostgreSQL**: Supabaseで管理

### UIライブラリ
- **Radix UI**: ダイアログ、セパレータ、シートコンポーネント
- **lucide-react**: アイコン
- **shadcn/ui**: UIコンポーネントベース

### その他ライブラリ
- **Chart.js / react-chartjs-2**: グラフ表示
- **XLSX / xlsx-populate**: Excel操作
- **date-fns**: 日付処理
- **zod**: バリデーション

---

## 環境構成

### 必要な環境変数

`.env.local`ファイルに以下を設定：

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 外部連携（オプション）
NEXT_PUBLIC_DAILY_LOG_APP_URL=https://your-daily-log-app-url
```

### ローカル開発環境

#### 前提条件
- Node.js 18.x以上
- pnpm (推奨) または npm
- Supabase CLI 2.51.0以上

#### セットアップ手順

1. **依存関係のインストール**
   ```bash
   pnpm install
   ```

2. **Supabaseローカル環境の起動**
   ```bash
   supabase start
   ```

3. **開発サーバーの起動**
   ```bash
   pnpm dev
   ```

4. **ブラウザでアクセス**
   ```
   http://localhost:3000
   ```

---

## ディレクトリ構造

```
anshin-house-db/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── actions/              # Server Actions
│   │   │   ├── consultations.ts  # 相談管理API
│   │   │   ├── users.ts          # 利用者管理API
│   │   │   ├── supportPlans.ts   # 支援計画API
│   │   │   ├── export.ts         # エクスポート処理
│   │   │   └── dashboard.ts      # ダッシュボードデータ
│   │   ├── consultations/        # 相談管理ページ
│   │   ├── users/                # 利用者管理ページ
│   │   ├── support-plans/        # 支援計画ページ
│   │   ├── data-management/      # データ管理ページ
│   │   ├── layout.tsx            # ルートレイアウト
│   │   ├── page.tsx              # ホームページ
│   │   └── globals.css           # グローバルCSS
│   ├── components/               # Reactコンポーネント
│   │   ├── Header.tsx            # ヘッダーメニュー
│   │   ├── Layout.tsx            # ページレイアウト
│   │   ├── ConsultationList.tsx  # 相談一覧
│   │   ├── ConsultationForm.tsx  # 相談フォーム
│   │   ├── UserEditForm.tsx      # 利用者編集フォーム
│   │   ├── SupportTimeline.tsx   # 支援タイムライン
│   │   └── ui/                   # UIコンポーネント（shadcn/ui）
│   ├── types/                    # TypeScript型定義
│   │   ├── database.ts           # Supabase自動生成型
│   │   └── consultation.ts       # 相談関連カスタム型
│   ├── utils/                    # ユーティリティ
│   │   ├── supabase/
│   │   │   ├── server.ts         # サーバーサイドクライアント
│   │   │   └── client.ts         # クライアントサイドクライアント
│   │   ├── export.ts             # エクスポート機能
│   │   └── import.ts             # インポート機能
│   └── styles/                   # スタイルファイル
├── supabase/
│   ├── migrations/               # データベースマイグレーション
│   │   ├── 20251018013035_remote_schema.sql
│   │   ├── 20251019053917_create_consultation_status_enum.sql
│   │   ├── 20251019054018_create_consultation_events_table.sql
│   │   ├── 20251019102038_create_policy_for_consultations_update.sql
│   │   ├── 20251020031028_set_secure_rls_policies_for_all_tables.sql
│   │   ├── 20251028022734_unify_staff_management.sql
│   │   ├── 20251101_add_status_transition_columns.sql
│   │   └── 20260117_add_user_status.sql  # 最新
│   └── seed.sql                  # 初期データ
├── public/                       # 静的ファイル
├── next.config.mjs               # Next.js設定
├── tsconfig.json                 # TypeScript設定
├── tailwind.config.ts            # Tailwind CSS設定
├── package.json                  # 依存関係
└── MAINTENANCE.md                # このファイル
```

### 重要ファイルの説明

#### `src/types/database.ts`
Supabaseから自動生成されるデータベース型定義。**手動で編集しないこと**。

生成方法:
```bash
supabase gen types typescript --local > src/types/database.ts
```

#### `src/types/consultation.ts`
相談関連のカスタム型定義。Supabase JOINクエリの型推論問題を解決するために作成。

```typescript
export type ConsultationWithStaff = Consultation & {
  staff: {
    name: string | null
  } | null
}
```

#### `src/utils/supabase/server.ts`
Server Components/Server Actions用のSupabaseクライアント。

**重要**: Next.js 14では`createClient()`は同期関数（awaitなし）。

#### `next.config.mjs`
Next.js設定ファイル。**Next.js 14では`.ts`ではなく`.mjs`を使用**。

---

## データベース構造

### 主要テーブル

#### 1. `users` (利用者)
利用者の基本情報、身体状況、居住情報を管理。

主要カラム:
- `uid` (UUID, PK): 利用者ID
- `name` (text): 氏名
- `birth_date` (text): 生年月日
- `gender` (enum): 性別
- `property_name`, `property_address`: 物件情報
- `rent`, `deposit`, `common_fee`: 家賃情報
- `care_level_*`: 介護度フラグ
- `registered_at` (text): 利用者登録日
- `status` (enum): 利用者ステータス (`利用中` | `逝去` | `解約`) ※2026/01/17追加
- `end_date` (date): 終了日/逝去日 ※2026/01/17追加

#### 2. `consultations` (相談)
相談記録を管理。

主要カラム:
- `id` (UUID, PK): 相談ID
- `user_id` (UUID, FK → users): 利用者ID（NULL許容、登録前相談対応）
- `staff_id` (UUID, FK → staff): 担当スタッフID
- `name` (text): 相談者名
- `consultation_date` (date): 相談日
- `status` (enum): ステータス
- `consultation_content` (text): 相談内容
- `consultation_result` (text): 対応結果

#### 3. `consultation_events` (相談イベント)
相談のステータス変更履歴や次回アクションを記録。

主要カラム:
- `id` (UUID, PK): イベントID
- `consultation_id` (UUID, FK → consultations): 相談ID
- `staff_id` (UUID, FK → staff): 担当スタッフID
- `status` (enum): 現在のステータス
- `status_from` (text): 遷移前ステータス（2025/11/01追加）
- `status_to` (text): 遷移後ステータス（2025/11/01追加）
- `event_note` (text): イベントメモ
- `next_action_date` (date): 次回アクション予定日
- `next_action_memo` (text): 次回アクション内容（2025/11/01追加）
- `created_at` (timestamptz): イベント記録日時

#### 4. `support_plans` (支援計画)
個別支援計画を管理。

主要カラム:
- `id` (UUID, PK): 計画ID
- `user_id` (UUID, FK → users): 利用者ID
- `staff_id` (UUID, FK → staff): 担当スタッフID
- `creation_date` (date): 作成日
- `start_date`, `end_date` (date): 支援期間
- `goals` (text): 支援目標
- `support_content` (text): 支援内容

#### 5. `staff` (スタッフ)
支援スタッフ情報。

主要カラム:
- `id` (UUID, PK): スタッフID
- `name` (text): 氏名
- `email` (text): メールアドレス

### テーブル関連図

```
users (利用者)
  ↑
  ├─ consultations (相談)
  │    ↓
  │    └─ consultation_events (相談イベント)
  │
  └─ support_plans (支援計画)

staff (スタッフ)
  ├─→ consultations
  ├─→ consultation_events
  └─→ support_plans
```

### 重要なENUM型

#### `consultation_status`
```sql
'初回面談' | '支援検討中' | '物件探し中' | '申込・審査中' |
'入居後フォロー中' | '支援終了' | '対象外・辞退' | '進行中'
```

#### `user_status` (2026/01/17追加)
```sql
'利用中' | '逝去' | '解約'
```

---

## 開発フロー

### 1. 新機能開発の流れ

1. **ブランチ作成**
   ```bash
   git checkout -b feature/new-feature-name
   ```

2. **開発環境起動**
   ```bash
   supabase start  # Supabaseローカル環境
   pnpm dev        # Next.js開発サーバー
   ```

3. **データベーススキーマ変更が必要な場合**

   a. マイグレーションファイル作成
   ```bash
   # 例: consultation_eventsテーブルにカラム追加
   touch supabase/migrations/$(date +%Y%m%d)_add_new_column.sql
   ```

   b. SQLを記述
   ```sql
   ALTER TABLE "public"."table_name"
   ADD COLUMN IF NOT EXISTS "column_name" data_type;
   ```

   c. ローカル環境に適用
   ```bash
   supabase db reset  # 全マイグレーション再適用（データリセット）
   # または
   supabase migration up  # 新規マイグレーションのみ適用（データ保持）
   ```

   d. 型定義再生成
   ```bash
   supabase gen types typescript --local > src/types/database.ts
   ```

4. **型チェック**
   ```bash
   pnpm tsc --noEmit
   ```

5. **ビルドテスト**
   ```bash
   pnpm build
   ```

### 2. データベース型定義の更新

スキーマ変更後は**必ず**型定義を再生成：

```bash
# ローカル環境から生成（推奨）
supabase gen types typescript --local > src/types/database.ts

# 本番環境から生成（プロジェクトID必要）
supabase gen types typescript --project-id your-project-id > src/types/database.ts
```

### 3. よく使うコマンド

```bash
# 開発サーバー起動
pnpm dev

# 型チェック
pnpm tsc --noEmit

# ビルド
pnpm build

# Supabaseローカル環境の状態確認
supabase status

# Supabaseローカル環境の停止
supabase stop

# ローカルDBのリセット
supabase db reset
```

---

## デプロイフロー

### 本番環境デプロイ前のチェックリスト

- [ ] すべての型エラーが解決済み（`pnpm tsc --noEmit`）
- [ ] ビルドが成功（`pnpm build`）
- [ ] ローカルで動作確認済み
- [ ] マイグレーションファイルがコミット済み
- [ ] 環境変数が正しく設定されている

### デプロイ手順

#### 1. データベースマイグレーション適用

**方法A: Supabase Dashboard経由（推奨）**

1. Supabase Dashboardにログイン
2. SQL Editorを開く
3. 新しいマイグレーションファイルの内容をコピー＆実行
4. 実行成功を確認

**方法B: Supabase CLI経由**

```bash
# 本番環境にマイグレーションをプッシュ
supabase db push
```

#### 2. 型定義の再生成（本番環境から）

```bash
supabase gen types typescript --project-id your-project-id > src/types/database.ts
git add src/types/database.ts
git commit -m "chore: update database types from production"
```

#### 3. Vercelへのデプロイ

```bash
# mainブランチにマージ後、自動デプロイ
git checkout main
git merge feature/your-feature
git push origin main
```

または手動デプロイ:
```bash
vercel --prod
```

#### 4. デプロイ後の確認

- [ ] 本番サイトが正常に表示される
- [ ] 新機能が動作する
- [ ] 既存機能が壊れていない
- [ ] ブラウザコンソールにエラーがない

---

## 今回実施した作業（2026年1月17日）

### 背景

**問題**: 利用者名簿がフラットな状態で、「お亡くなりになった方」や「解約者」を除外して表示する機能がなかった。これにより日常業務での視認性が悪く、また過去データの正確な抽出も困難だった。

**目標**: 利用者のライフサイクル（開始〜終了）を管理し、デフォルトでは「利用中」のみを表示しつつ、必要に応じて過去データも参照できる仕組みを構築する。

### 実施した作業の詳細

#### フェーズ1: データベーススキーマ改修

1. **マイグレーション作成**:
   - `users` テーブルに以下のカラムを追加:
     - `status` (ENUM: '利用中', '逝去', '解約') - デフォルト '利用中'
     - `end_date` (DATE) - 終了日または逝去日

2. **型定義更新**:
   - `supabase gen types typescript` を実行し、新しいENUM型とカラム定義をTypeScript型に反映。

#### フェーズ2: バックエンドロジック (Server Actions)

1. **`src/app/actions/users.ts` の修正**:
   - `getUsers` 関数に `status` 引数を追加。
   - デフォルトで `status = '利用中'` のクエリを発行するよう変更し、サーバーサイドでのフィルタリングを実装。

#### フェーズ3: フロントエンド実装

1. **利用者一覧画面 (`src/app/users/page.tsx`, `UsersClientPage.tsx`)**:
   - タブ切り替えUI（利用中 | すべて | 逝去 | 解約）を追加。
   - URLクエリパラメータ (`?status=...`) によるフィルタリングに対応。
   - `useEffect` を追加し、サーバーからのデータ更新時にクライアント側の表示リストも同期されるよう修正（ブラウザバック時の整合性確保）。
   - ステータスに応じた行の背景色変更（グレーアウト等）を実装。

2. **利用者編集画面 (`src/components/UserEditForm.tsx`)**:
   - ステータス変更用のドロップダウンを追加。
   - ステータスが「利用中」以外の場合のみ、終了日入力欄を動的に表示する制御を追加。
   - TypeScriptの型推論エラー (`required` 属性の矛盾) を解決。

### 解決した問題の総括

| 問題 | 原因 | 解決策 |
|------|------|--------|
| 除外フィルタ不可 | DBにステータスカラム不在 | `status` ENUMカラム追加とサーバーサイドフィルタ実装 |
| 一覧のデータ同期ズレ | `useState` の初期値のみ使用 | `useEffect` で `initialUsers` の変更を監視・同期 |
| 型エラー | TypeScriptの過剰な型絞り込み | 不要な条件分岐を削除し論理的な整合性を確保 |

### 変更したファイル一覧

```
追加:
- supabase/migrations/20260117_add_user_status.sql

修正:
- src/types/database.ts (自動生成)
- src/app/actions/users.ts
- src/app/users/page.tsx
- src/app/users/UsersClientPage.tsx
- src/components/UserEditForm.tsx
```

---

## 履歴

| 日付 | 作業内容 | 担当者 |
|------|---------|--------|
| 2025-11-01 | 初版作成。Next.js 15→14ダウングレード、consultation_eventsテーブル拡張、全型エラー解決 | - |
| 2025-11-03 | 月次報告書エクスポート機能実装。xlsx-populateライブラリの制約対応 | - |
| 2025-11-05 | Vercel環境でのExcelエクスポート機能をAPI Route方式に根本修正。Server ActionsからAPI Routesへ移行 | - |
| 2026-01-17 | 利用者ステータス管理機能（利用中/逝去/解約）の実装。DBスキーマ拡張、一覧/編集画面改修、フィルタリング機能追加 | - |

---

**最終更新**: 2026年1月17日