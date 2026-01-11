"use client";

import { useState, useRef, useEffect } from "react";
import { ScoreResult } from "@/lib/schemas";
import { saveToHistory } from "@/lib/history";
import {
  loadPreferences,
  formatPreferencesForPrompt,
} from "@/lib/preferences";
import UploadCard from "./UploadCard";
import ImagePreviewCard from "./ImagePreviewCard";
import PrimaryButton from "./PrimaryButton";
import ScoreCards from "./ScoreCards";
import WarningsCard from "./WarningsCard";
import LoadingState from "./LoadingState";

interface AnalyzeResponse {
  success: boolean;
  requestId: string;
  imageHash: string;
  ocrText?: string; // OCR text extracted from the image
  result: ScoreResult;
}

const MAX_IMAGE_SIZE = 2000; // Max width/height for compression

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > MAX_IMAGE_SIZE) {
            height = (height * MAX_IMAGE_SIZE) / width;
            width = MAX_IMAGE_SIZE;
          }
        } else {
          if (height > MAX_IMAGE_SIZE) {
            width = (width * MAX_IMAGE_SIZE) / height;
            height = MAX_IMAGE_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.85);
        resolve(compressed);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function LabelCapture() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [showOcrText, setShowOcrText] = useState(false);
  const [savedToHistory, setSavedToHistory] = useState(false);
  const [preferencesContext, setPreferencesContext] = useState<string>("");
  const [responseSpeed, setResponseSpeed] = useState<"fast" | "thorough">("fast");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load preferences on mount
  useEffect(() => {
    const preferences = loadPreferences();
    const formatted = formatPreferencesForPrompt(preferences);
    setPreferencesContext(formatted);
    setResponseSpeed(preferences.responseSpeed);
  }, []);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setResult(null);
    setSavedToHistory(false);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.onerror = () => {
      setError("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setSavedToHistory(false);

    try {
      // Compress image
      const compressedDataUrl = await compressImage(selectedFile);
      const compressedBlob = await fetch(compressedDataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          return new File([blob], selectedFile.name, { type: "image/jpeg" });
        });

      // Upload and analyze
      const formData = new FormData();
      formData.append("image", compressedBlob);
      
      // Include preferences context if available
      if (preferencesContext) {
        formData.append("preferences", preferencesContext);
      }
      
      // Include response speed preference
      formData.append("responseSpeed", responseSpeed);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // If error response includes OCR text, show it to the user
        if (errorData.ocrText) {
          setOcrText(errorData.ocrText);
          setShowOcrText(true); // Auto-expand OCR text on error
        }
        // Include details in error message if available
        const errorMessage = errorData.error || `HTTP ${response.status}`;
        const errorDetails = errorData.details ? ` ${errorData.details}` : "";
        throw new Error(errorMessage + errorDetails);
      }

      const data: AnalyzeResponse = await response.json();

      if (data.success && data.result) {
        setResult(data.result);
        setOcrText(data.ocrText || null); // Store OCR text for display

        // Auto-save to history
        await saveToHistory({
          id: data.imageHash,
          timestamp: Date.now(),
          scores: data.result,
          imagePreview: compressedDataUrl,
        });
        setSavedToHistory(true);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze image"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setResult(null);
    setOcrText(null);
    setShowOcrText(false);
    setError(null);
    setSavedToHistory(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChangeImage = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-6">
      {/* Hidden file input for programmatic access */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
        disabled={isAnalyzing}
      />

      {/* Step 1: Upload */}
      {!imagePreview && (
        <UploadCard
          onFileSelect={handleFileSelect}
          disabled={isAnalyzing}
          hasImage={false}
        />
      )}

      {/* Step 2: Preview */}
      {imagePreview && !result && (
        <>
          <ImagePreviewCard
            imageUrl={imagePreview}
            onChange={handleChangeImage}
            onRemove={handleReset}
          />

          {/* Error state */}
          {error && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 mb-1">
                      Analysis failed
                    </p>
                    <p className="text-sm text-red-700">{error}</p>
                    <button
                      onClick={handleAnalyze}
                      className="mt-3 text-sm font-medium text-red-700 hover:text-red-800 underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>

              {/* Show OCR text in error state if available */}
              {ocrText && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <button
                    onClick={() => setShowOcrText(!showOcrText)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">
                        Detected Text ({ocrText.length} characters)
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-600 transition-transform ${
                        showOcrText ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {showOcrText && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">
                        This is the text that was extracted from the image:
                      </p>
                      <div className="bg-white border border-gray-200 rounded-lg p-3 max-h-64 overflow-y-auto">
                        <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                          {ocrText}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Loading state */}
          {isAnalyzing && <LoadingState />}
        </>
      )}

      {/* Step 3: Results */}
      {result && (
        <div className="space-y-4">
          {imagePreview && (
            <ImagePreviewCard
              imageUrl={imagePreview}
              onChange={handleChangeImage}
              onRemove={handleReset}
            />
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Analysis Results
              </h2>
              {savedToHistory && (
                <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Saved
                </span>
              )}
            </div>

            <ScoreCards result={result} />

            {result.warnings && result.warnings.length > 0 && (
              <WarningsCard warnings={result.warnings} />
            )}

            {/* OCR Text Display */}
            {ocrText && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <button
                  onClick={() => setShowOcrText(!showOcrText)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">
                      Detected Text ({ocrText.length} characters)
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-600 transition-transform ${
                      showOcrText ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showOcrText && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">
                      This is the text that was extracted from the nutrition label:
                    </p>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 max-h-64 overflow-y-auto">
                      <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                        {ocrText}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky bottom CTA (mobile) */}
      {imagePreview && !result && !isAnalyzing && (
        <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 safe-area-bottom md:relative md:bottom-0 md:pb-0">
          <div className="max-w-4xl mx-auto">
            <PrimaryButton
              onClick={handleAnalyze}
              disabled={!imagePreview || isAnalyzing}
              loading={isAnalyzing}
            >
              Analyze
            </PrimaryButton>
          </div>
        </div>
      )}

      {/* Reset button when results are shown */}
      {result && (
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            Analyze Another Label
          </button>
        </div>
      )}
    </div>
  );
}
