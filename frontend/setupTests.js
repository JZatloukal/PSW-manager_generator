// Jest setup pro frontend testy
import '@testing-library/jest-dom';

// Mock pro localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock pro fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Mock pro window.alert
global.alert = jest.fn();

// Mock pro window.confirm
global.confirm = jest.fn();
