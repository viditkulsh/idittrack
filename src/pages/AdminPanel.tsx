import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, Shield, Crown, User, Edit2, Mail, Building2, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import SessionMonitor from '../components/SessionMonitor';

interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string; // Fixed: use company_name to match database schema
  role: 'admin' | 'manager' | 'user';
  created_at: string;
  updated_at: string;
}

const AdminPanel: React.FC = () => {
  const { user, profile, loading: authLoading, isAdmin } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Profile>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Helper function to generate user initials and avatar color
  const getUserInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (email) {
      const name = email.split('@')[0];
      const parts = name.split(/[._-]/);
      if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return 'U?';
  };

  const getAvatarColor = (email: string) => {
    const colors = [
      'bg-gradient-to-br from-purple-400 to-purple-600',
      'bg-gradient-to-br from-blue-400 to-blue-600',
      'bg-gradient-to-br from-green-400 to-green-600',
      'bg-gradient-to-br from-yellow-400 to-yellow-600',
      'bg-gradient-to-br from-red-400 to-red-600',
      'bg-gradient-to-br from-indigo-400 to-indigo-600',
      'bg-gradient-to-br from-pink-400 to-pink-600',
      'bg-gradient-to-br from-teal-400 to-teal-600',
    ];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  useEffect(() => {
    // Only fetch profiles when we have a user and profile loaded and they are admin
    if (!authLoading && user && profile && isAdmin()) {
      fetchProfiles();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, profile, authLoading, isAdmin]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
      setError(`Failed to fetch user profiles: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (profile: Profile) => {
    setEditingId(profile.id);
    setEditData({
      first_name: profile.first_name,
      last_name: profile.last_name,
      company_name: profile.company_name,
      role: profile.role
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(editData)
        .eq('id', id);

      if (error) throw error;

      setSuccess('Profile updated successfully');
      setEditingId(null);
      setEditData({});
      fetchProfiles();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
      setTimeout(() => setError(null), 3000);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'manager':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and has profile
  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  // Check admin privileges
  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Current role: {profile?.role || 'Loading...'}</p>
          {profile?.role && (
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Refresh Page
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show loading while fetching profiles
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-lg">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-gray-600">Manage users and system configuration</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <SessionMonitor onSessionExpired={() => window.location.reload()} />
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg text-green-700 animate-slide-in-left shadow-md">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="font-medium">{success}</span>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg text-red-700 animate-slide-in-left shadow-md">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="card p-0 overflow-hidden shadow-lg">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                  <p className="text-sm text-gray-600">{profiles.length} registered users</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    User Profile
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <Building2 className="h-4 w-4" />
                      <span>Company</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Role & Permissions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Member Since</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {profiles.map((profile, index) => (
                  <tr
                    key={profile.id}
                    className={`hover:bg-gray-50 transition-all duration-200 ${editingId === profile.id ? 'bg-blue-50 shadow-inner' : ''
                      }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        {/* User Avatar */}
                        <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${getAvatarColor(profile.email)}`}>
                          {getUserInitials(profile.first_name, profile.last_name, profile.email)}
                        </div>

                        <div className="flex-1 min-w-0">
                          {editingId === profile.id ? (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={editData.first_name || ''}
                                  onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                                  className="input-field text-sm border-2 border-blue-200 focus:border-blue-400 rounded-lg"
                                  placeholder="First name"
                                />
                                <input
                                  type="text"
                                  value={editData.last_name || ''}
                                  onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                                  className="input-field text-sm border-2 border-blue-200 focus:border-blue-400 rounded-lg"
                                  placeholder="Last name"
                                />
                              </div>
                            </div>
                          ) : (
                              <div>
                                <div className="font-semibold text-gray-900 text-lg">
                                  {profile.first_name && profile.last_name
                                    ? `${profile.first_name} ${profile.last_name}`
                                    : profile.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{profile.email}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-6 whitespace-nowrap">
                      {editingId === profile.id ? (
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            value={editData.company_name || ''}
                            onChange={(e) => setEditData({ ...editData, company_name: e.target.value })}
                            className="input-field text-sm pl-10 border-2 border-blue-200 focus:border-blue-400 rounded-lg"
                            placeholder="Company name"
                          />
                        </div>
                      ) : (
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900 font-medium">
                              {profile.company_name || <span className="text-gray-400 italic">Not specified</span>}
                            </span>
                          </div>
                      )}
                    </td>

                    <td className="px-6 py-6 whitespace-nowrap">
                      {editingId === profile.id ? (
                        <select
                          value={editData.role || profile.role}
                          onChange={(e) => setEditData({ ...editData, role: e.target.value as 'admin' | 'manager' | 'user' })}
                          className="input-field text-sm border-2 border-blue-200 focus:border-blue-400 rounded-lg"
                        >
                          <option value="user">👤 User</option>
                          <option value="manager">🛡️ Manager</option>
                          <option value="admin">👑 Admin</option>
                        </select>
                      ) : (
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${profile.role === 'admin' ? 'bg-yellow-100' : profile.role === 'manager' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                              {getRoleIcon(profile.role)}
                            </div>
                            <div>
                              <span className={`px-3 py-1 text-xs font-bold rounded-full border-2 ${getRoleBadgeClass(profile.role)}`}>
                                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                {profile.role === 'admin' && 'Full system access'}
                                {profile.role === 'manager' && 'Manage inventory & orders'}
                                {profile.role === 'user' && 'View personal data'}
                              </div>
                            </div>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(profile.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.ceil((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-6 whitespace-nowrap">
                      {editingId === profile.id ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => saveEdit(profile.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(profile)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit User
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enhanced Role Descriptions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Role Card */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-yellow-200 rounded-full">
                <Crown className="h-6 w-6 text-yellow-700" />
              </div>
              <div>
                <h3 className="font-bold text-yellow-900 text-lg">Administrator</h3>
                <p className="text-yellow-700 text-sm">Full System Control</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                <span>User management & role assignment</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                <span>Complete inventory control</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                <span>System configuration access</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-yellow-600" />
                <span>Analytics & reporting</span>
              </li>
            </ul>
          </div>

          {/* Manager Role Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-blue-200 rounded-full">
                <Shield className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 text-lg">Manager</h3>
                <p className="text-blue-700 text-sm">Operations Management</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>Inventory & product management</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>Order processing & tracking</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>View user profiles</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>Generate reports</span>
              </li>
            </ul>
          </div>

          {/* User Role Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gray-200 rounded-full">
                <User className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Standard User</h3>
                <p className="text-gray-700 text-sm">Personal Access</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-800">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-gray-600" />
                <span>View & edit personal profile</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-gray-600" />
                <span>Access personal dashboard</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-gray-600" />
                <span>Upload & manage files</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-gray-600" />
                <span>View personal analytics</span>
              </li>
            </ul>
          </div>
        </div>

        {/* User Statistics */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Crown className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {profiles.filter(p => p.role === 'admin').length}
                </p>
                <p className="text-sm text-gray-600">Administrators</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {profiles.filter(p => p.role === 'manager').length}
                </p>
                <p className="text-sm text-gray-600">Managers</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {profiles.filter(p => p.role === 'user').length}
                </p>
                <p className="text-sm text-gray-600">Standard Users</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
