/**
 * User Preferences Model
 * Stores dietary needs, allergies, health modes, and custom constraints
 */

export interface UserPreferences {
  // Allergies (checkboxes)
  allergies: {
    peanuts: boolean;
    treeNuts: boolean;
    milk: boolean;
    eggs: boolean;
    wheat: boolean;
    soy: boolean;
    fish: boolean;
    shellfish: boolean;
    sesame: boolean;
    corn: boolean;
    sulfites: boolean;
  };

  // Intolerances & sensitivities
  intolerances: {
    lactose: boolean;
    gluten: boolean;
    fructose: boolean;
    histamine: boolean;
    fodmap: boolean;
  };

  // Dietary patterns
  dietaryPatterns: {
    vegan: boolean;
    vegetarian: boolean;
    pescatarian: boolean;
    keto: boolean;
    lowCarb: boolean;
    paleo: boolean;
    wholeFoods: boolean;
    plantForward: boolean;
  };

  // Health modes (multiple allowed)
  healthModes: {
    diabetesFriendly: boolean;
    heartHealth: boolean;
    weightManagement: boolean;
    gutHealth: boolean;
    highProtein: boolean;
    lowSodium: boolean;
    lowAddedSugar: boolean;
  };

  // Ingredient avoidance
  ingredientAvoidance: {
    artificialSweeteners: boolean;
    seedOils: boolean;
    ultraProcessed: boolean;
    addedSugars: boolean;
    highFructoseCornSyrup: boolean;
    emulsifiers: boolean;
    foodDyes: boolean;
  };

  // Custom constraints (free text)
  customConstraints: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  allergies: {
    peanuts: false,
    treeNuts: false,
    milk: false,
    eggs: false,
    wheat: false,
    soy: false,
    fish: false,
    shellfish: false,
    sesame: false,
    corn: false,
    sulfites: false,
  },
  intolerances: {
    lactose: false,
    gluten: false,
    fructose: false,
    histamine: false,
    fodmap: false,
  },
  dietaryPatterns: {
    vegan: false,
    vegetarian: false,
    pescatarian: false,
    keto: false,
    lowCarb: false,
    paleo: false,
    wholeFoods: false,
    plantForward: false,
  },
  healthModes: {
    diabetesFriendly: false,
    heartHealth: false,
    weightManagement: false,
    gutHealth: false,
    highProtein: false,
    lowSodium: false,
    lowAddedSugar: false,
  },
  ingredientAvoidance: {
    artificialSweeteners: false,
    seedOils: false,
    ultraProcessed: false,
    addedSugars: false,
    highFructoseCornSyrup: false,
    emulsifiers: false,
    foodDyes: false,
  },
  customConstraints: "",
};

const STORAGE_KEY = "nutrilabel_preferences";

/**
 * Load preferences from localStorage
 */
export function loadPreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_PREFERENCES;
    }

    const parsed = JSON.parse(stored);
    // Merge with defaults to handle missing fields
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      allergies: { ...DEFAULT_PREFERENCES.allergies, ...parsed.allergies },
      intolerances: {
        ...DEFAULT_PREFERENCES.intolerances,
        ...parsed.intolerances,
      },
      dietaryPatterns: {
        ...DEFAULT_PREFERENCES.dietaryPatterns,
        ...parsed.dietaryPatterns,
      },
      healthModes: {
        ...DEFAULT_PREFERENCES.healthModes,
        ...parsed.healthModes,
      },
      ingredientAvoidance: {
        ...DEFAULT_PREFERENCES.ingredientAvoidance,
        ...parsed.ingredientAvoidance,
      },
    };
  } catch (error) {
    console.error("Failed to load preferences:", error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Save preferences to localStorage
 */
export function savePreferences(preferences: UserPreferences): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error("Failed to save preferences:", error);
  }
}

/**
 * Reset preferences to defaults
 */
export function resetPreferences(): UserPreferences {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
  return DEFAULT_PREFERENCES;
}

/**
 * Check if user has any preferences set
 */
export function hasPreferences(preferences: UserPreferences): boolean {
  const hasAllergies = Object.values(preferences.allergies).some((v) => v);
  const hasIntolerances = Object.values(preferences.intolerances).some(
    (v) => v
  );
  const hasDietaryPatterns = Object.values(
    preferences.dietaryPatterns
  ).some((v) => v);
  const hasHealthModes = Object.values(preferences.healthModes).some(
    (v) => v
  );
  const hasIngredientAvoidance = Object.values(
    preferences.ingredientAvoidance
  ).some((v) => v);
  const hasCustomConstraints =
    preferences.customConstraints.trim().length > 0;

  return (
    hasAllergies ||
    hasIntolerances ||
    hasDietaryPatterns ||
    hasHealthModes ||
    hasIngredientAvoidance ||
    hasCustomConstraints
  );
}

/**
 * Format preferences for prompt injection
 */
export function formatPreferencesForPrompt(
  preferences: UserPreferences
): string {
  if (!hasPreferences(preferences)) {
    return "";
  }

  const sections: string[] = [];

  // Allergies (highest priority - safety critical)
  const allergies = Object.entries(preferences.allergies)
    .filter(([_, value]) => value)
    .map(([key, _]) => {
      // Format key: "treeNuts" -> "Tree nuts"
      return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
    });

  if (allergies.length > 0) {
    sections.push(
      `ALLERGIES (CRITICAL - MUST AVOID): ${allergies.join(", ")}`
    );
  }

  // Intolerances
  const intolerances = Object.entries(preferences.intolerances)
    .filter(([_, value]) => value)
    .map(([key, _]) => {
      return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
    });

  if (intolerances.length > 0) {
    sections.push(`INTOLERANCES: ${intolerances.join(", ")}`);
  }

  // Dietary patterns
  const dietaryPatterns = Object.entries(preferences.dietaryPatterns)
    .filter(([_, value]) => value)
    .map(([key, _]) => {
      return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
    });

  if (dietaryPatterns.length > 0) {
    sections.push(`DIETARY PATTERNS: ${dietaryPatterns.join(", ")}`);
  }

  // Health modes - with detailed labels
  const healthModeLabels: Record<string, string> = {
    diabetesFriendly: "Diabetes-friendly (Type 1 / Type 2)",
    heartHealth: "Heart health",
    weightManagement: "Weight management",
    gutHealth: "Gut health",
    highProtein: "High-protein focus",
    lowSodium: "Low-sodium focus",
    lowAddedSugar: "Low-added-sugar focus",
  };

  const healthModes = Object.entries(preferences.healthModes)
    .filter(([_, value]) => value)
    .map(([key, _]) => healthModeLabels[key] || key);

  const healthModeKeys = Object.entries(preferences.healthModes)
    .filter(([_, value]) => value)
    .map(([key, _]) => key);

  if (healthModes.length > 0) {
    sections.push(
      `HEALTH MODES (ACTIVE - ANALYZE FOR EACH): ${healthModes.join(", ")}`
    );
    sections.push(
      `HEALTH MODE KEYS (REQUIRED IN JSON): ${healthModeKeys.join(", ")}`
    );
  }

  // Ingredient avoidance
  const ingredientAvoidance = Object.entries(
    preferences.ingredientAvoidance
  )
    .filter(([_, value]) => value)
    .map(([key, _]) => {
      return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
    });

  if (ingredientAvoidance.length > 0) {
    sections.push(`AVOID: ${ingredientAvoidance.join(", ")}`);
  }

  // Custom constraints
  if (preferences.customConstraints.trim().length > 0) {
    sections.push(
      `CUSTOM CONSTRAINTS: ${preferences.customConstraints.trim()}`
    );
  }

  return sections.join("\n");
}
