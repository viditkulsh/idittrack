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
    detectSessionInUrl: true
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
