const { getDefaultConfig } = require("@expo/metro-config");
/**
 * Metro configuration for Expo and React Native
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);
// Modify the default config to add SVG and RIV handling
const config = {
  transformer: {
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  },
  resolver: {
    assetExts: defaultConfig.resolver.assetExts
      .filter((ext) => ext !== "svg")
      .concat(["riv"]),
    sourceExts: defaultConfig.resolver.sourceExts.concat(["svg"]),
  },
};
module.exports = getDefaultConfig(__dirname, config);
