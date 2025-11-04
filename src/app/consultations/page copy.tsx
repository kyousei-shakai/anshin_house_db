//src/app/consultations/page.tsx
import { getConsultations } from '@/app/actions/consultations'
// --- ▼ 追加 ▼ ---
import { getStaffForSelection } from '@/app/actions/staff'
// --- ▲ 追加 ▲ ---
import ConsultationsClientPage from './ConsultationsClientPage'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

// --- ▼ 変更 ▼ ---
const ITEMS_PER_PAGE = 100;
// --- ▲ 変更 ▲ ---

export default async function ConsultationsPage() {
  
  const headersList = headers()
  const url = headersList.get('x-url') || ''
  const searchParams = new URL(url).searchParams
  const currentPage = Number(searchParams.get('page')) || 1

  // --- ▼ 変更: スタッフ一覧も並行して取得 ▼ ---
  const [consultationsResult, staffsResult] = await Promise.all([
    getConsultations({
      page: currentPage,
      itemsPerPage: ITEMS_PER_PAGE,
    }),
    getStaffForSelection(),
  ])

  const { data: consultations, count, error: fetchError } = consultationsResult
  const { data: staffs, error: staffFetchError } = staffsResult
  // --- ▲ 変更 ▲ ---

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  // エラーハンドリングを統合
  const combinedError = fetchError || staffFetchError || null

  return (
    <ConsultationsClientPage
      initialConsultations={consultations || []}
      // --- ▼ 追加 ▼ ---
      staffs={staffs || []}
      // --- ▲ 追加 ▲ ---
      totalPages={totalPages}
      currentPage={currentPage}
      fetchError={combinedError}
    />
  )
}