const { getDefaultConfig, mergeConfig } = require("@expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  },
  resolver: {
    // Remove "svg" from the asset extensions and add "riv"
    assetExts: defaultConfig.resolver.assetExts
      .filter((ext) => ext !== "svg")
      .concat(["riv"]),
    // Add "svg" to the source extensions
    sourceExts: [...defaultConfig.resolver.sourceExts, "svg"],
  },
};

module.exports = mergeConfig(defaultConfig, config);
