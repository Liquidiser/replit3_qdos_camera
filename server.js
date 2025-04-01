const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

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

// API endpoint to get app status is now defined further down in the file

// Endpoint to run Metro bundler - replaced with enhanced version below

// Endpoint to run Android build - replaced with enhanced version below

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

// Enhanced Fabric architecture diagnostics endpoint
app.get('/api/fabric-diagnostics', (req, res) => {
  console.log('Running enhanced Fabric architecture diagnostics...');
  
  exec('node fabric-check.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Fabric check error: ${error.message}`);
      return res.status(500).json({ 
        error: error.message,
        stdout: stdout,
        stderr: stderr
      });
    }
    
    // Parse the results for a more structured response
    const results = {
      appJsonFabric: stdout.includes('✅ Fabric enabled: true'),
      appJsonSurfaceRegistry: stdout.includes('✅ SurfaceRegistryBinding: true'),
      appConfigFabric: stdout.includes('✅ Fabric and SurfaceRegistryBinding appear to be configured'),
      gradleNewArch: stdout.includes('✅ New Architecture enabled: true'),
      gradleSurfaceRegistry: stdout.includes('✅ SurfaceRegistryBinding enabled: true'),
      easScriptConfig: stdout.includes('✅ EAS Pre-Install script has proper Fabric configuration'),
      rawOutput: stdout,
      timestamp: new Date().toISOString()
    };
    
    res.json(results);
  });
});

// Get project status information
app.get('/api/status', (req, res) => {
  console.log('Getting server status...');
  
  const status = {
    node_version: process.version,
    os: process.platform,
    memory_usage: process.memoryUsage(),
    uptime: process.uptime(),
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: process.env.PORT || '5000'
    },
    workflows: {
      server: 'running'
    },
    timestamp: new Date().toISOString()
  };
  
  // Check if Android workflow is running
  exec('ps -ef | grep "gradlew assembleDebug" | grep -v grep', (error, stdout) => {
    status.workflows.android = stdout ? 'running' : 'stopped';
    res.json(status);
  });
});

// The '/api/check-files' endpoint is already defined above

// Start Metro bundler
app.post('/api/start-metro', (req, res) => {
  console.log('Starting Metro bundler...');
  
  const metroProcess = spawn('npx', ['react-native', 'start'], { 
    detached: true,
    stdio: 'ignore'
  });
  
  metroProcess.unref();
  
  res.json({ 
    message: 'Metro bundler started in background',
    pid: metroProcess.pid,
    timestamp: new Date().toISOString()
  });
});

// Build Android app
app.post('/api/build-android', (req, res) => {
  console.log('Building Android app...');
  
  exec('cd android && ./gradlew assembleDebug', (error, stdout, stderr) => {
    if (error) {
      console.error(`Android build error: ${error.message}`);
      return res.status(500).json({ 
        success: false,
        error: error.message,
        stderr: stderr
      });
    }
    
    res.json({
      success: true,
      message: 'Android app built successfully',
      logs: stdout,
      timestamp: new Date().toISOString()
    });
  });
});

// Fix Surface Registry issues - already defined above

// Serve index.html for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Debug server running at http://0.0.0.0:${PORT}`);
  console.log('You can view project information at /api/project-info');
});