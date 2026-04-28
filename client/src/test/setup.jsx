import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const localStorageStore = new Map();

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: {
    getItem: (key) => localStorageStore.get(key) ?? null,
    setItem: (key, value) => localStorageStore.set(key, String(value)),
    removeItem: (key) => localStorageStore.delete(key),
    clear: () => localStorageStore.clear(),
  },
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

window.scrollTo = vi.fn();

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverMock;
window.IntersectionObserver = IntersectionObserverMock;

vi.mock('framer-motion', async () => {
  const React = await vi.importActual('react');
  const motionProps = new Set([
    'animate',
    'exit',
    'initial',
    'transition',
    'variants',
    'viewport',
    'whileHover',
    'whileInView',
    'whileTap',
  ]);

  const createMotionComponent = (tag) => React.forwardRef(({ children, ...props }, ref) => {
    const domProps = Object.fromEntries(
      Object.entries(props).filter(([key]) => !motionProps.has(key))
    );

    return React.createElement(tag, { ...domProps, ref }, children);
  });

  return {
    AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
    motion: new Proxy({}, {
      get: (_target, tag) => createMotionComponent(tag),
    }),
  };
});
