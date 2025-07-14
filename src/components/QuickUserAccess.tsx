'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useUsers } from '@/hooks/useUsers'

const QuickUserAccess: React.FC = () => {
  const { users, loading } = useUsers()
  const [searchTerm, setSearchTerm] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.uid.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5) // 最大5件表示

  const recentUsers = users.slice(0, 3) // 最新の3件

  // クリックアウトサイドで検索を閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        if (isExpanded) {
          setIsExpanded(false)
          setSearchTerm('')
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded])

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">利用者名簿</h2>
        <div className="flex items-center space-x-2">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            {users.length}名
          </span>
          <Link 
            href="/users/new"
            className="bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-blue-700"
          >
            新規追加
          </Link>
        </div>
      </div>

      {/* 検索バー */}
      <div ref={searchRef} className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="利用者名またはUIDで検索..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setIsExpanded(e.target.value.length > 0)
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('')
                setIsExpanded(false)
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 検索結果または最近の利用者 */}
      {loading ? (
        <div className="text-center py-4 text-gray-500 text-sm">読み込み中...</div>
      ) : (
        <div className="space-y-2">
          {isExpanded && searchTerm ? (
            // 検索結果
            <>
              {filteredUsers.length > 0 ? (
                <>
                  {filteredUsers.map((user) => (
                    <Link
                      key={user.id}
                      href={`/users/${user.id}`}
                      className="block p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                          <div className="text-xs text-gray-500">UID: {user.uid}</div>
                        </div>
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                  {users.filter(user =>
                    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.uid.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length > 5 && (
                    <div className="text-center py-2">
                      <Link 
                        href="/users"
                        className="text-blue-600 text-xs hover:text-blue-800"
                      >
                        さらに表示...
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  該当する利用者が見つかりません
                </div>
              )}
            </>
          ) : (
            // 最近の利用者
            <>
              <div className="text-xs text-gray-500 mb-2">最近追加された利用者</div>
              {recentUsers.length > 0 ? (
                <>
                  {recentUsers.map((user) => (
                    <Link
                      key={user.id}
                      href={`/users/${user.id}`}
                      className="block p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                          <div className="text-xs text-gray-500">UID: {user.uid}</div>
                        </div>
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                  <div className="text-center pt-2">
                    <Link 
                      href="/users"
                      className="text-blue-600 text-sm hover:text-blue-800 font-medium"
                    >
                      すべての利用者を見る →
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  利用者が登録されていません
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default QuickUserAccess