import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.laundryterdekat.app',
    appName: 'Laundry Terdekat',
    webDir: 'out',
    server: {
        androidScheme: 'https',
        // Point to production URL for OAuth callbacks
        url: 'https://laundry-terdekat.vercel.app',
        cleartext: true
    },
    plugins: {
        Browser: {
            // Browser plugin config
        },
        App: {
            launchDarkMode: true
        }
    }
};

export default config;
