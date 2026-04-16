import { useRef, useState } from 'react';
import { Heart, Plus, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { Filter } from '@/types';

interface FilterStripProps {
  filters: Filter[];
  customFilters: Filter[];
  currentFilterId: string;
  favorites: string[];
  onSelectFilter: (filter: Filter) => void;
  onToggleFavorite: (filterId: string) => void;
  onOpenEditor: () => void;
  showOnlyFavorites?: boolean;
}

export function FilterStrip({
  filters,
  customFilters,
  currentFilterId,
  favorites,
  onSelectFilter,
  onToggleFavorite,
  onOpenEditor,
  showOnlyFavorites = false,
}: FilterStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFavorites, setShowFavorites] = useState(false);

  const allFilters = [...filters, ...customFilters];
  
  const displayedFilters = showOnlyFavorites || showFavorites
    ? allFilters.filter(f => favorites.includes(f.id) || f.isFavorite)
    : allFilters;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative bg-black/90 backdrop-blur-lg border-t border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              showFavorites ? 'bg-yellow-500 text-black' : 'bg-white/20 text-white'
            }`}
          >
            <Star className="w-3 h-3" />
            Favorites
          </button>
          <span className="text-white/40 text-xs">
            {displayedFilters.length} filters
          </span>
        </div>
        <button
          onClick={onOpenEditor}
          className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs font-medium text-white hover:bg-white/30 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Create
        </button>
      </div>

      {/* Scroll Buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/80 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/80 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Filters Scroll */}
      <div
        ref={scrollRef}
        className="flex gap-3 p-4 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayedFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onSelectFilter(filter)}
            className={`flex-shrink-0 relative group ${
              currentFilterId === filter.id ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-black' : ''
            }`}
          >
            {/* Filter Preview */}
            <div
              className={`w-16 h-16 rounded-xl ${filter.preview} flex items-center justify-center overflow-hidden`}
              style={{ filter: filter.cssFilter !== 'none' ? filter.cssFilter : undefined }}
            >
              {filter.isCustom && (
                <span className="text-[8px] font-bold text-white/80 bg-black/50 px-1 rounded">
                  CUSTOM
                </span>
              )}
            </div>

            {/* Filter Name */}
            <span className="block mt-1 text-[10px] text-white/80 text-center truncate w-16">
              {filter.name}
            </span>

            {/* Favorite Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(filter.id);
              }}
              className={`absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                favorites.includes(filter.id) || filter.isFavorite
                  ? 'bg-yellow-500 text-black'
                  : 'bg-black/50 text-white/60 hover:bg-black/80'
              }`}
            >
              <Heart
                className={`w-3 h-3 ${
                  favorites.includes(filter.id) || filter.isFavorite ? 'fill-current' : ''
                }`}
              />
            </button>

            {/* Selected Indicator */}
            {currentFilterId === filter.id && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-400 rounded-full" />
            )}
          </button>
        ))}

        {/* Empty State */}
        {displayedFilters.length === 0 && (
          <div className="flex-shrink-0 w-full py-4 text-center text-white/40 text-sm">
            No favorite filters yet. Tap the heart to add some!
          </div>
        )}
      </div>
    </div>
  );
}
