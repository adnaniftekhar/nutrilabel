export function buildNutritionPrompt(ocrText: string): string {
  return `You are a nutrition analysis expert. Analyze the following nutrition label text and provide scores and explanations.

OCR Text from Nutrition Label:
${ocrText}

Instructions:
1. Score the product on a scale of 1-10 for GENERAL HEALTHINESS (1 = very unhealthy, 10 = very healthy)
2. Score the product on a scale of 1-10 for DIABETES-FRIENDLINESS (1 = very bad for diabetes, 10 = very good for diabetes)
3. Provide a SHORT justification (max 400 chars) for each score
4. If you identify concerning ingredients or values, list them as warnings (optional array)
5. Extract key nutrition facts if clearly visible (optional)

CRITICAL: You MUST respond with ONLY valid JSON matching this exact schema:
{
  "generalScore": <number 1-10>,
  "diabetesScore": <number 1-10>,
  "generalJustification": "<string, max 400 chars>",
  "diabetesJustification": "<string, max 400 chars>",
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

Do NOT include any markdown formatting, code blocks, or explanatory text outside the JSON.
If information is missing or unclear, use null or omit optional fields. Do not guess.
Respond with ONLY the JSON object.`;
}
