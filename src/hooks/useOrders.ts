import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useOrders = () => {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, profile } = useAuth()

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user, profile])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name, sku, selling_price)
          )
        `)
        .order('created_at', { ascending: false })

      // If user is not admin/manager, only show their orders
      if (profile?.role !== 'admin' && profile?.role !== 'manager') {
        query = query.eq('customer_id', user?.id)
      }

      const { data, error } = await query

      if (error) throw error
      setOrders(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createOrder = async (orderData: any, orderItems: any[]) => {
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          ...orderData,
          customer_id: user?.id,
          order_number: `ORD-${Date.now()}`
        }])
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const itemsWithOrderId = orderItems.map(item => ({
        ...item,
        order_id: order.id
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsWithOrderId)

      if (itemsError) throw itemsError

      await fetchOrders() // Refresh the list
      return { data: order, error: null }
    } catch (err: any) {
      return { data: null, error: err.message }
    }
  }

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      await fetchOrders() // Refresh the list
      return { data, error: null }
    } catch (err: any) {
      setError(err.message)
      throw new Error(err.message)
    }
  }

  return { 
    orders, 
    loading, 
    error, 
    createOrder, 
    updateOrderStatus, 
    refetch: fetchOrders 
  }
}
