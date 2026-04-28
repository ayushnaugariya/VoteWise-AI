/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './context/LangContext';

describe('App', () => {
  it('renders without crashing', () => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => null,
        setItem: () => null,
      },
      writable: true
    });
    
    render(
      <AuthProvider>
        <LangProvider>
          <App />
        </LangProvider>
      </AuthProvider>
    );
    expect(true).toBe(true);
  });
});
