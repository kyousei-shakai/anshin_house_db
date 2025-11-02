// src/app/users/[uid]/page.tsx

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Layout from '@/components/Layout'
import UserDetailTabs from '@/components/UserDetailTabs'
import { getUserByUid } from '@/app/actions/users'
import { getConsultationsByUserId } from '@/app/actions/consultations'
import { getSupportPlansByUserId } from '@/app/actions/supportPlans'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function UserDetailPage() {
  // ★ 変更点: headers()の呼び出しをawaitする
  const headersList = await headers()
  const url = headersList.get('x-url') || ''
  const segments = new URL(url).pathname.split('/')
  const uid = segments[segments.length - 1] || ''

  if (!uid) {
    notFound()
  }

  const userResult = await getUserByUid(uid);
  
  if (!userResult.success || !userResult.data) {
    notFound()
  }
  const user = userResult.data;

  const [consultationsResult, supportPlansResult] = await Promise.all([
    getConsultationsByUserId(user.id),
    getSupportPlansByUserId(user.id)
  ]);
  
  const consultations = consultationsResult.data || [];
  const supportPlans = supportPlansResult.data || [];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                  ホーム
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                  </svg>
                  <Link href="/users" className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
                    利用者一覧
                  </Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{user.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
        
        <UserDetailTabs 
          user={user} 
          consultations={consultations} 
          supportPlans={supportPlans} 
        />
      </div>
    </Layout>
  )
}