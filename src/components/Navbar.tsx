import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  LogIn, 
  UserPlus, 
  LayoutDashboard,
  ShoppingCart,
  Upload,
  User,
  LogOut,
  Package,
  Settings,
  ChevronDown,
  UserCircle,
  Crown,
  Warehouse,
  MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

type NavLink = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type AuthLink = NavLink & {
  onClick?: () => Promise<void>;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, signOutLoading } = useAuth();
  const { isAdmin } = usePermissions();
  const profileRef = useRef<HTMLDivElement>(null);
  const adminRef = useRef<HTMLDivElement>(null);

  // Core navigation - most used features first
  const coreNavigation = [
    // Only show Home for non-authenticated users
    ...(user ? [] : [{ name: 'Home', href: '/', icon: Home }]),
    ...(user ? [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Products', href: '/products', icon: Package },
      { name: 'Inventory', href: '/inventory', icon: Warehouse },
      { name: 'Orders', href: '/orders', icon: ShoppingCart },
    ] : [])
  ];

  // Admin tools - grouped in dropdown for cleaner UI
  const adminTools = [
    { name: 'Admin Panel', href: '/admin', icon: Crown },
    { name: 'Categories', href: '/categories', icon: Settings },
    { name: 'Locations', href: '/locations', icon: MapPin },
    { name: 'Upload Data', href: '/upload', icon: Upload },
  ];

  const authLinks: AuthLink[] = user ? [] : [
    { name: 'Login', href: '/login', icon: LogIn },
    { name: 'Register', href: '/register', icon: UserPlus },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (adminRef.current && !adminRef.current.contains(event.target as Node)) {
        setIsAdminOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsProfileOpen(false);
    
    // Provide immediate feedback by navigating first
    navigate('/');
    
    // Then handle the actual signout in the background
    signOut().catch(error => {
      console.error('Error during logout:', error);
      // Even if logout fails, user is already redirected to home
    });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden bg-white shadow-sm group-hover:shadow-md transition-shadow duration-200">
                <img 
                  src="/logo.jpg" 
                  alt="IditTrack Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-xl font-bold text-gray-900 group-hover:text-primary-500 transition-colors duration-200">
                IditTrack
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Core Navigation Links */}
            {coreNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link flex items-center space-x-1 ${
                    isActive(item.href) ? 'nav-link-active' : ''
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Admin Tools Dropdown */}
            {user && isAdmin() && (
              <div className="relative" ref={adminRef}>
                <button
                  onClick={() => setIsAdminOpen(!isAdminOpen)}
                  className={`nav-link flex items-center space-x-1 ${adminTools.some(tool => isActive(tool.href)) ? 'nav-link-active' : ''
                    }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Admin</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isAdminOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Admin Dropdown Menu */}
                {isAdminOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-slide-up">
                    {adminTools.map((tool) => {
                      const Icon = tool.icon;
                      return (
                        <Link
                          key={tool.name}
                          to={tool.href}
                          onClick={() => setIsAdminOpen(false)}
                          className={`flex items-center w-full px-4 py-2 text-sm transition-colors duration-200 ${isActive(tool.href)
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                          <Icon className="h-4 w-4 mr-3" />
                          {tool.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Auth Links & Profile - Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {!user ? (
              // Show login/register for unauthenticated users
              authLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-link flex items-center space-x-1 ${
                      isActive(item.href) ? 'nav-link-active' : ''
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })
            ) : (
              // Show profile dropdown for authenticated users
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {profile?.first_name && profile?.last_name 
                        ? `${profile.first_name} ${profile.last_name}`
                        : user.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-slide-up">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {profile?.first_name && profile?.last_name 
                          ? `${profile.first_name} ${profile.last_name}`
                          : user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${profile?.role === 'admin' ? 'bg-red-100 text-red-800' :
                              profile?.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                            {profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'User'}
                          </span>
                        </div>
                      </div>
                    
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate('/profile');
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <UserCircle className="h-4 w-4 mr-3" />
                        View Profile
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate('/profile/edit');
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Edit Profile
                      </button>
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      <button
                        onClick={handleSignOut}
                        disabled={signOutLoading}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
                      >
                        {signOutLoading ? (
                          <>
                            <div className="w-4 h-4 mr-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                            Signing out...
                          </>
                        ) : (
                          <>
                            <LogOut className="h-4 w-4 mr-3" />
                            Logout
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-all duration-200"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden animate-slide-up">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200 shadow-lg">
            {/* Core Navigation */}
            {coreNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`nav-link flex items-center space-x-2 w-full ${
                    isActive(item.href) ? 'nav-link-active' : ''
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Admin Tools Section for Mobile */}
            {user && isAdmin() && (
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Admin Tools
                </div>
                {adminTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.name}
                      to={tool.href}
                      onClick={() => setIsOpen(false)}
                      className={`nav-link flex items-center space-x-2 w-full ${isActive(tool.href) ? 'nav-link-active' : ''
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tool.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
            
            {/* Mobile Auth Section */}
            <div className="border-t border-gray-200 pt-2">
              {!user ? (
                // Login/Register for unauthenticated users
                authLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`nav-link flex items-center space-x-2 w-full ${
                        isActive(item.href) ? 'nav-link-active' : ''
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })
              ) : (
                // Profile options for authenticated users
                <>
                  <div className="px-3 py-2 border-b border-gray-100 mb-2">
                    <p className="text-sm font-medium text-gray-900">
                      {profile?.first_name && profile?.last_name 
                        ? `${profile.first_name} ${profile.last_name}`
                        : user.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/profile');
                    }}
                    className="nav-link flex items-center space-x-2 w-full text-left"
                  >
                    <UserCircle className="h-4 w-4" />
                    <span>View Profile</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/profile/edit');
                    }}
                    className="nav-link flex items-center space-x-2 w-full text-left"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleSignOut();
                    }}
                    disabled={signOutLoading}
                    className="nav-link flex items-center space-x-2 w-full text-left text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {signOutLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                        <span>Signing out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;