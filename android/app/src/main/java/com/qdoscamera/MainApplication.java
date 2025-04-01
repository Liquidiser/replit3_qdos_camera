package com.qdoscamera;

import android.app.Application;
import android.util.Log;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;
import com.facebook.react.bridge.JSIModulePackage;
import com.facebook.react.bridge.JSIModuleProvider;
import com.facebook.react.bridge.JSIModuleSpec;
import com.facebook.react.bridge.JSIModuleType;
import com.facebook.react.fabric.ComponentFactory;
import com.facebook.react.fabric.CoreComponentsRegistry;
import com.facebook.react.fabric.FabricJSIModuleProvider;
import com.facebook.jni.HybridData;
import com.facebook.react.config.ReactFeatureFlags;
import java.util.List;
import java.util.Collections;

// Import for Flipper in debug mode
import com.qdoscamera.ReactNativeFlipper;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new DefaultReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
          packages.add(new QRDetectorPackage());
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

        @Override
        protected boolean isNewArchEnabled() {
          return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
        }

        @Override
        protected Boolean isHermesEnabled() {
          return BuildConfig.IS_HERMES_ENABLED;
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    
    // Enable SurfaceRegistry binding in React Feature Flags
    ReactFeatureFlags.useTurboModules = true;
    ReactFeatureFlags.enableFabricRenderer = true;
    ReactFeatureFlags.enableSurfaceRegistryForComponents = true;
    
    // Initialize SoLoader before any other React Native components
    SoLoader.init(this, /* native exopackage */ false);
    Log.d("QDOS", "SoLoader initialized");
    
    // Initialize Native SurfaceRegistry classes before creating ReactInstanceManager
    try {
      // This forces the initialization of necessary classes for SurfaceRegistryBinding
      Class<?> surfaceRegistryClass = Class.forName("com.facebook.react.fabric.SurfaceRegistry");
      Log.d("QDOS", "SurfaceRegistry class loaded");
      
      Class<?> globalClass = Class.forName("com.facebook.react.common.annotations.Global");
      Log.d("QDOS", "Global class loaded");
      
      // Force early initialization of key native modules required by Fabric
      Class.forName("com.facebook.react.fabric.FabricBinding");
      Class.forName("com.facebook.react.fabric.ReactNativeConfig");
      Log.d("QDOS", "Fabric initialization classes loaded");
    } catch (ClassNotFoundException e) {
      Log.e("QDOS", "Error initializing SurfaceRegistry classes", e);
    }
    
    // Continue with the normal initialization
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      DefaultNewArchitectureEntryPoint.load();
      Log.d("QDOS", "New Architecture entry point loaded");
    } else {
      Log.d("QDOS", "Using old architecture (Fabric may not be fully enabled)");
    }
    
    // Finally initialize Flipper for debugging
    ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
    Log.d("QDOS", "Application initialization complete");
  }
}