// OAuth utilities for Capacitor native app
// Uses in-app browser to keep authentication within the app

export const isNativeApp = (): boolean => {
    if (typeof window === 'undefined') return false
    return !!(window as any).Capacitor?.isNativePlatform?.()
}

export const openInAppBrowser = async (url: string): Promise<void> => {
    if (isNativeApp()) {
        try {
            // Dynamic import to avoid SSR issues
            const { Browser } = await import('@capacitor/browser')
            await Browser.open({
                url,
                presentationStyle: 'popover', // Keep it in app context
                toolbarColor: '#1e293b' // Match app theme
            })
        } catch (e) {
            // Fallback to window.open
            window.location.href = url
        }
    } else {
        // Web - normal redirect
        window.location.href = url
    }
}

export const closeInAppBrowser = async (): Promise<void> => {
    if (isNativeApp()) {
        try {
            const { Browser } = await import('@capacitor/browser')
            await Browser.close()
        } catch (e) {
            // Ignore errors
        }
    }
}

// Setup app URL listener for OAuth callback
export const setupDeepLinkListener = async (callback: (url: string) => void): Promise<void> => {
    if (isNativeApp()) {
        try {
            const { App } = await import('@capacitor/app')

            // Listen for app URL open events (deep links)
            App.addListener('appUrlOpen', (event) => {
                callback(event.url)
            })
        } catch (e) {
            console.error('Failed to setup deep link listener:', e)
        }
    }
}
