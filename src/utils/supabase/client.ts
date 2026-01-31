import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

// Singleton instance to prevent multiple client recreations
let supabaseInstance: SupabaseClient | null = null

export function createClient() {
    if (supabaseInstance) return supabaseInstance

    supabaseInstance = createSupabaseClient(
        'https://ntcrwmluwhuynpjtkths.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Y3J3bWx1d2h1eW5wanRrdGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Njk5MTIsImV4cCI6MjA4NTI0NTkxMn0.6yY_ikYPQkZPhBxlreMprgaTiBeM8wLgdwhvLHv_2vY',
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                storageKey: 'laundry_auth_token',
                storage: typeof window !== 'undefined' ? window.localStorage : undefined,
                flowType: 'pkce'
            },
            global: {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            },
            db: {
                schema: 'public'
            }
        }
    )
    return supabaseInstance
}

