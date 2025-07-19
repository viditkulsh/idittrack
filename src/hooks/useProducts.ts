import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useProducts = () => {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (id, name),
          inventory (
            quantity,
            reserved_quantity,
            reorder_point,
            location_id,
            locations (name)
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addProduct = async (productData: any) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single()

      if (error) throw error
      
      await fetchProducts() // Refresh the list
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  const updateProduct = async (id: string, productData: any) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      await fetchProducts() // Refresh the list
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'discontinued' })
        .eq('id', id)

      if (error) throw error
      
      await fetchProducts() // Refresh the list
      return { error: null }
    } catch (err: any) {
      return { error: err.message }
    }
  }

  return { 
    products, 
    loading, 
    error, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    refetch: fetchProducts 
  }
}
