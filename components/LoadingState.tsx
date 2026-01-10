"use client";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = "Analyzing nutrition label...",
}: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm text-gray-600 font-medium">{message}</p>
    </div>
  );
}
