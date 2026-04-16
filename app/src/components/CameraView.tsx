import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Zap, Settings, RefreshCw, Aperture, Timer, Sun } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import type { CameraSettings } from '@/types';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isReady: boolean;
  settings: CameraSettings;
  onUpdateSettings: (settings: Partial<CameraSettings>) => void;
  onTakePhoto: () => void;
  onToggleCamera: () => void;
  currentFilter: string;
  flashActive: boolean;
}

const SHUTTER_SPEEDS = [1, 2, 4, 8, 15, 30, 60, 125, 250, 500, 1000, 2000];
const APERTURES = [1.4, 1.8, 2.8, 4, 5.6, 8, 11, 16, 22];
const ISOS = [50, 100, 200, 400, 800, 1600, 3200, 6400];

export function CameraView({
  videoRef,
  isReady,
  settings,
  onUpdateSettings,
  onTakePhoto,
  onToggleCamera,
  currentFilter,
  flashActive,
}: CameraViewProps) {
  const [showControls, setShowControls] = useState(false);
  const [activeControl, setActiveControl] = useState<'iso' | 'shutter' | 'aperture' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Apply filter to video preview via canvas
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !isReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      if (video.readyState >= 2) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.filter = currentFilter;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [videoRef, isReady, currentFilter]);

  const handleShutterClick = useCallback(() => {
    onTakePhoto();
  }, [onTakePhoto]);

  const getShutterSpeedDisplay = (speed: number) => {
    if (speed >= 1) return `1/${speed}`;
    return `${1/speed}s`;
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Video/Canvas Layer */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover opacity-0"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: currentFilter }}
      />

      {/* Flash Effect Overlay */}
      {flashActive && (
        <div className="absolute inset-0 bg-white animate-flash z-50 pointer-events-none" />
      )}

      {/* Viewfinder Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Corner Markers */}
        <div className="absolute top-16 left-4 w-8 h-8 border-l-2 border-t-2 border-white/60" />
        <div className="absolute top-16 right-4 w-8 h-8 border-r-2 border-t-2 border-white/60" />
        <div className="absolute bottom-32 left-4 w-8 h-8 border-l-2 border-b-2 border-white/60" />
        <div className="absolute bottom-32 right-4 w-8 h-8 border-r-2 border-b-2 border-white/60" />
        
        {/* Center Crosshair */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 border border-white/40 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-4 bg-white/40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-px w-4 bg-white/40" />

        {/* Focus Points */}
        <div className="absolute top-1/3 left-1/3 w-2 h-2 border border-white/30 rounded-full" />
        <div className="absolute top-1/3 right-1/3 w-2 h-2 border border-white/30 rounded-full" />
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 border border-white/30 rounded-full" />
        <div className="absolute bottom-1/3 right-1/3 w-2 h-2 border border-white/30 rounded-full" />
      </div>

      {/* Top Info Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center justify-between text-white text-sm font-mono">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowControls(!showControls)}
              className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-lg backdrop-blur-sm"
            >
              <Settings className="w-4 h-4" />
              <span className="text-xs">ISO {settings.iso}</span>
            </button>
            <span className="text-xs opacity-80">{getShutterSpeedDisplay(settings.shutterSpeed)}</span>
            <span className="text-xs opacity-80">f/{settings.aperture}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateSettings({ flashEnabled: !settings.flashEnabled })}
              className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                settings.flashEnabled ? 'bg-yellow-500/80' : 'bg-white/20'
              }`}
            >
              <Zap className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleCamera}
              className="p-2 bg-white/20 rounded-full backdrop-blur-sm"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Camera Controls Panel */}
      {showControls && (
        <div className="absolute top-16 left-4 right-4 bg-black/80 backdrop-blur-lg rounded-2xl p-4 z-40">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveControl(activeControl === 'iso' ? null : 'iso')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono transition-colors ${
                activeControl === 'iso' ? 'bg-white text-black' : 'bg-white/20 text-white'
              }`}
            >
              ISO
            </button>
            <button
              onClick={() => setActiveControl(activeControl === 'shutter' ? null : 'shutter')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono transition-colors ${
                activeControl === 'shutter' ? 'bg-white text-black' : 'bg-white/20 text-white'
              }`}
            >
              SHUTTER
            </button>
            <button
              onClick={() => setActiveControl(activeControl === 'aperture' ? null : 'aperture')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono transition-colors ${
                activeControl === 'aperture' ? 'bg-white text-black' : 'bg-white/20 text-white'
              }`}
            >
              APERTURE
            </button>
          </div>

          {activeControl === 'iso' && (
            <div className="space-y-2">
              <div className="flex justify-between text-white/60 text-xs">
                <Sun className="w-4 h-4" />
                <span>ISO</span>
              </div>
              <Slider
                value={[ISOS.indexOf(settings.iso)]}
                onValueChange={([v]) => onUpdateSettings({ iso: ISOS[v] || 100 })}
                max={ISOS.length - 1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-white text-xs font-mono">
                {ISOS.map((iso) => (
                  <span key={iso} className={settings.iso === iso ? 'text-yellow-400' : ''}>
                    {iso}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeControl === 'shutter' && (
            <div className="space-y-2">
              <div className="flex justify-between text-white/60 text-xs">
                <Timer className="w-4 h-4" />
                <span>SHUTTER SPEED</span>
              </div>
              <Slider
                value={[SHUTTER_SPEEDS.indexOf(settings.shutterSpeed)]}
                onValueChange={([v]) => onUpdateSettings({ shutterSpeed: SHUTTER_SPEEDS[v] || 125 })}
                max={SHUTTER_SPEEDS.length - 1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-white text-xs font-mono">
                {SHUTTER_SPEEDS.map((speed) => (
                  <span key={speed} className={settings.shutterSpeed === speed ? 'text-yellow-400' : ''}>
                    {getShutterSpeedDisplay(speed)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeControl === 'aperture' && (
            <div className="space-y-2">
              <div className="flex justify-between text-white/60 text-xs">
                <Aperture className="w-4 h-4" />
                <span>APERTURE</span>
              </div>
              <Slider
                value={[APERTURES.indexOf(settings.aperture)]}
                onValueChange={([v]) => onUpdateSettings({ aperture: APERTURES[v] || 2.8 })}
                max={APERTURES.length - 1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-white text-xs font-mono">
                {APERTURES.map((ap) => (
                  <span key={ap} className={settings.aperture === ap ? 'text-yellow-400' : ''}>
                    f/{ap}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Shutter Button */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8">
        <div className="w-16" /> {/* Spacer */}
        
        {/* Shutter Button */}
        <button
          onClick={handleShutterClick}
          disabled={!isReady}
          className="relative w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
        >
          <div className="w-16 h-16 rounded-full bg-white border-4 border-gray-300" />
        </button>

        {/* Camera Switch */}
        <button
          onClick={onToggleCamera}
          className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center active:scale-95 transition-transform"
        >
          <RefreshCw className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Not Ready Message */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="text-center text-white">
            <Camera className="w-12 h-12 mx-auto mb-4 animate-pulse" />
            <p className="text-lg font-medium">Starting Camera...</p>
            <p className="text-sm text-white/60 mt-2">Please allow camera access</p>
          </div>
        </div>
      )}
    </div>
  );
}
