import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    currentUser: null,
    logout: vi.fn(),
  }),
}));

vi.mock('./context/LangContext', () => {
  const languages = [
    { code: 'en', nativeLabel: 'English', flag: 'GB' },
    { code: 'hi', nativeLabel: 'Hindi', flag: 'IN' },
  ];

  return {
    LangProvider: ({ children }) => children,
    LANGUAGES: languages,
    useLang: () => ({
      currentLangObj: languages[0],
      changeLanguage: vi.fn(),
      LANGUAGES: languages,
    }),
  };
});

describe('App shell', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
    localStorage.clear();
  });

  it('renders an accessible app landmark, skip link, and home content', async () => {
    render(<App />);

    const main = screen.getByRole('main');
    expect(main.id).toBe('main-content');
    expect(main.tabIndex).toBe(-1);

    const skipLink = screen.getByText('Skip to content');
    expect(skipLink.getAttribute('href')).toBe('#main-content');

    expect(screen.getByRole('link', { name: /VoteWise AI Home/i }).getAttribute('href')).toBe('/');
    expect(await screen.findByRole('heading', { name: /Understand Elections/i })).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /AI Chat/i }).length).toBeGreaterThan(0);
  });

  it('deep-links to the election timeline route', async () => {
    window.history.pushState({}, '', `${window.location.origin}/timeline`);

    render(<App />);

    expect(await screen.findByText(/from announcement to government formation/i)).toBeTruthy();
    expect(screen.getByRole('list', { name: /Indian election process steps/i })).toBeTruthy();
  });
});
