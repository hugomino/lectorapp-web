// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 1) Permite que Metro cargue m�dulos internos de paquetes aunque no est�n en "exports"
config.resolver.unstable_enablePackageExports = false;

// 2) Mapea los m�dulos nativos de Node a sus polyfills para React Native
config.resolver.extraNodeModules = require('node-libs-expo');

// 3) Asegura que Metro reconozca archivos .cjs (algunos polyfills vienen as�)
config.resolver.sourceExts.push('cjs');

module.exports = config;
