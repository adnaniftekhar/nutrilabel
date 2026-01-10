"use client";

import { useRef } from "react";

interface UploadCardProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  hasImage?: boolean;
}

export default function UploadCard({
  onFileSelect,
  disabled = false,
  hasImage = false,
}: UploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative w-full p-8 border-2 border-dashed rounded-2xl
        transition-all duration-200 cursor-pointer
        ${
          disabled
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : hasImage
            ? "border-green-300 bg-green-50/50 hover:border-green-400 hover:bg-green-50"
            : "border-gray-300 bg-white hover:border-green-500 hover:bg-green-50/30"
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        disabled={disabled}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <div
          className={`
          w-16 h-16 rounded-full flex items-center justify-center
          transition-colors
          ${
            disabled
              ? "bg-gray-200"
              : hasImage
              ? "bg-green-100"
              : "bg-green-50"
          }
        `}
        >
          <svg
            className={`w-8 h-8 ${
              disabled ? "text-gray-400" : "text-green-600"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <div>
          <p
            className={`
            text-base font-semibold mb-1
            ${disabled ? "text-gray-400" : "text-gray-900"}
          `}
          >
            {hasImage ? "Change Image" : "Add a label photo"}
          </p>
          <p
            className={`
            text-sm
            ${disabled ? "text-gray-400" : "text-gray-500"}
          `}
          >
            {hasImage
              ? "Tap to choose a different image"
              : "Tap to take a photo or select from gallery"}
          </p>
        </div>
      </div>
    </div>
  );
}
