// src/app/support-plans/[id]/edit/page.tsx 
import { notFound } from 'next/navigation'
// import Link from 'next/link' ★ 修正点: 未使用の為コメントアウト
import Layout from '@/components/Layout'
import SupportPlanForm from '@/components/SupportPlanForm'
import { getSupportPlanById } from '@/app/actions/supportPlans'
import { getUsers } from '@/app/actions/users'

export const dynamic = 'force-dynamic'

interface SupportPlanEditPageProps {
  params: {
    id: string
  }
}

export default async function SupportPlanEditPage({ params }: SupportPlanEditPageProps) {
  // ★ 変更点: Next.js v15の警告を回避する、より安全なアクセス方法に変更
  const id = params?.id ?? ''

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