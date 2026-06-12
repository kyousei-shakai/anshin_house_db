//src/app/settings/categories/page.tsx
import React from 'react'
import Layout from '@/components/Layout'
import CategoryManagement from '@/components/support/CategoryManagement'
import { getAllSupportCategories } from '@/app/actions/support'

export const dynamic = 'force-dynamic'

export default async function CategorySettingsPage() {
  // すべてのカテゴリ（非表示含む）を取得
  const result = await getAllSupportCategories()

  if (result.error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6 text-red-600 bg-red-50 rounded-lg border border-red-200">
          データの取得に失敗しました。{result.error}
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* コンポーネントを呼び出す */}
        <CategoryManagement initialCategories={result.data || []} />
      </div>
    </Layout>
  )
}