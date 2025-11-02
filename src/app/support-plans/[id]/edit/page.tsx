// src/app/support-plans/[id]/edit/page.tsx 
import { notFound } from 'next/navigation'
import Layout from '@/components/Layout'
import SupportPlanForm from '@/components/SupportPlanForm'
import { getSupportPlanById } from '@/app/actions/supportPlans'
import { getUsers } from '@/app/actions/users'

export const dynamic = 'force-dynamic'

// ▼▼▼ ここからが修正箇所です ▼▼▼

// Next.js v15のビルドシステムと開発サーバーの両方の要求を満たすため、
// paramsの型を Promise として明示的に定義します。
export default async function SupportPlanEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Promiseとして型定義したため、await は型エラーを起こしません。
  const resolvedParams = await params;
  const id = resolvedParams.id ?? '';

// ▲▲▲ ここまでが修正箇所です ▲▲▲

  const [planResult, usersResult] = await Promise.all([
    getSupportPlanById(id),
    getUsers()
  ])

  const { data: supportPlan } = planResult
  const { data: users } = usersResult

  if (!supportPlan || !users) {
    notFound()
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">支援計画の編集</h1>
        </div>

        <SupportPlanForm
          editMode={true}
          supportPlan={supportPlan}
          users={users}
        />
      </div>
    </Layout>
  )
}