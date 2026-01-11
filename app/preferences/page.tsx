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
  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loaded = loadPreferences();
    setPreferences(loaded);
  }, []);

  const handleAllergyChange = (key: keyof UserPreferences["allergies"]) => {
    setPreferences((prev) => ({
      ...prev,
      allergies: {
        ...prev.allergies,
        [key]: !prev.allergies[key],
      },
    }));
    setHasChanges(true);
    setSaved(false);
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
    setHasChanges(true);
    setSaved(false);
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
    setHasChanges(true);
    setSaved(false);
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
    setHasChanges(true);
    setSaved(false);
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
    setHasChanges(true);
    setSaved(false);
  };

  const handleCustomConstraintsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setPreferences((prev) => ({
      ...prev,
      customConstraints: e.target.value,
    }));
    setHasChanges(true);
    setSaved(false);
  };

  const handleSave = () => {
    savePreferences(preferences);
    setHasChanges(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (
      confirm(
        "Reset all preferences to defaults? This cannot be undone."
      )
    ) {
      const defaults = resetPreferences();
      setPreferences(defaults);
      setHasChanges(false);
      setSaved(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-900">Preferences</h1>
          <div className="flex items-center gap-3">
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
            {hasChanges && (
              <button
                onClick={handleSave}
                className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Save
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Configure your dietary needs and health goals. Your preferences
            will automatically be applied to every analysis.
          </p>
        </div>

        <div className="space-y-6">
          {/* Allergies Section */}
          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-600"
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
            <p className="text-xs text-gray-600 mb-4">
              Select all that apply. These will be flagged as safety warnings.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(preferences.allergies).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() =>
                      handleAllergyChange(
                        key as keyof UserPreferences["allergies"]
                      )
                    }
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-900">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Intolerances Section */}
          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Intolerances & Sensitivities
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              Select any food intolerances or sensitivities.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(preferences.intolerances).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() =>
                      handleIntoleranceChange(
                        key as keyof UserPreferences["intolerances"]
                      )
                    }
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-900">
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
          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Dietary Patterns
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              Select your dietary lifestyle preferences.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(preferences.dietaryPatterns).map(
                ([key, value]) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() =>
                        handleDietaryPatternChange(
                          key as keyof UserPreferences["dietaryPatterns"]
                        )
                      }
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-900">
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
          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Health Modes
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              Select health goals to prioritize in analysis. Multiple allowed.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(preferences.healthModes).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() =>
                      handleHealthModeChange(
                        key as keyof UserPreferences["healthModes"]
                      )
                    }
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-900">
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
          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Ingredient Avoidance
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              Select ingredients or additives you prefer to avoid.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(preferences.ingredientAvoidance).map(
                ([key, value]) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() =>
                        handleIngredientAvoidanceChange(
                          key as keyof UserPreferences["ingredientAvoidance"]
                        )
                      }
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-900">
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

          {/* Custom Constraints Section */}
          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              Custom Constraints
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              Anything else we should know? (e.g., "Also allergic to apples",
              "Avoid foods that spike glucose quickly")
            </p>
            <textarea
              value={preferences.customConstraints}
              onChange={handleCustomConstraintsChange}
              placeholder="Enter any additional dietary constraints or preferences..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none text-sm"
              rows={4}
            />
          </section>

          {/* Reset Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
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
