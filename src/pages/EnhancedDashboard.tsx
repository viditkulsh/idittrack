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
    Eye,
    Printer
} from 'lucide-react';
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardAnalytics } from '../hooks/useDashboardAnalytics';
import { PrintableAnalyticsReport } from '../components/PrintableAnalyticsReport';

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
    const [showPrintReport, setShowPrintReport] = useState(false);
  const { user, profile } = useAuth();
  const { analytics, loading: analyticsLoading, error: analyticsError, refetch } = useDashboardAnalytics();

  const handleRefresh = async () => {
    console.log('🔄 Manually refreshing dashboard analytics...');
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000); // Add a small delay for UX
  };

    const handlePrintReport = () => {
        setShowPrintReport(true);
        // Remove automatic printing - let user decide when to print
    };

    const handleActualPrint = () => {
        window.print();
    };

    const handleClosePrintReport = () => {
        setShowPrintReport(false);
    }; useEffect(() => {
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
                              onClick={handlePrintReport}
                              className="btn-primary flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                              <Eye className="h-4 w-4" />
                              <span>View Report</span>
                          </button>
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

              {/* Advanced Analytics Section */}
              <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">🔬 Advanced Business Intelligence</h2>

                  {/* ABC Analysis & Seasonal Trends */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      {/* ABC Analysis */}
                      <div className="card p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-6">📊 ABC Analysis - Inventory Classification</h3>
                          <div className="space-y-4">
                              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                                  <div className="p-3 bg-red-50 rounded-lg">
                                      <p className="text-2xl font-bold text-red-600">
                                          {analytics.abcAnalysis.filter(item => item.classification === 'A').length}
                                      </p>
                                      <p className="text-sm text-red-600">Class A (80% Revenue)</p>
                                  </div>
                                  <div className="p-3 bg-yellow-50 rounded-lg">
                                      <p className="text-2xl font-bold text-yellow-600">
                                          {analytics.abcAnalysis.filter(item => item.classification === 'B').length}
                                      </p>
                                      <p className="text-sm text-yellow-600">Class B (15% Revenue)</p>
                                  </div>
                                  <div className="p-3 bg-green-50 rounded-lg">
                                      <p className="text-2xl font-bold text-green-600">
                                          {analytics.abcAnalysis.filter(item => item.classification === 'C').length}
                                      </p>
                                      <p className="text-sm text-green-600">Class C (5% Revenue)</p>
                                  </div>
                              </div>

                              <div className="space-y-3">
                                  <h4 className="font-medium text-gray-900">Top Class A Products:</h4>
                                  {analytics.abcAnalysis.filter(item => item.classification === 'A').slice(0, 5).map((item) => (
                                      <div key={item.id} className="flex justify-between items-center p-2 bg-red-50 rounded">
                                          <div>
                                              <p className="font-medium text-red-900">{item.name}</p>
                                              <p className="text-sm text-red-700">{item.revenuePercentage.toFixed(1)}% of total revenue</p>
                                          </div>
                                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">A</span>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>

                      {/* Seasonal Trends */}
                      <div className="card p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-6">📈 Seasonal Trends (12 Months)</h3>
                          <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={analytics.seasonalTrends}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                  <YAxis tick={{ fontSize: 12 }} />
                                  <Tooltip
                                      formatter={(value: any, name: string) => [
                                          name === 'revenue' || name === 'profit' ? formatCurrency(value) : value,
                                          name.charAt(0).toUpperCase() + name.slice(1)
                                      ]}
                                  />
                                  <Bar dataKey="revenue" fill={CHART_COLORS.primary} name="Revenue" />
                                  <Bar dataKey="profit" fill={CHART_COLORS.success} name="Profit" />
                              </BarChart>
                          </ResponsiveContainer>
                      </div>
                  </div>

                  {/* Advanced Inventory Classification Techniques */}
                  <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">🏷️ Multi-Dimensional Inventory Classification</h3>

                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
                          {/* VED Analysis */}
                          <div className="card p-4">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">🎯 VED Analysis</h4>
                              <p className="text-sm text-gray-600 mb-4">Vital, Essential, Desirable</p>
                              <div className="space-y-3">
                                  {['Vital', 'Essential', 'Desirable'].map((type, index) => {
                                      const count = analytics.vedAnalysis.filter(item => item.classification === type).length;
                                      const colors = ['text-red-600 bg-red-50', 'text-yellow-600 bg-yellow-50', 'text-green-600 bg-green-50'];
                                      return (
                                          <div key={type} className={`p-2 rounded ${colors[index]}`}>
                                              <div className="flex justify-between items-center">
                                                  <span className="font-medium">{type}</span>
                                                  <span className="text-sm font-bold">{count}</span>
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>

                          {/* HML Analysis */}
                          <div className="card p-4">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">💰 HML Analysis</h4>
                              <p className="text-sm text-gray-600 mb-4">High, Medium, Low Value</p>
                              <div className="space-y-3">
                                  {['High', 'Medium', 'Low'].map((type, index) => {
                                      const count = analytics.hmlAnalysis.filter(item => item.classification === type).length;
                                      const colors = ['text-purple-600 bg-purple-50', 'text-blue-600 bg-blue-50', 'text-gray-600 bg-gray-50'];
                                      return (
                                          <div key={type} className={`p-2 rounded ${colors[index]}`}>
                                              <div className="flex justify-between items-center">
                                                  <span className="font-medium">{type}</span>
                                                  <span className="text-sm font-bold">{count}</span>
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>

                          {/* FSN Analysis */}
                          <div className="card p-4">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">⚡ FSN Analysis</h4>
                              <p className="text-sm text-gray-600 mb-4">Fast, Slow, Non-moving</p>
                              <div className="space-y-3">
                                  {['Fast', 'Slow', 'Non-moving'].map((type, index) => {
                                      const count = analytics.fsnAnalysis.filter(item => item.classification === type).length;
                                      const colors = ['text-green-600 bg-green-50', 'text-orange-600 bg-orange-50', 'text-red-600 bg-red-50'];
                                      return (
                                          <div key={type} className={`p-2 rounded ${colors[index]}`}>
                                              <div className="flex justify-between items-center">
                                                  <span className="font-medium">{type}</span>
                                                  <span className="text-sm font-bold">{count}</span>
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>

                          {/* SDE Analysis */}
                          <div className="card p-4">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">📦 SDE Analysis</h4>
                              <p className="text-sm text-gray-600 mb-4">Scarce, Difficult, Easy</p>
                              <div className="space-y-3">
                                  {['Scarce', 'Difficult', 'Easily Available'].map((type, index) => {
                                      const count = analytics.sdeAnalysis.filter(item => item.classification === type).length;
                                      const colors = ['text-red-600 bg-red-50', 'text-yellow-600 bg-yellow-50', 'text-green-600 bg-green-50'];
                                      return (
                                          <div key={type} className={`p-2 rounded ${colors[index]}`}>
                                              <div className="flex justify-between items-center">
                                                  <span className="font-medium">{type.split(' ')[0]}</span>
                                                  <span className="text-sm font-bold">{count}</span>
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Inventory Optimization Techniques */}
                  <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">⚙️ Inventory Optimization Dashboard</h3>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                          {/* EOQ Analysis */}
                          <div className="card p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">📏 Economic Order Quantity (EOQ)</h4>
                              <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4 text-center mb-4">
                                      <div className="p-3 bg-blue-50 rounded-lg">
                                          <p className="text-xl font-bold text-blue-600">
                                              {analytics.inventoryOptimization.eoqAnalysis.length}
                                          </p>
                                          <p className="text-sm text-blue-600">Products Analyzed</p>
                                      </div>
                                      <div className="p-3 bg-green-50 rounded-lg">
                                          <p className="text-xl font-bold text-green-600">
                                              {formatCurrency(analytics.inventoryOptimization.eoqAnalysis.reduce((sum, item) => sum + item.totalCost, 0))}
                                          </p>
                                          <p className="text-sm text-green-600">Total EOQ Cost</p>
                                      </div>
                                  </div>

                                  <div className="space-y-2">
                                      <h5 className="font-medium text-gray-900">Top EOQ Recommendations:</h5>
                                      {analytics.inventoryOptimization.eoqAnalysis.slice(0, 3).map((item) => (
                                          <div key={item.productId} className="p-2 bg-gray-50 rounded text-sm">
                                              <div className="flex justify-between">
                                                  <span className="font-medium">{item.productName}</span>
                                                  <span className="text-blue-600">EOQ: {item.economicOrderQuantity}</span>
                                              </div>
                                              <div className="text-gray-600">
                                                  Reorder at: {item.reorderPoint} units
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>

                          {/* JIT Metrics */}
                          <div className="card p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">⚡ Just-in-Time (JIT) Metrics</h4>
                              <div className="grid grid-cols-2 gap-4">
                                  <div className="text-center p-3 bg-green-50 rounded-lg">
                                      <p className="text-lg font-bold text-green-600">
                                          {analytics.inventoryOptimization.jitMetrics.inventoryTurnover.toFixed(1)}x
                                      </p>
                                      <p className="text-sm text-green-600">Inventory Turnover</p>
                                  </div>
                                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                                      <p className="text-lg font-bold text-blue-600">
                                          {analytics.inventoryOptimization.jitMetrics.wasteReduction.toFixed(1)}%
                                      </p>
                                      <p className="text-sm text-blue-600">Waste Reduction</p>
                                  </div>
                                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                      <p className="text-lg font-bold text-yellow-600">
                                          {analytics.inventoryOptimization.jitMetrics.supplierReliability.toFixed(1)}%
                                      </p>
                                      <p className="text-sm text-yellow-600">Supplier Reliability</p>
                                  </div>
                                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                                      <p className="text-lg font-bold text-purple-600">
                                          {analytics.inventoryOptimization.jitMetrics.stockoutFrequency.toFixed(1)}%
                                      </p>
                                      <p className="text-sm text-purple-600">Stockout Frequency</p>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Safety Stock & MRP */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                          {/* Safety Stock Analysis */}
                          <div className="card p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">🛡️ Safety Stock Analysis</h4>
                              <div className="space-y-3">
                                  {analytics.inventoryOptimization.safetyStockAnalysis.slice(0, 5).map((item) => (
                                      <div key={item.productId} className="p-3 border rounded">
                                          <div className="flex justify-between items-center mb-2">
                                              <span className="font-medium text-gray-900">{item.productName}</span>
                                              <span className={`text-sm px-2 py-1 rounded ${item.recommendedSafetyStock > item.currentSafetyStock
                                                      ? 'bg-red-100 text-red-800'
                                                      : 'bg-green-100 text-green-800'
                                                  }`}>
                                                  {item.recommendedSafetyStock > item.currentSafetyStock ? 'Increase' : 'Adequate'}
                                              </span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 text-sm">
                                              <div>
                                                  <p className="text-gray-500">Current</p>
                                                  <p className="font-medium">{item.currentSafetyStock}</p>
                                              </div>
                                              <div>
                                                  <p className="text-gray-500">Recommended</p>
                                                  <p className="font-medium">{item.recommendedSafetyStock}</p>
                                              </div>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>

                          {/* MRP Recommendations */}
                          <div className="card p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">📋 MRP Recommendations</h4>
                              <div className="space-y-3">
                                  {analytics.inventoryOptimization.mrpRecommendations.slice(0, 5).map((item) => (
                                      <div key={item.productId} className="p-3 bg-blue-50 rounded">
                                          <div className="flex justify-between items-center mb-2">
                                              <span className="font-medium text-blue-900">{item.productName}</span>
                                              <span className="text-sm text-blue-700">Qty: {item.plannedOrderQuantity}</span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                                              <div>
                                                  <p className="text-blue-600">Order Date</p>
                                                  <p className="font-medium">{new Date(item.plannedOrderDate).toLocaleDateString()}</p>
                                              </div>
                                              <div>
                                                  <p className="text-blue-600">Required Date</p>
                                                  <p className="font-medium">{new Date(item.requiredDate).toLocaleDateString()}</p>
                                              </div>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Advanced Inventory Metrics */}
                  <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-6">📊 Advanced Inventory Performance Metrics</h3>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Key Performance Indicators */}
                          <div className="card p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">🎯 Key Metrics</h4>
                              <div className="space-y-4">
                                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                                      <div>
                                          <p className="text-sm text-green-600">GMROI</p>
                                          <p className="text-lg font-bold text-green-800">{analytics.advancedMetrics.gmroi.toFixed(1)}%</p>
                                      </div>
                                      <p className="text-xs text-green-600">Gross Margin ROI</p>
                                  </div>

                                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                                      <div>
                                          <p className="text-sm text-blue-600">DSI</p>
                                          <p className="text-lg font-bold text-blue-800">{analytics.advancedMetrics.dsi.toFixed(0)} days</p>
                                      </div>
                                      <p className="text-xs text-blue-600">Days Sales Inventory</p>
                                  </div>

                                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                                      <div>
                                          <p className="text-sm text-yellow-600">Obsolescence Risk</p>
                                          <p className="text-lg font-bold text-yellow-800">{analytics.advancedMetrics.obsolescenceRisk.toFixed(1)}%</p>
                                      </div>
                                      <p className="text-xs text-yellow-600">Risk Level</p>
                                  </div>
                              </div>
                          </div>

                          {/* Cost Analysis */}
                          <div className="card p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">💸 Cost Analysis</h4>
                              <div className="space-y-4">
                                  <div className="p-3 bg-red-50 rounded">
                                      <p className="text-sm text-red-600 mb-1">Stockout Cost</p>
                                      <p className="text-xl font-bold text-red-800">{formatCurrency(analytics.advancedMetrics.stockoutCost)}</p>
                                      <p className="text-xs text-red-600">Lost revenue potential</p>
                                  </div>

                                  <div className="p-3 bg-orange-50 rounded">
                                      <p className="text-sm text-orange-600 mb-1">Carrying Cost</p>
                                      <p className="text-xl font-bold text-orange-800">{formatCurrency(analytics.advancedMetrics.overheadCarryingCost)}</p>
                                      <p className="text-xs text-orange-600">Annual overhead</p>
                                  </div>
                              </div>
                          </div>

                          {/* Batch Tracking */}
                          <div className="card p-6">
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">📦 Batch Tracking</h4>
                              <div className="space-y-4">
                                  <div className="p-3 bg-yellow-50 rounded">
                                      <p className="text-sm text-yellow-600 mb-1">Near Expiry</p>
                                      <p className="text-xl font-bold text-yellow-800">{analytics.advancedMetrics.batchTracking.batchesNearExpiry}</p>
                                      <p className="text-xs text-yellow-600">Batches</p>
                                  </div>

                                  <div className="p-3 bg-red-50 rounded">
                                      <p className="text-sm text-red-600 mb-1">Quality Issues</p>
                                      <p className="text-xl font-bold text-red-800">{analytics.advancedMetrics.batchTracking.qualityIssues}</p>
                                      <p className="text-xs text-red-600">Items affected</p>
                                  </div>

                                  <div className="p-3 bg-purple-50 rounded">
                                      <p className="text-sm text-purple-600 mb-1">Recall Risk</p>
                                      <p className="text-xl font-bold text-purple-800">{analytics.advancedMetrics.batchTracking.recallRisk}</p>
                                      <p className="text-xs text-purple-600">High-risk items</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Financial Ratios & Customer Segmentation */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      {/* Financial Ratios */}
                      <div className="card p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-6">💰 Financial Health Ratios</h3>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-4 bg-blue-50 rounded-lg">
                                  <p className="text-xl font-bold text-blue-600">{analytics.financialRatios.grossMargin.toFixed(1)}%</p>
                                  <p className="text-sm text-blue-600">Gross Margin</p>
                              </div>
                              <div className="text-center p-4 bg-green-50 rounded-lg">
                                  <p className="text-xl font-bold text-green-600">{analytics.financialRatios.inventoryTurnover.toFixed(1)}x</p>
                                  <p className="text-sm text-green-600">Inventory Turnover</p>
                              </div>
                              <div className="text-center p-4 bg-purple-50 rounded-lg">
                                  <p className="text-xl font-bold text-purple-600">{analytics.financialRatios.returnOnInventoryInvestment.toFixed(1)}%</p>
                                  <p className="text-sm text-purple-600">ROI on Inventory</p>
                              </div>
                              <div className="text-center p-4 bg-orange-50 rounded-lg">
                                  <p className="text-xl font-bold text-orange-600">{analytics.financialRatios.fillRate.toFixed(1)}%</p>
                                  <p className="text-sm text-orange-600">Fill Rate</p>
                              </div>
                          </div>

                          <div className="mt-4 space-y-3">
                              <div className="flex justify-between text-sm">
                                  <span>Days Sales Outstanding</span>
                                  <span className="font-medium">{analytics.financialRatios.daysSalesOutstanding} days</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                  <span>Stockout Rate</span>
                                  <span className={`font-medium ${analytics.financialRatios.stockoutRate > 10 ? 'text-red-600' : 'text-green-600'}`}>
                                      {analytics.financialRatios.stockoutRate.toFixed(1)}%
                                  </span>
                              </div>
                          </div>
                      </div>

                      {/* Customer Segmentation */}
                      <div className="card p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-6">👥 Customer Segmentation</h3>
                          <div className="space-y-4">
                              {analytics.customerSegmentation.map((segment, index) => (
                                  <div key={segment.segment} className="p-3 border rounded-lg">
                                      <div className="flex justify-between items-center mb-2">
                                          <h4 className="font-medium text-gray-900">{segment.segment} Customers</h4>
                                          <span className={`px-2 py-1 rounded text-xs font-medium ${index === 0 ? 'bg-red-100 text-red-800' :
                                                  index === 1 ? 'bg-yellow-100 text-yellow-800' :
                                                      'bg-green-100 text-green-800'
                                              }`}>
                                              {segment.customers} customers
                                          </span>
                                      </div>
                                      <div className="grid grid-cols-3 gap-2 text-sm">
                                          <div>
                                              <p className="text-gray-500">AOV</p>
                                              <p className="font-medium">{formatCurrency(segment.averageOrderValue)}</p>
                                          </div>
                                          <div>
                                              <p className="text-gray-500">Revenue</p>
                                              <p className="font-medium">{formatCurrency(segment.totalRevenue)}</p>
                                          </div>
                                          <div>
                                              <p className="text-gray-500">Frequency</p>
                                              <p className="font-medium">{segment.orderFrequency}x/year</p>
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* Regional Performance & Product Lifecycle */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      {/* Regional Performance */}
                      <div className="card p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-6">🗺️ Regional Performance</h3>
                          <div className="space-y-4">
                              {analytics.regionalPerformance.map((region, index) => (
                                  <div key={region.region} className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                          <span className="font-medium">{region.region} Region</span>
                                          <div className="flex items-center space-x-2">
                                              <span className="text-gray-600">{formatCurrency(region.revenue)}</span>
                                              <span className={`text-xs ${region.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                  {formatPercentage(region.growth)}
                                              </span>
                                          </div>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div
                                              className={`h-2 rounded-full transition-all duration-500 ${index === 0 ? 'bg-blue-500' :
                                                      index === 1 ? 'bg-green-500' :
                                                          index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                                                  }`}
                                              style={{
                                                  width: `${Math.min((region.revenue / (analytics.regionalPerformance[0]?.revenue || 1)) * 100, 100)}%`
                                              }}
                                          ></div>
                                      </div>
                                      <div className="flex justify-between text-xs text-gray-500">
                                          <span>{region.orders} orders</span>
                                          <span>Profit: {formatCurrency(region.profit)}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* Product Lifecycle */}
                      <div className="card p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-6">🔄 Product Lifecycle Distribution</h3>
                          <ResponsiveContainer width="100%" height={250}>
                              <PieChart>
                                  <Pie
                                      data={[
                                          { name: 'Introduction', value: analytics.productLifecycle.introduction, color: CHART_COLORS.info },
                                          { name: 'Growth', value: analytics.productLifecycle.growth, color: CHART_COLORS.success },
                                          { name: 'Maturity', value: analytics.productLifecycle.maturity, color: CHART_COLORS.warning },
                                          { name: 'Decline', value: analytics.productLifecycle.decline, color: CHART_COLORS.danger }
                                      ]}
                                      cx="50%"
                                      cy="50%"
                                      outerRadius={80}
                                      dataKey="value"
                                      label={({ name, value }) => `${name}: ${value}`}
                                  >
                                      {[
                                          { name: 'Introduction', value: analytics.productLifecycle.introduction, color: CHART_COLORS.info },
                                          { name: 'Growth', value: analytics.productLifecycle.growth, color: CHART_COLORS.success },
                                          { name: 'Maturity', value: analytics.productLifecycle.maturity, color: CHART_COLORS.warning },
                                          { name: 'Decline', value: analytics.productLifecycle.decline, color: CHART_COLORS.danger }
                                      ].map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} />
                                      ))}
                                  </Pie>
                                  <Tooltip />
                                  <Legend />
                              </PieChart>
                          </ResponsiveContainer>

                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                              <div className="p-2 bg-blue-50 rounded text-center">
                                  <p className="font-medium text-blue-900">Introduction</p>
                                  <p className="text-blue-700">{analytics.productLifecycle.introduction} products</p>
                              </div>
                              <div className="p-2 bg-green-50 rounded text-center">
                                  <p className="font-medium text-green-900">Growth</p>
                                  <p className="text-green-700">{analytics.productLifecycle.growth} products</p>
                              </div>
                              <div className="p-2 bg-yellow-50 rounded text-center">
                                  <p className="font-medium text-yellow-900">Maturity</p>
                                  <p className="text-yellow-700">{analytics.productLifecycle.maturity} products</p>
                              </div>
                              <div className="p-2 bg-red-50 rounded text-center">
                                  <p className="font-medium text-red-900">Decline</p>
                                  <p className="text-red-700">{analytics.productLifecycle.decline} products</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Bottom Section - AI-Powered Recommendations */}
              <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">💡 AI-Powered Inventory Intelligence & Recommendations</h2>

                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {/* Classification-Based Strategies */}
                      <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100">
                          <h3 className="text-lg font-semibold text-blue-900 mb-4">🏷️ Multi-Classification Strategy</h3>
                          <div className="space-y-3 text-sm">
                              <div className="flex items-start space-x-2">
                                  <span className="text-blue-600">•</span>
                                  <p className="text-blue-800">
                                      <strong>ABC + VED:</strong> Focus on Class A + Vital items - these are your business-critical high-revenue products
                                  </p>
                              </div>
                              <div className="flex items-start space-x-2">
                                  <span className="text-blue-600">•</span>
                                  <p className="text-blue-800">
                                      <strong>HML + SDE:</strong> High-value + Scarce items need supplier diversification and strategic partnerships
                                  </p>
                              </div>
                              <div className="flex items-start space-x-2">
                                  <span className="text-blue-600">•</span>
                                  <p className="text-blue-800">
                                      <strong>FSN Alert:</strong> {analytics.fsnAnalysis.filter(item => item.classification === 'Non-moving').length} non-moving items need immediate action
                                  </p>
                              </div>
                          </div>
                      </div>

                      {/* EOQ & Optimization */}
                      <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100">
                          <h3 className="text-lg font-semibold text-green-900 mb-4">⚙️ Optimization Opportunities</h3>
                          <div className="space-y-3 text-sm">
                              <div className="flex items-start space-x-2">
                                  <span className="text-green-600">•</span>
                                  <p className="text-green-800">
                                      <strong>EOQ Implementation:</strong> Potential savings of {formatCurrency(analytics.inventoryOptimization.eoqAnalysis.reduce((sum, item) => sum + item.totalCost * 0.15, 0))} annually
                                  </p>
                              </div>
                              <div className="flex items-start space-x-2">
                                  <span className="text-green-600">•</span>
                                  <p className="text-green-800">
                                      <strong>JIT Benefits:</strong> {analytics.inventoryOptimization.jitMetrics.wasteReduction.toFixed(1)}% waste reduction achieved
                                  </p>
                              </div>
                              <div className="flex items-start space-x-2">
                                  <span className="text-green-600">•</span>
                                  <p className="text-green-800">
                                      <strong>Safety Stock:</strong> Optimize {analytics.inventoryOptimization.safetyStockAnalysis.filter(item => item.recommendedSafetyStock !== item.currentSafetyStock).length} products
                                  </p>
                              </div>
                          </div>
                      </div>

                      {/* Risk Management */}
                      <div className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100">
                          <h3 className="text-lg font-semibold text-purple-900 mb-4">🛡️ Risk Mitigation</h3>
                          <div className="space-y-3 text-sm">
                              <div className="flex items-start space-x-2">
                                  <span className="text-purple-600">•</span>
                                  <p className="text-purple-800">
                                      <strong>Stockout Risk:</strong> Potential loss of {formatCurrency(analytics.advancedMetrics.stockoutCost)} from stockouts
                                  </p>
                              </div>
                              <div className="flex items-start space-x-2">
                                  <span className="text-purple-600">•</span>
                                  <p className="text-purple-800">
                                      <strong>Obsolescence:</strong> {analytics.advancedMetrics.obsolescenceRisk.toFixed(1)}% risk level - monitor slow movers
                                  </p>
                              </div>
                              <div className="flex items-start space-x-2">
                                  <span className="text-purple-600">•</span>
                                  <p className="text-purple-800">
                                      <strong>Batch Tracking:</strong> {analytics.advancedMetrics.batchTracking.batchesNearExpiry} batches need urgent attention
                                  </p>
                              </div>
                          </div>
                      </div>

                      {/* Performance Optimization */}
                      <div className="card p-6 bg-gradient-to-br from-orange-50 to-orange-100">
                          <h3 className="text-lg font-semibold text-orange-900 mb-4">� Performance Enhancement</h3>
                          <div className="space-y-3 text-sm">
                              <div className="flex items-start space-x-2">
                                  <span className="text-orange-600">•</span>
                                  <p className="text-orange-800">
                                      <strong>GMROI:</strong> Current {analytics.advancedMetrics.gmroi.toFixed(1)}% - target 150%+ for optimal performance
                                  </p>
                              </div>
                              <div className="flex items-start space-x-2">
                                  <span className="text-orange-600">•</span>
                                  <p className="text-orange-800">
                                      <strong>Turnover:</strong> {analytics.financialRatios.inventoryTurnover.toFixed(1)}x current - aim for 8-12x industry benchmark
                                  </p>
                              </div>
                              <div className="flex items-start space-x-2">
                                  <span className="text-orange-600">•</span>
                                  <p className="text-orange-800">
                                      <strong>DSI:</strong> {analytics.advancedMetrics.dsi.toFixed(0)} days - reduce to 30-45 days for better cash flow
                                  </p>
                              </div>
                          </div>
                      </div>

                      {/* Strategic Actions */}
                      <div className="card p-6 bg-gradient-to-br from-red-50 to-red-100">
                          <h3 className="text-lg font-semibold text-red-900 mb-4">🎯 Strategic Actions</h3>
                          <div className="space-y-3 text-sm">
                              <div className="flex items-start space-x-2">
                                  <span className="text-red-600">•</span>
                                  <p className="text-red-800">
                                      <strong>Immediate:</strong> Implement EOQ for top 20 products to reduce holding costs
                                  </p>
                              </div>
                              <div className="flex items-start space-x-2">
                                  <span className="text-red-600">•</span>
                                  <p className="text-red-800">
                                      <strong>Short-term:</strong> Establish JIT partnerships with reliable suppliers
                                  </p>
                              </div>
                              <div className="flex items-start space-x-2">
                                  <span className="text-red-600">•</span>
                                  <p className="text-red-800">
                                      <strong>Long-term:</strong> Implement perpetual inventory system for real-time tracking
                                  </p>
                              </div>
                          </div>
                      </div>

                      {/* Technology Integration */}
                      <div className="card p-6 bg-gradient-to-br from-cyan-50 to-cyan-100">
                          <h3 className="text-lg font-semibold text-cyan-900 mb-4">� Technology Roadmap</h3>
                          <div className="space-y-3 text-sm">
                              <div className="flex items-start space-x-2">
                                  <span className="text-cyan-600">•</span>
                                  <p className="text-cyan-800">
                                      <strong>Automation:</strong> Deploy MRP system for {analytics.inventoryOptimization.mrpRecommendations.length} priority items
                                  </p>
                              </div>
                              <div className="flex items-start space-x-2">
                                  <span className="text-cyan-600">•</span>
                                  <p className="text-cyan-800">
                                      <strong>AI/ML:</strong> Implement demand forecasting for seasonal trend optimization
                                  </p>
                              </div>
                              <div className="flex items-start space-x-2">
                                  <span className="text-cyan-600">•</span>
                                  <p className="text-cyan-800">
                                      <strong>Integration:</strong> Connect supplier systems for real-time availability updates
                                  </p>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Action Plan Summary */}
                  <div className="mt-8 card p-6 bg-gradient-to-r from-gray-50 to-gray-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">📋 30-60-90 Day Action Plan</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-3">
                              <h4 className="font-semibold text-blue-900">🚀 30 Days (Quick Wins)</h4>
                              <ul className="space-y-2 text-sm text-blue-800">
                                  <li>• Implement ABC analysis for procurement prioritization</li>
                                  <li>• Set up reorder alerts for Class A + Vital items</li>
                                  <li>• Review and adjust safety stock levels</li>
                                  <li>• Identify and liquidate non-moving inventory</li>
                              </ul>
                          </div>
                          <div className="space-y-3">
                              <h4 className="font-semibold text-green-900">⚙️ 60 Days (Optimization)</h4>
                              <ul className="space-y-2 text-sm text-green-800">
                                  <li>• Deploy EOQ calculations for top 50 products</li>
                                  <li>• Negotiate JIT agreements with key suppliers</li>
                                  <li>• Implement MRP for production planning</li>
                                  <li>• Set up batch tracking system</li>
                              </ul>
                          </div>
                          <div className="space-y-3">
                              <h4 className="font-semibold text-purple-900">🎯 90 Days (Strategic)</h4>
                              <ul className="space-y-2 text-sm text-purple-800">
                                  <li>• Full perpetual inventory implementation</li>
                                  <li>• Advanced demand forecasting deployment</li>
                                  <li>• Supplier integration and automation</li>
                                  <li>• Performance dashboards and KPI tracking</li>
                              </ul>
                          </div>
                      </div>
                  </div>
              </div>
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

          {/* Detailed Business Intelligence Report View */}
          {showPrintReport && (
              <div className="fixed inset-0 z-50 bg-white overflow-auto">
                  {/* Report Controls Header */}
                  <div className="no-print sticky top-0 z-60 bg-white border-b shadow-sm">
                      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                              <h2 className="text-xl font-bold text-gray-900">📊 Comprehensive Business Intelligence Report</h2>
                              <span className="text-sm text-gray-500">
                                  Generated on {new Date().toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      weekday: 'long'
                                  })}
                              </span>
                          </div>
                          <div className="flex items-center space-x-3">
                              <button
                                  onClick={handleActualPrint}
                                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                              >
                                  <Printer className="h-4 w-4" />
                                  <span>Print Report</span>
                              </button>
                              <button
                                  onClick={handleClosePrintReport}
                                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                              >
                                  <span>Close</span>
                                  <span className="text-lg">×</span>
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* Report Content */}
                  <div className="max-w-7xl mx-auto">
                      <PrintableAnalyticsReport
                          analytics={analytics}
                          companyName="IditTrack Analytics"
                          reportDate={new Date().toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              weekday: 'long'
                          })}
                      />
                  </div>
              </div>
          )}
    </div>
  );
};

export default EnhancedDashboard;
