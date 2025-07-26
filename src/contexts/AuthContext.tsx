import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, getUserPermissions, getUserTenants } from '../lib/supabase'

interface Permission {
  resource: string
  action: string
  granted: boolean
}

interface Tenant {
  tenant_id: string
  tenant_name: string
  tenant_slug: string
  user_role: 'admin' | 'manager' | 'user'
  is_primary: boolean
}

interface Profile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  company_name?: string
  department?: string
  role: 'admin' | 'manager' | 'user'
  tenant_id?: string
  manager_id?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  permissions: Permission[]
  currentTenant: Tenant | null
  availableTenants: Tenant[]
  loading: boolean
  signInLoading: boolean
  signOutLoading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, userData?: any) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (data: any) => Promise<any>
  hasPermission: (resource: string, action: string) => boolean
  hasRole: (role: 'admin' | 'manager' | 'user') => boolean
  isAdmin: () => boolean
  isManager: () => boolean
  isManagerOrAdmin: () => boolean
  isSuperAdmin: () => boolean
  switchTenant: (tenantId: string) => Promise<void>
  refreshPermissions: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null)
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [signInLoading, setSignInLoading] = useState(false)
  const [signOutLoading, setSignOutLoading] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true; // Track if component is still mounted
    
    // Set a timeout to ensure loading doesn't hang indefinitely
    timeoutId = setTimeout(() => {
      if (loading && isMounted) {
        console.warn('Auth loading timeout - setting loading to false');
        setLoading(false);
      }
    }, 8000); // Increased to 8 seconds

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return; // Don't update state if component unmounted
      
      clearTimeout(timeoutId);
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false) // Set loading false immediately if no user
      }
    }).catch((error) => {
      if (!isMounted) return;
      
      console.error('Error getting initial session:', error);
      clearTimeout(timeoutId);
      setLoading(false);
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return; // Don't update state if component unmounted
        
        console.log('Auth state change:', event, session?.user?.email);

        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Always fetch profile when we have a user, regardless of event type
          await fetchProfile(session.user.id)
        } else {
          // Clear all data immediately on sign out
          setProfile(null)
          setPermissions([])
          setCurrentTenant(null)
          setAvailableTenants([])
          setLoading(false)
        }
      }
    )

    // Set up automatic session refresh for admin users
    const refreshInterval = setInterval(async () => {
      if (isMounted && profile?.role === 'admin') {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log('Admin session refreshed automatically');
          }
        } catch (error) {
          console.warn('Admin session refresh failed:', error);
        }
      }
    }, 30 * 60 * 1000); // Refresh every 30 minutes for admin users

    return () => {
      isMounted = false; // Mark component as unmounted
      clearTimeout(timeoutId);
      clearInterval(refreshInterval);
      subscription.unsubscribe();
    }
  }, [profile?.role]) // Added profile.role as dependency

  // Load RBAC data when profile changes
  useEffect(() => {
    if (profile && user) {
      loadUserTenants()
      loadUserPermissions()
    }
  }, [profile, user])

  const fetchProfile = async (userId: string) => {
    try {
      // Add a timeout to the profile fetch to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );
      
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error && error.code === 'PGRST116') {
        // No profile found - create a basic profile for the user
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: userData.user.email || '',
              first_name: userData.user.user_metadata?.first_name || 'User',
              last_name: userData.user.user_metadata?.last_name || 'Name',
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            setProfile(null);
          } else {
            setProfile(newProfile);
          }
        } else {
          setProfile(null);
        }
      } else if (error) {
        console.error('Error fetching profile:', error.message)
        setProfile(null);
      } else if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Don't let profile fetch errors prevent the app from working
      setProfile(null);
    } finally {
      setLoading(false) // Always set loading to false after attempting to fetch profile
    }
  }

  const loadUserTenants = async () => {
    if (!user) return

    try {
      const tenants = await getUserTenants(user.id)
      setAvailableTenants(tenants || [])

      // Set current tenant to primary or first available
      if (tenants && tenants.length > 0) {
        const primaryTenant = tenants.find((t: Tenant) => t.is_primary) || tenants[0]
        setCurrentTenant(primaryTenant)
      }
    } catch (error) {
      console.error('Error loading user tenants:', error)
      setAvailableTenants([])
      setCurrentTenant(null)
    }
  }

  const loadUserPermissions = async () => {
    if (!user || !currentTenant) return

    try {
      const userPermissions = await getUserPermissions(user.id, currentTenant.tenant_id)
      setPermissions(userPermissions || [])
    } catch (error) {
      console.error('Error loading user permissions:', error)
      setPermissions([])
    }
  }

  const refreshPermissions = async () => {
    if (user && profile) {
      await loadUserTenants()
      await loadUserPermissions()
    }
  }

  const switchTenant = async (tenantId: string) => {
    const tenant = availableTenants.find(t => t.tenant_id === tenantId)
    if (tenant) {
      setCurrentTenant(tenant)
      // Reload permissions for new tenant
      const userPermissions = await getUserPermissions(user?.id, tenantId)
      setPermissions(userPermissions || [])
    }
  }

  const signIn = async (email: string, password: string) => {
    setSignInLoading(true)
    try {
      const result = await supabase.auth.signInWithPassword({ email, password })
      return result
    } finally {
      setSignInLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        // For development, you can add this to skip email confirmation:
        // emailRedirectTo: window.location.origin
      }
    })
    
    // If signup is successful but user needs to confirm email
    if (result.data.user && !result.data.session) {
      // User needs to confirm email - this is expected behavior
    }
    
    return result
  }

  const signOut = async () => {
    setSignOutLoading(true)
    
    // Immediately clear user state for instant UI feedback
    setUser(null)
    setSession(null)
    setProfile(null)
    setLoading(false)
    
    try {
      // Use a timeout to prevent logout from hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Logout timeout')), 3000)
      );
      
      const signOutPromise = supabase.auth.signOut();
      
      await Promise.race([signOutPromise, timeoutPromise]);
    } catch (error) {
      console.error('Error during sign out:', error)
      // Even if signOut fails, we've already cleared the local state
      // This ensures the user is logged out from the UI perspective
    } finally {
      setSignOutLoading(false)
    }
  }

  const updateProfile = async (data: any) => {
    if (!user) return { error: 'No user logged in' }

    try {
      // First, try to update the existing profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: data.first_name?.trim() || null,
          last_name: data.last_name?.trim() || null,
          company_name: data.company?.trim() || null, // Fixed: use company_name instead of company
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (updateError && updateError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            first_name: data.first_name?.trim() || null,
            last_name: data.last_name?.trim() || null,
            company_name: data.company?.trim() || null, // Fixed: use company_name instead of company
            role: 'user', // Default role for new profiles
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (!insertError) {
          setProfile(newProfile)
          return { data: newProfile, error: null }
        } else {
          console.error('Error creating profile:', insertError)
          return { data: null, error: insertError }
        }
      } else if (updateError) {
        console.error('Error updating profile:', updateError)
        return { data: null, error: updateError }
      } else {
        setProfile(updatedProfile)
        return { data: updatedProfile, error: null }
      }
    } catch (error) {
      console.error('Error in updateProfile:', error)
      return { data: null, error }
    }
  }

  // Permission checking functions
  const hasPermission = (resource: string, action: string): boolean => {
    return permissions.some(p =>
      p.resource === resource &&
      p.action === action &&
      p.granted === true
    )
  }

  const hasRole = (role: 'admin' | 'manager' | 'user'): boolean => {
    return profile?.role === role
  }

  // Role-based helper functions
  const isAdmin = () => {
    return profile?.role === 'admin'
  }

  const isManager = () => {
    return profile?.role === 'manager'
  }

  const isManagerOrAdmin = () => {
    return profile?.role === 'admin' || profile?.role === 'manager'
  }

  const isSuperAdmin = () => {
    return profile?.role === 'admin' && profile?.tenant_id === null
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      permissions,
      currentTenant,
      availableTenants,
      loading,
      signInLoading,
      signOutLoading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      hasPermission,
      hasRole,
      isAdmin,
      isManager,
      isManagerOrAdmin,
      isSuperAdmin,
      switchTenant,
      refreshPermissions
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
