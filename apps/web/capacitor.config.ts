import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.pandacrm.app",
  appName: "Pandacrm",
  webDir: "www",
  server: {
    url: "https://pandacrm.com.ng",
    cleartext: true,
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0d0d12",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
    GoogleAuth: {
      forceCodeForRefreshToken: true,
      scopes: ["email", "profile", "openid"],
    },
  },
};

export default config;
