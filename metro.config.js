const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Limit transform workers — the main cause of EMFILE on Windows
// (fewer workers = fewer concurrent file handles)
config.maxWorkers = 2;

// Exclude directories that Metro doesn't need to watch. This dramatically
// reduces open file handles on Windows.
//
// IMPORTANT: these patterns are anchored to this project's own top-level
// folders (via `escapeAndAnchor`) rather than matching the folder name
// anywhere in the path. Unanchored patterns like /.*[\/\\]dist[\/\\].*/ or
// /.*[\/\\]server[\/\\].*/ also match node_modules/**/dist/** and
// node_modules/**/server/** — which is most of the npm ecosystem (any
// package with a "dist" build output) — and previously made Metro report
// legitimate dependencies (e.g. @radix-ui/react-slot/dist/index.js, pulled
// in by expo-router itself, and Expo's own nested
// @expo/router-server/build/server/*) as "does not exist", breaking bundling.
const escapeAndAnchor = (...segments) => {
  const escaped = path.join(__dirname, ...segments).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}[\\/\\\\].*`);
};

config.resolver.blockList = [
  // Admin Vite app — has its own build system
  escapeAndAnchor('admin'),
  // Express server — no need to watch backend files
  escapeAndAnchor('server'),
  // Android / iOS build artifacts
  escapeAndAnchor('android', 'build'),
  escapeAndAnchor('android', '.gradle'),
  escapeAndAnchor('ios', 'build'),
  escapeAndAnchor('ios', 'Pods'),
  // Dist / output
  escapeAndAnchor('dist'),
];

module.exports = config;
