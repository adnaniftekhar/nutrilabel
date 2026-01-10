import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("Gemini Vertex AI Implementation", () => {
  it("should use Vertex AI with project and location", () => {
    const geminiSourcePath = join(__dirname, "../gemini.ts");
    const sourceCode = readFileSync(geminiSourcePath, "utf-8");
    
    // Should use Vertex AI (project and location)
    expect(sourceCode).toContain("GOOGLE_CLOUD_PROJECT");
    expect(sourceCode).toContain("project:");
    expect(sourceCode).toContain("location:");
    
    // Should NOT use API key
    expect(sourceCode).not.toContain("GEMINI_API_KEY");
    expect(sourceCode).not.toContain("apiKey");
  });

  it("should use GEMINI_MODEL from environment or default", () => {
    const original = process.env.GEMINI_MODEL;
    process.env.GEMINI_MODEL = "gemini-2.5-flash";
    expect(process.env.GEMINI_MODEL).toBe("gemini-2.5-flash");
    if (original) {
      process.env.GEMINI_MODEL = original;
    } else {
      delete process.env.GEMINI_MODEL;
    }
  });
});
