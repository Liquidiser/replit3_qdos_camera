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

// Endpoint to run Android build
app.post('/api/build-android', (req, res) => {
  console.log('Attempting to build Android app...');
  
  const androidProcess = exec('npx react-native run-android', (error, stdout, stderr) => {
    if (error) {
      console.error(`Android build error: ${error.message}`);
      return;
    }
    console.log(`Android build output: ${stdout}`);
    console.error(`Android build stderr: ${stderr}`);
  });
  
  androidProcess.stdout.on('data', (data) => {
    console.log(`Android: ${data}`);
  });
  
  androidProcess.stderr.on('data', (data) => {
    console.error(`Android Error: ${data}`);
  });
  
  res.json({
    message: 'Android build started',
    success: true
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