#!/bin/bash
set -e

export ANDROID_HOME=/opt/android-sdk
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64

APP_GRADLE="/opt/pandicrm-mobile/apps/web/android/app/build.gradle"

echo "=== Fixing keystore path to absolute ==="
sed -i "s|file('../../../pandacrm-release.keystore')|file('/opt/pandicrm-mobile/pandacrm-release.keystore')|" "$APP_GRADLE"
grep "storeFile" "$APP_GRADLE"

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
