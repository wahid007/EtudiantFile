"use client"; // Context with hooks like useState/useEffect needs to be client-side

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of the context value
interface FavoritesContextType {
  favoriteIds: string[];
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

// Create the context with a default undefined value
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// localStorage key
const LOCAL_STORAGE_KEY = 'htacademy-favorites';

// Create the Provider component
export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Load favorites from localStorage on initial mount
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedFavorites) {
        setFavoriteIds(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Failed to load favorites from localStorage:", error);
      setFavoriteIds([]); // Default to empty array on error
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch (error) {
      console.error("Failed to save favorites to localStorage:", error);
    }
  }, [favoriteIds]);

  const addFavorite = (id: string) => {
    setFavoriteIds((prevIds) => {
      if (!prevIds.includes(id)) {
        return [...prevIds, id];
      }
      return prevIds;
    });
  };

  const removeFavorite = (id: string) => {
    setFavoriteIds((prevIds) => prevIds.filter(favId => favId !== id));
  };

  const isFavorite = (id: string): boolean => {
    return favoriteIds.includes(id);
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Create a custom hook to use the FavoritesContext
export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
