// src/components/Layout.tsx (修正後・サイドバー撤廃)

'use client'

import React from 'react'
// import Sidebar from './Sidebar' // 不要
import Header from './Header'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // ▼▼▼ サイドバーの状態管理ロジックを全て削除 ▼▼▼
  // const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ▼▼▼ サイドバー関連のdivとロジックを全て削除 ▼▼▼ */}
      <div className="flex flex-col min-h-screen">
        {/* HeaderからonMenuClickプロパティを削除 */}
        <Header />
        <main className="flex-1 p-3 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout