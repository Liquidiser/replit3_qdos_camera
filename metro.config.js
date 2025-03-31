const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Customize the transformer to use the SVG transformer
config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer"
);

// Adjust asset and source extensions for SVGs and other assets
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);
config.resolver.assetExts.push("riv");
config.resolver.sourceExts.push("svg");

module.exports = config;
