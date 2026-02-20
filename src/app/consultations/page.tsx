// src/app/consultations/page.tsx
import { getConsultations } from '@/app/actions/consultations'
import { getStaffForSelection } from '@/app/actions/staff'
import ConsultationsClientPage from './ConsultationsClientPage'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

const ITEMS_PER_PAGE = 10;

export default async function ConsultationsPage() {
  
  const headersList = headers()
  const url = headersList.get('x-url') || ''
  const searchParams = new URL(url).searchParams
  const currentPage = Number(searchParams.get('page')) || 1

  const [consultationsResult, staffsResult] = await Promise.all([
    getConsultations({
      page: currentPage,
      itemsPerPage: ITEMS_PER_PAGE,
    }),
    getStaffForSelection(),
  ])

  // ▼▼▼【修正】statusCounts を受け取る ▼▼▼
  const { data: consultations, count, statusCounts, error: fetchError } = consultationsResult
  const { data: staffs, error: staffFetchError } = staffsResult

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  const combinedError = fetchError || staffFetchError || null

  return (
    <ConsultationsClientPage
      initialConsultations={consultations || []}
      staffs={staffs || []}
      totalPages={totalPages}
      currentPage={currentPage}
      // ▼▼▼【追加】集計データをクライアントへ渡す（なければ空オブジェクト） ▼▼▼
      statusCounts={statusCounts || {}}
      fetchError={combinedError}
    />
  )
}