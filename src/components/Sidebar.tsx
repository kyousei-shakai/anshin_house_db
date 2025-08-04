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
      <div className="w-80 bg-white border-r border-gray-200 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
          <Link href="/" onClick={handleUserClick} className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">ホーム</Link>
          <Link href="/consultations" onClick={handleUserClick} className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">相談履歴</Link>
          <Link href="/consultations/new" onClick={handleUserClick} className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">新規相談</Link>
          <Link href="/support-plans" onClick={handleUserClick} className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">支援計画</Link>
          <Link href="/data-management" onClick={handleUserClick} className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">データ管理</Link>
        </nav>
      </div>

      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">利用者名簿</h2>
        
        <div className="relative mb-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
          </div>
          <input
            type="text"
            placeholder="名前またはUIDで検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          />
        </div>

        <Link
          href="/users/new"
          onClick={handleUserClick}
          className="inline-flex w-full items-center justify-center gap-x-2 rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <svg className="-ml-0.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          新規利用者追加
        </Link>
      </div>
      
      <div className="border-b border-gray-200 px-4 py-2">
         <div className="text-xs text-gray-500">
          {filteredUsers.length} / {users.length} 件表示
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            {searchTerm ? '該当する利用者が見つかりません' : '利用者が登録されていません'}
          </div>
        ) : (
          <nav>
            <ul role="list" className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <li key={user.id}>
                  {/* ▼▼▼▼▼▼▼▼▼▼ ここが修正点 ▼▼▼▼▼▼▼▼▼▼ */}
                  <Link
                    href={`/users/${user.uid}`}
                    onClick={handleUserClick}
                    className="block px-4 py-3 transition-colors hover:bg-gray-50"
                  >
                  {/* ▲▲▲▲▲▲▲▲▲▲ ここが修正点 ▲▲▲▲▲▲▲▲▲▲ */}
                    <p className="text-gray-900 truncate">
                      {user.name}
                    </p>
                    <div className="mt-1 flex items-center gap-x-2 text-xs text-gray-500">
                        <p className="truncate">UID: {user.uid}</p>
                        {user.birth_date && (
                           <>
                            <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current"><circle cx={1} cy={1} r={1} /></svg>
                            <p className="truncate">
                                {new Date(user.birth_date).toLocaleDateString('ja-JP')}
                            </p>
                           </>
                        )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={refreshUsers}
          className="inline-flex w-full items-center justify-center gap-x-2 rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          <svg className="-ml-0.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201-4.42 5.5 5.5 0 017.423-5.223a.75.75 0 01.926.386a5.5 5.5 0 01-4.735 9.257a.75.75 0 01.386-.926a4 4 0 003.199-6.724a.75.75 0 01-1.25-.615A5.5 5.5 0 0115.312 11.424zM6.25 7.5a.75.75 0 01.75-.75h3.5a.75.75 0 010 1.5h-3.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            <path d="M8.016 13.344a.75.75 0 01.386.926A5.503 5.503 0 016.92 18.25a.75.75 0 01-.926-.386a4 4 0 00-3.199-6.724a.75.75 0 011.25.615A5.503 5.503 0 018.016 13.344z" />
          </svg>
          リストを更新
        </button>
      </div>
    </div>
  )
}

export default Sidebar