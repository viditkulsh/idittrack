import { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingCart, 
  AlertTriangle,
  DollarSign,
  BarChart3,
  Activity,
  ArrowUp,
  ArrowDown,
  Calendar,
  Filter,
  Upload,
  Users,
  Crown,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions, useRoleAccess } from '../hooks/usePermissions';
import { PermissionGate, AdminOnly, ManagerOrAdmin, SuperAdminOnly } from '../components/PermissionGate';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, profile, currentTenant } = useAuth();
  const {
    canReadInventory,
    canReadOrders,
    canReadProducts,
    canManageUsers,
    isAdmin,
    isManager,
    isSuperAdmin
  } = usePermissions();
  const { canViewAllOrders } = useRoleAccess();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Role-based stats configuration
  const getStatsForRole = () => {
    const baseStats: Array<{
      title: string;
      value: string;
      change: string;
      changeType: 'increase' | 'decrease' | 'neutral';
      icon: any;
      color: string;
      bgColor: string;
    }> = [];

    // Products stats - visible if user can read products
    if (canReadProducts) {
      baseStats.push({
        title: 'Total Products',
        value: '0',
        change: '--',
        changeType: 'neutral',
        icon: Package,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      });
    }

    // Orders stats - visible if user can read orders
    if (canReadOrders) {
      baseStats.push({
        title: canViewAllOrders ? 'All Orders' : 'My Orders',
        value: '0',
        change: '--',
        changeType: 'neutral',
        icon: ShoppingCart,
        color: 'text-primary-600',
        bgColor: 'bg-primary-100'
      });
    }

    // Revenue stats - visible for admins and managers
    if (isAdmin() || isManager()) {
      baseStats.push({
        title: 'Revenue',
        value: '$0.00',
        change: '--',
        changeType: 'neutral',
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      });
    }

    // Inventory alerts - visible if user can read inventory
    if (canReadInventory) {
      baseStats.push({
        title: 'Low Stock Items',
        value: '0',
        change: '--',
        changeType: 'neutral',
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      });
    }

    // Users stats - visible if user can manage users
    if (canManageUsers) {
      baseStats.push({
        title: isSuperAdmin() ? 'Platform Users' : 'Team Members',
        value: '0',
        change: '--',
        changeType: 'neutral',
        icon: Users,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      });
    }

    return baseStats;
  };

  const stats = getStatsForRole();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
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
              <div className="flex items-center space-x-4">
                <p className="text-gray-600">Here's an overview of your business.</p>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${profile?.role === 'admin' ? 'bg-red-100 text-red-800' :
                      profile?.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                    {profile?.role === 'admin' && isSuperAdmin() ? 'Super Admin' :
                      profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'User'}
                  </span>
                  {currentTenant && (
                    <span className="text-sm text-gray-500">
                      @ {currentTenant.tenant_name}
                    </span>
                  )}
                </div>
              </div>
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
            <div className="grid grid-cols-1 gap-3">

              <PermissionGate resource="products" action="create">
                <Link to="/products" className="w-full btn-primary flex items-center justify-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Add Products</span>
                </Link>
              </PermissionGate>

              <PermissionGate resource="orders" action="create">
                <Link to="/orders" className="w-full btn-secondary flex items-center justify-center space-x-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Create Order</span>
                </Link>
              </PermissionGate>

              <Link to="/upload" className="w-full btn-secondary flex items-center justify-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload Files</span>
              </Link>

              <ManagerOrAdmin>
                <Link to="/admin" className="w-full btn-outline flex items-center justify-center space-x-2">
                  <Crown className="h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
              </ManagerOrAdmin>

              <PermissionGate resource="users" action="manage">
                <Link to="/users" className="w-full btn-outline flex items-center justify-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Manage Users</span>
                </Link>
              </PermissionGate>

              <SuperAdminOnly>
                <Link to="/system" className="w-full btn-outline flex items-center justify-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>System Settings</span>
                </Link>
              </SuperAdminOnly>

            </div>
          </div>
        </div>

        {/* Role-specific sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Admin/Manager Section */}
          <ManagerOrAdmin>
            <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                {isAdmin() ? 'Administrative Overview' : 'Management Dashboard'}
              </h3>
              <div className="space-y-4">
                <PermissionGate resource="users" action="read">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Team Management</span>
                    </div>
                    <Link to="/users" className="text-blue-600 hover:text-blue-800">
                      View →
                    </Link>
                  </div>
                </PermissionGate>

                <PermissionGate resource="analytics" action="read">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Analytics & Reports</span>
                    </div>
                    <Link to="/analytics" className="text-blue-600 hover:text-blue-800">
                      View →
                    </Link>
                  </div>
                </PermissionGate>

                <AdminOnly>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">System Configuration</span>
                    </div>
                    <Link to="/admin" className="text-blue-600 hover:text-blue-800">
                      Configure →
                    </Link>
                  </div>
                </AdminOnly>
              </div>
            </div>
          </ManagerOrAdmin>

          {/* Recent Activity */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent activity</p>
                <p className="text-sm text-gray-500">Activity will appear here as you use the system</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
