import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Ensure persistent storage for admin sessions
    storage: window.localStorage,
    storageKey: 'idittrack-auth-token',
    flowType: 'pkce' // More secure auth flow
  },
  global: {
    headers: {
      'x-client-info': 'idittrack-web'
    }
  },
  // Add realtime config to prevent hanging
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Session management helpers for admin users
export const checkSessionValidity = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Session check error:', error);
      return { valid: false, error };
    }

    // Check if session is about to expire (within 5 minutes)
    if (session) {
      const expiresAt = new Date(session.expires_at! * 1000);
      const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
      const needsRefresh = expiresAt < fiveMinutesFromNow;

      return {
        valid: true,
        session,
        needsRefresh,
        expiresAt,
        timeUntilExpiry: expiresAt.getTime() - Date.now()
      };
    }

    return { valid: false, error: 'No session found' };
  } catch (error) {
    console.error('Session validity check failed:', error);
    return { valid: false, error };
  }
};

export const refreshSessionIfNeeded = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Session refresh error:', error);
      return { success: false, error };
    }
    console.log('Session refreshed successfully');
    return { success: true, session };
  } catch (error) {
    console.error('Session refresh failed:', error);
    return { success: false, error };
  }
};

// RBAC Helper Functions
export const getUserPermissions = async (userId?: string, tenantId?: string) => {
  const { data, error } = await supabase.rpc('get_user_permissions', {
    p_user_id: userId,
    p_tenant_id: tenantId
  })

  if (error) {
    console.error('Error getting user permissions:', error)
    return []
  }
  return data || []
}

export const checkUserPermission = async (
  userId: string,
  resource: string,
  action: string,
  tenantId?: string
) => {
  const { data, error } = await supabase.rpc('user_has_permission', {
    p_user_id: userId,
    p_resource: resource,
    p_action: action,
    p_tenant_id: tenantId
  })

  if (error) {
    console.error('Error checking user permission:', error)
    return false
  }
  return data || false
}

export const getUserTenants = async (userId?: string) => {
  const { data, error } = await supabase.rpc('get_user_tenants', {
    p_user_id: userId
  })

  if (error) {
    console.error('Error getting user tenants:', error)
    return []
  }
  return data || []
}

export const getUserEffectiveRole = async (userId: string, tenantId?: string) => {
  const { data, error } = await supabase.rpc('get_user_effective_role', {
    p_user_id: userId,
    p_tenant_id: tenantId
  })

  if (error) {
    console.error('Error getting user effective role:', error)
    return 'user'
  }
  return data || 'user'
}

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role?: string
        }
        Update: {
          first_name?: string | null
          last_name?: string | null
          role?: string
        }
      }
      products: {
        Row: {
          id: string
          sku: string
          name: string
          description: string | null
          category_id: string | null
          selling_price: number | null
          cost_price: number | null
          weight_kg: number | null
          dimensions: any | null
          metadata: any | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          sku: string
          name: string
          description?: string | null
          category_id?: string | null
          selling_price?: number | null
          cost_price?: number | null
          weight_kg?: number | null
          dimensions?: any | null
          metadata?: any | null
          status?: string
        }
        Update: {
          name?: string
          description?: string | null
          category_id?: string | null
          selling_price?: number | null
          cost_price?: number | null
          weight_kg?: number | null
          dimensions?: any | null
          metadata?: any | null
          status?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description?: string | null
          parent_id?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          parent_id?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          status: string
          order_type: string
          subtotal: number | null
          tax_amount: number | null
          shipping_amount: number | null
          total_amount: number | null
          shipping_address: any | null
          billing_address: any | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          order_number: string
          customer_id?: string | null
          status?: string
          order_type?: string
          subtotal?: number | null
          tax_amount?: number | null
          shipping_amount?: number | null
          total_amount?: number | null
          shipping_address?: any | null
          billing_address?: any | null
          notes?: string | null
        }
        Update: {
          status?: string
          subtotal?: number | null
          tax_amount?: number | null
          shipping_amount?: number | null
          total_amount?: number | null
          shipping_address?: any | null
          billing_address?: any | null
          notes?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          unit_price: number | null
          total_price: number | null
          created_at: string
        }
        Insert: {
          order_id: string
          product_id?: string | null
          quantity: number
          unit_price?: number | null
          total_price?: number | null
        }
        Update: {
          quantity?: number
          unit_price?: number | null
          total_price?: number | null
        }
      }
      inventory: {
        Row: {
          id: string
          product_id: string
          location_id: string | null
          quantity: number
          reserved_quantity: number
          reorder_level: number
          last_counted_at: string | null
          updated_at: string
        }
        Insert: {
          product_id: string
          location_id?: string | null
          quantity?: number
          reserved_quantity?: number
          reorder_level?: number
          last_counted_at?: string | null
        }
        Update: {
          quantity?: number
          reserved_quantity?: number
          reorder_level?: number
          last_counted_at?: string | null
        }
      }
      locations: {
        Row: {
          id: string
          name: string
          type: string
          address: any | null
          contact_info: any | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          name: string
          type?: string
          address?: any | null
          contact_info?: any | null
          is_active?: boolean
        }
        Update: {
          name?: string
          type?: string
          address?: any | null
          contact_info?: any | null
          is_active?: boolean
        }
      }
      file_uploads: {
        Row: {
          id: string
          name: string
          type: string
          size: number
          status: string
          url: string | null
          uploaded_by: string
          file_path: string | null
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          size: number
          status?: string
          url?: string | null
          uploaded_by: string
          file_path?: string | null
          metadata?: any
        }
        Update: {
          name?: string
          type?: string
          size?: number
          status?: string
          url?: string | null
          file_path?: string | null
          metadata?: any
        }
      }
    }
  }
}
