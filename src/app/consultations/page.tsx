// src/app/consultations/page.tsx
import { getConsultations } from '@/app/actions/consultations'
import ConsultationsClientPage from './ConsultationsClientPage'
import { headers } from 'next/headers' // ★ 変更点: headersをインポート

export const dynamic = 'force-dynamic'

const ITEMS_PER_PAGE = 20;

// ★ 変更点: propsからsearchParamsを受け取らない
export default async function ConsultationsPage() {
  
  // ★ 変更点: headers()を使ってURLからページ番号を安全に抽出
  const headersList = await headers()
  const url = headersList.get('x-url') || ''
  const searchParams = new URL(url).searchParams
  const currentPage = Number(searchParams.get('page')) || 1

  const { data: consultations, count, error: fetchError } = await getConsultations({
    page: currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  return (
    <ConsultationsClientPage
      initialConsultations={consultations || []}
      totalPages={totalPages}
      currentPage={currentPage}
      fetchError={fetchError || null}
    />
  )
}