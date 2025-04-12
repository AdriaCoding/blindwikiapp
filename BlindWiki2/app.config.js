const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  "expo": {
    "name": "BlindWiki 2",
    "slug": "blind-wiki-2",
    "version": "2.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "myapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "buildNumber": "2.0.0",
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "proto.BW"
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png",
      "viewport": {
        "width": "device-width",
        "initialScale": 1,
        "maximumScale": 1,
        "userScalable": false
      },
      "mobileMode": true
    },
    "plugins": [
      "expo-router",
      "expo-secure-store"
    ],
    "experiments": {
      "typedRoutes": true,
      ...(isProduction ? { baseUrl: "/blindwikiapp" } : {})
    },
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "1fd04953-c4ae-4c1c-ac28-cd5274e0181b"
      }
    },
    "runtimeVersion": {
      "policy": "appVersion"
    },
    "updates": {
      "url": "https://u.expo.dev/1fd04953-c4ae-4c1c-ac28-cd5274e0181b"
    },
    "owner": "adriacoding"
  }
}
