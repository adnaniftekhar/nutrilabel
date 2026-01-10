import { describe, it, expect } from "vitest";
import { ScoreResultSchema } from "../schemas";
import { buildNutritionPrompt } from "../prompt";

describe("Prompt and JSON Parsing", () => {
  it("should generate a prompt with OCR text", () => {
    const ocrText = "Nutrition Facts\nCalories: 250";
    const prompt = buildNutritionPrompt(ocrText);

    expect(prompt).toContain(ocrText);
    expect(prompt).toContain("JSON");
    expect(prompt).toContain("generalScore");
    expect(prompt).toContain("diabetesScore");
  });

  it("should parse valid JSON response from model", () => {
    const validJson = {
      generalScore: 7,
      diabetesScore: 8,
      generalJustification: "Good nutrition",
      diabetesJustification: "Low sugar",
    };

    const result = ScoreResultSchema.parse(validJson);
    expect(result.generalScore).toBe(7);
    expect(result.diabetesScore).toBe(8);
  });

  it("should handle JSON wrapped in markdown code blocks", () => {
    const jsonInMarkdown = `\`\`\`json
{
  "generalScore": 6,
  "diabetesScore": 7,
  "generalJustification": "Moderate",
  "diabetesJustification": "Okay"
}
\`\`\``;

    // Simulate extraction logic
    let jsonText = jsonInMarkdown.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/```\s*$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*/, "").replace(/```\s*$/, "");
    }

    const parsed = JSON.parse(jsonText);
    const result = ScoreResultSchema.parse(parsed);
    expect(result.generalScore).toBe(6);
  });

  it("should reject invalid JSON structure", () => {
    const invalidJson = {
      generalScore: 7,
      // missing required fields
    };

    expect(() => ScoreResultSchema.parse(invalidJson)).toThrow();
  });

  it("should reject malformed JSON string", () => {
    const malformedJson = `{
      "generalScore": 7,
      "diabetesScore": 8,
      // missing closing brace
    `;

    expect(() => {
      const parsed = JSON.parse(malformedJson);
      ScoreResultSchema.parse(parsed);
    }).toThrow();
  });

  it("should handle empty or null optional fields", () => {
    const minimalJson = {
      generalScore: 5,
      diabetesScore: 5,
      generalJustification: "Test",
      diabetesJustification: "Test",
    };

    const result = ScoreResultSchema.parse(minimalJson);
    expect(result.warnings).toBeUndefined();
    expect(result.extracted).toBeUndefined();
  });
});
