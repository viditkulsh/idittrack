import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Utility function to generate a URL-friendly slug from a name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

// Function to ensure slug uniqueness
const ensureUniqueSlug = async (baseSlug: string, excludeId?: string): Promise<string> => {
  let slug = baseSlug
  let counter = 1

  while (true) {
    let query = supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .limit(1)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data } = await query

    if (!data || data.length === 0) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }
}

export const useCategories = () => {
  const { user, profile } = useAuth()
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
      // Convert empty string parent_id to null for UUID field
      const processedData = {
        ...categoryData,
        parent_id: categoryData.parent_id === '' ? null : categoryData.parent_id,
        created_by: user?.id || null,
        tenant_id: profile?.tenant_id || null
      }

      // Generate a unique slug from the category name
      const baseSlug = generateSlug(processedData.name)
      const uniqueSlug = await ensureUniqueSlug(baseSlug)

      // Add the generated slug to the data
      processedData.slug = uniqueSlug

      const { data, error } = await supabase
        .from('categories')
        .insert([processedData])
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
      // Convert empty string parent_id to null for UUID field
      const processedData = {
        ...categoryData,
        parent_id: categoryData.parent_id === '' ? null : categoryData.parent_id
      }

      // If the name is being updated, regenerate the slug
      if (processedData.name) {
        const baseSlug = generateSlug(processedData.name)
        const uniqueSlug = await ensureUniqueSlug(baseSlug, id)
        processedData.slug = uniqueSlug
      }

      const { data, error } = await supabase
        .from('categories')
        .update(processedData)
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

  const updateLocation = async (id: string, locationData: any) => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .update(locationData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      await fetchLocations() // Refresh the list
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  const deleteLocation = async (id: string) => {
    try {
      // Check if location is used by any inventory
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .select('id')
        .eq('location_id', id)

      if (inventoryError) throw inventoryError

      if (inventory && inventory.length > 0) {
        throw new Error('Cannot delete location that has inventory. Please move inventory to another location first.')
      }

      // Soft delete: set is_active to false instead of removing the record.
      // Note: fetchLocations only returns locations where is_active is true,
      // so 'deleted' locations will not appear in the list but remain in the database.
      const { error } = await supabase
        .from('locations')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error

      await fetchLocations() // Refresh the list
      return { data: null, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  return { 
    locations, 
    loading, 
    error, 
    addLocation,
    updateLocation,
    deleteLocation,
    refetch: fetchLocations 
  }
}
