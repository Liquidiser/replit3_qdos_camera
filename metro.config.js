const { getDefaultConfig } = require("@react-native/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

// Manually update the transformer configuration
defaultConfig.transformer = {
  ...defaultConfig.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

// Manually update the resolver configuration
defaultConfig.resolver = {
  ...defaultConfig.resolver,
  assetExts: defaultConfig.resolver.assetExts
    .filter((ext) => ext !== "svg")
    .concat(["riv"]),
  sourceExts: [...defaultConfig.resolver.sourceExts, "svg"],
};

module.exports = defaultConfig;
