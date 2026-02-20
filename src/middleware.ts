//src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // 1. 環境変数の優先取得（安全なサーバーサイド専用を優先）
  const authSecret = process.env.AUTH_SECRET
  const masterApiKey = process.env.MASTER_DB_API_KEY || process.env.NEXT_PUBLIC_MASTER_DB_API_KEY
  
  const { pathname } = req.nextUrl
  const authToken = req.cookies.get('auth-token')?.value
  const authHeader = req.headers.get('Authorization')

  // 2. 基本ヘッダー設定 (MAINTENANCE.mdの要件を維持)
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-url', req.url)

  // 3. セーフティガード
  if (!authSecret) {
    console.warn('警告: AUTH_SECRET が設定されていません。')
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // 4. 無条件通過パス（ログイン画面、認証API、静的ファイル等）
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  // 5. 【最適化】Daily Log 連携専用のバイパスロジック
  if (pathname.startsWith('/api/v1/users')) {
    // Bearerトークンの完全一致チェック
    if (authHeader === `Bearer ${masterApiKey}`) {
      return NextResponse.next({ request: { headers: requestHeaders } })
    }

    // APIキーが不正な場合、ログイン画面へリダイレクトせず、直接401 JSONを返す
    // これにより Daily Log 側で HTML をパースしてエラーになるのを防ぎます
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized: Invalid or missing API Key' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 6. 既存のクッキー認証（一般スタッフのブラウザ操作を保護）
  if (authToken !== authSecret) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}