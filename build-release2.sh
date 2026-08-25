#!/bin/bash
set -e

export ANDROID_HOME=/opt/android-sdk
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64

APP_GRADLE="/opt/pandicrm-mobile/apps/web/android/app/build.gradle"

echo "=== Writing clean build.gradle ==="
cat > "$APP_GRADLE" << 'GRADLE_EOF'
apply plugin: 'com.android.application'

android {
    namespace = "com.pandacrm.app"
    compileSdk = rootProject.ext.compileSdkVersion
    defaultConfig {
        applicationId "com.pandacrm.app"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        aaptOptions {
             ignoreAssetsPattern = '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~'
        }
    }
    signingConfigs {
        release {
            storeFile file('../../pandacrm-release.keystore')
            storePassword 'PandiCRM2026!Release'
            keyAlias 'pandacrm'
            keyPassword 'PandiCRM2026!Release'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

repositories {
    flatDir{
        dirs '../capacitor-cordova-android-plugins/src/main/libs', 'libs'
    }
}

dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    implementation project(':capacitor-android')
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
    implementation project(':capacitor-cordova-android-plugins')
}

apply from: 'capacitor.build.gradle'

try {
    def servicesJSON = file('google-services.json')
    if (servicesJSON.text) {
        apply plugin: 'com.google.gms.google-services'
    }
} catch(Exception e) {
    logger.info("google-services.json not found, google-services plugin not applied. Push Notifications won't work")
}
GRADLE_EOF

echo "=== Verifying build.gradle ==="
grep -A6 "signingConfigs" "$APP_GRADLE"

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
