import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // この設定を、/api/ で始まる全てのパスに適用します。
        // 例: /api/v1/users, /api/v1/consultations など
        source: "/api/:path*",
        headers: [
          // どのオリジン(サイト)からのアクセスを許可するかを指定します。
          // ローカル開発環境では、daily-logが動いている http://localhost:3000 を許可します。
          // 本番環境にデプロイする際は、ここを本番のdaily-logのURLに変更する必要があります。
          // 例: "https://anshin-house-daily-log.vercel.app"
          { 
            key: "Access-Control-Allow-Origin", 
            value: "http://localhost:3000" 
          },

          // 許可するHTTPメソッドの種類を指定します。
          // GET(取得), POST(作成), PUT(更新), DELETE(削除), OPTIONS(事前確認)
          { 
            key: "Access-Control-Allow-Methods", 
            value: "GET, POST, PUT, DELETE, OPTIONS" 
          },

          // リクエストに含めても良いヘッダーの種類を指定します。
          // Authorizationヘッダー(APIキー用)とContent-Typeヘッダー(JSONデータ用)を許可します。
          { 
            key: "Access-Control-Allow-Headers", 
            value: "Content-Type, Authorization" 
          },
        ],
      },
    ];
  },
};

export default nextConfig;