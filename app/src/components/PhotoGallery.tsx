import { useState } from 'react';
import { X, Download, Trash2, Share2, Image as ImageIcon, Camera } from 'lucide-react';
import type { Photo } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PhotoGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  photos: Photo[];
  onDelete: (id: string) => void;
  onSaveToDevice: (photo: Photo) => void;
}

export function PhotoGallery({
  isOpen,
  onClose,
  photos,
  onDelete,
  onSaveToDevice,
}: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setViewMode('detail');
  };

  const handleBack = () => {
    setViewMode('grid');
    setSelectedPhoto(null);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {viewMode === 'detail' && selectedPhoto ? (
          <>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-white"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <span className="font-medium">Back to Gallery</span>
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-black" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Camera Roll</h2>
                <p className="text-xs text-white/60">{photos.length} photos</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <ScrollArea className="flex-1">
          {photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/40 p-8">
              <ImageIcon className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">No photos yet</p>
              <p className="text-sm mt-2">Take your first photo with the camera!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 p-1">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => handlePhotoClick(photo)}
                  className="relative aspect-square overflow-hidden bg-gray-800 active:scale-95 transition-transform"
                >
                  <img
                    src={photo.dataUrl}
                    alt={`Photo taken on ${formatDate(photo.timestamp)}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-[10px] text-white/80">{photo.filterName}</p>
                      <p className="text-[8px] text-white/60">{formatDate(photo.timestamp)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      ) : selectedPhoto ? (
        <div className="flex-1 flex flex-col">
          {/* Photo Display */}
          <div className="flex-1 flex items-center justify-center bg-gray-900 p-4">
            <img
              src={selectedPhoto.dataUrl}
              alt="Selected photo"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {/* Photo Info */}
          <div className="p-4 bg-gray-900 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white font-medium">{selectedPhoto.filterName}</p>
                <p className="text-sm text-white/60">{formatDate(selectedPhoto.timestamp)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => onSaveToDevice(selectedPhoto)}
                className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span className="text-xs">Save</span>
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    fetch(selectedPhoto.dataUrl)
                      .then(res => res.blob())
                      .then(blob => {
                        const file = new File([blob], `retrocam-${selectedPhoto.id}.jpg`, { type: 'image/jpeg' });
                        navigator.share({ files: [file] });
                      });
                  }
                }}
                className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-xs">Share</span>
              </button>
              <button
                onClick={() => {
                  onDelete(selectedPhoto.id);
                  handleBack();
                }}
                className="flex flex-col items-center gap-2 p-3 bg-red-500/20 rounded-xl text-red-400 hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                <span className="text-xs">Delete</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
