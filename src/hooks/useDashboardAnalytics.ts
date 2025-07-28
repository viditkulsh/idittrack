import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface DailySale {
  date: string
  revenue: number
  orders: number
  profit: number
}

interface TopProduct {
  id: string
  name: string
  sku: string
  quantity: number
  revenue: number
  profit: number
  margin: number
}

interface ProfitabilityMetrics {
  totalRevenue: number
  totalCost: number
  grossProfit: number
  profitMargin: number
  averageOrderValue: number
  customerAcquisitionCost: number
}

interface CategoryPerformance {
  category: string
  revenue: number
  profit: number
  quantity: number
  margin: number
}

interface TrendAnalysis {
  revenueGrowth: number
  orderGrowth: number
  profitGrowth: number
  bestPerformingDay: string
  worstPerformingDay: string
}

interface InventoryInsights {
  fastMovingProducts: TopProduct[]
  slowMovingProducts: TopProduct[]
  overstockedItems: Array<{
    id: string
    name: string
    currentStock: number
    averageMonthlySales: number
    monthsOfStock: number
  }>
  stockoutRisk: Array<{
    id: string
    name: string
    currentStock: number
    reorderLevel: number
    daysUntilStockout: number
  }>
}

interface Analytics {
  products: {
    total: number
    active: number
    lowStock: number
    categories: number
  }
  orders: {
    total: number
    pending: number
    processing: number
    delivered: number
    revenue: number
    todayOrders: number
    monthlyRevenue: number
  }
  inventory: {
    totalItems: number
    totalValue: number
    lowStockItems: number
    locations: number
  }
  sales: {
    dailySales: DailySale[]
    topProducts: TopProduct[]
    revenueGrowth: number
  }
  profitability: ProfitabilityMetrics
  categoryPerformance: CategoryPerformance[]
  trends: TrendAnalysis
  inventoryInsights: InventoryInsights
}

export const useDashboardAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics>({
    products: {
      total: 0,
      active: 0,
      lowStock: 0,
      categories: 0
    },
    orders: {
      total: 0,
      pending: 0,
      processing: 0,
      delivered: 0,
      revenue: 0,
      todayOrders: 0,
      monthlyRevenue: 0
    },
    inventory: {
      totalItems: 0,
      totalValue: 0,
      lowStockItems: 0,
      locations: 0
    },
    sales: {
      dailySales: [],
      topProducts: [],
      revenueGrowth: 0
    },
    profitability: {
      totalRevenue: 0,
      totalCost: 0,
      grossProfit: 0,
      profitMargin: 0,
      averageOrderValue: 0,
      customerAcquisitionCost: 0
    },
    categoryPerformance: [],
    trends: {
      revenueGrowth: 0,
      orderGrowth: 0,
      profitGrowth: 0,
      bestPerformingDay: '',
      worstPerformingDay: ''
    },
    inventoryInsights: {
      fastMovingProducts: [],
      slowMovingProducts: [],
      overstockedItems: [],
      stockoutRisk: []
    }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Fetching analytics data...')

      // Fetch Products Analytics
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, status, category_id')

      if (productsError) {
        console.error('❌ Products error:', productsError)
        throw productsError
      }
      console.log('✅ Products fetched:', products?.length || 0)
      console.log('📊 Products by status:', products?.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>))

      // Fetch Orders Analytics
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id, 
          status, 
          total_amount, 
          created_at,
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (id, name, sku)
          )
        `)
        .order('created_at', { ascending: false })

      if (ordersError) {
        console.error('❌ Orders error:', ordersError)
        throw ordersError
      }
      console.log('✅ Orders fetched:', orders?.length || 0)
      console.log('📊 Order statuses:', orders?.map(o => o.status) || [])

      // Fetch Inventory Analytics
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .select(`
          id,
          quantity,
          reorder_level,
          product_id,
          products!inner (id, name, cost_price),
          locations (id, name)
        `)

      if (inventoryError) throw inventoryError

      // Fetch Categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id')

      if (categoriesError) throw categoriesError

      // Fetch Locations
      const { data: locations, error: locationsError } = await supabase
        .from('locations')
        .select('id')
        .eq('is_active', true)

      if (locationsError) throw locationsError

      // Enhanced Analytics Calculations
      console.log('🔄 Fetching enhanced product data with cost prices...')
      
      // Fetch Products with cost prices for profit calculations
      const { data: detailedProducts, error: detailedProductsError } = await supabase
        .from('products')
        .select('id, name, sku, status, category_id, cost_price, selling_price, categories(name)')

      if (detailedProductsError) throw detailedProductsError

      // Calculate comprehensive analytics
      const productAnalytics = {
        total: products?.length || 0,
        active: products?.filter(p => p.status === 'active')?.length || 0,
        categories: categories?.length || 0,
        lowStock: 0 // Will be calculated from inventory
      }

      // Enhanced order analytics with profit calculations
      const today = new Date()
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      const todayOrders = orders?.filter(order => 
        new Date(order.created_at) >= startOfToday
      ) || []

      const monthlyOrders = orders?.filter(order => 
        new Date(order.created_at) >= startOfMonth
      ) || []

      const lastMonthOrders = orders?.filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate >= lastMonth && orderDate <= endOfLastMonth
      }) || []

      const last30DaysOrders = orders?.filter(order => 
        new Date(order.created_at) >= last30Days
      ) || []

      // Calculate revenue and costs
      let totalRevenue = 0
      let totalCost = 0
      const categoryRevenue: { [key: string]: number } = {}
      const categoryProfit: { [key: string]: number } = {}
      const categoryQuantity: { [key: string]: number } = {}

      orders?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const product = detailedProducts?.find(p => p.id === item.products?.id)
          const revenue = item.total_price || 0
          const cost = (product?.cost_price || 0) * (item.quantity || 0)
          const categoryName = product?.categories?.[0]?.name || 'Uncategorized'
          
          totalRevenue += revenue
          totalCost += cost
          
          categoryRevenue[categoryName] = (categoryRevenue[categoryName] || 0) + revenue
          categoryProfit[categoryName] = (categoryProfit[categoryName] || 0) + (revenue - cost)
          categoryQuantity[categoryName] = (categoryQuantity[categoryName] || 0) + (item.quantity || 0)
        })
      })

      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      
      const grossProfit = totalRevenue - totalCost
      const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
      const averageOrderValue = orders?.length ? totalRevenue / orders.length : 0

      // Growth calculations
      const revenueGrowth = lastMonthRevenue > 0 
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0
      
      const orderGrowth = lastMonthOrders.length > 0
        ? ((monthlyOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100
        : 0

      // Profitability metrics
      const profitabilityMetrics: ProfitabilityMetrics = {
        totalRevenue,
        totalCost,
        grossProfit,
        profitMargin,
        averageOrderValue,
        customerAcquisitionCost: totalRevenue > 0 ? totalCost * 0.1 : 0 // Estimated
      }

      // Category performance analysis
      const categoryPerformance: CategoryPerformance[] = Object.keys(categoryRevenue).map(category => ({
        category,
        revenue: categoryRevenue[category],
        profit: categoryProfit[category],
        quantity: categoryQuantity[category],
        margin: categoryRevenue[category] > 0 ? (categoryProfit[category] / categoryRevenue[category]) * 100 : 0
      })).sort((a, b) => b.profit - a.profit)

      const orderAnalytics = {
        total: orders?.length || 0,
        pending: orders?.filter(o => o.status === 'pending')?.length || 0,
        processing: orders?.filter(o => o.status === 'processing')?.length || 0,
        delivered: orders?.filter(o => o.status === 'delivered')?.length || 0,
        revenue: totalRevenue,
        todayOrders: todayOrders.length,
        monthlyRevenue,
        revenueGrowth
      }

      // Enhanced inventory analytics with stockout predictions
      const lowStockItems = inventory?.filter(item => 
        item.quantity <= (item.reorder_level || 10)
      ) || []

      const totalInventoryValue = inventory?.reduce((sum, item) => {
        const costPrice = (item.products as any)?.cost_price || 0
        return sum + (item.quantity * costPrice)
      }, 0) || 0

      // Inventory insights calculations
      const productSalesMap: { [key: string]: { quantity: number; revenue: number; lastSaleDate: Date | null } } = {}
      
      // Calculate sales velocity for each product
      last30DaysOrders.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const productId = item.products?.id
          if (productId) {
            if (!productSalesMap[productId]) {
              productSalesMap[productId] = { quantity: 0, revenue: 0, lastSaleDate: null }
            }
            productSalesMap[productId].quantity += item.quantity || 0
            productSalesMap[productId].revenue += item.total_price || 0
            const orderDate = new Date(order.created_at)
            if (!productSalesMap[productId].lastSaleDate || orderDate > productSalesMap[productId].lastSaleDate) {
              productSalesMap[productId].lastSaleDate = orderDate
            }
          }
        })
      })

      // Fast and slow moving products
      const productMovement = Object.entries(productSalesMap).map(([productId, sales]) => {
        const product = detailedProducts?.find(p => p.id === productId)
        const inventoryItem = inventory?.find(i => i.product_id === productId)
        const profit = sales.revenue - ((product?.cost_price || 0) * sales.quantity)
        const margin = sales.revenue > 0 ? (profit / sales.revenue) * 100 : 0
        
        return {
          id: productId,
          name: product?.name || 'Unknown',
          sku: product?.sku || 'N/A',
          quantity: sales.quantity,
          revenue: sales.revenue,
          profit,
          margin,
          velocity: sales.quantity / 30, // Sales per day
          currentStock: inventoryItem?.quantity || 0,
          lastSaleDate: sales.lastSaleDate
        }
      }).filter(p => p.velocity > 0)

      const fastMovingProducts = productMovement
        .sort((a, b) => b.velocity - a.velocity)
        .slice(0, 5)

      const slowMovingProducts = productMovement
        .sort((a, b) => a.velocity - b.velocity)
        .slice(0, 5)

      // Overstock analysis
      const overstockedItems = inventory?.map(item => {
        const sales = productSalesMap[item.product_id] || { quantity: 0 }
        const averageMonthlySales = sales.quantity
        const monthsOfStock = averageMonthlySales > 0 ? item.quantity / averageMonthlySales : 999
        
        return {
          id: item.product_id || '',
          name: (item.products as any)?.name || 'Unknown',
          currentStock: item.quantity,
          averageMonthlySales,
          monthsOfStock
        }
      }).filter(item => item.monthsOfStock > 6 && item.currentStock > 0)
        .sort((a, b) => b.monthsOfStock - a.monthsOfStock)
        .slice(0, 10) || []

      // Stockout risk analysis
      const stockoutRisk = inventory?.map(item => {
        const sales = productSalesMap[item.product_id] || { quantity: 0 }
        const dailySales = sales.quantity / 30
        const daysUntilStockout = dailySales > 0 ? item.quantity / dailySales : 999
        
        return {
          id: item.product_id || '',
          name: (item.products as any)?.name || 'Unknown',
          currentStock: item.quantity,
          reorderLevel: item.reorder_level || 0,
          daysUntilStockout
        }
      }).filter(item => item.daysUntilStockout <= 30 && item.currentStock > 0)
        .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout)
        .slice(0, 10) || []

      const inventoryAnalytics = {
        totalItems: inventory?.reduce((sum, item) => sum + item.quantity, 0) || 0,
        totalValue: totalInventoryValue,
        lowStockItems: lowStockItems.length,
        locations: locations?.length || 0
      }

      const inventoryInsights: InventoryInsights = {
        fastMovingProducts,
        slowMovingProducts,
        overstockedItems,
        stockoutRisk
      }

      // Enhanced daily sales with profit tracking for the last 30 days
      const dailySales = []
      let bestDay = { date: '', revenue: 0 }
      let worstDay = { date: '', revenue: Infinity }
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
        
        const dayOrders = orders?.filter(order => {
          const orderDate = new Date(order.created_at)
          return orderDate >= startOfDay && orderDate < endOfDay
        }) || []

        let dayRevenue = 0
        let dayCost = 0
        
        dayOrders.forEach(order => {
          order.order_items?.forEach((item: any) => {
            const product = detailedProducts?.find(p => p.id === item.products?.id)
            const revenue = item.total_price || 0
            const cost = (product?.cost_price || 0) * (item.quantity || 0)
            
            dayRevenue += revenue
            dayCost += cost
          })
        })
        
        const dayProfit = dayRevenue - dayCost
        const dateStr = date.toISOString().split('T')[0]
        
        if (dayRevenue > bestDay.revenue) {
          bestDay = { date: dateStr, revenue: dayRevenue }
        }
        if (dayRevenue < worstDay.revenue && dayRevenue > 0) {
          worstDay = { date: dateStr, revenue: dayRevenue }
        }
        
        dailySales.push({
          date: dateStr,
          revenue: dayRevenue,
          orders: dayOrders.length,
          profit: dayProfit
        })
      }

      // Enhanced top products with profit analysis
      const productSales: { [key: string]: TopProduct } = {}
      orders?.forEach(order => {
        order.order_items?.forEach((item: any) => {
          const product = detailedProducts?.find(p => p.id === item.products?.id)
          const productId = product?.id
          const revenue = item.total_price || 0
          const cost = (product?.cost_price || 0) * (item.quantity || 0)
          const profit = revenue - cost
          
          if (productId) {
            if (!productSales[productId]) {
              productSales[productId] = {
                id: productId,
                name: product?.name || 'Unknown Product',
                sku: product?.sku || 'N/A',
                quantity: 0,
                revenue: 0,
                profit: 0,
                margin: 0
              }
            }
            productSales[productId].quantity += item.quantity || 0
            productSales[productId].revenue += revenue
            productSales[productId].profit += profit
          }
        })
      })

      // Calculate margins for top products
      Object.values(productSales).forEach(product => {
        product.margin = product.revenue > 0 ? (product.profit / product.revenue) * 100 : 0
      })

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.profit - a.profit) // Sort by profit instead of revenue
        .slice(0, 10)

      // Trend analysis
      const currentMonthProfit = monthlyOrders.reduce((sum, order) => {
        let orderProfit = 0
        order.order_items?.forEach((item: any) => {
          const product = detailedProducts?.find(p => p.id === item.products?.id)
          const revenue = item.total_price || 0
          const cost = (product?.cost_price || 0) * (item.quantity || 0)
          orderProfit += (revenue - cost)
        })
        return sum + orderProfit
      }, 0)

      const lastMonthProfit = lastMonthOrders.reduce((sum, order) => {
        let orderProfit = 0
        order.order_items?.forEach((item: any) => {
          const product = detailedProducts?.find(p => p.id === item.products?.id)
          const revenue = item.total_price || 0
          const cost = (product?.cost_price || 0) * (item.quantity || 0)
          orderProfit += (revenue - cost)
        })
        return sum + orderProfit
      }, 0)

      const profitGrowth = lastMonthProfit > 0 
        ? ((currentMonthProfit - lastMonthProfit) / lastMonthProfit) * 100 
        : 0

      const trends: TrendAnalysis = {
        revenueGrowth,
        orderGrowth,
        profitGrowth,
        bestPerformingDay: bestDay.date,
        worstPerformingDay: worstDay.revenue === Infinity ? '' : worstDay.date
      }

      const salesAnalytics = {
        dailySales,
        topProducts,
        revenueGrowth
      }

      // Update analytics state with all enhanced metrics
      setAnalytics({
        products: { ...productAnalytics, lowStock: lowStockItems.length },
        orders: orderAnalytics,
        inventory: inventoryAnalytics,
        sales: salesAnalytics,
        profitability: profitabilityMetrics,
        categoryPerformance,
        trends,
        inventoryInsights
      })

    } catch (err: any) {
      setError(err.message)
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  return { 
    analytics, 
    loading, 
    error, 
    refetch: fetchAnalytics 
  }
}
