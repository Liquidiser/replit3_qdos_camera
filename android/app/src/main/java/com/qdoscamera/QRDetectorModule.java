package com.qdoscamera;

import android.annotation.SuppressLint;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.ImageFormat;
import android.graphics.Rect;
import android.graphics.YuvImage;
import android.media.Image;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.camera.core.ImageProxy;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.mlkit.vision.barcode.BarcodeScanner;
import com.google.mlkit.vision.barcode.BarcodeScannerOptions;
import com.google.mlkit.vision.barcode.BarcodeScanning;
import com.google.mlkit.vision.barcode.common.Barcode;
import com.google.mlkit.vision.common.InputImage;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.util.List;

public class QRDetectorModule extends ReactContextBaseJavaModule {
    private static final String TAG = "QRDetectorModule";
    private static final String MODULE_NAME = "QRDetectorModule";
    private final ReactApplicationContext reactContext;
    private BarcodeScanner barcodeScanner;

    public QRDetectorModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        
        // Initialize barcode scanner with QR code format
        BarcodeScannerOptions options = new BarcodeScannerOptions.Builder()
                .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
                .build();
        barcodeScanner = BarcodeScanning.getClient(options);
    }

    @NonNull
    @Override
    public String getName() {
        return MODULE_NAME;
    }

    /**
     * Detects QR codes in a camera frame
     * 
     * @param frameData Map containing frame data from React Native Vision Camera
     * @param promise Promise to resolve with QR code results
     */
    @ReactMethod
    public void detectQRCode(ReadableMap frameData, final Promise promise) {
        try {
            if (frameData == null) {
                promise.reject("INVALID_FRAME", "Frame data is null");
                return;
            }

            // Extract frame data
            int width = frameData.getInt("width");
            int height = frameData.getInt("height");
            String orientation = frameData.getString("orientation");
            int format = frameData.getInt("format");
            byte[] data = getByteArrayFromFrameData(frameData);

            if (data == null) {
                promise.reject("INVALID_DATA", "Failed to extract frame data");
                return;
            }

            // Process image based on format
            InputImage inputImage;
            if (format == ImageFormat.YUV_420_888) {
                inputImage = InputImage.fromByteArray(
                        data,
                        width,
                        height,
                        getRotationBasedOnOrientation(orientation),
                        InputImage.IMAGE_FORMAT_YUV_420_888
                );
            } else if (format == ImageFormat.NV21) {
                inputImage = InputImage.fromByteArray(
                        data,
                        width,
                        height,
                        getRotationBasedOnOrientation(orientation),
                        InputImage.IMAGE_FORMAT_NV21
                );
            } else {
                // Fallback to bitmap-based processing for other formats
                Bitmap bitmap = convertFrameToBitmap(data, width, height, format);
                if (bitmap == null) {
                    promise.reject("CONVERSION_ERROR", "Failed to convert frame to bitmap");
                    return;
                }
                inputImage = InputImage.fromBitmap(bitmap, getRotationBasedOnOrientation(orientation));
            }

            // Process the image with ML Kit's barcode scanner
            barcodeScanner.process(inputImage)
                    .addOnSuccessListener(barcodes -> {
                        if (barcodes.isEmpty()) {
                            // No QR codes found
                            promise.resolve(null);
                            return;
                        }

                        // Return the first QR code result (could be modified to return all)
                        WritableMap resultMap = processQRCodeResult(barcodes.get(0), width, height);
                        promise.resolve(resultMap);
                    })
                    .addOnFailureListener(e -> {
                        Log.e(TAG, "QR code detection failed", e);
                        promise.reject("DETECTION_ERROR", "QR code detection failed: " + e.getMessage());
                    });

        } catch (Exception e) {
            Log.e(TAG, "Error in QR code detection", e);
            promise.reject("DETECTION_ERROR", "Error in QR code detection: " + e.getMessage());
        }
    }

    /**
     * Process a QR code result from ML Kit
     * 
     * @param barcode The barcode detected by ML Kit
     * @param imageWidth Width of the source image
     * @param imageHeight Height of the source image
     * @return Map containing QR code value and bounds
     */
    private WritableMap processQRCodeResult(Barcode barcode, int imageWidth, int imageHeight) {
        WritableMap resultMap = Arguments.createMap();
        
        // Extract and add QR code value
        String value = barcode.getRawValue();
        if (value != null) {
            resultMap.putString("value", value);
        } else {
            resultMap.putString("value", barcode.getDisplayValue());
        }

        // Add bounding box information
        WritableMap boundsMap = Arguments.createMap();
        if (barcode.getBoundingBox() != null) {
            Rect boundingBox = barcode.getBoundingBox();
            boundsMap.putInt("x", boundingBox.left);
            boundsMap.putInt("y", boundingBox.top);
            boundsMap.putInt("width", boundingBox.width());
            boundsMap.putInt("height", boundingBox.height());
            
            // Add normalized origin and size for convenience
            WritableArray origin = Arguments.createArray();
            origin.pushDouble((double) boundingBox.left / imageWidth);
            origin.pushDouble((double) boundingBox.top / imageHeight);
            boundsMap.putArray("origin", origin);
            
            WritableArray size = Arguments.createArray();
            size.pushDouble((double) boundingBox.width() / imageWidth);
            size.pushDouble((double) boundingBox.height() / imageHeight);
            boundsMap.putArray("size", size);
        }
        resultMap.putMap("bounds", boundsMap);

        return resultMap;
    }

    /**
     * Extract byte array from frame data provided by React Native Vision Camera
     */
    private byte[] getByteArrayFromFrameData(ReadableMap frameData) {
        if (frameData.hasKey("data")) {
            return frameData.getMap("data").getArray("bytes").toArrayList()
                    .stream()
                    .map(Number.class::cast)
                    .map(Number::byteValue)
                    .toArray(byte[]::new);
        } else if (frameData.hasKey("buffer")) {
            return frameData.getArray("buffer").toArrayList()
                    .stream()
                    .map(Number.class::cast)
                    .map(Number::byteValue)
                    .toArray(byte[]::new);
        } else {
            Log.e(TAG, "Frame data does not contain expected data format");
            return null;
        }
    }

    /**
     * Convert camera frame format to bitmap for processing
     * This is a fallback method for unsupported formats
     */
    private Bitmap convertFrameToBitmap(byte[] data, int width, int height, int format) {
        try {
            if (format == ImageFormat.JPEG) {
                return BitmapFactory.decodeByteArray(data, 0, data.length);
            } else if (format == ImageFormat.YUV_420_888 || format == ImageFormat.NV21) {
                YuvImage yuvImage = new YuvImage(data, format, width, height, null);
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                yuvImage.compressToJpeg(new Rect(0, 0, width, height), 100, out);
                byte[] jpegBytes = out.toByteArray();
                return BitmapFactory.decodeByteArray(jpegBytes, 0, jpegBytes.length);
            } else {
                Log.e(TAG, "Unsupported image format: " + format);
                return null;
            }
        } catch (Exception e) {
            Log.e(TAG, "Error converting frame to bitmap", e);
            return null;
        }
    }

    /**
     * Get rotation value based on device orientation
     */
    private int getRotationBasedOnOrientation(String orientation) {
        switch (orientation) {
            case "portrait":
                return 0;
            case "landscapeLeft":
                return 90;
            case "landscapeRight":
                return 270;
            case "portraitUpsideDown":
                return 180;
            default:
                return 0;
        }
    }

    /**
     * Release resources when module is destroyed
     */
    @Override
    public void onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy();
        if (barcodeScanner != null) {
            barcodeScanner.close();
            barcodeScanner = null;
        }
    }
}
