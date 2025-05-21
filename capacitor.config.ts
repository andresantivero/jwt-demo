import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'jwt-demo',
  webDir: 'www',
  plugins: {
    Camera: {
      android: {
        useLegacy: true
      },
      web: {
        camera: {
          height: 1280,
          width: 1280,
          deviceId: undefined
        },
        inputType: 'file',
        captureBase64: true
      }
    }
  },
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: ['*']
  }
};

export default config;
