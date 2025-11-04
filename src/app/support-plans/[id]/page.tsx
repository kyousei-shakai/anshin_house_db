// src/app/support-plans/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/Layout'
import SupportPlanDetail from '@/components/SupportPlanDetail'
import { getSupportPlanById } from '@/app/actions/supportPlans'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

// ▼▼▼ 目次コンポーネントを新設 ▼▼▼
const TableOfContents = ({ sections }: { sections: { id: string; title: string }[] }) => (
    <aside className="sticky top-24 h-full hidden lg:block">
      <h3 className="text-base font-semibold leading-6 text-gray-900">目次</h3>
      <nav className="mt-4">
        <ul className="space-y-3">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md p-2 block text-sm font-medium transition-colors"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )

export default async function SupportPlanDetailPage() {
  // データ取得ロジックは一切変更ありません
  const headersList = await headers()
  const url = headersList.get('x-url') || ''
  const segments = new URL(url).pathname.split('/')
  const id = segments[segments.length - 1] || ''

  if (!id) {
    notFound()
  }

  const { success, data: supportPlan } = await getSupportPlanById(id)

  if (!success || !supportPlan) {
    notFound()
  }
  
  // ▼▼▼ 目次の項目リストをsupportPlanのデータに基づいて定義 ▼▼▼
  const sections = [
    { id: 'section-1', title: '1. 基本情報' },
    { id: 'section-2', title: '2. 生活保護・介護保険' },
    { id: 'section-3', title: '3. 医療状況' },
  ];

  // 「障がい状況」セクションはデータが存在する場合のみ目次に追加
  if (supportPlan.physical_disability_level || supportPlan.mental_disability_level || supportPlan.therapy_certificate_level) {
    sections.push({ id: 'section-4', title: '4. 障がい状況' });
  }

  sections.push(
    { id: 'section-5', title: '5. 年金状況' },
    { id: 'section-6', title: '6. 生活支援サービス' },
    { id: 'section-7', title: '7. 支援計画' },
    { id: 'section-8', title: '8. 個別避難計画' },
    { id: 'section-9', title: 'システム情報' }
  );
  
  return (
    <Layout>
      {/* ▼▼▼ ここからレイアウト構造を全面的に統一 ▼▼▼ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 text-sm text-gray-600">
              <li>
                <Link href="/support-plans" className="block transition hover:text-gray-700"> 支援計画 </Link>
              </li>
              <li className="rtl:rotate-180">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </li>
              <li>
                <span className="block transition text-gray-700 font-medium"> 計画詳細 </span>
              </li>
            </ol>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-12">
          <div className="lg:col-span-1">
            <TableOfContents sections={sections} />
          </div>

          <div className="lg:col-span-3">
            <SupportPlanDetail supportPlan={supportPlan} />
          </div>
        </div>
      </div>
    </Layout>
  )
}