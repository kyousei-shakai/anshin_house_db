// src/app/users/UsersClientPage.tsx 
'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database'
import { calculateAge } from '@/utils/date'
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react'

type User = Database['public']['Tables']['users']['Row']

interface UsersClientPageProps {
  initialUsers: User[]
  fetchError: string | null
}

export default function UsersClientPage({ initialUsers, fetchError }: UsersClientPageProps) {
  const router = useRouter();
  const [users] = useState<User[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'created_at' | 'updated_at', direction: 'asc' | 'desc' }>({ key: 'updated_at', direction: 'desc' });

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users;

    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      const filterWithoutHyphen = lowercasedFilter.replace(/-/g, '');

      filtered = filtered.filter(user => {
        // 利用者本人の情報
        if (user.name?.toLowerCase().includes(lowercasedFilter)) return true;
        if (user.uid?.toLowerCase().includes(lowercasedFilter)) return true;
        if (user.property_address?.toLowerCase().includes(lowercasedFilter)) return true;
        if (user.property_name?.toLowerCase().includes(lowercasedFilter)) return true;
        if (user.room_number?.toLowerCase().includes(lowercasedFilter)) return true;
        if (user.resident_contact?.replace(/-/g, '').includes(filterWithoutHyphen)) return true;
        
        // 緊急連絡先の情報
        if (user.emergency_contact_name?.toLowerCase().includes(lowercasedFilter)) return true;
        if (user.emergency_contact?.replace(/-/g, '').includes(filterWithoutHyphen)) return true;

        // ▼▼▼ ここからが今回の追加箇所です ▼▼▼
        if (user.intermediary?.toLowerCase().includes(lowercasedFilter)) return true;
        // ▲▲▲ ここまでが今回の追加箇所です ▲▲▲

        return false;
      });
    }

    return [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || bValue === null) return 0;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue, 'ja');
      } else {
         const dateA = new Date(aValue);
         const dateB = new Date(bValue);
         if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
           comparison = dateA.getTime() - dateB.getTime();
         }
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [users, searchTerm, sortConfig]);


  const handleSort = (key: typeof sortConfig.key) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未設定';
    return new Date(dateString).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  if (fetchError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-500 text-sm">
          エラーが発生しました: {fetchError}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <label htmlFor="search-term" className="sr-only">検索</label>
          <input
            id="search-term"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="氏名、連絡先、住所、などで検索..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
        <p className="text-gray-600 text-sm flex-shrink-0">
          {filteredAndSortedUsers.length} / {users.length} 名表示
        </p>
      </div>

      {filteredAndSortedUsers.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center border">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">{searchTerm ? '該当する利用者が見つかりません' : '利用者が登録されていません'}</h3>
            <p className="mt-1 text-sm text-gray-500">{searchTerm ? '検索条件を変更して再度お試しください。' : '新しい利用者を登録してください。'}</p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button onClick={() => handleSort('name')} className="flex items-center gap-1 group">
                      氏名 / UID
                      {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />) : <ChevronsUpDown className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">住所 / 物件名・部屋番号</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">連絡先</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <button onClick={() => handleSort('updated_at')} className="flex items-center gap-1 group">
                      最終更新
                      {sortConfig.key === 'updated_at' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />) : <ChevronsUpDown className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />}
                    </button>
                  </th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">詳細</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-blue-50 cursor-pointer"
                    onClick={() => router.push(`/users/${user.uid}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500 font-mono">{user.uid}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div>{user.property_address}</div>
                      { (user.property_name || user.room_number) &&
                        <div className="text-xs text-gray-500">{user.property_name} {user.room_number && `${user.room_number}号室`}</div>
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.resident_contact}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.updated_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/users/${user.uid}`} 
                        className="text-blue-600 hover:text-blue-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        詳細
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-4">
            {filteredAndSortedUsers.map((user) => (
               <Link key={user.id} href={`/users/${user.uid}`} className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                 <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{user.name}</h3>
                      <p className="text-sm text-gray-500 font-mono">{user.uid}</p>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                 </div>
                 <div className="space-y-3 text-sm border-t border-gray-100 pt-3">
                    <div className="flex">
                      <dt className="w-20 flex-shrink-0 text-gray-500">住所</dt>
                      <dd className="text-gray-800">{user.property_address}</dd>
                    </div>
                    {(user.property_name || user.room_number) &&
                      <div className="flex">
                        <dt className="w-20 flex-shrink-0 text-gray-500">物件/部屋</dt>
                        <dd className="text-gray-800">{user.property_name} {user.room_number && `${user.room_number}号室`}</dd>
                      </div>
                    }
                    <div className="flex">
                      <dt className="w-20 flex-shrink-0 text-gray-500">連絡先</dt>
                      <dd className="text-gray-800">{user.resident_contact}</dd>
                    </div>
                    <div className="flex">
                      <dt className="w-20 flex-shrink-0 text-gray-500">最終更新</dt>
                      <dd className="text-gray-800">{formatDate(user.updated_at)}</dd>
                    </div>
                 </div>
               </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}