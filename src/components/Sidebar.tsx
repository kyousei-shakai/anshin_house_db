'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useUsers } from '@/hooks/useUsers'

interface SidebarProps {
  onClose?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { users, loading, error, refreshUsers } = useUsers()
  const [searchTerm, setSearchTerm] = useState('')
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.uid.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUserClick = () => {
    if (onClose) {
      onClose()
    }
  }

  if (loading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 p-4">
        <div className="text-center">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 p-4">
        <div className="text-red-500 text-center">エラー: {error}</div>
      </div>
    )
  }

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

      {/* モバイル用ナビゲーション */}
      <div className="lg:hidden border-b border-gray-200">
        <nav className="p-4 space-y-2">
          <Link href="/" onClick={handleUserClick} className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
            ホーム
          </Link>
          <Link href="/consultations" onClick={handleUserClick} className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
            相談履歴
          </Link>
          <Link href="/consultations/new" onClick={handleUserClick} className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
            新規相談
          </Link>
          <Link href="/support-plans" onClick={handleUserClick} className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
            支援計画
          </Link>
          <Link href="/data-management" onClick={handleUserClick} className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
            データ管理
          </Link>
        </nav>
      </div>

      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">利用者名簿</h2>
        
        {/* 検索バー */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="名前またはUIDで検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 新規追加ボタン */}
        <Link
          href="/users/new"
          onClick={handleUserClick}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 text-center block"
        >
          新規利用者追加
        </Link>

        {/* 件数表示 */}
        <div className="text-sm text-gray-600">
          {filteredUsers.length} / {users.length} 件表示
        </div>
      </div>

      {/* 利用者一覧 */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? '該当する利用者が見つかりません' : '利用者が登録されていません'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <li key={user.id}>
                <Link
                  href={`/users/${user.id}`}
                  onClick={handleUserClick}
                  className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">UID: {user.uid}</div>
                    {user.birth_date && (
                      <div className="text-sm text-gray-500">
                        生年月日: {new Date(user.birth_date).toLocaleDateString('ja-JP')}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 更新ボタン */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={refreshUsers}
          className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          更新
        </button>
      </div>

    </div>
  )
}

export default Sidebar