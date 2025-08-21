import { NextRequest, NextResponse } from 'next/server';
import { usersApi } from '@/lib/api'; // あなたが提示したapi.tsをインポート

// APIのシークレットキーを環境変数から取得
const API_SECRET_KEY = process.env.API_SECRET_KEY;

export async function GET(request: NextRequest) {
  // 1. セキュリティチェック：リクエストヘッダーから認証情報を取得
  const authHeader = request.headers.get('Authorization');

  // 2. 認証情報が存在し、かつ正しいキーであるか検証
  if (!API_SECRET_KEY || authHeader !== `Bearer ${API_SECRET_KEY}`) {
    // 認証失敗の場合は401 Unauthorizedエラーを返す
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 3. 認証成功の場合、既存のAPIロジックを使って全利用者を取得
    const users = await usersApi.getAll();

    // 4. API-Aの仕様に従い、必要な情報（uidとname）だけを抽出して返す
    const responseData = users.map(user => ({
      uid: user.uid,
      name: user.name,
    }));

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('API Error in /api/v1/users:', error);
    // 5. サーバー内部でエラーが発生した場合は500エラーを返す
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
