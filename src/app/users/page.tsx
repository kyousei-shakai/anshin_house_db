// src/app/users/page.tsx

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { useUsers } from '@/hooks/useUsers'
import { calculateAge } from '@/utils/date' // ★★★ インポートを追加 ★★★

const UsersPage: React.FC = () => {
  const { users, loading, error } = useUsers()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'uid'>('name')

  const filteredAndSortedUsers = users
    .filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.property_address?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'uid':
          return a.uid.localeCompare(b.uid)
        default:
          return 0
      }
    })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-500 text-sm">
            エラーが発生しました: {error}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">利用者名簿</h1>
            <p className="text-gray-600 text-sm mt-1">
              {filteredAndSortedUsers.length} / {users.length} 名表示
            </p>
          </div>
          <Link
            href="/users/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          >
            新規利用者追加
          </Link>
        </div>

        {/* 検索・フィルタ */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                検索
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="氏名、UID、住所で検索..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                並び順
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'created_at' | 'uid')}
                className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">氏名順</option>
                <option value="created_at">登録日順</option>
                <option value="uid">UID順</option>
              </select>
            </div>
          </div>
        </div>

        {/* 利用者一覧 */}
        {filteredAndSortedUsers.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="text-gray-500 text-lg mb-2">
              {searchTerm ? '該当する利用者が見つかりません' : '利用者が登録されていません'}
            </div>
            <p className="text-gray-400">
              {searchTerm ? '検索条件を変更して再度お試しください。' : '新しい利用者を登録してください。'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedUsers.map((user) => {
              // ★★★ 動的に年齢を計算 ★★★
              const age = calculateAge(user.birth_date);
              return (
                <Link
                  key={user.id}
                  href={`/users/${user.id}`}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{user.name}</h3>
                      <p className="text-sm text-gray-500">UID: {user.uid}</p>
                    </div>
                    <div className="ml-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {user.birth_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">生年月日:</span>
                        <span className="text-gray-700">{formatDate(user.birth_date)}</span>
                      </div>
                    )}
                    
                    {/* ★★★ user.age を計算した age に置き換え ★★★ */}
                    {age !== null && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">年齢:</span>
                        <span className="text-gray-700">{age}歳</span>
                      </div>
                    )}
                    
                    {user.property_address && (
                      <div>
                        <span className="text-gray-500">住所:</span>
                        <p className="text-gray-700 text-xs mt-1 line-clamp-2">{user.property_address}</p>
                      </div>
                    )}
                    
                    {user.resident_contact && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">連絡先:</span>
                        <span className="text-gray-700">{user.resident_contact}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      登録日: {formatDate(user.created_at)}
                    </span>
                    <div className="flex space-x-1">
                      {user.welfare_recipient && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">生保</span>
                      )}
                      {user.line_available && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">LINE</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default UsersPage