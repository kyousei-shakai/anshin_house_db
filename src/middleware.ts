//src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // 環境変数から合言葉を取得
  const authSecret = process.env.AUTH_SECRET
  // リクエストからクッキーを取得
  const authToken = req.cookies.get('auth-token')?.value

  // アクセスしようとしているページのURLを取得
  const { pathname } = req.nextUrl

  // 環境変数が設定されていない場合は、エラーページに飛ばすか、何もしない
  // ここでは開発のしやすさを考慮し、コンソールに警告を出すに留める
  if (!authSecret) {
    console.warn(
      '警告: 環境変数 AUTH_SECRET が設定されていません。認証ミドルウェアは機能しません。'
    )
    return NextResponse.next()
  }
  
  // ★ 変更点: Next.js v15のparams警告を回避するため、リクエストURLをヘッダーに設定
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-url', req.url)

  // ログインページへのアクセスは常に許可する
  if (pathname.startsWith('/login')) {
    // ★ 変更点: ヘッダーを付けてレスポンスを返す
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  
  // APIルートへのアクセスも、ログインページからの通信は許可する必要がある
  if (pathname.startsWith('/api/auth')) {
    // ★ 変更点: ヘッダーを付けてレスポンスを返す
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }
  
  // クッキーの合言葉と環境変数の合言葉が一致しない場合
  if (authToken !== authSecret) {
    // ログインページにリダイレクトする
    // 元々アクセスしようとしていたページをクエリパラメータとして保持する
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // 全てのチェックをパスした場合、要求されたページへのアクセスを許可する
  // ★ 変更点: ヘッダーを付けてレスポンスを返す
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

// このミドルウェアがどのパスで実行されるかを設定
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}