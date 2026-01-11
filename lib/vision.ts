import { ImageAnnotatorClient } from "@google-cloud/vision";

let client: ImageAnnotatorClient | null = null;

function getVisionClient(): ImageAnnotatorClient {
  if (!client) {
    // Use standard project resolution:
    // 1. GOOGLE_CLOUD_PROJECT env var if set
    // 2. ADC default project (from gcloud auth application-default login)
    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    
    const config: { projectId?: string } = {};
    if (projectId) {
      config.projectId = projectId;
    }
    
    client = new ImageAnnotatorClient(config);
    console.log(`[Vision] Client initialized${projectId ? ` with project: ${projectId}` : " (using ADC default project)"}`);
  }
  return client;
}

export async function extractTextFromImage(
  imageBuffer: Buffer
): Promise<string> {
  const visionClient = getVisionClient();

  try {
    // Language hints for common languages used in nutrition labels
    // Vision API will auto-detect, but hints improve accuracy
    const languageHints = [
      "en", // English
      "es", // Spanish
      "fr", // French
      "de", // German
      "it", // Italian
      "pt", // Portuguese
      "zh", // Chinese
      "ja", // Japanese
      "ko", // Korean
      "ar", // Arabic
      "hi", // Hindi
    ];

    // Try document text detection first (better for structured labels)
    const [documentResult] = await visionClient.documentTextDetection({
      image: { content: imageBuffer },
      imageContext: {
        languageHints,
      },
    });

    const fullTextAnnotation = documentResult.fullTextAnnotation;
    if (fullTextAnnotation?.text && fullTextAnnotation.text.trim().length > 0) {
      console.log(`Document text detection found ${fullTextAnnotation.text.length} characters`);
      return fullTextAnnotation.text;
    }

    // Fallback to regular text detection with language hints
    const [textResult] = await visionClient.textDetection({
      image: { content: imageBuffer },
      imageContext: {
        languageHints,
      },
    });

    const detections = textResult.textAnnotations;
    if (detections && detections.length > 0) {
      // First detection is usually the entire text
      const text = detections[0].description || "";
      if (text.trim().length > 0) {
        console.log(`Text detection found ${text.length} characters`);
        return text;
      }
    }

    console.warn("No text found in image");
    return "";
  } catch (error) {
    console.error("Vision API error:", error);
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorString = String(error);
    
    // Check for authentication/credential errors
    if (
      errorMessage.includes("invalid_grant") ||
      errorMessage.includes("invalid_rapt") ||
      errorMessage.includes("reauth") ||
      errorString.includes("invalid_grant") ||
      errorString.includes("invalid_rapt")
    ) {
      throw new Error(
        "Authentication failed. Your Google Cloud credentials have expired or are invalid. " +
        "Please run: gcloud auth application-default login"
      );
    }
    
    if (errorMessage.includes("PERMISSION_DENIED") || errorMessage.includes("403")) {
      throw new Error("Permission denied. Check that Vision API is enabled and service account has proper permissions.");
    }
    if (errorMessage.includes("API not enabled")) {
      throw new Error("Vision API is not enabled. Enable it in Google Cloud Console.");
    }
    throw new Error(`Failed to extract text from image: ${errorMessage}`);
  }
}
