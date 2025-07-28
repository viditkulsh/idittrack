import { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingCart, 
  AlertTriangle,
  DollarSign,
  Activity,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  RefreshCw,
  Target,
  Zap,
  Award,
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics';

// Chart colors for consistent theming
const CHART_COLORS = {
  primary: '#3B82F6',
  success: '#10B981', 
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F97316'
};

// Format currency for display
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format percentage
const formatPercentage = (value: number) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
};

const EnhancedDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, profile } = useAuth();
  const { analytics, loading: analyticsLoading, error: analyticsError, refetch } = useDashboardAnalytics();

  const handleRefresh = async () => {
    console.log('🔄 Manually refreshing dashboard analytics...');
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000); // Add a small delay for UX
  };

  useEffect(() => {
    // Set loading based on analytics loading
    setIsLoading(analyticsLoading);
  }, [analyticsLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Error loading analytics: {analyticsError}</p>
          <button onClick={handleRefresh} className="mt-4 btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🚀 Business Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome {profile?.first_name || user?.email?.split('@')[0]}! 
                Here's your comprehensive business performance overview.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`btn-secondary flex items-center space-x-2 ${isRefreshing ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-100'}`}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue KPI */}
          <div className="card p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.profitability.totalRevenue)}</p>
                <div className="flex items-center mt-2">
                  {analytics.trends.revenueGrowth >= 0 ? 
                    <ArrowUp className="h-4 w-4 text-green-300" /> : 
                    <ArrowDown className="h-4 w-4 text-red-300" />
                  }
                  <span className="text-sm text-blue-100 ml-1">
                    {formatPercentage(analytics.trends.revenueGrowth)} from last month
                  </span>
                </div>
              </div>
              <div className="bg-blue-400 bg-opacity-30 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Profit KPI */}
          <div className="card p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Gross Profit</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.profitability.grossProfit)}</p>
                <div className="flex items-center mt-2">
                  <Target className="h-4 w-4 text-green-200" />
                  <span className="text-sm text-green-100 ml-1">
                    {analytics.profitability.profitMargin.toFixed(1)}% margin
                  </span>
                </div>
              </div>
              <div className="bg-green-400 bg-opacity-30 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Orders KPI */}
          <div className="card p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Orders</p>
                <p className="text-2xl font-bold">{analytics.orders.total}</p>
                <div className="flex items-center mt-2">
                  <ShoppingCart className="h-4 w-4 text-purple-200" />
                  <span className="text-sm text-purple-100 ml-1">
                    {formatCurrency(analytics.profitability.averageOrderValue)} avg value
                  </span>
                </div>
              </div>
              <div className="bg-purple-400 bg-opacity-30 p-3 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Products KPI */}
          <div className="card p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Active Products</p>
                <p className="text-2xl font-bold">{analytics.products.active}</p>
                <div className="flex items-center mt-2">
                  <Package className="h-4 w-4 text-orange-200" />
                  <span className="text-sm text-orange-100 ml-1">
                    {analytics.products.categories} categories
                  </span>
                </div>
              </div>
              <div className="bg-orange-400 bg-opacity-30 p-3 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue & Profit Trend */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue & Profit Trend (30 Days)</h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span>Revenue</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>Profit</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={analytics.sales.dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'revenue' || name === 'profit' ? formatCurrency(value) : value,
                    name.charAt(0).toUpperCase() + name.slice(1)
                  ]}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  fill={CHART_COLORS.primary}
                  fillOpacity={0.1}
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke={CHART_COLORS.success}
                  strokeWidth={3}
                  dot={{ fill: CHART_COLORS.success, strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Top Performing Products */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Most Profitable Products</h3>
            <div className="space-y-4">
              {analytics.sales.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold
                      ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'}`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(product.profit)}</p>
                    <p className="text-sm text-green-600">{product.margin.toFixed(1)}% margin</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Category Performance */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Performance</h3>
            <div className="space-y-3">
              {analytics.categoryPerformance.slice(0, 5).map((category) => (
                <div key={category.category} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{category.category}</span>
                    <span className="text-gray-600">{formatCurrency(category.profit)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min((category.profit / (analytics.categoryPerformance[0]?.profit || 1)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{category.quantity} sold</span>
                    <span>{category.margin.toFixed(1)}% margin</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Insights */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Business Insights</h3>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-sm font-medium text-green-800">Best Day</p>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  {analytics.trends.bestPerformingDay ? 
                    new Date(analytics.trends.bestPerformingDay).toLocaleDateString() : 
                    'No data available'
                  }
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                  <p className="text-sm font-medium text-blue-800">Profit Growth</p>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  {formatPercentage(analytics.trends.profitGrowth)} this month
                </p>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 text-orange-500 mr-2" />
                  <p className="text-sm font-medium text-orange-800">Avg Order Value</p>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  {formatCurrency(analytics.profitability.averageOrderValue)}
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-purple-500 mr-2" />
                  <p className="text-sm font-medium text-purple-800">Top Category</p>
                </div>
                <p className="text-sm text-purple-700 mt-1">
                  {analytics.categoryPerformance[0]?.category || 'No data'}
                </p>
              </div>
            </div>
          </div>

          {/* Inventory Alerts */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Inventory Alerts</h3>
            <div className="space-y-4">
              {/* Stockout Risk */}
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Stockout Risk
                </h4>
                <div className="space-y-2">
                  {analytics.inventoryInsights.stockoutRisk.slice(0, 3).map((item) => (
                    <div key={item.id} className="p-2 bg-red-50 rounded text-sm">
                      <p className="font-medium text-red-900">{item.name}</p>
                      <p className="text-red-700">{item.daysUntilStockout.toFixed(0)} days left</p>
                    </div>
                  ))}
                  {analytics.inventoryInsights.stockoutRisk.length === 0 && (
                    <p className="text-sm text-gray-500">No immediate stockout risks</p>
                  )}
                </div>
              </div>

              {/* Fast Moving Items */}
              <div>
                <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                  <Zap className="h-4 w-4 mr-1" />
                  Fast Moving
                </h4>
                <div className="space-y-2">
                  {analytics.inventoryInsights.fastMovingProducts.slice(0, 3).map((item) => (
                    <div key={item.id} className="p-2 bg-green-50 rounded text-sm">
                      <p className="font-medium text-green-900">{item.name}</p>
                      <p className="text-green-700">{item.quantity} sold this month</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Recommendations */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">💡 Business Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📈 Revenue Optimization</h4>
              <p className="text-sm text-gray-700">
                Focus on promoting your top category "{analytics.categoryPerformance[0]?.category}" 
                which shows {analytics.categoryPerformance[0]?.margin.toFixed(1)}% margin.
              </p>
            </div>
            
            <div className="p-4 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">📦 Inventory Management</h4>
              <p className="text-sm text-gray-700">
                {analytics.inventoryInsights.stockoutRisk.length > 0 ? 
                  `Reorder ${analytics.inventoryInsights.stockoutRisk.length} items at risk of stockout.` :
                  'Inventory levels are healthy. Consider expanding fast-moving products.'
                }
              </p>
            </div>
            
            <div className="p-4 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">🎯 Profit Enhancement</h4>
              <p className="text-sm text-gray-700">
                Current profit margin is {analytics.profitability.profitMargin.toFixed(1)}%. 
                {analytics.profitability.profitMargin < 20 ? 
                  'Consider reviewing pricing or reducing costs.' :
                  'Great margins! Focus on scaling sales volume.'
                }
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EnhancedDashboard;
