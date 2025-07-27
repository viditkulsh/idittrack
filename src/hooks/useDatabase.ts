import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useCategories = () => {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async (categoryData: any) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single()

      if (error) throw error
      
      await fetchCategories() // Refresh the list
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  const updateCategory = async (id: string, categoryData: any) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await fetchCategories() // Refresh the list
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      // First, check if category has children
      const { data: children, error: childrenError } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', id)

      if (childrenError) throw childrenError

      if (children && children.length > 0) {
        throw new Error('Cannot delete category with subcategories. Please delete subcategories first.')
      }

      // Check if category is used by any products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', id)

      if (productsError) throw productsError

      if (products && products.length > 0) {
        throw new Error('Cannot delete category that is assigned to products. Please reassign or delete products first.')
      }

      // Delete the category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchCategories() // Refresh the list
      return { data: null, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  return { 
    categories, 
    loading, 
    error, 
    addCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories 
  }
}

export const useInventory = () => {
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          products (id, name, sku),
          locations (id, name)
        `)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setInventory(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateInventory = async (id: string, inventoryData: any) => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .update(inventoryData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      await fetchInventory() // Refresh the list
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  return { 
    inventory, 
    loading, 
    error, 
    updateInventory, 
    refetch: fetchInventory 
  }
}

export const useLocations = () => {
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      setLocations(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addLocation = async (locationData: any) => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert([locationData])
        .select()
        .single()

      if (error) throw error
      
      await fetchLocations() // Refresh the list
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  return { 
    locations, 
    loading, 
    error, 
    addLocation, 
    refetch: fetchLocations 
  }
}
