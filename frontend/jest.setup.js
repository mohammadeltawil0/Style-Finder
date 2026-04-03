// fix AsyncStorage crash
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// fix vector icons (prevents act warning too)
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Icon',
}));

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');