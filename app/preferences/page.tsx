"use client";

import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import {
  UserPreferences,
  loadPreferences,
  savePreferences,
  resetPreferences,
  DEFAULT_PREFERENCES,
} from "@/lib/preferences";

export default function PreferencesPage() {
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [saved, setSaved] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const loaded = loadPreferences();
    setPreferences(loaded);
    setIsInitialLoad(false);
  }, []);

  // Auto-save when preferences change (debounced for textarea)
  useEffect(() => {
    if (isInitialLoad) return; // Don't save on initial load

    const timer = setTimeout(() => {
      savePreferences(preferences);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500); // 500ms debounce for textarea, immediate for checkboxes/radios

    return () => clearTimeout(timer);
  }, [preferences, isInitialLoad]);

  const handleAllergyChange = (key: keyof UserPreferences["allergies"]) => {
    setPreferences((prev) => ({
      ...prev,
      allergies: {
        ...prev.allergies,
        [key]: !prev.allergies[key],
      },
    }));
  };

  const handleIntoleranceChange = (
    key: keyof UserPreferences["intolerances"]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      intolerances: {
        ...prev.intolerances,
        [key]: !prev.intolerances[key],
      },
    }));
  };

  const handleDietaryPatternChange = (
    key: keyof UserPreferences["dietaryPatterns"]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      dietaryPatterns: {
        ...prev.dietaryPatterns,
        [key]: !prev.dietaryPatterns[key],
      },
    }));
  };

  const handleHealthModeChange = (
    key: keyof UserPreferences["healthModes"]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      healthModes: {
        ...prev.healthModes,
        [key]: !prev.healthModes[key],
      },
    }));
  };

  const handleIngredientAvoidanceChange = (
    key: keyof UserPreferences["ingredientAvoidance"]
  ) => {
    setPreferences((prev) => ({
      ...prev,
      ingredientAvoidance: {
        ...prev.ingredientAvoidance,
        [key]: !prev.ingredientAvoidance[key],
      },
    }));
  };

  const handleCustomConstraintsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setPreferences((prev) => ({
      ...prev,
      customConstraints: e.target.value,
    }));
  };

  const handleResponseSpeedChange = (speed: "fast" | "thorough") => {
    setPreferences((prev) => ({
      ...prev,
      responseSpeed: speed,
    }));
  };

  const handleReset = () => {
    if (
      confirm(
        "Reset all preferences to defaults? This cannot be undone."
      )
    ) {
      const defaults = resetPreferences();
      setPreferences(defaults);
      // Auto-save will trigger via useEffect
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-2 md:py-3 flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-900">Preferences</h1>
          {saved && (
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
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-4 md:py-6">
        <div className="mb-4">
          <p className="text-xs md:text-sm text-gray-600">
            Configure your dietary needs and health goals. Your preferences
            will automatically be applied to every analysis.
          </p>
        </div>

        <div className="space-y-3 md:space-y-4">
          {/* Allergies Section */}
          <section className="bg-white border border-gray-200 rounded-lg p-3 md:p-4">
            <h2 className="text-sm md:text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <svg
                className="w-4 h-4 md:w-5 md:h-5 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Allergies
            </h2>
            <p className="text-xs text-gray-600 mb-2 md:mb-3">
              Select all that apply. These will be flagged as safety warnings.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.entries(preferences.allergies).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() =>
                      handleAllergyChange(
                        key as keyof UserPreferences["allergies"]
                      )
                    }
                    className="w-4 h-4 md:w-5 md:h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 flex-shrink-0"
                  />
                  <span className="text-xs md:text-sm text-gray-900 truncate">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Intolerances Section */}
          <section className="bg-white border border-gray-200 rounded-lg p-3 md:p-4">
            <h2 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
              Intolerances & Sensitivities
            </h2>
            <p className="text-xs text-gray-600 mb-2 md:mb-3">
              Select any food intolerances or sensitivities.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(preferences.intolerances).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() =>
                      handleIntoleranceChange(
                        key as keyof UserPreferences["intolerances"]
                      )
                    }
                    className="w-4 h-4 md:w-5 md:h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 flex-shrink-0"
                  />
                  <span className="text-xs md:text-sm text-gray-900">
                    {key === "lactose"
                      ? "Lactose intolerance"
                      : key === "gluten"
                      ? "Gluten sensitivity (non-celiac)"
                      : key === "fructose"
                      ? "Fructose intolerance"
                      : key === "histamine"
                      ? "Histamine sensitivity"
                      : "FODMAP sensitivity"}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Dietary Patterns Section */}
          <section className="bg-white border border-gray-200 rounded-lg p-3 md:p-4">
            <h2 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
              Dietary Patterns
            </h2>
            <p className="text-xs text-gray-600 mb-2 md:mb-3">
              Select your dietary lifestyle preferences.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.entries(preferences.dietaryPatterns).map(
                ([key, value]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() =>
                        handleDietaryPatternChange(
                          key as keyof UserPreferences["dietaryPatterns"]
                        )
                      }
                      className="w-4 h-4 md:w-5 md:h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 flex-shrink-0"
                    />
                    <span className="text-xs md:text-sm text-gray-900">
                      {key === "wholeFoods"
                        ? "Whole-foods focused"
                        : key === "plantForward"
                        ? "Plant-forward"
                        : key === "lowCarb"
                        ? "Low-carb"
                        : key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                    </span>
                  </label>
                )
              )}
            </div>
          </section>

          {/* Health Modes Section */}
          <section className="bg-white border border-gray-200 rounded-lg p-3 md:p-4">
            <h2 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
              Health Modes
            </h2>
            <p className="text-xs text-gray-600 mb-2 md:mb-3">
              Select health goals to prioritize in analysis. Multiple allowed.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.entries(preferences.healthModes).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() =>
                      handleHealthModeChange(
                        key as keyof UserPreferences["healthModes"]
                      )
                    }
                    className="w-4 h-4 md:w-5 md:h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 flex-shrink-0"
                  />
                  <span className="text-xs md:text-sm text-gray-900">
                    {key === "diabetesFriendly"
                      ? "Diabetes-friendly (Type 1 / Type 2)"
                      : key === "heartHealth"
                      ? "Heart health"
                      : key === "weightManagement"
                      ? "Weight management"
                      : key === "gutHealth"
                      ? "Gut health"
                      : key === "highProtein"
                      ? "High-protein focus"
                      : key === "lowSodium"
                      ? "Low-sodium focus"
                      : "Low-added-sugar focus"}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Ingredient Avoidance Section */}
          <section className="bg-white border border-gray-200 rounded-lg p-3 md:p-4">
            <h2 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
              Ingredient Avoidance
            </h2>
            <p className="text-xs text-gray-600 mb-2 md:mb-3">
              Select ingredients or additives you prefer to avoid.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {Object.entries(preferences.ingredientAvoidance).map(
                ([key, value]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() =>
                        handleIngredientAvoidanceChange(
                          key as keyof UserPreferences["ingredientAvoidance"]
                        )
                      }
                      className="w-4 h-4 md:w-5 md:h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 flex-shrink-0"
                    />
                    <span className="text-xs md:text-sm text-gray-900">
                      {key === "artificialSweeteners"
                        ? "Artificial sweeteners"
                        : key === "seedOils"
                        ? "Seed oils"
                        : key === "ultraProcessed"
                        ? "Ultra-processed foods"
                        : key === "addedSugars"
                        ? "Added sugars"
                        : key === "highFructoseCornSyrup"
                        ? "High fructose corn syrup"
                        : key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                    </span>
                  </label>
                )
              )}
            </div>
          </section>

          {/* Response Speed Section */}
          <section className="bg-white border border-gray-200 rounded-lg p-3 md:p-4">
            <div className="flex items-center gap-2 mb-2 md:mb-3">
              <h2 className="text-sm md:text-base font-semibold text-gray-900">
                Response Speed
              </h2>
              <div className="relative group">
                <button
                  type="button"
                  className="w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                  aria-label="Response speed information"
                >
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all z-50 pointer-events-none shadow-xl">
                  <div className="mb-2 font-semibold text-sm">Model Information:</div>
                  <div className="mb-2 space-y-1">
                    <div>
                      <strong className="text-green-400">Faster:</strong> gemini-2.5-flash-lite, gemini-2.5-flash, gemini-2.0-flash
                    </div>
                    <div>
                      <strong className="text-blue-400">Thorough:</strong> gemini-2.5-pro, gemini-2.5-flash-lite, gemini-2.5-flash
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-700 text-gray-300">
                    Multiple models are tried in order if one fails.
                  </div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-2 md:mb-3">
              Choose between faster responses or more thorough analysis.
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-2 md:p-3 rounded-lg border-2 border-gray-200 hover:border-green-300 cursor-pointer transition-colors bg-gray-50">
                <input
                  type="radio"
                  name="responseSpeed"
                  value="fast"
                  checked={preferences.responseSpeed === "fast"}
                  onChange={() => handleResponseSpeedChange("fast")}
                  className="w-4 h-4 md:w-5 md:h-5 text-green-600 border-gray-300 focus:ring-green-500 focus:ring-2 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs md:text-sm font-medium text-gray-900">
                    Faster
                  </div>
                  <div className="text-xs text-gray-600">
                    Quick responses (default)
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-2 p-2 md:p-3 rounded-lg border-2 border-gray-200 hover:border-green-300 cursor-pointer transition-colors bg-gray-50">
                <input
                  type="radio"
                  name="responseSpeed"
                  value="thorough"
                  checked={preferences.responseSpeed === "thorough"}
                  onChange={() => handleResponseSpeedChange("thorough")}
                  className="w-4 h-4 md:w-5 md:h-5 text-green-600 border-gray-300 focus:ring-green-500 focus:ring-2 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs md:text-sm font-medium text-gray-900">
                    Thorough
                  </div>
                  <div className="text-xs text-gray-600">
                    More detailed analysis (slower)
                  </div>
                </div>
              </label>
            </div>
          </section>

          {/* Custom Constraints Section */}
          <section className="bg-white border border-gray-200 rounded-lg p-3 md:p-4">
            <h2 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
              Custom Constraints
            </h2>
            <p className="text-xs text-gray-600 mb-2 md:mb-3">
              Anything else we should know? (e.g., "Also allergic to apples",
              "Avoid foods that spike glucose quickly")
            </p>
            <textarea
              value={preferences.customConstraints}
              onChange={handleCustomConstraintsChange}
              placeholder="Enter any additional dietary constraints or preferences..."
              className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none text-xs md:text-sm"
              rows={3}
            />
          </section>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium text-yellow-900 mb-1">
                  Analysis Disclaimer
                </p>
                <p className="text-xs text-yellow-800 leading-relaxed">
                  Nutrition analysis is provided for informational purposes only
                  and should not replace professional medical advice. Always
                  consult with a healthcare provider for dietary decisions,
                  especially if you have allergies, medical conditions, or
                  specific nutritional needs. The AI models used may vary based on
                  your response speed preference, and multiple models are tried
                  automatically if one fails.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 md:pt-4 space-y-2 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="w-full px-4 py-2 md:px-6 md:py-3 bg-gray-100 text-gray-700 text-sm md:text-base font-medium rounded-lg md:rounded-xl hover:bg-gray-200 transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </main>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}
