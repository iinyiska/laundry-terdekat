import { createClient } from '@/utils/supabase/client'

export const signInWithGoogleNative = async () => {
    const supabase = createClient()

    try {
        // Dynamic import for Capacitor plugin
        const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth')

        // Initialize (should be done early, but safe here)
        await GoogleAuth.initialize()

        // Native Sign In
        const user = await GoogleAuth.signIn()

        if (user.authentication.idToken) {
            // Sign in to Supabase with the ID token
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: user.authentication.idToken,
            })

            if (error) throw error

            return { data, error: null }
        } else {
            throw new Error('No ID token returned from Google')
        }
    } catch (error: any) {
        console.error('Google Native Sign-In Error:', error)
        return { data: null, error }
    }
}
