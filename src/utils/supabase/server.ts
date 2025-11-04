// utils/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type Database } from '@/types/database'

// @supabase/ssr@0.3.0 + Next.js 14 環境における標準的な実装
export async function createClient() {
  // cookies()はPromiseを返すため、ここでは直接呼び出す
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // try-catchは非同期コンテキストで必要
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Componentsでのsetエラーは無視できる場合がある
          }
        },
        remove(name: string, options: CookieOptions) {
          // try-catchは非同期コンテキストで必要
          try {
             cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Componentsでのremoveエラーは無視できる場合がある
          }
        },
      },
    }
  )
}