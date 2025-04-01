/**
 * Fabric Configuration Checker
 * 
 * This script helps diagnose issues with React Native Fabric and SurfaceRegistryBinding.
 * Run with: node fabric-check.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('QDOS Fabric Configuration Checker\n');

// Check app.json and app.config.js for Fabric settings
const checkExpoConfig = () => {
  try {
    // Check app.json
    const appJsonPath = path.join(__dirname, 'app.json');
    if (fs.existsSync(appJsonPath)) {
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
      console.log('app.json Fabric config:');
      
      if (appJson.expo && appJson.expo.android && appJson.expo.android.fabric) {
        console.log('✅ Fabric enabled:', appJson.expo.android.fabric.enabled);
        console.log('✅ SurfaceRegistryBinding:', appJson.expo.android.fabric.surfaceRegistryBinding);
      } else {
        console.log('❌ Fabric configuration not found in app.json');
      }
    }
    
    // Check app.config.js
    const appConfigPath = path.join(__dirname, 'app.config.js');
    if (fs.existsSync(appConfigPath)) {
      // Since we can't directly require the JS file without evaluating it,
      // we'll check its content for fabric settings
      const appConfigContent = fs.readFileSync(appConfigPath, 'utf8');
      console.log('\napp.config.js Fabric check:');
      
      if (appConfigContent.includes('fabric:') && 
          appConfigContent.includes('enabled: true') &&
          appConfigContent.includes('surfaceRegistryBinding: true')) {
        console.log('✅ Fabric and SurfaceRegistryBinding appear to be configured');
      } else {
        console.log('❌ Fabric configuration appears to be missing or incomplete in app.config.js');
      }
    }
  } catch (error) {
    console.error('Error checking Expo config:', error.message);
  }
};

// Check gradle.properties for Fabric settings
const checkGradleProperties = () => {
  try {
    const gradlePropsPath = path.join(__dirname, 'android', 'gradle.properties');
    if (fs.existsSync(gradlePropsPath)) {
      const gradleProps = fs.readFileSync(gradlePropsPath, 'utf8');
      console.log('\nandroid/gradle.properties check:');
      
      const newArchEnabled = gradleProps.includes('newArchEnabled=true');
      console.log(`✅ New Architecture enabled: ${newArchEnabled}`);
      
      const surfaceRegistryBinding = gradleProps.includes('react.fabric.enableSurfaceRegistryBinding=true');
      console.log(`✅ SurfaceRegistryBinding enabled: ${surfaceRegistryBinding}`);
      
      if (!newArchEnabled || !surfaceRegistryBinding) {
        console.log('❌ Some Fabric settings are missing in gradle.properties');
      }
    }
  } catch (error) {
    console.error('Error checking gradle.properties:', error.message);
  }
};

// Check if EAS Pre-Install script has Fabric settings
const checkEASScripts = () => {
  try {
    const preInstallPath = path.join(__dirname, 'eas-build-pre-install.sh');
    if (fs.existsSync(preInstallPath)) {
      const preInstallScript = fs.readFileSync(preInstallPath, 'utf8');
      console.log('\nEAS Pre-Install script check:');
      
      if (preInstallScript.includes('newArchEnabled=true') && 
          preInstallScript.includes('react.fabric.enableSurfaceRegistryBinding=true')) {
        console.log('✅ EAS Pre-Install script has proper Fabric configuration');
      } else {
        console.log('❌ EAS Pre-Install script may be missing Fabric configuration');
      }
    }
  } catch (error) {
    console.error('Error checking EAS scripts:', error.message);
  }
};

// Main function
const main = () => {
  checkExpoConfig();
  checkGradleProperties();
  checkEASScripts();
  
  console.log('\nRecommendations:');
  console.log('1. If using EAS build, ensure Fabric settings are in eas-build-pre-install.sh');
  console.log('2. For local builds, ensure gradle.properties has proper Fabric settings');
  console.log('3. Check MainApplication.java and MainActivity.java for proper initialization');
};

main();