# 居住支援管理マスター - 保守管理ドキュメント

最終更新: 2026年1月18日
プロジェクト参照ID: `hvmuwweipoiubtamiygv`

---

## 目次

1. [システム概要](#システム概要)
2. [技術スタック](#技術スタック)
3. [環境構成](#環境構成)
4. [ディレクトリ構造](#ディレクトリ構造)
5. [データベース構造](#データベース構造)
6. [開発フロー](#開発フロー)
7. [デプロイフロー](#デプロイフロー)
8. [作業履歴](#作業履歴)
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
   - **相談履歴の一覧表示とフィルタリング（年齢・年代ヒント表示機能搭載）**

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
   - **月次推移グラフ（年齢層分布のハイブリッド集計：生年月日+年代フラグに対応）**

---

## 技術スタック

### フロントエンド
- **Next.js**: 14.2.18 (App Router)
- **React**: 18.3.1
- **TypeScript**: ^5
- **Tailwind CSS**: ^3.4.1

### バックエンド/データベース
- **Supabase**: ローカル開発 + 本番環境 (hvmuwweipoiubtamiygv)
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
- Supabase CLI 2.51.0以上（2026/01/18に2.72.8へ近代化推奨）

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
│   │   │   └── dashboard.ts      # ダッシュボードデータ（age_group取得追加）
│   │   ├── api/export/           # API Routes（Excel生成・Vercel安定化用）
│   │   │   ├── consultations/    # 個別相談票（{{age_group}}対応）
│   │   │   └── monthly-report/   # 月次報告書（フォーマッタ統合済）
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
│   │   ├── ConsultationList.tsx  # 相談一覧（年代表示対応）
│   │   ├── ConsultationForm/     # 相談フォーム（年代自動連動・インテリジェント化）
│   │   ├── ConsultationDetail.tsx# 相談詳細（ハイブリッド表示対応）
│   │   ├── UserEditForm.tsx      # 利用者編集フォーム
│   │   ├── SupportTimeline.tsx   # 支援タイムライン
│   │   ├── SupportPlanForm.tsx   # 支援計画フォーム（ビルドエラー修正済）
│   │   ├── AnalyticsDashboard.tsx# 分析ダッシュボード（ハイブリッド集計対応）
│   │   └── ui/                   # UIコンポーネント（shadcn/ui）
│   ├── types/                    # TypeScript型定義
│   │   ├── database.ts           # Supabase自動生成型
│   │   └── consultation.ts       # 相談関連カスタム型（RPC同期済）
│   ├── utils/                    # ユーティリティ
│   │   ├── supabase/
│   │   │   ├── server.ts         # サーバーサイドクライアント
│   │   │   └── client.ts         # クライアントサイドクライアント
│   │   ├── export.ts             # エクスポート機能
│   │   ├── import.ts             # インポート機能
│   │   ├── age-utils.ts          # 年代計算・ロジック一貫性（2026/01/18追加）
│   │   └── consultation-formatter.ts # エクスポート整形（2026/01/18改修）
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
│   │   ├── 20260117_add_user_status.sql
│   │   └── 20260118_add_age_group_to_consultations.sql  # 最新
│   └── seed.sql                  # 初期データ
├── public/                       # 静的ファイル・Excelテンプレート正本
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
npx supabase@latest gen types typescript --local > src/types/database.ts
```

#### `src/types/consultation.ts`
相談関連のカスタム型定義。Supabase JOINクエリやRPCの型推論問題を解決するために作成。

#### `src/utils/supabase/server.ts`
Server Components/Server Actions用のSupabaseクライアント。 Next.js 14では同期関数。

---

## データベース構造

### 主要テーブル

#### 1. `users` (利用者)
利用者の基本情報、身体状況、居住情報を管理。
- `status` (enum): `利用中` | `逝去` | `解約` ※2026/01/17追加
- `end_date` (date): 利用終了または逝去日 ※2026/01/17追加

#### 2. `consultations` (相談)
相談記録を管理。
- `age_group` (text): 相談者の年代フラグ ※2026/01/18追加

### 重要なDB関数 (RPC)
- **`get_consultations_with_next_action`**: 
  一覧画面のデータ取得に使用。物理テーブル構造と `RETURNS TABLE` 定義を **100% 同期させる必要がある**。2026/01/18にVersion 6へ更新済。

---

## 作業履歴

### 【2025年11月1日】ビルド安定化
Next.js v15 Canaryからのダウングレード（14.2.18へ）および全型エラー解消。

### 【2025年11月3日】月次報告書エクスポート実装
`xlsx-populate`の制約（行削除不可）に対応する「テンプレート行上書き」方式の確立。

### 【2025年11月5日】API Routesへの移行
Vercel本番環境でのファイルパス解決（`process.cwd()`）を安定させるため、エクスポート機能をServer ActionsからAPI Routesへ根本修正。

### 【2026年1月17日】利用者ステータス管理機能
利用者名簿に「逝去」「解約」ステータスを導入。タブによるフィルタリング機能を実装。

### 【2026年1月18日】年代フラグ管理機能とビルド環境修復
1. **年代フラグ管理**: 
   - 生年月日不明者への対応として `age_group` カラムを追加。
   - 保存時に「生年月日算出値 > 手動年代選択値」の順でDBへ確定値を格納する正規化を実施。
   - 入力フォームでのリアクティブな自動計算およびロック機能を実装。
2. **ビルド環境の外科手術**:
   - ESLint v9系パッケージ（`eslint.config.mjs` 等）の混入によるエラーを解消。
   - v8世代/v7系プラグインへの完全回帰。
   - `SupportPlanForm.tsx` の `catch` 構文修正による `eslint-disable` コメントの廃絶。

---

## トラブルシューティング

### 1〜8 (既存のトラブルシューティング項目を維持)
(※以前のドキュメントの 1. Never type error から 8. Vercelエクスポート失敗までを完備)

### 9. ビルドエラー: "Definition for rule ... was not found"
- **原因**: ESLint 9 (Flat Config) モードが強制発動。
- **解決**: `eslint.config.mjs` を物理削除し、依存関係を v7/v8 世代へ戻す。

### 10. RPC不整合: "structure of query does not match function result type"
- **原因**: RPC の戻り値定義とSELECT文の列数・順序の不一致。
- **解決**: `database.ts` の物理順序に基づき、テーブルの全カラムをRPC定義に記述する。

---

## 今後の注意事項（最高峰の保守原則）

1. **依存関係の維持**: Next.js 14 のエコシステム（ESLint v8, Tailwind v3, React v18）を維持すること。不用意なアップデートは設定崩壊を招く。
2. **データの正規化**: 統計ロジックを複雑化させないため、年代判定は常に保存時（入口）で行い、DBの `age_group` を「真実のソース」とすること。

---
**最終更新**: 2026年1月18日
**プロジェクト参照ID**: hvmuwweipoiubtamiygv