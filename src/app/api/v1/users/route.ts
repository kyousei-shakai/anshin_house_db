import { NextRequest, NextResponse } from 'next/server';
import { usersApi } from '@/lib/api'; 

const API_SECRET_KEY = process.env.API_SECRET_KEY;

// ▼▼▼ 許可するオリジン（リクエスト元）のリストを定義 ▼▼▼
// 開発環境と本番環境の両方を許可します
const allowedOrigins = [
  'http://localhost:3000',
  'https://anshin-house-daily-log.vercel.app'
];

export async function GET(request: NextRequest) {
  // ▼▼▼ CORSチェックを追加 ▼▼▼
  const origin = request.headers.get('origin');
  if (!origin || !allowedOrigins.includes(origin)) {
    // 許可されていないオリジンからのリクエストは、ここではエラーにせず、
    // 後続の処理（認証チェックなど）に任せても良いですが、
    // 明示的に拒否する場合は以下のようにします。
    // return new NextResponse(null, { status: 403, statusText: "Forbidden" });
  }

  // 1. セキュリティチェック
  const authHeader = request.headers.get('Authorization');
  if (!API_SECRET_KEY || authHeader !== `Bearer ${API_SECRET_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 3. 認証成功の場合
    const users = await usersApi.getAll();
    const responseData = users.map(user => ({
      uid: user.uid,
      name: user.name,
    }));

    // ▼▼▼ 成功時のレスポンスにCORSヘッダーを追加 ▼▼▼
    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin || '*', // 動的にオリジンを設定
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('API Error in /api/v1/users:', error);
    // ▼▼▼ エラー時のレスポンスにもCORSヘッダーを追加 ▼▼▼
    return NextResponse.json({ error: 'Internal Server Error' }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
}

// ▼▼▼ プリフライトリクエスト用のOPTIONSメソッドを追加 ▼▼▼
// ブラウザは、実際のGETリクエストの前に、このAPIが安全かどうかを確認するための
// OPTIONSリクエストを送信します。これに正しく応答することがCORS成功の鍵です。
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && allowedOrigins.includes(origin)) {
    return new NextResponse(null, {
      status: 204, // No Content
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
  // 許可されていないオリジンの場合は何も返さない
  return new NextResponse(null, { status: 204 });
}