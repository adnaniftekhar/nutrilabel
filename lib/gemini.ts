import { VertexAI } from "@google-cloud/vertexai";
import { ScoreResult, ScoreResultSchema } from "./schemas";
import { buildNutritionPrompt } from "./prompt";

let vertexAI: VertexAI | null = null;

function getVertexAIClient(): VertexAI {
  // Vertex AI requires project and location (uses Application Default Credentials)
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || process.env.GCP_LOCATION || "us-central1";
  
  console.log(`[Gemini] Initializing Vertex AI client...`);
  console.log(`[Gemini] Project ID: ${projectId}`);
  console.log(`[Gemini] Location: ${location}`);
  
  if (!projectId) {
    throw new Error(
      "GOOGLE_CLOUD_PROJECT environment variable is not set. " +
      "Required for Vertex AI. Set it to your GCP project ID."
    );
  }

  if (!vertexAI) {
    // Initialize Vertex AI client with project and location
    // Uses Application Default Credentials (ADC) automatically
    console.log(`[Gemini] Creating new VertexAI instance...`);
    vertexAI = new VertexAI({
      project: projectId,
      location: location,
    });
    
    console.log(`[Gemini] ✅ Vertex AI client initialized successfully`);
  } else {
    console.log(`[Gemini] Using existing Vertex AI client instance`);
  }
  
  return vertexAI;
}

export async function scoreNutrition({
  ocrText,
  requestId,
  preferencesContext,
}: {
  ocrText: string;
  requestId: string;
  preferencesContext?: string;
}): Promise<ScoreResult> {
  console.log(`[${requestId}] Starting nutrition scoring...`);
  
  const vertexAI = getVertexAIClient();
  
  // AVAILABLE MODELS (as of January 2025 - confirmed from Google Cloud docs):
  // - gemini-2.5-pro (most capable)
  // - gemini-2.5-flash (fast, balanced)
  // - gemini-2.5-flash-lite (fastest, cost-efficient)
  // - gemini-2.0-flash (stable)
  // DO NOT USE: gemini-1.5-flash, gemini-1.5-pro, gemini-3-flash, gemini-3-pro (NOT AVAILABLE)
  const modelNameRaw = process.env.GEMINI_MODEL;
  const modelCandidates = modelNameRaw 
    ? [modelNameRaw] 
    : [
        "gemini-2.5-pro",        // Most capable, handles longer responses better
        "gemini-2.5-flash-lite", // Fastest, cost-efficient, handles longer responses
        "gemini-2.5-flash",      // Fast, balanced
        "gemini-2.0-flash",      // Stable fallback
      ];
  
  console.log(`[${requestId}] Model candidates to try: ${modelCandidates.join(", ")}`);
  console.log(`[${requestId}] OCR text length: ${ocrText.length} characters`);
  if (preferencesContext) {
    console.log(`[${requestId}] Preferences context provided: ${preferencesContext.length} characters`);
  }

  const prompt = buildNutritionPrompt(ocrText, preferencesContext);
  console.log(`[${requestId}] Prompt built, length: ${prompt.length} characters`);

  const maxRetries = 2;
  let lastError: Error | null = null;

  // Try each model candidate until one works
  for (let modelIndex = 0; modelIndex < modelCandidates.length; modelIndex++) {
    const modelName = modelCandidates[modelIndex].trim();
    console.log(`[${requestId}] Trying model ${modelIndex + 1}/${modelCandidates.length}: ${modelName}`);
    
    // Get the generative model
    let model;
    try {
      model = vertexAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096, // Increased to 4096 to handle multiple health mode scores and longer JSON responses
        },
      });
      console.log(`[${requestId}] ✅ Generative model '${modelName}' obtained successfully`);
    } catch (error) {
      console.error(`[${requestId}] ❌ Failed to get generative model '${modelName}':`, error);
      if (modelIndex < modelCandidates.length - 1) {
        console.log(`[${requestId}] Trying next model candidate...`);
        continue;
      } else {
        throw new Error(`All model candidates failed. Last error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Try generating content with this model
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[${requestId}] Attempt ${attempt + 1}/${maxRetries + 1} with model '${modelName}': Generating content...`);
        
        const timeoutMs = 30000; // 30 seconds
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Request timeout")), timeoutMs);
        });

        console.log(`[${requestId}] Calling generateContent API...`);
        const generateContentPromise = model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const response = await Promise.race([
          generateContentPromise,
          timeoutPromise,
        ]);

        console.log(`[${requestId}] ✅ API call successful with model '${modelName}', parsing response...`);

        // Extract text from Vertex AI response
        const candidate = response.response.candidates?.[0];
        const finishReason = candidate?.finishReason;
        const responseText = candidate?.content?.parts?.[0]?.text || "";
        
        console.log(`[${requestId}] Response text length: ${responseText.length} characters`);

        if (!responseText) {
          console.error(`[${requestId}] ❌ Empty response from Vertex AI`);
          console.error(`[${requestId}] Response structure:`, JSON.stringify(response.response, null, 2));
          throw new Error("Empty response from Vertex AI");
        }

        // Check if response was truncated
        if (finishReason === "MAX_TOKENS" || finishReason === "OTHER") {
          console.warn(`[${requestId}] ⚠️ Response may be truncated (finishReason: ${finishReason})`);
        }

        // Extract JSON from response (handle cases where model adds markdown)
        let jsonText = responseText.trim();
        console.log(`[${requestId}] Extracting JSON from response...`);
        if (jsonText.startsWith("```json")) {
          jsonText = jsonText.replace(/^```json\s*/, "").replace(/```\s*$/, "");
          console.log(`[${requestId}] Removed markdown code fence (json)`);
        } else if (jsonText.startsWith("```")) {
          jsonText = jsonText.replace(/^```\s*/, "").replace(/```\s*$/, "");
          console.log(`[${requestId}] Removed markdown code fence`);
        }

        console.log(`[${requestId}] Parsing JSON...`);
        const parsed = JSON.parse(jsonText);
        console.log(`[${requestId}] ✅ JSON parsed successfully`);

        console.log(`[${requestId}] Validating with Zod schema...`);
        const validated = ScoreResultSchema.parse(parsed);
        console.log(`[${requestId}] ✅ Schema validation passed`);
        console.log(`[${requestId}] ✅ Successfully used model: ${modelName}`);

        return validated;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        const errorDetails = {
          message: lastError.message,
          name: lastError.name,
        };
        
        // If it's a 404 (model not found), try next model candidate
        if (lastError.message.includes("404") || lastError.message.includes("NOT_FOUND") || lastError.message.includes("not found")) {
          console.error(`[${requestId}] ❌ Model '${modelName}' not found (404), trying next candidate...`);
          break; // Break out of retry loop, try next model
        }
        
        console.error(`[${requestId}] ❌ Attempt ${attempt + 1} failed with model '${modelName}':`, errorDetails);
        
        // Log only high-level error info (no secrets, no OCR text)
        if (attempt < maxRetries) {
          console.log(`[${requestId}] Retrying in ${1000 * (attempt + 1)}ms...`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        } else {
          console.error(`[${requestId}] ❌ All ${maxRetries + 1} attempts failed with model '${modelName}'`);
          // If this was the last model candidate, throw error
          if (modelIndex >= modelCandidates.length - 1) {
            throw new Error(
              `Failed to score nutrition after trying ${modelCandidates.length} models and ${maxRetries + 1} attempts each: ${lastError?.message}`
            );
          }
          // Otherwise, try next model
          break;
        }
      }
    }
  }

  throw new Error(
    `Failed to score nutrition after trying all model candidates: ${lastError?.message}`
  );
}
