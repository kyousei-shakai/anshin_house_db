// src/app/data-management/page.tsx

import Link from 'next/link'
import Layout from '@/components/Layout'
import DataManagement from '@/components/DataManagement'
import { getAllUsersForExport } from '@/app/actions/users'
import { getAllConsultationsForExport } from '@/app/actions/consultations'
import { getAllSupportPlansForExport } from '@/app/actions/supportPlans'
// ▼▼▼ 【追加】担当者取得のServer Actionをインポート ▼▼▼
import { getStaffForSelection } from '@/app/actions/staff'

export const dynamic = 'force-dynamic'

export default async function DataManagementPage() {
  // ▼▼▼ Promise.allに担当者取得を追加 ▼▼▼
  const [
    usersResult,
    consultationsResult,
    supportPlansResult,
    staffResult // 【追加】
  ] = await Promise.all([
    getAllUsersForExport(),
    getAllConsultationsForExport(),
    getAllSupportPlansForExport(),
    getStaffForSelection() // 【追加】
  ]);
  return (
    <Layout>
      {/* ★ 修正: 黄金のコンテナ・ルールを適用し、パンくずの開始位置を統一 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">データ管理</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* ★ 修正: 枠を画面端まで広げ(-mx-4)、内側余白を標準化(p-4 sm:p-6) */}
        <div className="bg-white -mx-4 sm:mx-0 border-y sm:border border-gray-200 sm:rounded-lg sm:shadow-md p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">データ管理</h1>
            <p className="text-gray-600">
              特定の内容を指定して、データエクエルファイルとしてダウンロードできます。
            </p>
          </div>

           {/* ▼▼▼ 取得したデータをpropsで渡す (既存維持) ▼▼▼ */}
          <DataManagement
            initialUsers={usersResult.data || []}
            initialConsultations={consultationsResult.data || []}
            initialSupportPlans={supportPlansResult.data || []}
            // ▼▼▼ 【追加】取得したスタッフリストをpropsで渡す ▼▼▼
            staffList={staffResult.success ? (staffResult.data || []) : []}
          />
        </div>
      </div>
    </Layout>
  )
}