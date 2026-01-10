import { describe, it, expect } from "vitest";
import { ScoreResultSchema } from "../schemas";

describe("ScoreResultSchema", () => {
  it("should accept valid score result", () => {
    const valid = {
      generalScore: 7,
      diabetesScore: 8,
      generalJustification: "Good balance of nutrients",
      diabetesJustification: "Low sugar content",
    };

    const result = ScoreResultSchema.parse(valid);
    expect(result.generalScore).toBe(7);
    expect(result.diabetesScore).toBe(8);
  });

  it("should accept valid score result with optional fields", () => {
    const valid = {
      generalScore: 5,
      diabetesScore: 6,
      generalJustification: "Moderate nutrition value",
      diabetesJustification: "Some concerns with sugar",
      warnings: ["High sodium"],
      extracted: {
        calories: 250,
        servingSize: "1 cup",
      },
    };

    const result = ScoreResultSchema.parse(valid);
    expect(result.warnings).toEqual(["High sodium"]);
    expect(result.extracted?.calories).toBe(250);
  });

  it("should reject score below 1", () => {
    const invalid = {
      generalScore: 0,
      diabetesScore: 5,
      generalJustification: "Test",
      diabetesJustification: "Test",
    };

    expect(() => ScoreResultSchema.parse(invalid)).toThrow();
  });

  it("should reject score above 10", () => {
    const invalid = {
      generalScore: 11,
      diabetesScore: 5,
      generalJustification: "Test",
      diabetesJustification: "Test",
    };

    expect(() => ScoreResultSchema.parse(invalid)).toThrow();
  });

  it("should reject missing required fields", () => {
    const invalid = {
      generalScore: 5,
      // missing diabetesScore
      generalJustification: "Test",
      diabetesJustification: "Test",
    };

    expect(() => ScoreResultSchema.parse(invalid)).toThrow();
  });

  it("should reject justification exceeding max length", () => {
    const longString = "a".repeat(401);
    const invalid = {
      generalScore: 5,
      diabetesScore: 5,
      generalJustification: longString,
      diabetesJustification: "Test",
    };

    expect(() => ScoreResultSchema.parse(invalid)).toThrow();
  });

  it("should reject non-numeric scores", () => {
    const invalid = {
      generalScore: "7",
      diabetesScore: 8,
      generalJustification: "Test",
      diabetesJustification: "Test",
    };

    expect(() => ScoreResultSchema.parse(invalid)).toThrow();
  });
});
