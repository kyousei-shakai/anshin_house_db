'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useUsers } from '@/hooks/useUsers'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  onMenuClick: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { users } = useUsers()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearchResults, setShowSearchResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.uid.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5)

  // ▼▼▼▼▼▼▼▼▼▼ ここが修正点 ▼▼▼▼▼▼▼▼▼▼
  const handleUserClick = (userUid: string) => { // 引数を userUid に変更
    setSearchTerm('')
    setShowSearchResults(false)
    router.push(`/users/${userUid}`) // 遷移先を userUid を使って生成
  }
  // ▲▲▲▲▲▲▲▲▲▲ ここが修正点 ▲▲▲▲▲▲▲▲▲▲

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 px-3 md:px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3 md:space-x-6">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">
            居住支援管理システム
          </h1>
          
          <nav className="hidden md:flex space-x-2 lg:space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium">
              ホーム
            </Link>
            <Link href="/consultations" className="text-gray-600 hover:text-gray-900 px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium">
              相談履歴
            </Link>
            <Link href="/consultations/new" className="text-gray-600 hover:text-gray-900 px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium">
              新規相談
            </Link>
            <Link href="/support-plans" className="text-gray-600 hover:text-gray-900 px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium">
              支援計画
            </Link>
            <Link href="/data-management" className="text-gray-600 hover:text-gray-900 px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium">
              データ管理
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <div ref={searchRef} className="relative md:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="利用者検索"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowSearchResults(e.target.value.length > 0)
                }}
                onFocus={() => setShowSearchResults(searchTerm.length > 0)}
                className="w-32 pl-8 pr-3 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {showSearchResults && searchTerm && (
              <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  <>
                    {filteredUsers.map((user) => (
                      // ▼▼▼▼▼▼▼▼▼▼ ここが修正点 ▼▼▼▼▼▼▼▼▼▼
                      <button
                        key={user.id}
                        onClick={() => handleUserClick(user.uid)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                      {/* ▲▲▲▲▲▲▲▲▲▲ ここが修正点 ▲▲▲▲▲▲▲▲▲▲ */}
                        <div className="font-medium text-gray-900 text-sm">{user.name}</div>
                        <div className="text-xs text-gray-500">UID: {user.uid}</div>
                      </button>
                    ))}
                    <Link
                      href="/users"
                      onClick={() => {
                        setSearchTerm('')
                        setShowSearchResults(false)
                      }}
                      className="block w-full text-center px-3 py-2 text-blue-600 hover:bg-gray-50 text-xs"
                    >
                      すべて見る
                    </Link>
                  </>
                ) : (
                  <div className="px-3 py-2 text-gray-500 text-xs text-center">
                    該当する利用者が見つかりません
                  </div>
                )}
              </div>
            )}
          </div>

          <Link 
            href="/users"
            className="hidden md:block text-gray-600 hover:text-gray-900 px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium"
          >
            利用者名簿
          </Link>

        </div>
      </div>
    </header>
  )
}

export default Header