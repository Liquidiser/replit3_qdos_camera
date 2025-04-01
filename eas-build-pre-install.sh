#!/bin/bash

echo "Running EAS Build Pre-Install script..."

# Create the directory for ReactAndroid/gradle.properties
# This needs to be done AFTER the dependencies are installed during build
mkdir -p ./temp-gradle-props

# Create a gradle.properties file if we need to
cat > ./temp-gradle-props/gradle.properties <<EOL
VERSION_NAME=0.76.7
react.internal.publishingGroup=com.facebook.react

android.useAndroidX=true

# Java and Gradle configuration
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.caching=true

# Java 17 configuration
java.sourceCompatibility=17
java.targetCompatibility=17
kotlin.jvm.target.validation.mode=warning

# We want to have more fine grained control on the Java version for
# ReactAndroid, therefore we disable RGNP Java version alignment mechanism
react.internal.disableJavaVersionAlignment=true

# New Architecture and Fabric configuration
newArchEnabled=true
hermesEnabled=true

# Surface Registry Configuration for Fabric
react.fabric.useSurfaceRegistryForComponents=true
react.fabric.enableSurfaceRegistryBinding=true
react.fabric.enableBindingSurfaceRegistration=true
react.fabric.enableBridgelessSurfaceAttributeRegistry=true
react.fabric.alwaysCreateSurfaceRegistryBinding=true
react.fabric.earlyInitGlobalObject=true

# Binary Compatibility Validator properties
binaryCompatibilityValidator.ignoredClasses=com.facebook.react.BuildConfig
binaryCompatibilityValidator.ignoredPackages=com.facebook.debug,\\
  com.facebook.fbreact,\\
  com.facebook.hermes,\\
  com.facebook.perftest,\\
  com.facebook.proguard,\\
  com.facebook.react.bridgeless.internal,\\
  com.facebook.react.flipper,\\
  com.facebook.react.internal,\\
  com.facebook.react.module.processing,\\
  com.facebook.react.processing,\\
  com.facebook.react.views.text.internal,\\
  com.facebook.systrace,\\
  com.facebook.yoga
binaryCompatibilityValidator.nonPublicMarkers=com.facebook.react.common.annotations.VisibleForTesting,\\
  com.facebook.react.common.annotations.UnstableReactNativeAPI
binaryCompatibilityValidator.validationDisabled=true
binaryCompatibilityValidator.outputApiFileName=ReactAndroid
EOL

# Create a post-install script that will be run after npm dependencies are installed
