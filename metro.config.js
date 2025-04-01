const { getDefaultConfig, mergeConfig } = require("@expo/metro-config");
const defaultConfig = getDefaultConfig(__dirname);

const customConfig = {
  transformer: {
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  },
  resolver: {
    assetExts: defaultConfig.resolver.assetExts
      .filter((ext) => ext !== "svg")
      .concat(["riv"]),
    sourceExts: [...defaultConfig.resolver.sourceExts, "svg"],
  },
};

module.exports = mergeConfig(defaultConfig, customConfig);
