// AsyncStorage (official mock)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Vector icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Icon',
}));

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Helper to flush promises
const flushPromises = () => new Promise(setImmediate);

// Cleanup
afterEach(async () => {
  jest.clearAllMocks();
  jest.clearAllTimers();

  await new Promise(setImmediate);
});

jest.spyOn(global, "setTimeout").mockImplementation((fn) => {
  fn();
  return 0;
});