#!/bin/bash
set -e

export ANDROID_HOME=/opt/android-sdk
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64

KEYSTORE_PATH="/opt/pandicrm-mobile/pandacrm-release.keystore"
KEYSTORE_PASS="PandiCRM2026!Release"
KEY_ALIAS="pandacrm"
KEY_PASS="PandiCRM2026!Release"

echo "=== Generating release keystore ==="
keytool -genkeypair \
  -keystore "$KEYSTORE_PATH" \
  -storepass "$KEYSTORE_PASS" \
  -alias "$KEY_ALIAS" \
  -keypass "$KEY_PASS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 36500 \
  -dname "CN=PandiCRM, OU=Development, O=Kreatix Technologies, L=Lagos, ST=Lagos, C=NG" \
  -storetype PKCS12

echo "=== Keystore created ==="
ls -lh "$KEYSTORE_PATH"

echo "=== Configuring Gradle signing ==="
APP_GRADLE="/opt/pandicrm-mobile/apps/web/android/app/build.gradle"

# Add signing config before buildTypes
sed -i '/buildTypes {/i\
    signingConfigs {\
        release {\
            storeFile file("'"'"'../../pandacrm-release.keystore'"'"')\
            storePassword "'"'"'PandiCRM2026!Release'"'"'"\
            keyAlias "'"'"'pandacrm'"'"'"\
            keyPassword "'"'"'PandiCRM2026!Release'"'"'"\
        }\
    }\
' "$APP_GRADLE"

# Add signingConfig to release buildType
sed -i '/release {/a\            signingConfig signingConfigs.release' "$APP_GRADLE"

echo "=== Updated build.gradle ==="
grep -A5 "signingConfigs" "$APP_GRADLE"

echo "=== Building release APK ==="
cd /opt/pandicrm-mobile/apps/web/android
chmod +x gradlew
./gradlew assembleRelease 2>&1 | tail -25

echo "=== Checking APK ==="
APK=$(find /opt/pandicrm-mobile/apps/web/android -name "*release*.apk" -type f 2>/dev/null | head -1)
if [ -n "$APK" ]; then
  echo "Release APK built: $APK"
  ls -lh "$APK"
else
  echo "No release APK found!"
  find /opt/pandicrm-mobile/apps/web/android -name "*.apk" 2>/dev/null
  exit 1
fi
