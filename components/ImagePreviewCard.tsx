"use client";

interface ImagePreviewCardProps {
  imageUrl: string;
  onRemove?: () => void;
  onChange?: () => void;
}

export default function ImagePreviewCard({
  imageUrl,
  onRemove,
  onChange,
}: ImagePreviewCardProps) {
  return (
    <div className="relative w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
      <div className="aspect-video bg-gray-50 flex items-center justify-center">
        <img
          src={imageUrl}
          alt="Nutrition label preview"
          className="w-full h-full object-contain"
        />
      </div>

      {(onRemove || onChange) && (
        <div className="absolute top-2 right-2 flex gap-2">
          {onChange && (
            <button
              onClick={onChange}
              className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-sm font-medium rounded-lg shadow-sm hover:bg-white transition-colors"
            >
              Change
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-red-600 text-sm font-medium rounded-lg shadow-sm hover:bg-white transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
}
