// src/app/consultations/page.tsx
import { getConsultations } from '@/app/actions/consultations'
import { getStaffForSelection } from '@/app/actions/staff'
import ConsultationsClientPage from './ConsultationsClientPage'

// Next.js App Router の標準的な型定義
type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export const dynamic = 'force-dynamic'

const ITEMS_PER_PAGE = 100;

// searchParams をプロップスとして直接受け取る形に修正（これが標準です）
export default async function ConsultationsPage({ searchParams }: PageProps) {
  
  // URLパラメータから直接値を取得
  const currentPage = Number(searchParams.page) || 1
  const searchTerm = (searchParams.q as string) || ''

  // サーバーアクションの呼び出し
  const [consultationsResult, staffsResult] = await Promise.all([
    getConsultations({
      page: currentPage,
      itemsPerPage: ITEMS_PER_PAGE,
      searchTerm: searchTerm, // ここでキーワードがバックエンドへ流れる
    }),
    getStaffForSelection(),
  ])

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
      statusCounts={statusCounts || {}}
      fetchError={combinedError}
    />
  )
}
