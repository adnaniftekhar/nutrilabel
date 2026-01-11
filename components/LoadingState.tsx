"use client";

import { useState, useEffect } from "react";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = "Analyzing nutrition label...",
}: LoadingStateProps) {
  const [step, setStep] = useState(0);
  const steps = [
    "Extracting text from label...",
    "Analyzing nutrition facts...",
    "Calculating health scores...",
    "Finalizing results...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-900 font-medium mb-1">{message}</p>
        <p className="text-xs text-gray-500">{steps[step]}</p>
      </div>
    </div>
  );
}
