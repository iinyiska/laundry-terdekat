import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.laundry.terdekat',
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
        GoogleAuth: {
            scopes: ['profile', 'email'],
            serverClientId: '989969981177-u04mgh5tdap621t7oeoqcbgg6a138u02.apps.googleusercontent.com',
            forceCodeForRefreshToken: true
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
