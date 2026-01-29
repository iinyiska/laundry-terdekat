import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        'https://ntcrwmluwhuynpjtkths.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Y3J3bWx1d2h1eW5wanRrdGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Njk5MTIsImV4cCI6MjA4NTI0NTkxMn0.6yY_ikYPQkZPhBxlreMprgaTiBeM8wLgdwhvLHv_2vY'
    )
}
