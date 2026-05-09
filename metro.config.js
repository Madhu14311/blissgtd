// metro.config.js
// Fixes: "Cannot use 'import.meta' outside a module" from zustand v5 ESM build
// Strategy: force Metro to use 'require' (CJS) condition from package exports map
// so it picks zustand/*.js instead of zustand/esm/*.mjs

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Use 'require' condition so Metro picks CJS builds instead of ESM .mjs files
config.resolver.unstable_conditionNames = ['require', 'default', 'react-native'];

// Disable package exports resolution which causes Metro to pick ESM .mjs files
config.resolver.unstable_enablePackageExports = false;

module.exports = config;