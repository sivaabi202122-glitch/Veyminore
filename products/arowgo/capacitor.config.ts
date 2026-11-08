import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.veyminore.arowgo',
  appName: 'AROWGO',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
