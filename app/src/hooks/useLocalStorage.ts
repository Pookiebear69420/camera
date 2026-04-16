import { useState, useEffect, useCallback } from 'react';
import type { Photo, Filter } from '@/types';

const PHOTOS_KEY = 'retrocam-photos';
const FILTERS_KEY = 'retrocam-filters';
const FAVORITES_KEY = 'retrocam-favorites';

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(PHOTOS_KEY);
    if (stored) {
      try {
        setPhotos(JSON.parse(stored));
      } catch {
        setPhotos([]);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
    }
  }, [photos, isLoaded]);

  const addPhoto = useCallback((photo: Photo) => {
    setPhotos(prev => [photo, ...prev]);
  }, []);

  const deletePhoto = useCallback((id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  }, []);

  const updatePhoto = useCallback((id: string, updates: Partial<Photo>) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const clearAll = useCallback(() => {
    setPhotos([]);
  }, []);

  return { photos, addPhoto, deletePhoto, updatePhoto, clearAll, isLoaded };
}

export function useCustomFilters() {
  const [customFilters, setCustomFilters] = useState<Filter[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(FILTERS_KEY);
    if (stored) {
      try {
        setCustomFilters(JSON.parse(stored));
      } catch {
        setCustomFilters([]);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(FILTERS_KEY, JSON.stringify(customFilters));
    }
  }, [customFilters, isLoaded]);

  const addFilter = useCallback((filter: Filter) => {
    setCustomFilters(prev => [filter, ...prev]);
  }, []);

  const deleteFilter = useCallback((id: string) => {
    setCustomFilters(prev => prev.filter(f => f.id !== id));
  }, []);

  const updateFilter = useCallback((id: string, updates: Partial<Filter>) => {
    setCustomFilters(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  return { customFilters, addFilter, deleteFilter, updateFilter, isLoaded };
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        setFavorites([]);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  }, [favorites, isLoaded]);

  const toggleFavorite = useCallback((filterId: string) => {
    setFavorites(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  }, []);

  const isFavorite = useCallback((filterId: string) => {
    return favorites.includes(filterId);
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite, isLoaded };
}
