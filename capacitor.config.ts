import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.laundryterdekat.app',
    appName: 'Laundry Terdekat',
    webDir: 'out',
    server: {
        androidScheme: 'https',
        // Use production URL so OAuth redirects work
        url: 'https://laundry-terdekat.vercel.app',
        cleartext: true
    },
    plugins: {
        Browser: {
            // Browser will handle OAuth in in-app browser
        },
        App: {
            launchDarkMode: true
        },
        // Handle deep link callbacks
        SplashScreen: {
            launchShowDuration: 2000,
            backgroundColor: '#1e293b',
            showSpinner: true,
            spinnerColor: '#3b82f6'
        }
    }
};

export default config;
