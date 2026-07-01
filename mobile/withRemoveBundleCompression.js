const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Config plugin to remove the deprecated `enableBundleCompression` property
 * from the Android app build.gradle. This property was removed in React Native 0.74+
 * but Expo SDK 54's prebuild template still generates it, causing a Gradle build failure.
 */
const withRemoveBundleCompression = (config) => {
  return withAppBuildGradle(config, (modConfig) => {
    const contents = modConfig.modResults.contents;
    // Remove the entire enableBundleCompression line
    modConfig.modResults.contents = contents.replace(
      /\n\s*enableBundleCompression\s*=\s*.+\n/g,
      '\n'
    );
    return modConfig;
  });
};

module.exports = withRemoveBundleCompression;
