module.exports = {
  preset: 'jest-expo',

  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/__tests__/setup.ts',
  ],

  // Required: handle ESM packages inside node_modules.
  // until-async is ESM-only (used by msw) and must be transformed by Babel.
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      '(jest-)?react-native' +
      '|@react-native(-community)?' +
      '|expo(nent)?' +
      '|@expo(nent)?/.*' +
      '|@expo-google-fonts/.*' +
      '|react-navigation' +
      '|@react-navigation/.*' +
      '|lucide-react-native' +
      '|@lucide/.*' +
      '|@stripe/stripe-react-native' +
      '|react-native-safe-area-context' +
      '|react-native-screens' +
      '|react-native-reanimated' +
      '|react-native-gesture-handler' +
      '|until-async' +
    '))',
  ],

  // Resolve @/ alias, stub missing expo internals, and fix msw/node resolution.
  // The react-native test environment sets customExportConditions=['require','react-native'],
  // which resolves msw's 'react-native' export to null (unsupported).
  // Mapping it directly to the CJS build bypasses that condition entirely.
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^expo/src/async-require/messageSocket$': '<rootDir>/__tests__/mocks/emptyMock.ts',
    '^msw/node$': '<rootDir>/node_modules/msw/lib/node/index.js',
  },

  // Never treat app/ as test files (Expo Router routing folder)
  testPathIgnorePatterns: ['/node_modules/', '/app/'],

  // Where tests live
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],

  collectCoverageFrom: [
    'utils/**/*.ts',
    'services/**/*.ts',
    'models/**/*.ts',
    '!**/*.d.ts',
  ],
};
