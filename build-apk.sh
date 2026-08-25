#!/bin/bash
set -e

export ANDROID_HOME=/opt/android-sdk
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

echo "=== Cloning repo ==="
rm -rf /opt/pandicrm-mobile
git clone https://github.com/KachiAlex/pandicrm.git /opt/pandicrm-mobile
cd /opt/pandicrm-mobile/apps/web

echo "=== Installing pnpm deps ==="
npm install -g pnpm 2>/dev/null || true
pnpm config set minimumReleaseAge 0
rm -f pnpm-lock.yaml
pnpm install 2>&1 | tail -5
pnpm approve-builds --all 2>/dev/null || true

echo "=== Syncing Capacitor ==="
mkdir -p www
mkdir -p android/app/src/main/assets
pnpm exec cap copy android 2>&1
pnpm exec cap update android 2>&1

echo "=== Building APK ==="
cd android
chmod +x gradlew
./gradlew assembleDebug 2>&1 | tail -20

echo "=== Checking APK ==="
APK=$(find /opt/pandicrm-mobile/apps/web/android -name "*.apk" -type f 2>/dev/null | head -1)
if [ -n "$APK" ]; then
  echo "APK built: $APK"
  ls -lh "$APK"
else
  echo "No APK found!"
  exit 1
fi
