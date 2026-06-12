// src/components/support/SupportRecordTab.tsx

import React from 'react'
import { getDailySupportLogs, getSupportCategories, getOpenSupportTasks } from '@/app/actions/support'
import { getStaffForSelection } from '@/app/actions/staff'
import SupportActionButtons from './SupportActionButtons'
import SupportRecordTimeline from './SupportRecordTimeline'
import SupportTaskList from './SupportTaskList'

type Props = {
  userId: string
}

export default async function SupportRecordTab({ userId }: Props) {
  const [logsResult, tasksResult, categoriesResult, staffsResult] = await Promise.all([
    getDailySupportLogs(userId),
    getOpenSupportTasks(userId),
    getSupportCategories(),
    getStaffForSelection()
  ])

  if (logsResult.error || tasksResult.error || categoriesResult.error || staffsResult.error) {
    return <div className="p-4 bg-red-50 text-red-600 text-sm">データの読み込みに失敗しました。</div>
  }

  const logs = logsResult.data || []
  const tasks = tasksResult.data || []
  const categories = categoriesResult.data || []
  const staffs = staffsResult.data || []

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      
      {/* 1. アクションバー（入力の司令塔） */}
      <section>
        <SupportActionButtons userId={userId} categories={categories} staffs={staffs} />
      </section>

      {/* 2. これからの予定 */}
      <section>
        <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            これからの予定
          </h3>
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
            {tasks.length} 件
          </span>
        </div>
        <SupportTaskList userId={userId} tasks={tasks} staffs={staffs} categories={categories} />
      </section>

      {/* 3. 支援履歴 */}
      <section>
        <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
             <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            過去の支援履歴
          </h3>
          <span className="text-sm text-gray-500">
            全 {logs.length} 件
          </span>
        </div>
        <SupportRecordTimeline logs={logs} />
      </section>

    </div>
  )
}