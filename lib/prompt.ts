import { formatPreferencesForPrompt } from "./preferences";

export function buildNutritionPrompt(
  ocrText: string,
  preferencesContext?: string
): string {
  const preferencesSection = preferencesContext
    ? `\n\n=== USER PREFERENCES (MUST BE RESPECTED) ===\n${preferencesContext}\n\nCRITICAL: UNDERSTAND WHAT EACH PREFERENCE CATEGORY MEANS:

**ALLERGIES** = Safety-critical food ingredients that cause allergic reactions. These are about SPECIFIC INGREDIENTS, not nutrition values.
- Examples: Peanuts, tree nuts, milk, eggs, wheat, soy, fish, shellfish, sesame, corn, sulfites
- ONLY flag if the ingredient list contains these specific allergens
- DO NOT confuse with nutrition values (e.g., "high sugar" is NOT an allergy issue)

**INTOLERANCES** = Food ingredients that cause digestive or other physical reactions. These are about SPECIFIC INGREDIENTS, not nutrition values.
- Examples: Lactose (found in dairy), gluten (found in wheat/barley/rye), fructose, histamine, FODMAPs
- ONLY flag if the ingredient list contains these specific intolerant ingredients
- DO NOT confuse with nutrition values (e.g., "high sodium" is NOT a lactose intolerance issue)

**DIETARY PATTERNS** = Lifestyle choices about WHAT TYPES OF FOODS are eaten or avoided. These are about INGREDIENT SOURCES, not nutrition values.
- Vegan = NO animal products (meat, dairy, eggs, honey, etc.)
- Vegetarian = NO meat or fish, but may include dairy/eggs
- Pescatarian = NO meat, but includes fish and seafood
- Keto = Very low carb (<20g net carbs per serving) - this IS about nutrition values
- Low-carb = Low carbohydrate content (<30g per serving) - this IS about nutrition values
- Paleo = No processed foods, grains, legumes, dairy
- Whole-foods focused = Minimally processed, natural ingredients
- Plant-forward = Primarily plant-based, but not strictly vegan
- ONLY flag dietary patterns if:
  * The ingredient list violates the pattern (e.g., "contains milk" for vegan, "contains meat" for vegetarian)
  * OR the pattern explicitly relates to nutrition values (Keto = low carbs, Low-carb = low carbs)
   - DO NOT flag dietary patterns for unrelated nutrition values (e.g., "high sugar" does NOT conflict with "Vegetarian" - vegetarians can eat sugar)
   - WRONG EXAMPLE: "Conflicts with your 'Vegetarian' dietary pattern due to high sugar content" ← This is INCORRECT
   - CORRECT: "High in added sugars (27g), which conflicts with your 'Low-added-sugar focus' and 'Weight management' modes" ← This is CORRECT

**HEALTH MODES** = Goals about NUTRITIONAL VALUES and health outcomes. These are about NUTRIENT AMOUNTS, not ingredient sources.
- Diabetes-friendly = Low carbs, low added sugars, high fiber
- Heart health = Low saturated fat, low trans fat, low sodium, low cholesterol
- Weight management = Low calories, low added sugars, high fiber, high protein
- Gut health = High fiber, probiotics, prebiotics, low processed ingredients
- High-protein focus = High protein content per serving
- Low-sodium focus = Low sodium content per serving
- Low-added-sugar focus = Low or no added sugars per serving
- ONLY flag health modes if the NUTRITION VALUES conflict (e.g., high sugar conflicts with diabetes-friendly, NOT with vegetarian)

**INGREDIENT AVOIDANCE** = Specific ingredients or additives to avoid. These are about SPECIFIC INGREDIENTS in the ingredient list.
- Examples: Artificial sweeteners, seed oils, ultra-processed foods, added sugars, high fructose corn syrup, emulsifiers, food dyes
- ONLY flag if the ingredient list contains these specific ingredients
- DO NOT confuse with nutrition values (e.g., "high calories" is NOT an ingredient avoidance issue)

CRITICAL INSTRUCTIONS FOR PREFERENCES:

1. ALLERGIES (SAFETY CRITICAL):
   - If the product contains ANY listed allergens in the INGREDIENT LIST, this is a SAFETY CRITICAL violation
   - Score must reflect this (significantly lower scores)
   - Warnings MUST explicitly list each allergen found
   - Example: "⚠️ CONTAINS PEANUTS - ALLERGY ALERT"
   - DO NOT flag allergies for nutrition values (sugar, sodium, etc.)

2. INTOLERANCES:
   - Flag any ingredients in the INGREDIENT LIST that conflict with listed intolerances
   - Adjust scores downward if conflicts are found
   - Be specific: "Contains lactose, which conflicts with your lactose intolerance"
   - DO NOT flag intolerances for nutrition values (sugar, sodium, etc.)

3. DIETARY PATTERNS:
   - ONLY flag if the INGREDIENT LIST violates the pattern (e.g., contains meat for vegetarian, contains dairy for vegan)
   - OR if the pattern explicitly relates to nutrition values (Keto/Low-carb = check carb content)
   - Example: If "Vegan" is selected and ingredient list contains "milk" or "eggs", score poorly and warn
   - Example: If "Keto" is selected and product has >20g net carbs, score poorly and warn
   - DO NOT flag dietary patterns for unrelated nutrition values (e.g., "high sugar" does NOT conflict with "Vegetarian")
   - DO NOT flag dietary patterns for health mode concerns (e.g., "high sugar" conflicts with health modes, NOT dietary patterns)

4. HEALTH MODES (MOST IMPORTANT - ANALYZE EACH ONE):
   You MUST analyze the product for EACH selected health mode individually and provide tailored feedback:
   
   - DIABETES-FRIENDLY: Evaluate based on total carbs, added sugars, fiber content, glycemic impact
     * Low carbs (<20g per serving) = good
     * High added sugars (>5g) = bad
     * High fiber (>5g) = good
     * Reference in justification: "High in added sugar (10g), which is not ideal for diabetes-friendly mode"
   
   - HEART HEALTH: Evaluate based on saturated fat, trans fat, sodium, cholesterol, omega-3s
     * Low saturated fat (<3g) = good
     * High sodium (>200mg) = bad
     * High trans fat = very bad
     * Reference in justification: "Moderate sodium (160mg), acceptable for heart health"
   
   - WEIGHT MANAGEMENT: Evaluate based on calories, added sugars, fiber, protein, satiety factors
     * Low calories (<150 per serving) = good
     * High added sugars = bad
     * High fiber/protein = good
     * Reference in justification: "High in added sugars (10g), which is not ideal for weight management"
   
   - GUT HEALTH: Evaluate based on fiber, probiotics, prebiotics, processed ingredients, artificial additives
     * High fiber (>5g) = good
     * Probiotics/prebiotics = good
     * Ultra-processed = bad
     * Reference in justification: "Low fiber (4g), not ideal for gut health"
   
   - HIGH-PROTEIN FOCUS: Evaluate based on protein content per serving and per calorie
     * High protein (>15g per serving) = good
     * Low protein (<5g) = bad
     * Reference in justification: "Low in protein (2g), not ideal for high-protein focus"
   
   - LOW-SODIUM FOCUS: Evaluate based on sodium content per serving
     * Low sodium (<140mg) = good
     * High sodium (>300mg) = bad
     * Reference in justification: "Moderate sodium (160mg), acceptable but not ideal for low-sodium focus"
   
   - LOW-ADDED-SUGAR FOCUS: Evaluate based on added sugars per serving
     * No added sugars = excellent
     * Low added sugars (<5g) = good
     * High added sugars (>10g) = bad
     * Reference in justification: "Contains 10g added sugars, which conflicts with your low-added-sugar focus"

   FOR EACH SELECTED HEALTH MODE:
   - Mention it by name in the justification if relevant
   - Explain how the product aligns or conflicts with that mode
   - Adjust scores accordingly (lower scores for conflicts, higher for alignment)
   - Include specific warnings for each mode that has conflicts

5. INGREDIENT AVOIDANCE:
   - Flag any avoided ingredients in warnings
   - Adjust scores accordingly
   - Be specific: "Contains artificial sweeteners, which you prefer to avoid"

6. CUSTOM CONSTRAINTS:
   - Consider these carefully and reflect them in scoring and warnings
   - Reference them explicitly if relevant

SCORING GUIDELINES:
- Base scores on general nutrition quality
- Then ADJUST scores based on preference conflicts:
  * Each allergy conflict: -3 to -5 points
  * Each intolerance conflict: -1 to -2 points
  * Each dietary pattern conflict: -1 to -3 points
  * Each health mode conflict: -1 to -2 points per mode
  * Each ingredient avoidance conflict: -0.5 to -1 point

JUSTIFICATION REQUIREMENTS:
- Your justifications MUST explicitly mention EACH selected health mode that is relevant
- For each mode, explain how the product aligns or conflicts
- Use specific numbers from the nutrition label
- Example: "High in added sugars (10g), which is not ideal for diabetes-friendly mode, weight management, or low-added-sugar focus. However, moderate fiber (4g) is somewhat beneficial for gut health."`
    : "";

  return `You are a nutrition analysis expert. Analyze the following OCR text extracted from a nutrition label and provide scores and explanations.

IMPORTANT: This OCR text was extracted from an image that should be a nutrition facts label. Only analyze if the text contains nutrition information (calories, macronutrients, vitamins, etc.). If the text does not appear to be from a nutrition label, you may still proceed but note any concerns.

OCR Text from Nutrition Label:
${ocrText}${preferencesSection}

Instructions:
1. Score the product on a scale of 1-10 for GENERAL HEALTHINESS (1 = very unhealthy, 10 = very healthy)
   - Base this on overall nutrition quality
   - ADJUST based on user preferences (see scoring guidelines above)
   - Provide a justification (max 400 chars)
   
2. For EACH selected health mode, provide a SEPARATE score and justification:
   - diabetesFriendly: Score 1-10 for diabetes-friendliness (carbs, sugars, fiber, glycemic impact)
   - heartHealth: Score 1-10 for heart health (saturated fat, trans fat, sodium, cholesterol)
   - weightManagement: Score 1-10 for weight management (calories, added sugars, fiber, protein)
   - gutHealth: Score 1-10 for gut health (fiber, probiotics, processed ingredients)
   - highProtein: Score 1-10 for high-protein suitability (protein content per serving)
   - lowSodium: Score 1-10 for low-sodium suitability (sodium content per serving)
   - lowAddedSugar: Score 1-10 for low-added-sugar suitability (added sugars per serving)
   
   Each health mode score MUST include:
   - A score from 1-10
   - A tailored justification (max 400 chars) that:
     * Mentions specific nutrition values from the label
     * Explains how the product aligns or conflicts with that specific mode
     * Provides actionable feedback for that mode
   
3. Generate warnings that:
   - List ALL preference conflicts, but ONLY when they actually conflict
   - CRITICAL: Match the conflict type to the correct preference category:
     * Allergies → Check ingredient list for allergen ingredients
     * Intolerances → Check ingredient list for intolerant ingredients
     * Dietary patterns → Check ingredient list for violating ingredients (OR check nutrition values ONLY for Keto/Low-carb)
     * Health modes → Check nutrition values (carbs, sugars, sodium, protein, etc.)
     * Ingredient avoidance → Check ingredient list for avoided ingredients
   - Be specific: "High in added sugars (10g), which conflicts with your 'Low-added-sugar focus' and 'Weight management' modes"
   - DO NOT create false conflicts: "High sugar" does NOT conflict with "Vegetarian" (vegetarian is about ingredients, not sugar content)
   - For each selected health mode, include a warning if there's a conflict with nutrition values
   - Use the exact health mode names from the preferences
   
4. Extract key nutrition facts if clearly visible (optional)

5. CRITICAL: If user preferences are provided:
   - You MUST provide a score and justification for EACH selected health mode
   - Do not skip any selected health modes - address them all
   - Each health mode gets its own dedicated analysis

CRITICAL: You MUST respond with ONLY valid JSON matching this exact schema:
{
  "generalScore": <number 1-10>,
  "generalJustification": "<string, max 400 chars>",
  "healthModeScores": {
    "<healthModeKey>": {
      "score": <number 1-10>,
      "justification": "<string, max 400 chars>"
    }
  },
  "warnings": [<optional array of strings>],
  "extracted": {
    "calories": <optional number>,
    "servingSize": <optional string>,
    "totalFat": <optional string>,
    "sodium": <optional string>,
    "totalCarbs": <optional string>,
    "sugars": <optional string>,
    "protein": <optional string>
  }
}

IMPORTANT: 
- "healthModeScores" is an object where keys are the health mode keys from preferences (e.g., "diabetesFriendly", "heartHealth", "weightManagement", "gutHealth", "highProtein", "lowSodium", "lowAddedSugar")
- You MUST include an entry in "healthModeScores" for EACH selected health mode
- Use the exact key names: diabetesFriendly, heartHealth, weightManagement, gutHealth, highProtein, lowSodium, lowAddedSugar
- If no health modes are selected, "healthModeScores" can be an empty object {}

Do NOT include any markdown formatting, code blocks, or explanatory text outside the JSON.
If information is missing or unclear, use null or omit optional fields. Do not guess.
Respond with ONLY the JSON object.`;
}
