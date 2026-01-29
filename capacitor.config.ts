import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.laundryterdekat.app',
    appName: 'Laundry Terdekat',
    webDir: 'out',
    server: {
        androidScheme: 'https'
    }
};

export default config;
