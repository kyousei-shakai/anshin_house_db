'use client'

import { useState, useEffect, useCallback } from 'react'
import { usersApi } from '@/lib/api'
import { Database } from '@/types/database'

type User = Database['public']['Tables']['users']['Row']


export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await usersApi.getAll()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const refreshUsers = () => {
    fetchUsers()
  }

  return {
    users,
    loading,
    error,
    refreshUsers
  }
}


// =================================================================
// useUser フック (個別取得用)
// ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ ここからが修正箇所です ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼
// =================================================================
export const useUser = (uid: string | null) => { // 1. 引数名を id から uid に変更
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = useCallback(async () => {
    if (!uid) { // 2. 変数名も uid に変更
      setUser(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // 3. ★★★ 最重要変更点 ★★★
      //    id(UUID)で検索する getById から、
      //    uid(人間が読めるID)で検索する getByUid に変更する。
      const data = await usersApi.getByUid(uid)
      
      setUser(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [uid]) // 4. useCallbackの依存配列も uid に変更

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const refreshUser = () => {
    fetchUser()
  }

  return {
    user,
    loading,
    error,
    refreshUser
  }
}