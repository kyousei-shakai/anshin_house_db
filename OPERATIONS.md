# 複数環境（マルチテナント）運用管理マニュアル

## 1. 運用の全体設計
本システムは「1つのソースコード」で「複数の独立した法人環境」を運用するマルチテナント構成です。
人為的なミス（A法人のデータをB法人へ送る、等）を物理的に防ぐため、**「環境切り替えコマンド」による自動同期**を徹底します。

### 操作の3大原則
1.  **`.env.local` を手書きしない:** 常に `switch` コマンドで生成する。
2.  **`db:push` の前に `db:who`:** 今どのDBを向いているか必ず指差し確認する。
3.  **開発は必ず `local` で:** 本番環境（A/B）に接続したまま `pnpm dev` を行わない。

---

## 2. 環境定義（事実データ）

| 環境コンテキスト | 実行コマンド | 向先Supabase ID | 備考 |
| :--- | :--- | :--- | :--- |
| **開発 (Local)** | `pnpm switch:local` | `localhost` | Docker上のローカルDB |
| **法人A (本番)** | `pnpm switch:a` | `hvmuwweipoiubtamiygv` | **現在実務稼働中** |
| **法人B (本番)** | `pnpm switch:b` | `xnyjtcpwpmafbufsmezx` | **新規構築環境** |

---

## 3. 初期設定（シードファイルの準備）
プロジェクトルートに以下のファイルを一文字一句正確に作成・保持すること。
※これらのファイルは `.gitignore` によりGit管理から除外されている（秘匿情報）。

*   **`.env.local.dev`**: ローカル開発用の URL/KEY 一式
*   **`.env.project-a`**: 法人Aの Vercel 設定値と同じ URL/KEY 一式
*   **`.env.project-b`**: 法人Bの Vercel 設定値と同じ URL/KEY 一式

---

## 4. 自動化コマンドリファレンス (`package.json`)

| コマンド | 役割 | 実行タイミング |
| :--- | :--- | :--- |
| `pnpm switch:local` | 開発環境へ切り替え | 日々の実装を開始する時 |
| `pnpm switch:a` | 法人A本番へ切り替え | 法人AのDBを更新する時 |
| `pnpm switch:b` | 法人B本番へ切り替え | 法人BのDBを更新する時 |
| `pnpm db:who` | **【重要】** 現在の接続先表示 | `db:push` を叩く直前に必ず実行 |
| `pnpm db:push` | DB構造の反映 | テーブルや関数を追加・変更した時 |
| `pnpm types:update` | 型定義(`database.ts`)更新 | DB構造変更後、コードに同期させる時 |

---

## 5. 標準的な作業フロー

### A. 新機能の開発とテスト
1.  `pnpm switch:local` を実行。
2.  `pnpm dev` で実装とテストを行う。

### B. 本番環境（法人AまたはB）への反映手順
※法人Bを例にします。法人Aでも手順は同一です。

1.  **ターゲット切り替え:**
    ```bash
    pnpm switch:b
    ```
2.  **指差し確認:**
    ```bash
    pnpm db:who
    # xnyjtcpwpmafbufsmezx と表示されることを確認
    ```
3.  **DB構造の同期（マイグレーション適用）:**
    ```bash
    pnpm db:push
    ```
4.  **プログラム型の同期:**
    ```bash
    pnpm types:update
    ```
5.  **GitHubへプッシュ:**
    ```bash
    git add .
    git commit -m "feat: 新機能の追加"
    git push origin main
    # 各法人のVercelが自動的にビルド・デプロイを開始する
    ```

---

## 6. 注意事項と「詰み」の回避策

### 🚨 ログインセッションの期限切れ
`switch` コマンドで `Access token not provided` と出た場合は、以下の手順で再認証すること。
1.  `supabase login` を実行。
2.  対象法人のSupabaseアカウントでブラウザログイン。
3.  再度 `switch` コマンドを実行。

### 🚨 データベースパスワードの紛失
`switch` 中に `Enter database password` と聞かれるパスワードは、Supabaseプロジェクト作成時に設定したものです。
*   忘れた場合は、Supabase Dashboard ＞ Settings ＞ Database ＞ Password から再設定（Reset）が可能です。

### 🚨 型定義の不整合
A法人とB法人のDB構造に「差」があると、一方のビルドが通り、もう一方が落ちる現象が起きます。
*   **対策:** 常に「最新のマイグレーションファイルを全ての環境（local, A, B）に `db:push` してから、最後に `types:update` を行う」という順序を厳守してください。

---