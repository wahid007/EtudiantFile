import { renderHook, act } from '@testing-library/react';
import { FavoritesProvider, useFavorites } from '../FavoritesContext';
import React, { ReactNode } from 'react';

// Mock localStorage
let store: { [key: string]: string } = {};
const localStorageMock = {
  getItem: jest.fn((key: string) => store[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    store[key] = value.toString();
  }),
  removeItem: jest.fn((key: string) => {
    delete store[key];
  }),
  clear: jest.fn(() => {
    store = {};
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Wrapper component for testing the hook
const wrapper = ({ children }: { children: ReactNode }) => (
  <FavoritesProvider>{children}</FavoritesProvider>
);

describe('FavoritesContext', () => {
  beforeEach(() => {
    // Clear localStorage mock and spies before each test
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  test('initial favoriteIds is empty if localStorage is empty', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
    expect(result.current.favoriteIds).toEqual([]);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('htacademy-favorites');
  });

  test('loads favoriteIds from localStorage on initial mount', () => {
    const initialFavorites = ['course_001', 'course_003'];
    localStorageMock.setItem('htacademy-favorites', JSON.stringify(initialFavorites));

    const { result } = renderHook(() => useFavorites(), { wrapper });

    expect(result.current.favoriteIds).toEqual(initialFavorites);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('htacademy-favorites'); // Corrected key
  });

  test('addFavorite adds an ID and updates localStorage', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.addFavorite('course_001');
    });

    expect(result.current.favoriteIds).toEqual(['course_001']);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('htacademy-favorites', JSON.stringify(['course_001']));
  });

  test('addFavorite does not add a duplicate ID', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.addFavorite('course_001');
    });
    act(() => {
      result.current.addFavorite('course_001'); // Try adding again
    });

    expect(result.current.favoriteIds).toEqual(['course_001']);
    // setItem would be called twice, but the state should only contain one instance
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
    expect(localStorageMock.setItem).toHaveBeenLastCalledWith('htacademy-favorites', JSON.stringify(['course_001']));
  });

  test('removeFavorite removes an ID and updates localStorage', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    // Add a couple of items first
    act(() => {
      result.current.addFavorite('course_001');
    });
    act(() => {
      result.current.addFavorite('course_002');
    });

    expect(result.current.favoriteIds).toEqual(['course_001', 'course_002']);

    // Remove one
    act(() => {
      result.current.removeFavorite('course_001');
    });

    expect(result.current.favoriteIds).toEqual(['course_002']);
    expect(localStorageMock.setItem).toHaveBeenLastCalledWith('htacademy-favorites', JSON.stringify(['course_002']));
  });

  test('removeFavorite does nothing if ID is not present', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });
     act(() => {
      result.current.addFavorite('course_001');
    });
    localStorageMock.setItem.mockClear(); // Clear mocks after setup

    act(() => {
      result.current.removeFavorite('course_999'); // Try removing non-existent ID
    });

    expect(result.current.favoriteIds).toEqual(['course_001']);
    // setItem should not be called again if nothing changed, but due to useEffect dependency on favoriteIds, it will be.
    // The important part is that the state itself is correct.
    expect(localStorageMock.setItem).toHaveBeenCalledWith('htacademy-favorites', JSON.stringify(['course_001']));
  });


  test('isFavorite returns true for a favorited ID and false otherwise', () => {
    const { result } = renderHook(() => useFavorites(), { wrapper });

    act(() => {
      result.current.addFavorite('course_001');
    });

    expect(result.current.isFavorite('course_001')).toBe(true);
    expect(result.current.isFavorite('course_002')).toBe(false);
  });

  test('handles errors when parsing localStorage JSON', () => {
    // Suppress console.error for this specific test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    localStorageMock.setItem('htacademy-favorites', 'invalid json');

    const { result } = renderHook(() => useFavorites(), { wrapper });

    expect(result.current.favoriteIds).toEqual([]); // Should default to empty array
    expect(console.error).toHaveBeenCalled(); // Check if error was logged

    consoleErrorSpy.mockRestore(); // Restore console.error
  });
});
