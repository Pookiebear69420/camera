import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Save, RotateCcw, Sliders, Palette, Sparkles, Grid3X3 } from 'lucide-react';
import type { Filter, FilterAdjustments } from '@/types';
import { DEFAULT_ADJUSTMENTS } from '@/types';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateCSSFilter } from '@/utils/filterProcessor';

interface FilterEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (filter: Filter) => void;
  previewImage?: string;
}

export function FilterEditor({ isOpen, onClose, onSave, previewImage }: FilterEditorProps) {
  const [name, setName] = useState('My Filter');
  const [adjustments, setAdjustments] = useState<FilterAdjustments>({ ...DEFAULT_ADJUSTMENTS });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Generate preview
  useEffect(() => {
    if (!previewImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300 * (img.height / img.width);
      ctx.filter = generateCSSFilter(adjustments);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = previewImage;
  }, [previewImage, adjustments]);

  const updateAdjustment = useCallback((key: keyof FilterAdjustments, value: number) => {
    setAdjustments(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setAdjustments({ ...DEFAULT_ADJUSTMENTS });
  }, []);

  const handleSave = useCallback(() => {
    const newFilter: Filter = {
      id: `custom-${Date.now()}`,
      name: name || 'Custom Filter',
      preview: 'bg-gradient-to-br from-gray-400 to-gray-600',
      cssFilter: generateCSSFilter(adjustments),
      isFavorite: false,
      isCustom: true,
      adjustments: { ...adjustments },
    };
    onSave(newFilter);
    onClose();
    setName('My Filter');
    setAdjustments({ ...DEFAULT_ADJUSTMENTS });
  }, [name, adjustments, onSave, onClose]);

  if (!isOpen) return null;

  const AdjustmentSlider = ({
    label,
    value,
    min,
    max,
    onChange,
    icon: Icon,
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (val: number) => void;
    icon: React.ElementType;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/80">
          <Icon className="w-4 h-4" />
          <span className="text-sm">{label}</span>
        </div>
        <span className="text-sm text-white/60 font-mono">{value}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={1}
        className="w-full"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-white">Filter Editor</h2>
        <button
          onClick={handleSave}
          className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black hover:bg-yellow-400 transition-colors"
        >
          <Save className="w-5 h-5" />
        </button>
      </div>

      {/* Preview */}
      <div className="flex-shrink-0 p-4 bg-gray-900">
        <div className="relative aspect-video max-h-48 mx-auto rounded-xl overflow-hidden bg-gray-800">
          {previewImage ? (
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white/40">
              <div className="text-center">
                <Palette className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Take a photo to preview</p>
              </div>
            </div>
          )}
        </div>

        {/* Filter Name Input */}
        <div className="mt-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Filter name..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid grid-cols-4 mx-4 mt-4 bg-white/10">
            <TabsTrigger value="basic" className="data-[state=active]:bg-white/20">
              <Sliders className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="colors" className="data-[state=active]:bg-white/20">
              <Palette className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="effects" className="data-[state=active]:bg-white/20">
              <Sparkles className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="screen" className="data-[state=active]:bg-white/20">
              <Grid3X3 className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4">
            <TabsContent value="basic" className="mt-0 space-y-4">
              <AdjustmentSlider
                label="Brightness"
                value={adjustments.brightness}
                min={0}
                max={200}
                onChange={(v) => updateAdjustment('brightness', v)}
                icon={Sliders}
              />
              <AdjustmentSlider
                label="Contrast"
                value={adjustments.contrast}
                min={0}
                max={200}
                onChange={(v) => updateAdjustment('contrast', v)}
                icon={Sliders}
              />
              <AdjustmentSlider
                label="Saturation"
                value={adjustments.saturation}
                min={0}
                max={200}
                onChange={(v) => updateAdjustment('saturation', v)}
                icon={Sliders}
              />
              <AdjustmentSlider
                label="Hue"
                value={adjustments.hue}
                min={-180}
                max={180}
                onChange={(v) => updateAdjustment('hue', v)}
                icon={Sliders}
              />
            </TabsContent>

            <TabsContent value="colors" className="mt-0 space-y-4">
              <div className="text-white/60 text-xs uppercase tracking-wider mb-2">RGB Channels</div>
              <AdjustmentSlider
                label="Red"
                value={adjustments.red}
                min={0}
                max={200}
                onChange={(v) => updateAdjustment('red', v)}
                icon={Palette}
              />
              <AdjustmentSlider
                label="Green"
                value={adjustments.green}
                min={0}
                max={200}
                onChange={(v) => updateAdjustment('green', v)}
                icon={Palette}
              />
              <AdjustmentSlider
                label="Blue"
                value={adjustments.blue}
                min={0}
                max={200}
                onChange={(v) => updateAdjustment('blue', v)}
                icon={Palette}
              />

              <div className="text-white/60 text-xs uppercase tracking-wider mb-2 mt-6">CMY Channels</div>
              <AdjustmentSlider
                label="Cyan"
                value={adjustments.cyan}
                min={0}
                max={200}
                onChange={(v) => updateAdjustment('cyan', v)}
                icon={Palette}
              />
              <AdjustmentSlider
                label="Magenta"
                value={adjustments.magenta}
                min={0}
                max={200}
                onChange={(v) => updateAdjustment('magenta', v)}
                icon={Palette}
              />
              <AdjustmentSlider
                label="Yellow"
                value={adjustments.yellow}
                min={0}
                max={200}
                onChange={(v) => updateAdjustment('yellow', v)}
                icon={Palette}
              />
            </TabsContent>

            <TabsContent value="effects" className="mt-0 space-y-4">
              <AdjustmentSlider
                label="Sepia"
                value={adjustments.sepia}
                min={0}
                max={100}
                onChange={(v) => updateAdjustment('sepia', v)}
                icon={Sparkles}
              />
              <AdjustmentSlider
                label="Grayscale"
                value={adjustments.grayscale}
                min={0}
                max={100}
                onChange={(v) => updateAdjustment('grayscale', v)}
                icon={Sparkles}
              />
              <AdjustmentSlider
                label="Invert"
                value={adjustments.invert}
                min={0}
                max={100}
                onChange={(v) => updateAdjustment('invert', v)}
                icon={Sparkles}
              />
              <AdjustmentSlider
                label="Blur"
                value={adjustments.blur}
                min={0}
                max={20}
                onChange={(v) => updateAdjustment('blur', v)}
                icon={Sparkles}
              />
              <AdjustmentSlider
                label="Warmth"
                value={adjustments.warmth}
                min={0}
                max={100}
                onChange={(v) => updateAdjustment('warmth', v)}
                icon={Sparkles}
              />
            </TabsContent>

            <TabsContent value="screen" className="mt-0 space-y-4">
              <AdjustmentSlider
                label="Vignette"
                value={adjustments.vignette}
                min={0}
                max={100}
                onChange={(v) => updateAdjustment('vignette', v)}
                icon={Grid3X3}
              />
              <AdjustmentSlider
                label="Film Grain"
                value={adjustments.grain}
                min={0}
                max={100}
                onChange={(v) => updateAdjustment('grain', v)}
                icon={Grid3X3}
              />
              <AdjustmentSlider
                label="Tint"
                value={adjustments.tint}
                min={-100}
                max={100}
                onChange={(v) => updateAdjustment('tint', v)}
                icon={Grid3X3}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleReset}
          className="w-full py-3 bg-white/10 rounded-xl text-white font-medium flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All
        </button>
      </div>
    </div>
  );
}
