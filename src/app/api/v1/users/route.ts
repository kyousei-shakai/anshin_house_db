import { NextRequest, NextResponse } from 'next/server';
import { usersApi } from '@/lib/api'; 

// ▼▼▼ 修正: 読み込む環境変数名を daily-log 側と統一 ▼▼▼
const API_SECRET_KEY = process.env.NEXT_PUBLIC_MASTER_DB_API_KEY;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');

  if (!API_SECRET_KEY || authHeader !== `Bearer ${API_SECRET_KEY}`) {
    // キーが見つからない、または一致しない場合
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await usersApi.getAll();
    const responseData = users.map(user => ({
      uid: user.uid,
      name: user.name,
    }));
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('API Error in /api/v1/users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}