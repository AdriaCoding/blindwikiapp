Important repassar com es gestionen les variables d'entorn i secrets amb EXPO:

https://docs.expo.dev/eas/environment-variables/

# Google Maps API Key Setup

For the search functionality to work, you need to set up a Google Maps API key:

1. Create a Google Cloud project at [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs in your project:
   - Google Places API
   - Maps JavaScript API
   - Geocoding API

3. Create an API key with the appropriate restrictions (recommended to restrict by HTTP referrers or IP addresses)

4. Create a `.env` file in the root of the project with the following content:
   ```
   GOOGLE_MAPS_API_KEY=your_api_key_here
   ```
   Replace `your_api_key_here` with your actual Google Maps API key.

5. After adding the API key, rebuild your application with:
   ```
   npx expo start -c
   ```
   The `-c` flag clears the cache to ensure the environment variables are properly loaded.

## CORS Proxy for Web Development

To test the app in the browser (localhost), you need to open a separate terminal and run the proxy server with:

```shell
node proxy.js
```

Otherwise, all requests from the app on your localhost will be blocked by the server's CORS policy


## EAS deployment
```shell
npx eas update --branch HEAD --message "Updating..."
```