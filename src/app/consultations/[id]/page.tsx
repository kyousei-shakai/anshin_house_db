// src/app/consultations/[id]/page.tsx
import { notFound } from 'next/navigation'
import ConsultationDetailClientPage from './ConsultationDetailClientPage'
import ConsultationTimeline from '@/components/ConsultationTimeline'
import { getConsultationById } from '@/app/actions/consultations'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function ConsultationDetailPage() {
  // ★ 変更点: headers()の呼び出しにawaitを追加
  const headersList = await headers()
  const url = headersList.get('x-url') || ''
  const segments = new URL(url).pathname.split('/')
  const id = segments[segments.length - 1] || ''

  if (!id) {
    notFound()
  }

  const { success, data: consultation, error } = await getConsultationById(id)

  if (!success || !consultation) {
    console.error(`Failed to fetch consultation data for id: ${id}`, error)
    notFound()
  }

  return (
    <ConsultationDetailClientPage consultation={consultation}>
      <ConsultationTimeline consultationId={id} />
    </ConsultationDetailClientPage>
  )
}