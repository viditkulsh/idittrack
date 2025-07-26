import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface InventoryItem {
  id: string
  product_id: string
  location_id: string | null
  quantity: number
  reserved_quantity: number
  reorder_level: number
  last_counted_at: string | null
  updated_at: string
  products?: {
    id: string
    name: string
    sku: string
    selling_price: number
    cost_price: number
    status: string
  }
  locations?: {
    id: string
    name: string
    type: string
  }
}

export interface StockMovement {
  id: string
  inventory_id: string
  movement_type: 'in' | 'out' | 'transfer' | 'adjustment'
  quantity: number
  reference_type: string | null
  reference_id: string | null
  reason: string | null
  performed_by: string
  created_at: string
  inventory?: {
    products?: {
      name: string
      sku: string
    }
    locations?: {
      name: string
    }
  }
}

export const useInventoryManagement = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInventory()
    fetchMovements()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          products (
            id, 
            name, 
            sku, 
            selling_price, 
            cost_price, 
            status
          ),
          locations (
            id, 
            name, 
            type
          )
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

  const fetchMovements = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select(`
          *,
          inventory (
            products (name, sku),
            locations (name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setMovements(data || [])
    } catch (err: any) {
      console.error('Error fetching movements:', err.message)
    }
  }

  // Add new inventory item
  const addInventoryItem = async (inventoryData: {
    product_id: string
    location_id?: string | null
    quantity: number
    reorder_level: number
  }) => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .insert([{
          ...inventoryData,
          reserved_quantity: 0,
          last_counted_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      
      await fetchInventory()
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  // Update inventory item
  const updateInventoryItem = async (id: string, inventoryData: Partial<InventoryItem>) => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .update({
          ...inventoryData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      await fetchInventory()
      return { data, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  // Delete inventory item
  const deleteInventoryItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      await fetchInventory()
      return { error: null }
    } catch (err: any) {
      return { error: err.message }
    }
  }

  // Adjust stock quantity
  const adjustStock = async (
    inventoryId: string,
    newQuantity: number,
    reason: string,
    movementType: 'in' | 'out' | 'adjustment' = 'adjustment'
  ) => {
    try {
      // Get current inventory item
      const { data: currentItem, error: fetchError } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('id', inventoryId)
        .single()

      if (fetchError) throw fetchError

      const quantityDifference = newQuantity - currentItem.quantity

      // Update inventory quantity
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ 
          quantity: newQuantity,
          last_counted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', inventoryId)

      if (updateError) throw updateError

      // Record stock movement
      const { error: movementError } = await supabase
        .from('inventory_movements')
        .insert([{
          inventory_id: inventoryId,
          movement_type: movementType,
          quantity: Math.abs(quantityDifference),
          reason: reason,
          reference_type: 'manual_adjustment',
          performed_by: (await supabase.auth.getUser()).data.user?.id
        }])

      if (movementError) throw movementError

      await Promise.all([fetchInventory(), fetchMovements()])
      return { error: null }
    } catch (err: any) {
      return { error: err.message }
    }
  }

  // Transfer stock between locations
  const transferStock = async (
    fromInventoryId: string,
    toLocationId: string,
    quantity: number,
    reason: string
  ) => {
    try {
      // Get source inventory item
      const { data: sourceItem, error: sourceError } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', fromInventoryId)
        .single()

      if (sourceError) throw sourceError

      if (sourceItem.quantity < quantity) {
        throw new Error('Insufficient stock for transfer')
      }

      // Check if destination inventory exists
      const { data: destItem } = await supabase
        .from('inventory')
        .select('*')
        .eq('product_id', sourceItem.product_id)
        .eq('location_id', toLocationId)
        .single()

      // Update source inventory
      const { error: sourceUpdateError } = await supabase
        .from('inventory')
        .update({ 
          quantity: sourceItem.quantity - quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', fromInventoryId)

      if (sourceUpdateError) throw sourceUpdateError

      if (destItem) {
        // Update existing destination inventory
        const { error: destUpdateError } = await supabase
          .from('inventory')
          .update({ 
            quantity: destItem.quantity + quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', destItem.id)

        if (destUpdateError) throw destUpdateError
      } else {
        // Create new destination inventory
        const { error: createError } = await supabase
          .from('inventory')
          .insert([{
            product_id: sourceItem.product_id,
            location_id: toLocationId,
            quantity: quantity,
            reserved_quantity: 0,
            reorder_level: sourceItem.reorder_level,
            last_counted_at: new Date().toISOString()
          }])

        if (createError) throw createError
      }

      // Record movements
      const userId = (await supabase.auth.getUser()).data.user?.id

      const movements = [
        {
          inventory_id: fromInventoryId,
          movement_type: 'out' as const,
          quantity: quantity,
          reason: `Transfer out: ${reason}`,
          reference_type: 'transfer',
          performed_by: userId
        },
        {
          inventory_id: destItem?.id || null,
          movement_type: 'in' as const,
          quantity: quantity,
          reason: `Transfer in: ${reason}`,
          reference_type: 'transfer',
          performed_by: userId
        }
      ]

      const { error: movementError } = await supabase
        .from('inventory_movements')
        .insert(movements)

      if (movementError) throw movementError

      await Promise.all([fetchInventory(), fetchMovements()])
      return { error: null }
    } catch (err: any) {
      return { error: err.message }
    }
  }

  // Reserve stock for orders
  const reserveStock = async (inventoryId: string, quantity: number, orderId?: string) => {
    try {
      const { data: item, error: fetchError } = await supabase
        .from('inventory')
        .select('quantity, reserved_quantity')
        .eq('id', inventoryId)
        .single()

      if (fetchError) throw fetchError

      const availableQuantity = item.quantity - item.reserved_quantity

      if (availableQuantity < quantity) {
        throw new Error('Insufficient available stock for reservation')
      }

      const { error: updateError } = await supabase
        .from('inventory')
        .update({ 
          reserved_quantity: item.reserved_quantity + quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', inventoryId)

      if (updateError) throw updateError

      // Record movement
      const { error: movementError } = await supabase
        .from('inventory_movements')
        .insert([{
          inventory_id: inventoryId,
          movement_type: 'out',
          quantity: quantity,
          reason: 'Stock reserved for order',
          reference_type: 'order_reservation',
          reference_id: orderId,
          performed_by: (await supabase.auth.getUser()).data.user?.id
        }])

      if (movementError) throw movementError

      await Promise.all([fetchInventory(), fetchMovements()])
      return { error: null }
    } catch (err: any) {
      return { error: err.message }
    }
  }

  // Release reserved stock
  const releaseReservedStock = async (inventoryId: string, quantity: number, orderId?: string) => {
    try {
      const { data: item, error: fetchError } = await supabase
        .from('inventory')
        .select('reserved_quantity')
        .eq('id', inventoryId)
        .single()

      if (fetchError) throw fetchError

      const newReservedQuantity = Math.max(0, item.reserved_quantity - quantity)

      const { error: updateError } = await supabase
        .from('inventory')
        .update({ 
          reserved_quantity: newReservedQuantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', inventoryId)

      if (updateError) throw updateError

      // Record movement
      const { error: movementError } = await supabase
        .from('inventory_movements')
        .insert([{
          inventory_id: inventoryId,
          movement_type: 'in',
          quantity: quantity,
          reason: 'Reserved stock released',
          reference_type: 'order_release',
          reference_id: orderId,
          performed_by: (await supabase.auth.getUser()).data.user?.id
        }])

      if (movementError) throw movementError

      await Promise.all([fetchInventory(), fetchMovements()])
      return { error: null }
    } catch (err: any) {
      return { error: err.message }
    }
  }

  // Get low stock items
  const getLowStockItems = () => {
    return inventory.filter(item => {
      const availableQuantity = item.quantity - item.reserved_quantity
      return availableQuantity <= item.reorder_level
    })
  }

  // Get inventory by product
  const getInventoryByProduct = (productId: string) => {
    return inventory.filter(item => item.product_id === productId)
  }

  // Get inventory by location
  const getInventoryByLocation = (locationId: string) => {
    return inventory.filter(item => item.location_id === locationId)
  }

  // Get total stock for a product across all locations
  const getTotalStockForProduct = (productId: string) => {
    return inventory
      .filter(item => item.product_id === productId)
      .reduce((total, item) => total + item.quantity, 0)
  }

  // Get available stock (not reserved) for a product across all locations
  const getAvailableStockForProduct = (productId: string) => {
    return inventory
      .filter(item => item.product_id === productId)
      .reduce((total, item) => total + (item.quantity - item.reserved_quantity), 0)
  }

  return {
    // Data
    inventory,
    movements,
    loading,
    error,

    // CRUD operations
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,

    // Stock operations
    adjustStock,
    transferStock,
    reserveStock,
    releaseReservedStock,

    // Analytics
    getLowStockItems,
    getInventoryByProduct,
    getInventoryByLocation,
    getTotalStockForProduct,
    getAvailableStockForProduct,

    // Refresh
    refetch: () => Promise.all([fetchInventory(), fetchMovements()])
  }
}

export default useInventoryManagement
