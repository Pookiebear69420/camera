import { useState, useCallback, useEffect } from 'react';
import { Camera, Images, Heart, Settings } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { usePhotos, useCustomFilters, useFavorites } from '@/hooks/useLocalStorage';
import { CameraView } from '@/components/CameraView';
import { FilterStrip } from '@/components/FilterStrip';
import { FilterEditor } from '@/components/FilterEditor';
import { PhotoGallery } from '@/components/PhotoGallery';
import { PRESET_FILTERS } from '@/data/filters';
import type { Filter, Photo } from '@/types';
import { DEFAULT_ADJUSTMENTS } from '@/types';
import { createFilteredImage } from '@/utils/filterProcessor';
import { Toaster, toast } from 'sonner';

function App() {
  // Camera hook
  const { videoRef, isReady, settings, updateSettings, startCamera, takePhoto } = useCamera();

  // Storage hooks
  const { photos, addPhoto, deletePhoto, isLoaded: photosLoaded } = usePhotos();
  const { customFilters, addFilter, isLoaded: filtersLoaded } = useCustomFilters();
  const { favorites, toggleFavorite, isLoaded: favoritesLoaded } = useFavorites();

  // State
  const [currentFilter, setCurrentFilter] = useState<Filter>(PRESET_FILTERS[0]);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [flashActive, setFlashActive] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Start camera on mount
  useEffect(() => {
    if (photosLoaded && filtersLoaded && favoritesLoaded) {
      startCamera(facingMode);
    }
  }, [photosLoaded, filtersLoaded, favoritesLoaded, facingMode, startCamera]);

  // Handle taking photo
  const handleTakePhoto = useCallback(() => {
    if (!isReady) return;

    // Trigger flash
    if (settings.flashEnabled) {
      setFlashActive(true);
      setTimeout(() => setFlashActive(false), 150);
    }

    // Capture from video
    const dataUrl = takePhoto();
    if (!dataUrl) {
      toast.error('Failed to capture photo');
      return;
    }

    // Apply filter
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Apply CSS filter
      ctx.filter = currentFilter.cssFilter;
      ctx.drawImage(img, 0, 0);

      // Apply advanced filters if adjustments exist
      let finalDataUrl = canvas.toDataURL('image/jpeg', 0.95);

      if (currentFilter.adjustments) {
        // Use the filter processor for advanced effects
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.drawImage(img, 0, 0);
          finalDataUrl = createFilteredImage(tempCanvas, currentFilter.adjustments);
        }
      }

      // Save photo
      const newPhoto: Photo = {
        id: `photo-${Date.now()}`,
        dataUrl: finalDataUrl,
        timestamp: Date.now(),
        filterId: currentFilter.id,
        filterName: currentFilter.name,
        adjustments: currentFilter.adjustments || DEFAULT_ADJUSTMENTS,
      };

      addPhoto(newPhoto);
      setLastPhoto(finalDataUrl);
      toast.success('Photo saved to camera roll!');
    };
    img.src = dataUrl;
  }, [isReady, settings.flashEnabled, takePhoto, currentFilter, addPhoto]);

  // Toggle camera
  const handleToggleCamera = useCallback(() => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    startCamera(newMode);
  }, [facingMode, startCamera]);

  // Select filter
  const handleSelectFilter = useCallback((filter: Filter) => {
    setCurrentFilter(filter);
    toast.info(`Applied: ${filter.name}`);
  }, []);

  // Save custom filter
  const handleSaveFilter = useCallback((filter: Filter) => {
    addFilter(filter);
    toast.success('Filter saved!');
  }, [addFilter]);

  // Save photo to device
  const handleSaveToDevice = useCallback((photo: Photo) => {
    const link = document.createElement('a');
    link.href = photo.dataUrl;
    link.download = `retrocam-${photo.id}.jpg`;
    link.click();
    toast.success('Photo downloaded!');
  }, []);

  // Loading state
  if (!photosLoaded || !filtersLoaded || !favoritesLoaded) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <Camera className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col overflow-hidden">
      <Toaster position="top-center" richColors />

      {/* Main Camera View */}
      <div className="flex-1 relative">
        <CameraView
          videoRef={videoRef}
          isReady={isReady}
          settings={settings}
          onUpdateSettings={updateSettings}
          onTakePhoto={handleTakePhoto}
          onToggleCamera={handleToggleCamera}
          currentFilter={currentFilter.cssFilter}
          flashActive={flashActive}
        />
      </div>

      {/* Filter Strip */}
      <FilterStrip
        filters={PRESET_FILTERS}
        customFilters={customFilters}
        currentFilterId={currentFilter.id}
        favorites={favorites}
        onSelectFilter={handleSelectFilter}
        onToggleFavorite={toggleFavorite}
        onOpenEditor={() => setShowEditor(true)}
        showOnlyFavorites={showOnlyFavorites}
      />

      {/* Bottom Navigation */}
      <div className="bg-black border-t border-white/10 px-4 py-3">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setShowGallery(true)}
            className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors"
          >
            <div className="relative">
              <Images className="w-6 h-6" />
              {photos.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full text-[10px] font-bold text-black flex items-center justify-center">
                  {photos.length > 99 ? '99+' : photos.length}
                </span>
              )}
            </div>
            <span className="text-[10px]">Photos</span>
          </button>

          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              showOnlyFavorites ? 'text-yellow-400' : 'text-white/60 hover:text-white'
            }`}
          >
            <Heart className={`w-6 h-6 ${showOnlyFavorites ? 'fill-current' : ''}`} />
            <span className="text-[10px]">Favorites</span>
          </button>

          <button
            onClick={() => setShowEditor(true)}
            className="flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors"
          >
            <Settings className="w-6 h-6" />
            <span className="text-[10px]">Editor</span>
          </button>
        </div>
      </div>

      {/* Filter Editor Modal */}
      <FilterEditor
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        onSave={handleSaveFilter}
        previewImage={lastPhoto || undefined}
      />

      {/* Photo Gallery Modal */}
      <PhotoGallery
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        photos={photos}
        onDelete={deletePhoto}
        onSaveToDevice={handleSaveToDevice}
      />
    </div>
  );
}

export default App;
