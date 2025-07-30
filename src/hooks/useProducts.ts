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
            reorder_level,
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
      // Separate product data from inventory data
      const { quantity, reorder_point, ...productFields } = productData;
      
      // Convert empty string category_id to null for UUID field
      const processedProductFields = {
        ...productFields,
        category_id: productFields.category_id === '' ? null : productFields.category_id
      }

      // Create product first
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([processedProductFields])
        .select()
        .single()

      if (productError) throw productError
      
      // Create inventory record if quantity is provided
      if (quantity !== undefined && quantity !== '') {
        const inventoryData = {
          product_id: product.id,
          quantity: parseInt(quantity) || 0,
          reserved_quantity: 0,
          reorder_level: parseInt(reorder_point) || 0
        };
        
        const { error: inventoryError } = await supabase
          .from('inventory')
          .insert([inventoryData])
        
        if (inventoryError) throw inventoryError
      }
      
      await fetchProducts() // Refresh the list
      return { data: product, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  const updateProduct = async (id: string, productData: any) => {
    try {
      // Separate product data from inventory data
      const { quantity, reorder_point, ...productFields } = productData;
      
      // Convert empty string category_id to null for UUID field
      const processedProductFields = {
        ...productFields,
        category_id: productFields.category_id === '' ? null : productFields.category_id
      }

      // Update product
      const { data: product, error: productError } = await supabase
        .from('products')
        .update(processedProductFields)
        .eq('id', id)
        .select()
        .single()

      if (productError) throw productError
      
      // Update or create inventory record
      if (quantity !== undefined && quantity !== '') {
        const inventoryData = {
          quantity: parseInt(quantity) || 0,
          reorder_level: parseInt(reorder_point) || 0
        };
        
        // Check if inventory record exists
        const { data: existingInventory } = await supabase
          .from('inventory')
          .select('id')
          .eq('product_id', id)
          .single()
        
        if (existingInventory) {
          // Update existing inventory
          const { error: inventoryError } = await supabase
            .from('inventory')
            .update(inventoryData)
            .eq('product_id', id)
          
          if (inventoryError) throw inventoryError
        } else {
          // Create new inventory record
          const { error: inventoryError } = await supabase
            .from('inventory')
            .insert([{ ...inventoryData, product_id: id, reserved_quantity: 0 }])
          
          if (inventoryError) throw inventoryError
        }
      }
      
      await fetchProducts() // Refresh the list
      return { data: product, error: null }
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
