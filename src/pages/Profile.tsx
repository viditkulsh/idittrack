import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, Building } from 'lucide-react';

const Profile = () => {
  const { user, profile } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">View and manage your profile information.</p>
        </div>

        {/* Profile Card */}
        <div className="card p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900">
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : user.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-gray-600 mb-4">{user.email}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{user.email}</span>
                </div>
                
                {user.created_at && (
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">
                      Member since {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {profile?.company_name && (
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{profile.company_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {profile && profile.company_name && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <p className="mt-1 text-gray-900">{profile.company_name}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
