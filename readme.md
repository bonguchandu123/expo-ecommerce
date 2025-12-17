# 📱 Expo APK Build Guide

## 📂 Go to Project Root

cd your-expo-project


## 🔐 Login to Expo
```
npx expo login
```

## 🛠 Install EAS CLI

```
npm install -g eas-cli

```

## ✅ Check EAS Version

```
eas --version

```

## ⚙️ Configure EAS for Project

```
eas build:configure

```
## 📄 Example eas.json
```
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

## 📦 Build Android APK

```
eas build -p android --profile preview
```


## Android build 

```
npx expo prebuild --clean 
```

## END

