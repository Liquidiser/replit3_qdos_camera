const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 5000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the project directory
app.use(express.static(path.join(__dirname)));

// Endpoint to get project information
app.get('/api/project-info', (req, res) => {
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const appJson = JSON.parse(fs.readFileSync('./app.json', 'utf8'));
    const appConfigJs = fs.readFileSync('./app.config.js', 'utf8');
    const androidPackage = appConfigJs.match(/package:\s*["']([^"']+)["']/);
    
    res.json({
      name: packageJson.name,
      version: packageJson.version,
      dependencies: Object.keys(packageJson.dependencies),
      appName: appJson.name,
      displayName: appJson.displayName,
      androidPackage: androidPackage ? androidPackage[1] : (appJson.android?.package || 'Not specified'),
      iosBundle: appJson.ios?.bundleIdentifier || 'Not specified',
      configInfo: {
        hasAppConfig: fs.existsSync('./app.config.js'),
        hasMetroConfig: fs.existsSync('./metro.config.js'),
        hasAndroidFolder: fs.existsSync('./android'),
        hasIOSFolder: fs.existsSync('./ios')
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API endpoint to get app status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    message: 'QDOS Camera App Debug Server is running',
    serverTime: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      env: {
        NODE_ENV: process.env.NODE_ENV || 'not set',
        ANDROID_HOME: process.env.ANDROID_HOME || 'not set',
        ANDROID_SDK_ROOT: process.env.ANDROID_SDK_ROOT || 'not set'
      }
    }
  });
});

// Endpoint to run Metro bundler
app.post('/api/start-metro', (req, res) => {
  console.log('Attempting to start Metro bundler...');
  
  const metroProcess = exec('npx react-native start --port 8081', (error, stdout, stderr) => {
    if (error) {
      console.error(`Metro bundler error: ${error.message}`);
      return;
    }
    console.log(`Metro bundler output: ${stdout}`);
    console.error(`Metro bundler stderr: ${stderr}`);
  });
  
  metroProcess.stdout.on('data', (data) => {
    console.log(`Metro: ${data}`);
  });
  
  metroProcess.stderr.on('data', (data) => {
    console.error(`Metro Error: ${data}`);
  });
  
  res.json({
    message: 'Metro bundler started',
    success: true
  });
});

// Endpoint to run Android build with specific surface registry error handling
app.post('/api/build-android', (req, res) => {
  console.log('Attempting to build Android app...');
  
  // First, check for common build issues
  const checkBuildCmd = 'grep -r "SurfaceRegistryBinding" android/app/src/main/java || echo "Not found"';
  
  exec(checkBuildCmd, (error, stdout, stderr) => {
    console.log('Checking for SurfaceRegistryBinding references:', stdout || 'None found');
    
    // Now run the actual build
    const androidProcess = exec('npx react-native run-android', (error, stdout, stderr) => {
      if (error) {
        console.error(`Android build error: ${error.message}`);
        
        // Check specifically for SurfaceRegistry errors
        if (stderr && stderr.includes('SurfaceRegistryBinding::StartService failed')) {
          console.error('Detected SurfaceRegistryBinding error - This is likely due to React Native Fabric initialization issues');
          
          // Log additional diagnostic information
          exec('adb logcat -d | grep -i "SurfaceRegistry"', (err, logOutput) => {
            if (!err && logOutput) {
              console.log('Related logs from device:', logOutput);
            }
          });
        }
        return;
      }
      console.log(`Android build output: ${stdout}`);
      console.error(`Android build stderr: ${stderr}`);
    });
    
    androidProcess.stdout.on('data', (data) => {
      console.log(`Android: ${data}`);
      
      // Watch for successful initialization of Surface Registry
      if (data.includes('SurfaceRegistry') || data.includes('ReactNative')) {
        console.log('SurfaceRegistry/ReactNative related output detected');
      }
    });
    
    androidProcess.stderr.on('data', (data) => {
      console.error(`Android Error: ${data}`);
      
      // Flag surface registry binding errors specifically
      if (data.includes('SurfaceRegistryBinding') || data.includes('Global was not installed')) {
        console.error('CRITICAL: SurfaceRegistryBinding error detected!');
      }
    });
  });
  
  res.json({
    message: 'Android build started with enhanced error monitoring',
    success: true,
    note: 'Watch logs for "SurfaceRegistryBinding" related issues'
  });
});

// Dedicated endpoint to diagnose and potentially fix Surface Registry issues
app.post('/api/fix-surface-registry', (req, res) => {
  console.log('Running Surface Registry diagnostic tools...');
  
  // 1. Check that the environment has the correct React Native configuration
  exec('grep -r "react.fabric.enableSurfaceRegistryBinding" android/', (error, stdout) => {
    const surfaceRegistryConfigured = !error && stdout.includes('enableSurfaceRegistryBinding=true');
    
    // 2. Check if MainApplication.java has proper initialization
    exec('grep -r "SoLoader.init" android/app/src/main/java', (error2, stdout2) => {
      const soLoaderInitialized = !error2 && stdout2.includes('SoLoader.init');
      
      // Provide diagnostic information and next steps
      res.json({
        diagnosticResults: {
          surfaceRegistryProperlyConfigured: surfaceRegistryConfigured,
          soLoaderInitialized: soLoaderInitialized,
          possibleIssues: [
            surfaceRegistryConfigured ? null : "SurfaceRegistryBinding not enabled in gradle.properties",
            soLoaderInitialized ? null : "SoLoader not properly initialized in MainApplication.java"
          ].filter(Boolean),
          recommendedFixes: [
            "Ensure react.fabric.enableSurfaceRegistryBinding=true is in android/gradle.properties",
            "Initialize Global/SurfaceRegistry classes explicitly before React Native loads",
            "Check that Hermes is properly configured in app.json and android/app/build.gradle",
            "Try cleaning the build with 'cd android && ./gradlew clean'"
          ]
        },
        timestamp: new Date().toISOString()
      });
    });
  });
});

// Endpoint to check files
app.get('/api/check-files', (req, res) => {
  try {
    // List of important files to check
    const filesToCheck = [
      './app.json',
      './app.config.js',
      './metro.config.js',
      './index.js',
      './App.tsx',
      './src/navigation/AppNavigator.tsx',
      './src/screens/CameraScreen.tsx',
      './android/app/build.gradle',
      './android/app/src/main/AndroidManifest.xml'
    ];
    
    const fileStatuses = {};
    
    filesToCheck.forEach(file => {
      try {
        const exists = fs.existsSync(file);
        fileStatuses[file] = {
          exists,
          size: exists ? fs.statSync(file).size : 0,
          lastModified: exists ? fs.statSync(file).mtime : null
        };
      } catch (e) {
        fileStatuses[file] = { exists: false, error: e.message };
      }
    });
    
    res.json({
      files: fileStatuses,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve index.html for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Debug server running at http://0.0.0.0:${PORT}`);
  console.log('You can view project information at /api/project-info');
});