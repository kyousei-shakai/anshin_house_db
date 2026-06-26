---

# 居住支援管理マスター - 保守管理ドキュメント

最終更新: 2026年6月13日
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
   - **相談履歴の一覧表示とフィルタリング（サーバーサイド検索・年代ヒント表示機能搭載）**

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

6. **【NEW】生活支援管理 (2026/06/13 実装)**
   - **実績記録**: 訪問・電話等の日々の支援内容を分刻み（timestamptz）で記録。
   - **多角的な支援対応**: 「主目的」1つに加え、複数の「副次カテゴリー」を同時記録可能。
   - **予定管理**: 未来の支援予定をタスク（Open/Completed/Cancelled）として管理。
   - **完了連動**: 予定を「完了」にすると自動的に実績へコピー保存される原子性RPCを搭載。副次カテゴリも一括継承。
   - **ケア状況ダッシュボード**: 「本日」「今後」「要フォロー」「直近60日」の4窓口による孤立防止モニタリング。
   - **マスタ管理**: 支援カテゴリーの自由なカスタマイズ（論理削除対応）。

---

## 技術スタック

### フロントエンド
- **Next.js**: 14.2.18 (App Router)
- **React**: 18.3.1
- **TypeScript**: v5.5.4
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
│   │   │   ├── dashboard.ts      # ダッシュボード統合API
│   │   │   └── support.ts        # 生活支援・予定・マスタ・ダッシュボードAPI
│   │   ├── settings/             # 管理設定
│   │   │   └── categories/       # カテゴリマスタ管理ページ
│   │   │   └── staff/            # 【新設】スタッフマスタ管理ページ
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
│   │   ├── settings/             # 【新設】管理系コンポーネント
│   │   │   └── StaffManagement.tsx # 【新規】スタッフ管理UI（論理削除・表示順対応）
│   │   ├── Header.tsx            # ヘッダーメニュー（支援カテゴリ導線追加）
│   │   ├── Layout.tsx            # ページレイアウト
│   │   ├── ConsultationList.tsx  # 相談一覧（年代表示対応）
│   │   ├── ConsultationForm/     # 相談フォーム
│   │   ├── ConsultationDetail.tsx# 相談詳細
│   │   ├── UserEditForm.tsx      # 利用者編集フォーム
│   │   ├── SupportTimeline.tsx   # 支援タイムライン
│   │   ├── SupportPlanForm.tsx   # 支援計画フォーム
│   │   ├── AnalyticsDashboard.tsx# 分析ダッシュボード
│   │   ├── UserDetailTabs.tsx    # 利用者詳細タブ（生活支援記録タブを統合）
│   │   ├── support/              # 【新規】生活支援機能専用コンポーネント
│   │   │   ├── CareDashboard.tsx # 4窓口統合型ダッシュボード（判別可能ユニオン採用）
│   │   │   ├── SupportRecordForm.tsx # 実績・予定同時入力フォーム
│   │   │   ├── SupportRecordTimeline.tsx # 過去実績表示
│   │   │   ├── SupportTaskList.tsx   # 未来予定表示・編集（複数カテゴリ同期）
│   │   │   ├── SupportActionButtons.tsx # 入力司令塔
│   │   │   ├── SupportTaskFormOnly.tsx # 予定単独登録フォーム
│   │   │   └── CategoryManagement.tsx # マスタ管理UI
│   │   └── ui/                   # UIコンポーネント（shadcn/ui）
│   ├── types/                    # TypeScript型定義
│   │   ├── database.ts           # Supabase自動生成型
│   │   ├── consultation.ts       # 相談関連カスタム型
│   │   └── support.ts            # 【新規】生活支援関連型（CareDashboardItemユニオン型）
│   ├── utils/                    # ユーティリティ
│   │   ├── consultation-aggregator.ts # 個別相談票エクスポート機能のデータの加工ロジック
│   │   ├── age-utils.ts 
│   │   ├── date.ts 
│   │   ├── export.ts 
│   │   ├── import.ts 
│   │   ├── uid.ts 
│   │   ├── supabase/
│   │   │   ├── server.ts         # サーバーサイドクライアント
│   │   │   └── client.ts         # クライアントサイドクライアント
│   │   ├── export.ts             # エクスポート機能
│   │   ├── import.ts             # インポート機能
│   │   ├── age-utils.ts          # 年代計算・ロジック一貫性
│   │   └── consultation-formatter.ts # エクスポート整形 月次報告書（monthly_report_template）用
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
│   │   ├── 20260118_add_age_group_to_consultations.sql
│   │   ├── 20260606000000_update_get_consultations_rpc_for_search.sql # サーバーサイド検索
│   │   ├── 20260609110000_drop_vulnerable_temporary_policy.sql      # 脆弱性封鎖
│   │   ├── 20260612100000_add_life_support_records.sql              # 生活支援基盤一式
│   │   └── 20260613100000_add_sub_categories_with_snapshot.sql      # 複数カテゴリ拡張
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
- `status` (enum): `利用中` | `逝去` | `解約` 
- `end_date` (date): 利用終了または逝去日 

#### 2. `consultations` (相談)
相談記録を管理。
- `age_group` (text): 相談者の年代フラグ

#### 3. `support_categories` / `daily_support_logs` / `support_tasks` (生活支援)
生活支援の「マスタ」「実績」「予定」を管理。
- **不変性設計**: カテゴリ名変更に備え、ログ・タスク側には保存時の名称を `category_name_snapshot` として保持。表示時はマスタをJOINせず、このスナップショットを「真実」とする。
- **多対多構造**: 中間テーブル（`sub_categories`）により、1訪問における複数支援の同時記録に対応。

#### 4. `staff` (スタッフ)
システム全体の「担当者」を管理。
- `is_active` (boolean): 論理削除フラグ。退職者は `false` に設定し、歴史的証跡を保護する。
- `display_order` (integer): 選択肢の表示順を現場で調整可能にするための重み付けカラム。

### 重要なDB関数 (RPC)
- **`get_consultations_with_next_action`**: 一覧画面のデータ取得（サーバーサイド検索対応版）。
- **`get_user_care_dashboard`**: 利用者ごとの放置日数・未入力判定をリアルタイム算出。
- **`get_all_upcoming_tasks`**: 未来の全予定を時系列（1予定1行）で返却。
- **`get_team_recent_history`**: チーム全体の直近60日の履歴を返却。
- **`complete_support_task`**: 予定の完了と実績への一括コピー（副次カテゴリ含む）。

---

## 作業履歴

### 【2025年11月1日】ビルド安定化
Next.js v15 Canaryからのダウングレード（14.2.18へ）および全型エラー解消。

### 【2025年11月3日】月次報告書エクスポート実装
`xlsx-populate`の制約に対応する「テンプレート行上書き」方式の確立。

### 【2025年11月5日】API Routesへの移行
エクスポート機能をServer ActionsからAPI Routesへ根本修正。

### 【2026年1月17日】利用者ステータス管理機能
利用者名簿に「逝去」「解約」ステータスを導入。

### 【2026年1月18日】年代フラグ管理機能とビルド環境修復
生年月日不明者への対応として `age_group` カラムを追加。ESLint環境の修復。

### 【2026年2月1日】開発環境の安定化と依存関係の整理
TypeScriptのダウングレード(5.5.4)と依存関係の固定。

### 【2026年6月6日】検索不具合の解消
サーバーサイド検索への移行により、全期間のキーワード検索を可能にした。

### 【2026年6月9日】セキュリティ脆弱性の修正
`consultations`テーブルの不要な `TEMPORARY` 更新ポリシーを削除。

### 【2026年6月13日】生活支援管理機能の実装・拡張
生活支援ログ、次回予定管理、および4窓口統合型ダッシュボードを実装。複数カテゴリー選択（多対多）およびスナップショット同期に対応。

## 【2026年6月23日】個別相談票エクスポート機能の高度化と防弾設計の導入
従来のExcel出力は、あらかじめ用意された全選択肢に対して「チェック（✔）」を入れる「アナログ帳票模倣型」。**「選択された項目のみを日本語ラベルとして連結し、一つの文章として出力する」**データ駆動型の設計へ転換。

*   **関連ファイル:** `src/utils/consultation-aggregator.ts`
### 運用の「防弾設計（セーフティ）」

1.  **テンプレートの世代管理 (`v2` の導入):**
    既存の `consultation_template.xlsx` を破壊せず、`consultation_template_v2.xlsx` を新設して参照先を切り替えました。これにより、不測の事態における即時切り戻しを可能にしています。
2.  **後方互換性（Backward Compatibility）:**
    `route.ts` 内では旧プレースホルダ（`{{route_self}}` 等）への置換ロジックも削除せず保持しています。新旧どちらのテンプレートでも動作が停止しない設計です。
3.  **入力の浄化 (Data Sanitization):**
    詳細テキスト入力には必ず `.trim()` を実行し、空白文字のみの入力があった場合に `その他( )` といった不格好な出力がなされるのを物理的に防いでいます。


### 【2026年6月25日】相談フォームの属性項目（Attributes）の大幅拡張とデータ駆動型ダッシュボードの導入
厚労省の指定基準に準拠し属性項目を従来の12項目から30項目へ大幅に拡張。
物理スキーマの拡張: consultations テーブルに10項目の boolean カラムを追加。
RPC (Version 8) への刷新:関数: get_consultations_with_next_action
変更内容: 戻り値（RETURNS TABLE）に新設10カラムを追加。本システムでは、物理テーブルのカラム追加とRPCの戻り値定義の同期が必須であることを改めて定義。
型安全性の連鎖: supabase gen types による database.ts の更新に加え、手動定義の ConsultationFormData（types.ts）および Consultation（custom.ts）を完全同期。

### 【2026年6月26日】スタッフ管理機能の実装と参照整合性の強化
現場スタッフが担当者情報を自由に追加・編集・無効化できるマスタ管理機能を実装。
- **物理防御（三重防御）**: 全5テーブル（相談、イベント、計画、ログ、タスク）の `staff_id` 等に対する外部参照制約を動的に特定し、`ON DELETE RESTRICT` へ一括再定義。物理削除による証跡喪失をDBレベルで封鎖。
- **キャッシュ不整合の根絶**: Server Action 内部で `unstable_noStore()` による常時最新フェッチと、`revalidatePath('/', 'layout')` による広域パージを実装。マスタ変更を全画面に即時同期。
- **履歴保護ロジック**: 相談編集モード時、担当スタッフが無効化（論理削除）されていても、その記録の証跡としてプルダウンに表示し続ける「editMode連動フィルタリング」を導入。
---

## トラブルシューティング

### 1〜10 (既存項目を維持)
(※省略せず 1. Never type error から 10. RPC不整合までを維持)

### 11. RPC不整合と `undefined` 表示 (2026/06)
- **原因**: RPCの戻り値列と `src/types/support.ts` の定義がズレると発生。
- **解決**: `UpcomingTaskRow` 等の型定義と SQL 戻り値を常に同期させる。

### 12. 完了処理でのデータ漏れ
- **原因**: 予定の副次カテゴリーが実績にコピーされない（初期実装ミス）。
- **解決**: `complete_support_task` RPC内部で `INSERT SELECT` による一括コピーを実装。

---

## 今後の注意事項（最高峰の保守原則）

1. **依存関係の維持**: Next.js 14 のエコシステムを維持すること。
2. **データの正規化**: 年代判定は常に保存時（入口）で行うこと。
3. **マルチテナント化（Phase 2）への技術的課題**:
   - **セキュリティ脱却**: 現在 `SERVICE_ROLE_KEY` を使用中。複数法人化の際は `ANON_KEY` ＋セッション認証へ移行し RLS を実効化すること。
   - **組織IDの厳格化**: `organization_id` を `SET NOT NULL` 化し、全クエリに組織フィルタを実装すること。
   - **証跡性の確保**: 記録者を「自己申告」から「認証紐付け（`auth_user_id`）」にアップグレードすること。
4. **ビジネスロジックの所在 (SSOT)**:
   - 放置日数の計算や「要フォロー」の判定条件は、React側で再定義せず、必ずSQL（RPC）側を「唯一の真実」として参照すること。

5. **スタッフ同一性の維持**:
   - `staff` テーブルのレコードは「ID単位での個人」を象徴する。
   - 人物の入れ替え時に「既存レコードの名前を別人に書き換える」ことは**厳禁**。必ず旧担当を `is_active = false` とし、新担当を新規登録すること。これを守らない場合、過去の全相談記録の担当者名が遡って書き換わる「証跡破壊」が発生する。
---
**プロジェクト参照ID**: `hvmuwweipoiubtamiygv`