// src/app/api/auth/route.ts
import { NextResponse } from 'next/server'
// import { cookies } from 'next/headers' // ★ 変更点 1: この行を削除
import type { NextRequest } from 'next/server'

// 'export default' ではなく、'export async function POST' に変更
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()

    // 環境変数から合言葉を取得
    const authSecret = process.env.AUTH_SECRET

    if (!authSecret) {
      console.error('AUTH_SECRET is not set in .env.local')
      return NextResponse.json(
        { error: 'サーバー設定エラー' },
        { status: 500 }
      )
    }

    if (password === authSecret) {
      // 成功した場合、クッキーを設定して成功レスポンスを返す
      // Next.js 13以降では、レスポンスオブジェクトを作成してからクッキーを設定する
      const response = NextResponse.json({ success: true })
      response.cookies.set({
        name: 'auth-token',
        value: authSecret,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7日間
      })
      return response
    } else {
      // 失敗した場合
      return NextResponse.json(
        { error: '合言葉が正しくありません。' },
        { status: 401 }
      )
    }
  } catch { // ★ 変更点 2: (err) を削除
    return NextResponse.json({ error: '不正なリクエストです。' }, { status: 400 })
  }
}