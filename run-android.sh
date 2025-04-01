#!/bin/bash
cd /home/runner/workspace

echo "Starting React Native Android app..."

# Set JAVA_HOME to system JDK 21
export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
echo "Using JAVA_HOME: $JAVA_HOME"
java -version

# Start the Metro bundler if not already running
if ! pgrep -f "metro"; then
  echo "Starting Metro bundler..."
  npm start -- --reset-cache &
  sleep 5
fi

# Run Android in debug mode
cd android && ./gradlew installDebug

echo "Android app installation completed"