#!/bin/bash
set -e

echo "=== Installing OpenJDK 21 ==="
apt-get install -y openjdk-21-jdk-headless 2>&1 | tail -5
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
java -version 2>&1 | head -1

echo "=== Building APK ==="
export ANDROID_HOME=/opt/android-sdk
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"
cd /opt/pandicrm-mobile/apps/web/android
chmod +x gradlew
./gradlew assembleDebug 2>&1 | tail -25

echo "=== Checking APK ==="
APK=$(find /opt/pandicrm-mobile/apps/web/android -name "*.apk" -type f 2>/dev/null | head -1)
if [ -n "$APK" ]; then
  echo "APK built: $APK"
  ls -lh "$APK"
else
  echo "No APK found!"
  find /opt/pandicrm-mobile/apps/web/android -name "*.apk" 2>/dev/null
  exit 1
fi
