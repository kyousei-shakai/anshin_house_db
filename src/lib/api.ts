import { supabase } from './supabase'
// 👇 インポート元を 'database' に変更
import { Database } from '@/types/database'

// 👇 新しい型定義から型エイリアスを作成 (この部分は変更なしでOK)
type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type Consultation = Database['public']['Tables']['consultations']['Row']
type ConsultationInsert = Database['public']['Tables']['consultations']['Insert']
type SupportPlan = Database['public']['Tables']['support_plans']['Row']
type SupportPlanInsert = Database['public']['Tables']['support_plans']['Insert']
type Staff = Database['public']['Tables']['staff']['Row']
type StaffInsert = Database['public']['Tables']['staff']['Insert']

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*').order('name')
    if (error) throw error
    return data || []
  },

  getById: async (id: string): Promise<User | null> => {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  getByUid: async (uid: string): Promise<User | null> => {
    const { data, error } = await supabase.from('users').select('*').eq('uid', uid).single()
    if (error) throw error
    return data
  },

  create: async (user: UserInsert): Promise<User> => {
    console.log('usersApi.create: データ送信開始', { uid: user.uid, name: user.name })
    const { data, error } = await supabase.from('users').insert([user]).select().single()
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

  update: async (id: string, user: Partial<User>): Promise<User> => {
    const { data, error } = await supabase.from('users').update(user).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) throw error
  }
}

// Consultations API
export const consultationsApi = {
  getAll: async (): Promise<Consultation[]> => {
    const { data, error } = await supabase.from('consultations').select('*').order('consultation_date', { ascending: false })
    if (error) throw error
    return data || []
  },

  getById: async (id: string): Promise<Consultation | null> => {
    const { data, error } = await supabase.from('consultations').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  getByUserId: async (userId: string): Promise<Consultation[]> => {
    const { data, error } = await supabase.from('consultations').select('*').eq('user_id', userId).order('consultation_date', { ascending: false })
    if (error) throw error
    return data || []
  },

  create: async (consultation: ConsultationInsert): Promise<Consultation> => {
    const { data, error } = await supabase.from('consultations').insert([consultation]).select().single()
    if (error) throw error
    return data
  },

  update: async (id: string, consultation: Partial<Consultation>): Promise<Consultation> => {
    const { data, error } = await supabase.from('consultations').update(consultation).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('consultations').delete().eq('id', id)
    if (error) throw error
  }
}

// Support Plans API
export const supportPlansApi = {
  getAll: async (): Promise<SupportPlan[]> => {
    const { data, error } = await supabase.from('support_plans').select('*').order('creation_date', { ascending: false })
    if (error) throw error
    return data || []
  },

  getById: async (id: string): Promise<SupportPlan | null> => {
    const { data, error } = await supabase.from('support_plans').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  getByUserId: async (userId: string): Promise<SupportPlan[]> => {
    const { data, error } = await supabase.from('support_plans').select('*').eq('user_id', userId).order('creation_date', { ascending: false })
    if (error) throw error
    return data || []
  },

  create: async (supportPlan: SupportPlanInsert): Promise<SupportPlan> => {
    const { data, error } = await supabase.from('support_plans').insert([supportPlan]).select().single()
    if (error) throw error
    return data
  },

  update: async (id: string, supportPlan: Partial<SupportPlan>): Promise<SupportPlan> => {
    const { data, error } = await supabase.from('support_plans').update(supportPlan).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from('support_plans').delete().eq('id', id)
    if (error) throw error
  }
}

// Staff API
export const staffApi = {
  getAll: async (): Promise<Staff[]> => {
    const { data, error } = await supabase.from('staff').select('*').order('name')
    if (error) throw error
    return data || []
  },
  
  create: async (staff: StaffInsert): Promise<Staff> => {
    const { data, error } = await supabase.from('staff').insert([staff]).select().single()
    if (error) throw error
    return data
  }
}