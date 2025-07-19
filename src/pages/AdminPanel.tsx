import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, Shield, Crown, User, Edit2, Save, X } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  role: 'admin' | 'manager' | 'user';
  created_at: string;
  updated_at: string;
}

const AdminPanel: React.FC = () => {
  const { isAdmin } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Profile>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin()) {
      fetchProfiles();
    }
  }, [isAdmin]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setError('Failed to fetch user profiles');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (profile: Profile) => {
    setEditingId(profile.id);
    setEditData({
      first_name: profile.first_name,
      last_name: profile.last_name,
      company: profile.company,
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

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <p className="text-gray-600">Manage users and their roles</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
              <span className="text-sm text-gray-500">({profiles.length} users)</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {editingId === profile.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editData.first_name || ''}
                              onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                              className="input-field text-sm"
                              placeholder="First name"
                            />
                            <input
                              type="text"
                              value={editData.last_name || ''}
                              onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                              className="input-field text-sm"
                              placeholder="Last name"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="font-medium text-gray-900">
                              {profile.first_name && profile.last_name 
                                ? `${profile.first_name} ${profile.last_name}`
                                : profile.email.split('@')[0]}
                            </div>
                            <div className="text-sm text-gray-500">{profile.email}</div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === profile.id ? (
                        <input
                          type="text"
                          value={editData.company || ''}
                          onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                          className="input-field text-sm"
                          placeholder="Company"
                        />
                      ) : (
                        <span className="text-gray-900">{profile.company || 'Not specified'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === profile.id ? (
                        <select
                          value={editData.role || profile.role}
                          onChange={(e) => setEditData({ ...editData, role: e.target.value as 'admin' | 'manager' | 'user' })}
                          className="input-field text-sm"
                        >
                          <option value="user">User</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <div className="flex items-center space-x-2">
                          {getRoleIcon(profile.role)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeClass(profile.role)}`}>
                            {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingId === profile.id ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => saveEdit(profile.id)}
                            className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                          >
                            <Save className="h-4 w-4" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                          >
                            <X className="h-4 w-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(profile)}
                          className="text-primary-600 hover:text-primary-900 flex items-center space-x-1"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Role Descriptions</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center space-x-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              <span><strong>Admin:</strong> Full access to all features including user management</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-blue-500" />
              <span><strong>Manager:</strong> Can manage inventory, orders, and view user profiles</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span><strong>User:</strong> Can view and manage their own data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
