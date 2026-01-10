import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("Vision Project Resolution", () => {
  it("should not hardcode project ID in source code", () => {
    const visionSourcePath = join(__dirname, "../vision.ts");
    const sourceCode = readFileSync(visionSourcePath, "utf-8");
    
    // Should not contain hardcoded "nutrilabel-mvp"
    expect(sourceCode).not.toContain('"nutrilabel-mvp"');
    expect(sourceCode).not.toContain("FORCING project");
    expect(sourceCode).not.toContain("HARDCODE");
  });

  it("should use GOOGLE_CLOUD_PROJECT if set", () => {
    const original = process.env.GOOGLE_CLOUD_PROJECT;
    process.env.GOOGLE_CLOUD_PROJECT = "test-project";
    expect(process.env.GOOGLE_CLOUD_PROJECT).toBe("test-project");
    if (original) {
      process.env.GOOGLE_CLOUD_PROJECT = original;
    } else {
      delete process.env.GOOGLE_CLOUD_PROJECT;
    }
  });
});
