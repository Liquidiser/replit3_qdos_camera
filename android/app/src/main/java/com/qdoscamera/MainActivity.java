package com.qdoscamera;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.soloader.SoLoader;
import android.os.Bundle;
import android.view.KeyEvent;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "QDOSCamera";
  }

  /**
   * Required for proper react-native-screens & react-navigation support
   * Also initializes Surface Registry binding to prevent errors
   */
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    // Pre-load critical native modules to ensure proper initialization
    try {
      SoLoader.loadLibrary("fabricjni");
      SoLoader.loadLibrary("rnscreens");
      
      // Ensure SurfaceRegistry is initialized before React Native components
      Class.forName("com.facebook.react.fabric.SurfaceRegistry");
    } catch (Exception e) {
      // Log but continue - the app should still function
      System.err.println("Error preloading native modules: " + e.getMessage());
    }
    
    // Pass null to avoid restore issues with react-navigation
    super.onCreate(null);
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled());
  }
}