# 居住支援管理マスター - 保守管理ドキュメント

最終更新: 2025年11月1日

---

## 目次

1. [システム概要](#システム概要)
2. [技術スタック](#技術スタック)
3. [環境構成](#環境構成)
4. [ディレクトリ構造](#ディレクトリ構造)
5. [データベース構造](#データベース構造)
6. [開発フロー](#開発フロー)
7. [デプロイフロー](#デプロイフロー)
8. [今回実施した作業（2025年11月1日）](#今回実施した作業2025年11月1日)
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
│   │   └── 20251101_add_status_transition_columns.sql  # 最新
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

## 今回実施した作業（2025年11月1日）

### 背景

**問題**: Next.js v15 Canary / React v19環境で`pnpm build`が失敗。Supabaseクエリが`never`型を返し、57個の型エラーが発生。本番環境へのデプロイが不可能な状態。

**目標**: 安全に本番環境へデプロイできる状態にする。

### 実施した作業の詳細

#### フェーズ1: 根本原因の特定

1. **調査結果**
   - Next.js 15 Canary / React 19 Canaryの不安定性
   - `@supabase/ssr@0.6.1`がNext.js 14と非互換

2. **決定**: 安定版へダウングレード
   - Next.js: 15.3.5 → **14.2.18**
   - React: 19 → **18.3.1**
   - @supabase/ssr: 0.6.1 → **0.3.0**
   - @supabase/supabase-js: → **2.42.7**

#### フェーズ2: 設定ファイルの修正

1. **next.config.ts → next.config.mjs**
   - Next.js 14は`.ts`設定ファイル非対応
   - JavaScriptの`.mjs`形式に変換

2. **フォントの置き換え**
   - Geist, Geist_Mono（Next.js 15専用）
   - → **Inter, Roboto_Mono**に変更
   - ファイル: `src/app/layout.tsx`

3. **Layout.tsxの修正**
   - 重複する`<html>`と`<body>`タグ削除
   - `src/components/Layout.tsx`をシンプルなラッパーに変更

#### フェーズ3: 型システムの統一

1. **中央集権的な型定義ファイル作成**
   - ファイル: `src/types/consultation.ts`
   - Supabase JOINクエリの型推論問題を解決

   ```typescript
   export type ConsultationWithStaff = Consultation & {
     staff: {
       name: string | null
     } | null
   }
   ```

2. **型の置き換え**
   - `src/app/actions/consultations.ts`
   - `src/components/ConsultationList.tsx`
   - その他主要ファイル

#### フェーズ4: データベーススキーマ拡張

**問題発見**: コードが存在しないDBカラムを参照
- `consultation_events`テーブルに以下のカラムが不足:
  - `status_from` (遷移前ステータス)
  - `status_to` (遷移後ステータス)
  - `next_action_memo` (次回アクション内容)

**対応**:
1. マイグレーションファイル作成
   ```
   supabase/migrations/20251101_add_status_transition_columns.sql
   ```

2. SQL内容:
   ```sql
   ALTER TABLE "public"."consultation_events"
   ADD COLUMN IF NOT EXISTS "status_from" text,
   ADD COLUMN IF NOT EXISTS "status_to" text,
   ADD COLUMN IF NOT EXISTS "next_action_memo" text;
   ```

3. ローカル環境に適用
   ```bash
   supabase db reset
   ```

4. 型定義再生成
   ```bash
   supabase gen types typescript --local > src/types/database.ts
   ```

#### フェーズ5: コードの修正

1. **SupportTimeline.tsx**
   - `staff_name` → `staff?.name` (JOIN型に対応)
   - `note` → `event_note` (実際のカラム名)
   - `next_action_due_date` → `next_action_date`

2. **UserEditForm.tsx**
   - `registered_at: null` → `undefined` (Supabase型に合わせる)

3. **UserSupportPlans.tsx**
   - `staff_name` → `staff?.name`

4. **ConsultationList.tsx**
   - 型アノテーション修正: `(string | null)` → `string[]`

5. **DataManagement.tsx**
   - ジェネリック関数に変更して型を保持

#### フェーズ6: ビルド検証

```bash
pnpm build
```

**結果**: ✅ 成功

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (15/15)
```

### 解決した問題の総括

| 問題 | 原因 | 解決策 |
|------|------|--------|
| Never型エラー57個 | Next.js 15 Canary + Supabase SSR 0.6.1 | Next.js 14.2.18 + Supabase SSR 0.3.0 |
| next.config.ts非対応 | Next.js 14の制限 | .mjsに変換 |
| Geistフォント不明 | Next.js 15専用フォント | Inter/Roboto_Monoに変更 |
| 重複bodyタグ | Layout.tsxの構造問題 | シンプルなラッパーに変更 |
| JOINクエリ型推論 | Supabase SSR 0.3.0の制限 | カスタム型定義作成 |
| 存在しないDBカラム | コードとDBの乖離 | マイグレーション追加 |
| 型アノテーションミス | コーディングミス | 個別修正 |

### 変更したファイル一覧

```
修正:
- package.json (バージョンダウングレード)
- next.config.ts → next.config.mjs
- src/app/layout.tsx (フォント変更)
- src/components/Layout.tsx (構造変更)
- src/types/consultation.ts (新規作成)
- src/app/actions/consultations.ts
- src/components/ConsultationList.tsx
- src/components/SupportTimeline.tsx
- src/components/UserEditForm.tsx
- src/components/UserSupportPlans.tsx
- src/components/DataManagement.tsx
- src/components/Header.tsx

追加:
- supabase/migrations/20251101_add_status_transition_columns.sql

再生成:
- src/types/database.ts
```
## 今回実施した作業（2025年11月3日）

### 背景

**問題**: `Data Management`ページに、指定した年月の相談記録を特定のフォーマットでExcelファイルとして出力する「月次報告書エクスポート」機能を実装するにあたり、`xlsx-populate`ライブラリのAPI仕様に関する複数の問題に直面した。

**目標**: ライブラリの制約を理解し、堅牢で保守性の高い方法でExcelエクスポート機能を実装する。

### 実施した作業の詳細

#### フェーズ1: 根本原因の特定と解決策の確立

1. **調査結果（エラー履歴）**:
   - `sheet.insertRow is not a function`: ライブラリに存在しないAPIを呼び出していた。
   - `Row.style: Invalid arguments`: 行全体のスタイルを一括でコピーしようとしたが、APIがサポートしていない使い方だった。
   - `sheet.row(...).delete is not a function`: ライブラリに行を削除する機能が存在しないことが最終的に判明。

2. **根本原因の確定**:
   - `xlsx-populate`ライブラリには**行を削除するAPIが存在しない**。
   - セルのスタイルコピーは、プロパティ名を明示的に指定して取得・設定する必要がある。

3. **最終的な実装方針の決定**:
   - Excelテンプレートの特定の行（例: 6行目）を「テンプレート行」と定義する。
   - 1件目のデータは、その**テンプレート行に直接上書き**する。
   - 2件目以降のデータは、テンプレート行の下（7行目、8行目…）に追記し、その際にテンプレート行からスタイル情報をセル単位でコピーする。
   - このアプローチにより、行削除APIがなくても目的のレイアウトを実現できる。

#### フェーズ2: コードの修正と堅牢性の向上

1. **`src/app/actions/export.ts` の `generateMonthlyReportExcel` を修正**:
   - 上記の「上書きアプローチ」に基づき、行生成ロジックを全面的に書き換え。
   - スタイルコピー処理を、プロパティ名を配列で指定する公式APIに準拠した方法に変更。
   - `fs.access`によるテンプレートファイルの存在事前確認処理を追加。
   - `{{YEAR}}`などのプレースホルダー置換時に`null`チェックを追加。
   - 相談日を`new Date()`オブジェクトに変換してセルに渡すようにし、Excel側での書式設定を確実にした。

2. **`src/utils/consultation-formatter.ts` を新規作成**:
   - 相談データをExcel表示用の文字列に変換するロジックを、サーバーアクションから完全に分離。
   - 関心の分離を徹底し、コードの再利用性とテストの容易性を向上させた。

3. **`src/utils/export.ts` と `src/components/DataManagement.tsx` を修正**:
   - 新しく作成したサーバーアクションを呼び出し、UIと連携させるための修正を実施。

### 解決した問題の総括

| 問題 | 原因 | 解決策 |
|------|------|--------|
| Excel行操作エラー | `xlsx-populate`のAPI（行削除・スタイルコピー）の誤解 | ライブラリ仕様を再調査し、「テンプレート行の上書き」方式と正しいスタイルコピー方法を確立 |
| 潜在的な実行時エラー | ファイル不在、`null`参照、日付型の不整合 | 事前チェックと型変換を徹底する防御的プログラミングを導入 |
| コードの密結合 | サーバーアクション内にデータ整形ロジックが混在 | `consultation-formatter.ts` にロジックを分離し、責務を明確化 |

### 変更したファイル一覧

Model
はい、MAINTENANCE.md の修正は必要です。
このファイルは、README.md とは異なり、システムの内部構造や開発・保守の手順を詳細に記録する、**「開発チームのための運用マニュアル」**としての役割を持っています。
今回の実装では、非常に重要な技術的背景（ライブラリの制約）と、それに伴う実装上の決定がありました。これをこの保守ドキュメントに記録しておくことは、将来の自分たちや新しく参加するメンバーが、安全かつ効率的にシステムを保守していく上で不可欠です。
挿入箇所と挿入文（提案）
MAINTENANCE.md 内には、今回の修正内容を反映させるべき箇所が2つあります。
1. 「トラブルシューティング」セクションへの追記
【挿入箇所】
## トラブルシューティング セクションの末尾に、新しいトラブルシューティング項目として追加するのが適切です。
【挿入文】
以下のMarkdownブロックをコピーして、### 6. 型定義が更新されない の項目の下に追加してください。
code
Markdown
### 7. Excelエクスポートでレイアウトが崩れる、またはエラーが発生する

**症状**:
- 月次報告書などのExcelエクスポート機能で、意図しないレイアウトになる。
- `sheet.row(...).delete is not a function` のようなエラーが発生する。

**原因**:
コードとExcelテンプレートファイル (`public/monthly_report_template.xlsx` など) の間で仕様の不一致が発生している。特に、`xlsx-populate`ライブラリには**行を削除するAPIが存在しない**という強い制約がある。

**解決策**:
1. **テンプレートファイルの確認**:
   - `public/`フォルダ内の該当するテンプレートファイルを開き、シート名、データが書き込まれるべき行番号、プレースホルダー（例: `{{YEAR}}`）が、`src/app/actions/export.ts` 内のコードで期待されているものと一致しているか確認する。

2. **実装アプローチの再確認**:
   - `xlsx-populate`で行を追加する場合、「テンプレート行を後から削除する」ことはできない。
   - 正しい実装は、「**1件目のデータでテンプレート行を上書きし、2件目以降をその下の行に追記していく**」方式である。
   - `src/app/actions/export.ts` 内の `generateMonthlyReportExcel` 関数がこの原則に従って実装されているか確認する。

3. **スタイルコピー方法の確認**:
   - セルのスタイルをコピーする場合、`cell.style(anotherCell.style())` という単純な形式ではエラーになる。
   - `const styles = templateCell.style(['bold', 'fontSize', ...])` のように、コピーしたいスタイルプロパティを配列で明示的に指定し、取得したスタイルオブジェクトを `currentCell.style(styles)` で設定するのが正しい方法である。
2. 「今回実施した作業」セクションへの追記
【挿入箇所】
## 今回実施した作業（2025年11月1日） というセクションは、過去の作業記録のように見えます。もしこれが継続的に更新されるドキュメントであれば、このセクションの下に新しい日付で今回の作業内容を追記するのが理想的です。
ここでは、新しいセクションとして今回の作業内容を追加する形で提案します。
【挿入文】
以下のMarkdownブロックをコピーして、## 今回実施した作業（2025年11月1日） のセクション全体の下に追加してください。
code
Markdown
---

## 今回実施した作業（2025年11月3日）

### 背景

**問題**: `Data Management`ページに、指定した年月の相談記録を特定のフォーマットでExcelファイルとして出力する「月次報告書エクスポート」機能を実装するにあたり、`xlsx-populate`ライブラリのAPI仕様に関する複数の問題に直面した。

**目標**: ライブラリの制約を理解し、堅牢で保守性の高い方法でExcelエクスポート機能を実装する。

### 実施した作業の詳細

#### フェーズ1: 根本原因の特定と解決策の確立

1. **調査結果（エラー履歴）**:
   - `sheet.insertRow is not a function`: ライブラリに存在しないAPIを呼び出していた。
   - `Row.style: Invalid arguments`: 行全体のスタイルを一括でコピーしようとしたが、APIがサポートしていない使い方だった。
   - `sheet.row(...).delete is not a function`: ライブラリに行を削除する機能が存在しないことが最終的に判明。

2. **根本原因の確定**:
   - `xlsx-populate`ライブラリには**行を削除するAPIが存在しない**。
   - セルのスタイルコピーは、プロパティ名を明示的に指定して取得・設定する必要がある。

3. **最終的な実装方針の決定**:
   - Excelテンプレートの特定の行（例: 6行目）を「テンプレート行」と定義する。
   - 1件目のデータは、その**テンプレート行に直接上書き**する。
   - 2件目以降のデータは、テンプレート行の下（7行目、8行目…）に追記し、その際にテンプレート行からスタイル情報をセル単位でコピーする。
   - このアプローチにより、行削除APIがなくても目的のレイアウトを実現できる。

#### フェーズ2: コードの修正と堅牢性の向上

1. **`src/app/actions/export.ts` の `generateMonthlyReportExcel` を修正**:
   - 上記の「上書きアプローチ」に基づき、行生成ロジックを全面的に書き換え。
   - スタイルコピー処理を、プロパティ名を配列で指定する公式APIに準拠した方法に変更。
   - `fs.access`によるテンプレートファイルの存在事前確認処理を追加。
   - `{{YEAR}}`などのプレースホルダー置換時に`null`チェックを追加。
   - 相談日を`new Date()`オブジェクトに変換してセルに渡すようにし、Excel側での書式設定を確実にした。

2. **`src/utils/consultation-formatter.ts` を新規作成**:
   - 相談データをExcel表示用の文字列に変換するロジックを、サーバーアクションから完全に分離。
   - 関心の分離を徹底し、コードの再利用性とテストの容易性を向上させた。

3. **`src/utils/export.ts` と `src/components/DataManagement.tsx` を修正**:
   - 新しく作成したサーバーアクションを呼び出し、UIと連携させるための修正を実施。

### 解決した問題の総括

| 問題 | 原因 | 解決策 |
|------|------|--------|
| Excel行操作エラー | `xlsx-populate`のAPI（行削除・スタイルコピー）の誤解 | ライブラリ仕様を再調査し、「テンプレート行の上書き」方式と正しいスタイルコピー方法を確立 |
| 潜在的な実行時エラー | ファイル不在、`null`参照、日付型の不整合 | 事前チェックと型変換を徹底する防御的プログラミングを導入 |
| コードの密結合 | サーバーアクション内にデータ整形ロジックが混在 | `consultation-formatter.ts` にロジックを分離し、責務を明確化 |

### 変更したファイル一覧
修正:
src/app/actions/export.ts (generateMonthlyReportExcelを全面的に修正)
src/utils/export.ts (新しいサーバーアクションの呼び出しを追加)
src/components/DataManagement.tsx (UIとハンドラを月次報告書機能に対応)
追加:
src/utils/consultation-formatter.ts (データ整形ロジックを分離)
public/monthly_report_template.xlsx (エクスポート用テンプレート)```


---

## トラブルシューティング

### 1. ビルドエラー: "Never type error"

**症状**:
```
Type 'never' is not assignable to...
```

**原因**: SupabaseとNext.jsのバージョン不整合

**解決策**:
1. 依存関係を確認:
   ```bash
   cat package.json | grep -A 3 '"next"'
   cat package.json | grep -A 3 '"@supabase"'
   ```

2. 期待されるバージョン:
   - Next.js: 14.2.18
   - @supabase/ssr: 0.3.0
   - @supabase/supabase-js: 2.42.7

3. 必要に応じて再インストール:
   ```bash
   pnpm install
   ```

### 2. 型エラー: "Property does not exist"

**症状**:
```
Property 'staff_name' does not exist on type...
```

**原因**: database.tsが古い、またはマイグレーション未適用

**解決策**:
1. マイグレーションを確認:
   ```bash
   ls -la supabase/migrations/
   ```

2. ローカルDBに適用:
   ```bash
   supabase db reset
   ```

3. 型定義を再生成:
   ```bash
   supabase gen types typescript --local > src/types/database.ts
   ```

### 3. ビルドエラー: "next.config.ts is not supported"

**症状**:
```
Configuring Next.js via 'next.config.ts' is not supported
```

**原因**: Next.js 14は`.ts`設定ファイル非対応

**解決策**:
`next.config.mjs`を使用（既に対応済み）

### 4. ヘッダーメニューが表示されない

**症状**: ページにヘッダーが表示されない

**原因**:
- 複数の`<body>`タグが存在
- Layout.tsxの構造問題

**解決策**:
`src/components/Layout.tsx`が以下の構造になっているか確認:

```typescript
import Header from './Header'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col items-center">
        {children}
      </main>
    </>
  )
}
```

### 5. Supabaseローカル環境が起動しない

**症状**:
```
Error: Cannot connect to local database
```

**解決策**:
1. Dockerが起動しているか確認
   ```bash
   docker ps
   ```

2. Supabaseを再起動
   ```bash
   supabase stop
   supabase start
   ```

3. ポート競合を確認（デフォルト: 54321, 54322, 5432）

### 6. 型定義が更新されない

**症状**: マイグレーション適用後も型エラーが残る

**解決策**:
1. database.tsのタイムスタンプを確認
   ```bash
   ls -la src/types/database.ts
   ```

2. 強制再生成
   ```bash
   supabase gen types typescript --local > src/types/database.ts
   ```

3. TypeScriptサーバーを再起動（VSCode）
   - `Cmd+Shift+P` → "TypeScript: Restart TS Server"

### 7. Excelエクスポートでレイアウトが崩れる、またはエラーが発生する

**症状**:
- 月次報告書などのExcelエクスポート機能で、意図しないレイアウトになる。
- `sheet.row(...).delete is not a function` のようなエラーが発生する。

**原因**:
コードとExcelテンプレートファイル (`public/monthly_report_template.xlsx` など) の間で仕様の不一致が発生している。特に、`xlsx-populate`ライブラリには**行を削除するAPIが存在しない**という強い制約がある。

**解決策**:
1. **テンプレートファイルの確認**:
   - `public/`フォルダ内の該当するテンプレートファイルを開き、シート名、データが書き込まれるべき行番号、プレースホルダー（例: `{{YEAR}}`）が、`src/app/actions/export.ts` 内のコードで期待されているものと一致しているか確認する。

2. **実装アプローチの再確認**:
   - `xlsx-populate`で行を追加する場合、「テンプレート行を後から削除する」ことはできない。
   - 正しい実装は、「**1件目のデータでテンプレート行を上書きし、2件目以降をその下の行に追記していく**」方式である。
   - `src/app/actions/export.ts` 内の `generateMonthlyReportExcel` 関数がこの原則に従って実装されているか確認する。

3. **スタイルコピー方法の確認**:
   - セルのスタイルをコピーする場合、`cell.style(anotherCell.style())` という単純な形式ではエラーになる。
   - `const styles = templateCell.style(['bold', 'fontSize', ...])` のように、コピーしたいスタイルプロパティを配列で明示的に指定し、取得したスタイルオブジェクトを `currentCell.style(styles)` で設定するのが正しい方法である。

---

## 今後の注意事項

### 1. バージョン管理の重要性

**絶対に守るべきルール**:

1. **安定版を使用する**
   - Next.js: 14.x系（15.xは当面避ける）
   - React: 18.x系
   - Canary/Beta版は本番環境で使用しない

2. **依存関係の更新は慎重に**
   ```bash
   # NG: 一括アップデート
   pnpm update --latest

   # OK: 個別に検証
   pnpm update @supabase/ssr --latest
   pnpm build  # 必ず確認
   ```

3. **package.json固定**
   ```json
   {
     "dependencies": {
       "next": "14.2.18",           // ^ を使わない
       "@supabase/ssr": "0.3.0",
       "react": "^18.3.1"            // マイナーバージョンのみ許可
     }
   }
   ```

### 2. データベース変更のルール

1. **マイグレーションは必ずファイルで管理**
   - Supabase Dashboardでの直接変更は避ける
   - すべての変更を`supabase/migrations/`に記録

2. **マイグレーションファイル名の規則**
   ```
   YYYYMMDD_descriptive_name.sql
   例: 20251101_add_status_transition_columns.sql
   ```

3. **型定義の再生成を忘れない**
   ```bash
   # スキーマ変更後は必ず実行
   supabase gen types typescript --local > src/types/database.ts
   ```

4. **ロールバックの準備**
   - 破壊的変更（DROP COLUMN等）は慎重に
   - バックアップを取ってから実行

### 3. 型安全性の維持

1. **`any`型を使わない**
   ```typescript
   // NG
   const data: any = await supabase...

   // OK
   const data: ConsultationWithStaff[] = ...
   ```

2. **カスタム型はsrc/types/に集約**
   - `database.ts`: 自動生成（手動編集禁止）
   - `consultation.ts`, `user.ts`: カスタム型

3. **型アサーションは最小限に**
   ```typescript
   // 必要な場合のみ（Supabase JOIN制限時）
   data as unknown as ConsultationWithStaff
   ```

### 4. デプロイ前の必須チェック

```bash
# 1. 型チェック
pnpm tsc --noEmit

# 2. ビルドテスト
pnpm build

# 3. ローカルで動作確認
pnpm dev
# → 各ページを手動確認

# 4. マイグレーションの確認
ls -la supabase/migrations/
# → 未適用のマイグレーションがないか確認
```

### 5. 本番環境マイグレーションの手順

**重要**: 本番環境へのマイグレーション適用は以下の順序で実行

1. **バックアップ取得**（Supabase Dashboard）

2. **マイグレーションSQL確認**
   ```bash
   cat supabase/migrations/YYYYMMDD_*.sql
   ```

3. **Supabase DashboardのSQL Editorで実行**
   - 1マイグレーションずつ実行
   - エラーがないか確認

4. **本番環境から型定義を再生成**
   ```bash
   supabase gen types typescript --project-id your-project-id > src/types/database.ts
   git add src/types/database.ts
   git commit -m "chore: update database types from production"
   git push
   ```

5. **Vercel自動デプロイを待つ**

6. **本番サイトで動作確認**

### 6. 禁止事項

❌ **以下の操作は絶対に避ける**:

1. 本番データベースへの直接SQL実行（マイグレーションなし）
2. `database.ts`の手動編集
3. Canary/Beta版の本番使用
4. ビルド確認なしでのデプロイ
5. 型エラーを`@ts-ignore`で隠蔽

### 7. Git運用ルール

```bash
# ブランチ戦略
main          # 本番環境（保護ブランチ）
develop       # 開発環境
feature/*     # 機能開発

# コミットメッセージ規則
feat: 新機能
fix: バグ修正
chore: 雑務（型定義更新、依存関係更新等）
refactor: リファクタリング
docs: ドキュメント更新
```

---

## 連絡先・参考資料

### 公式ドキュメント

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React 18 Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Supabase CLI

```bash
# バージョン確認
supabase --version

# ヘルプ
supabase help

# ローカル環境の状態確認
supabase status
```

### デバッグツール

- ブラウザ開発者ツール（F12）
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- Supabase Dashboard（ローカル: http://localhost:54323）

---

## 履歴

| 日付 | 作業内容 | 担当者 |
|------|---------|--------|
| 2025-11-01 | 初版作成。Next.js 15→14ダウングレード、consultation_eventsテーブル拡張、全型エラー解決 | - |

---

**最終更新**: 2025年11月1日
