# Predictempo-app

Predictempo-app is an Expo-based mobile application that leverages **OpenMeteo** and **ONNX Runtime** to predict EDF's red days up to 5 days ahead using weather forecasts and models developed in the [modeling.ipynb](../notebooks/modeling.ipynb) notebook.

---

## Development setup

For the best development experience, we recommend using a **Development Build**.

### 1. Prerequisites & Installation
Ensure you have Node.js installed, then install `yarn` and the project dependencies:

```bash
npm install -g yarn
yarn install
```

### 2. Build the Development Client
Generate the development APK for Android (one-time or when native modules change):

```bash
npx eas-cli build --platform android --profile development
```

### 3. Install & Run
1. Install the generated `.apk` on your Android device.
2. Launch the development server in **development client** mode:

```bash
npx expo start --dev-client
```

Your app will stay synced with the code in the `predictempo-app` folder.

---

## Production Builds

To generate a preview/production APK:

```bash
npx eas-cli build --platform android --profile production 
```


## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
