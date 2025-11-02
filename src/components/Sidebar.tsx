// src/components/Sidebar.tsx (修正後・利用者一覧削除)

'use client'

import React from 'react'
import Link from 'next/link'

interface SidebarProps {
  onClose?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  
  const handleLinkClick = () => {
    if (onClose) {
      onClose()
    }
  }

  // ▼▼▼ 利用者一覧に関するロジックを全て削除 ▼▼▼
  /*
  const { users, loading, error, refreshUsers } = useUsers()
  const [searchTerm, setSearchTerm] = useState('')
  const filteredUsers = users.filter(...)
  if (loading) { ... }
  if (error) { ... }
  */

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* モバイル用ヘッダー */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">メニュー</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ナビゲーションメニュー */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <Link href="/" onClick={handleLinkClick} className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">ホーム</Link>
        <Link href="/users" onClick={handleLinkClick} className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">利用者名簿</Link>
        <Link href="/consultations" onClick={handleLinkClick} className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">相談履歴</Link>
        <Link href="/support-plans" onClick={handleLinkClick} className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">支援計画</Link>
        <Link href="/data-management" onClick={handleLinkClick} className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">データ管理</Link>
        
        <div className="pt-4 mt-4 border-t border-gray-200">
          <Link
            href="/consultations/new"
            onClick={handleLinkClick}
            className="block px-3 py-2 text-blue-600 font-semibold bg-blue-50 hover:bg-blue-100 rounded-md"
          >
            ＋ 新規相談を登録
          </Link>
        </div>
      </nav>

      {/* ▼▼▼ 利用者一覧関連のJSXを全て削除 ▼▼▼ */}
      
    </div>
  )
}

export default Sidebar