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

# We want to have more fine grained control on the Java version for
# ReactAndroid, therefore we disable RGNP Java version alignment mechanism
react.internal.disableJavaVersionAlignment=true

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
cat > ./eas-post-install.sh <<EOL
#!/bin/bash
echo "Running post-install script to fix gradle.properties..."
mkdir -p ./node_modules/react-native/ReactAndroid/
cp -f ./temp-gradle-props/gradle.properties ./node_modules/react-native/ReactAndroid/
chmod 644 ./node_modules/react-native/ReactAndroid/gradle.properties
echo "gradle.properties has been copied to ReactAndroid directory"
EOL

chmod +x ./eas-post-install.sh
echo "Pre-install setup complete. Post-install script created."