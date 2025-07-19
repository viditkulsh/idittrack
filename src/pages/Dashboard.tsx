import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  Users,
  BarChart3,
  Activity,
  ArrowUp,
  ArrowDown,
  Calendar,
  Filter
} from 'lucide-react';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      title: 'Total Products',
      value: '2,847',
      change: '+12%',
      changeType: 'increase',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Orders',
      value: '156',
      change: '+8%',
      changeType: 'increase',
      icon: ShoppingCart,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      title: 'Revenue',
      value: '$84,532',
      change: '+23%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Low Stock Items',
      value: '23',
      change: '-5%',
      changeType: 'decrease',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Smith', amount: '$234.50', status: 'Processing', date: '2024-01-15' },
    { id: 'ORD-002', customer: 'Sarah Johnson', amount: '$567.80', status: 'Shipped', date: '2024-01-15' },
    { id: 'ORD-003', customer: 'Mike Chen', amount: '$123.45', status: 'Delivered', date: '2024-01-14' },
    { id: 'ORD-004', customer: 'Emma Wilson', amount: '$789.20', status: 'Processing', date: '2024-01-14' },
    { id: 'ORD-005', customer: 'David Brown', amount: '$345.67', status: 'Shipped', date: '2024-01-13' }
  ];

  const lowStockItems = [
    { name: 'Wireless Headphones', sku: 'WH-001', current: 5, minimum: 10, status: 'Critical' },
    { name: 'Bluetooth Speaker', sku: 'BS-002', current: 8, minimum: 15, status: 'Low' },
    { name: 'Phone Case', sku: 'PC-003', current: 12, minimum: 20, status: 'Low' },
    { name: 'USB Cable', sku: 'UC-004', current: 3, minimum: 25, status: 'Critical' }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <button className="btn-secondary flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Last 30 days</span>
              </button>
              <button className="btn-secondary flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="card p-6 hover:scale-105 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.changeType === 'increase' ? (
                        <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts and Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Sales Chart */}
          <div className="lg:col-span-2 card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Sales Overview</h3>
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Last 7 days</span>
              </div>
            </div>
            <div className="h-64 bg-gradient-to-br from-primary-50 to-orange-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-12 w-12 text-primary-400 mx-auto mb-4" />
                <p className="text-gray-600">Sales chart would go here</p>
                <p className="text-sm text-gray-500">Integration with chart library needed</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
            <div className="space-y-4">
              <button className="w-full btn-primary flex items-center justify-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Add Product</span>
              </button>
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Create Order</span>
              </button>
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>View Reports</span>
              </button>
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Manage Customers</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Orders and Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <button className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div>
                    <p className="font-medium text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                    <p className="text-xs text-gray-500">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{order.amount}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h3>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="space-y-4">
              {lowStockItems.map((item, index) => (
                <div key={item.sku} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">SKU: {item.sku}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Stock: {item.current}</span>
                    <span className="text-gray-600">Min: {item.minimum}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        item.current <= item.minimum / 2 ? 'bg-red-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.min((item.current / item.minimum) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;