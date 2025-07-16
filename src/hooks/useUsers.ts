'use client'

import { useState, useEffect, useCallback } from 'react'
import { usersApi } from '@/lib/api'
// 👇 1. インポートを 'Database' 型に変更
import { Database } from '@/types/database'

// 👇 2. 新しい型定義から型エイリアスを作成
type User = Database['public']['Tables']['users']['Row']

export const useUsers = () => {
  // 👇 3. useStateの型指定は変更なしでOK
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

export const useUser = (id: string | null) => {
  // 👇 4. こちらのuseStateの型指定も変更なしでOK
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = useCallback(async () => {
    if (!id) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await usersApi.getById(id)
      setUser(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [id])

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