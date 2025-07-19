import { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  BarChart3,
  Activity,
  ArrowUp,
  ArrowDown,
  Calendar,
  Filter,
  Plus,
  Upload
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Empty state stats for new users
  const stats = [
    {
      title: 'Total Products',
      value: '0',
      change: '--',
      changeType: 'neutral',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Orders',
      value: '0',
      change: '--',
      changeType: 'neutral',
      icon: ShoppingCart,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      title: 'Revenue',
      value: '$0.00',
      change: '--',
      changeType: 'neutral',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Low Stock Items',
      value: '0',
      change: '--',
      changeType: 'neutral',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : user?.email?.split('@')[0] || 'User'}!
              </h1>
              <p className="text-gray-600">Here's an overview of your business.</p>
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
                      ) : stat.changeType === 'decrease' ? (
                        <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                      ) : (
                        <div className="h-4 w-4 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'increase' 
                          ? 'text-green-600' 
                          : stat.changeType === 'decrease' 
                          ? 'text-red-600' 
                          : 'text-gray-500'
                      }`}>
                        {stat.change}
                      </span>
                      {stat.changeType !== 'neutral' && (
                        <span className="text-sm text-gray-500 ml-1">vs last month</span>
                      )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/products" className="w-full btn-primary flex items-center justify-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Add Products</span>
              </Link>
              <Link to="/orders" className="w-full btn-secondary flex items-center justify-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Create Order</span>
              </Link>
              <Link to="/upload" className="w-full btn-secondary flex items-center justify-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload Data</span>
              </Link>
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>View Reports</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Orders and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <Link to="/orders" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                View all
              </Link>
            </div>
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h4>
              <p className="text-gray-600 mb-4">Your recent orders will appear here once customers start placing orders.</p>
              <Link to="/orders" className="btn-primary inline-flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create Order</span>
              </Link>
            </div>
          </div>

          {/* Inventory Status */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Inventory Status</h3>
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No products yet</h4>
              <p className="text-gray-600 mb-4">Add your first products to start tracking inventory and manage your business.</p>
              <Link to="/products" className="btn-primary inline-flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Products</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;