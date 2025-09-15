// import { supabase } from './supabase' // ← 古いインポートは不要
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

// 型エイリアス
type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type Consultation = Database['public']['Tables']['consultations']['Row']
type ConsultationInsert = Database['public']['Tables']['consultations']['Insert']
type SupportPlan = Database['public']['Tables']['support_plans']['Row']
type SupportPlanInsert = Database['public']['Tables']['support_plans']['Insert']
type Staff = Database['public']['Tables']['staff']['Row']
type StaffInsert = Database['public']['Tables']['staff']['Insert']

// ブラウザ環境で実行されるクライアントコンポーネント用のSupabaseクライアントを生成するヘルパー関数
// この関数を各APIメソッドの先頭で呼び出すことで、常に認証情報がリクエストに含まれるようになる
const getSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from('users').select('*').order('uid')
    if (error) throw error
    return data || []
  },

  getById: async (id: string): Promise<User | null> => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  getByUid: async (uid: string): Promise<User | null> => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from('users').select('*').eq('uid', uid).single()
    if (error) throw error
    return data
  },

  create: async (user: UserInsert): Promise<User> => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from('users').insert([user]).select().single()
    if (error) {
      console.error('usersApi.create: Supabaseエラー', error)
      throw error
    }
    return data
  },

  update: async (id: string, user: Partial<User>): Promise<User> => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from('users').update(user).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  delete: async (id: string): Promise<void> => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) {
      console.error('usersApi.delete: Supabaseエラー', error);
      throw error
    }
  }
}

// Consultations API
export const consultationsApi = {
  getAll: async (filter?: { status?: string | null }): Promise<Consultation[]> => {
    const supabase = getSupabaseClient()
    let query = supabase
      .from('consultations')
      .select('*')
      .order('consultation_date', { ascending: false });

    if (filter) {
      if (filter.status === '利用者登録済み') {
        query = query.not('user_id', 'is', null);
      } else if (filter.status) {
        query = query.eq('status', filter.status);
      }
    } else {
      query = query.not('status', 'in', '("支援終了", "対象外・辞退")');
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  getById: async (id: string): Promise<Consultation | null> => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from('consultations').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  getByUserId: async (userId: string): Promise<Consultation[]> => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from('consultations').select('*').eq('user_id', userId).order('consultation_date', { ascending: false })
    if (error) throw error
    return data || []
  },

  create: async (consultation: ConsultationInsert): Promise<Consultation> => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('consultations')
      .insert([consultation])
      .select('*')
      .single();
    
    if (error) {
      console.error('!!! consultationsApi.create: Supabaseエラー発生 !!!', {
        message: error.message,
        details: error.details,
        code: error.code,
        hint: error.hint,
        sentData: consultation
      });
      throw error;
    }
    return data;
  },

  update: async (id: string, consultation: Partial<Consultation>): Promise<Consultation> => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from('consultations').update(consultation).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  updateStatus: async (id: string, status: string): Promise<Consultation> => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('consultations')
      .update({ status: status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string): Promise<void> => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from('consultations').delete().eq('id', id)
    if (error) throw error
  }
}

// Support Plans API
export const supportPlansApi = {
  getAll: async (): Promise<SupportPlan[]> => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from('support_plans').select('*').order('creation_date', { ascending: false })
    if (error) throw error
    return data || []
  },

  getById: async (id: string): Promise<SupportPlan | null> => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from('support_plans').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  getByUserId: async (userId: string): Promise<SupportPlan[]> => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from('support_plans').select('*').eq('user_id', userId).order('creation_date', { ascending: false })
    if (error) throw error
    return data || []
  },

  create: async (supportPlan: SupportPlanInsert): Promise<SupportPlan> => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from('support_plans').insert([supportPlan]).select().single()
    if (error) throw error
    return data
  },

  update: async (id: string, supportPlan: Partial<SupportPlan>): Promise<SupportPlan> => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from('support_plans').update(supportPlan).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  delete: async (id: string): Promise<void> => {
    const supabase = getSupabaseClient()
    const { error } = await supabase.from('support_plans').delete().eq('id', id)
    if (error) throw error
  }
}

// Staff API
export const staffApi = {
  getAll: async (): Promise<Staff[]> => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from('staff').select('*').order('name')
    if (error) throw error
    return data || []
  },
  
  create: async (staff: StaffInsert): Promise<Staff> => {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from('staff').insert([staff]).select().single()
    if (error) throw error
    return data
  }
}