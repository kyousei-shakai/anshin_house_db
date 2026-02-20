// anshinhousedb: src/app/api/v1/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * 【最高峰のセキュリティ設計】
 * 1. APIキーの検証は自前で行う
 * 2. DBアクセスには Service Role Key を使用し、RLS設定に関わらず同期を確実にする
 */
const API_SECRET_KEY = process.env.MASTER_DB_API_KEY || process.env.NEXT_PUBLIC_MASTER_DB_API_KEY;

// 管理者権限を持つSupabaseクライアント
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  // 1. Authorizationヘッダーの取得
  const authHeader = request.headers.get('Authorization');

  // 2. 厳格な認証チェック
  if (!API_SECRET_KEY || authHeader !== `Bearer ${API_SECRET_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 3. 全利用者データを抽出
    // ※今後、特定のステータスのみを同期したい場合はここで .eq('status', '利用中') を追加可能
    const { data: users, error: dbError } = await supabaseAdmin
      .from('users')
      .select('id, name') 
      .order('name', { ascending: true });

    if (dbError) throw dbError;

    // 4. Daily Log 側が期待するデータ構造 (uid, name) にマッピング
    // anshinhousedbの 'id' を Daily Log の 'master_uid' として渡す
    const responseData = (users || []).map((user: any) => ({
      uid: user.id,
      name: user.name,
    }));

    // 5. JSON形式で返却（キャッシュを回避し常に最新を保証）
    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });

  } catch (error) {
    console.error('[Master DB API Error]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: String(error) }, 
      { status: 500 }
    );
  }
}

// Next.js 14 における動的実行の強制
export const dynamic = 'force-dynamic';