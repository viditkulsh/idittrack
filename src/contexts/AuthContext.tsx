import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface Profile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  company_name?: string // Fixed: use company_name to match database schema
  role: 'admin' | 'manager' | 'user'
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signInLoading: boolean
  signOutLoading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, userData?: any) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (data: any) => Promise<any>
  isAdmin: () => boolean
  isManager: () => boolean
  isManagerOrAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
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
    }, 5000); // 5 second timeout

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
      async (_, session) => {
        if (!isMounted) return; // Don't update state if component unmounted
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Always fetch profile when we have a user, regardless of event type
          await fetchProfile(session.user.id)
        } else {
          // Clear profile immediately on sign out
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      isMounted = false; // Mark component as unmounted
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    }
  }, [])

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

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signInLoading,
      signOutLoading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      isAdmin,
      isManager,
      isManagerOrAdmin
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
