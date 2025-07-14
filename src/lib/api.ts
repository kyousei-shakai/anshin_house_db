import { supabase } from './supabase'
import { User, Consultation, SupportPlan, Staff } from '@/types/database'

// Users API
export const usersApi = {
  // 全利用者取得
  getAll: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  },

  // 利用者ID取得
  getById: async (id: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // 利用者UID取得
  getByUid: async (uid: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('uid', uid)
      .single()
    
    if (error) throw error
    return data
  },

  // 利用者作成
  create: async (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> => {
    console.log('usersApi.create: データ送信開始', { uid: user.uid, name: user.name })
    
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single()
    
    if (error) {
      console.error('usersApi.create: Supabaseエラー', {
        error,
        errorMessage: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        sentData: user
      })
      throw error
    }
    
    console.log('usersApi.create: 保存成功', { id: data.id, uid: data.uid })
    return data
  },

  // 利用者更新
  update: async (id: string, user: Partial<User>): Promise<User> => {
    const { data, error } = await supabase
      .from('users')
      .update(user)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 利用者削除
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Consultations API
export const consultationsApi = {
  // 全相談取得
  getAll: async (): Promise<Consultation[]> => {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('consultation_date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // 相談ID取得
  getById: async (id: string): Promise<Consultation | null> => {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // 利用者IDで相談取得
  getByUserId: async (userId: string): Promise<Consultation[]> => {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('user_id', userId)
      .order('consultation_date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // 相談作成
  create: async (consultation: Omit<Consultation, 'id' | 'created_at' | 'updated_at'>): Promise<Consultation> => {
    const { data, error } = await supabase
      .from('consultations')
      .insert([consultation])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 相談更新
  update: async (id: string, consultation: Partial<Consultation>): Promise<Consultation> => {
    const { data, error } = await supabase
      .from('consultations')
      .update(consultation)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 相談削除
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('consultations')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Support Plans API
export const supportPlansApi = {
  // 全支援計画取得
  getAll: async (): Promise<SupportPlan[]> => {
    const { data, error } = await supabase
      .from('support_plans')
      .select('*')
      .order('creation_date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // 支援計画ID取得
  getById: async (id: string): Promise<SupportPlan | null> => {
    const { data, error } = await supabase
      .from('support_plans')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // 利用者IDで支援計画取得
  getByUserId: async (userId: string): Promise<SupportPlan[]> => {
    const { data, error } = await supabase
      .from('support_plans')
      .select('*')
      .eq('user_id', userId)
      .order('creation_date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // 支援計画作成
  create: async (supportPlan: Omit<SupportPlan, 'id' | 'created_at' | 'updated_at'>): Promise<SupportPlan> => {
    const { data, error } = await supabase
      .from('support_plans')
      .insert([supportPlan])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 支援計画更新
  update: async (id: string, supportPlan: Partial<SupportPlan>): Promise<SupportPlan> => {
    const { data, error } = await supabase
      .from('support_plans')
      .update(supportPlan)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 支援計画削除
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('support_plans')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Staff API
export const staffApi = {
  // 全スタッフ取得
  getAll: async (): Promise<Staff[]> => {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  },

  // スタッフ作成
  create: async (staff: Omit<Staff, 'id' | 'created_at' | 'updated_at'>): Promise<Staff> => {
    const { data, error } = await supabase
      .from('staff')
      .insert([staff])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}