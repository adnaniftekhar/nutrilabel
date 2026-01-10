import { NextRequest, NextResponse } from "next/server";
import { extractTextFromImage } from "@/lib/vision";
import { scoreNutrition } from "@/lib/gemini";
import { ScoreResultSchema } from "@/lib/schemas";
import { createHash } from "crypto";

export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds max

const MAX_IMAGE_BYTES = parseInt(process.env.MAX_IMAGE_BYTES || "6000000", 10);
const OCR_MIN_CHARS = parseInt(process.env.OCR_MIN_CHARS || "40", 10);

function generateRequestId(): string {
  return createHash("sha256")
    .update(Date.now().toString() + Math.random().toString())
    .digest("hex")
    .substring(0, 16);
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided", requestId },
        { status: 400 }
      );
    }

    // Validate MIME type
    const validMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type: ${file.type}. Allowed: ${validMimeTypes.join(", ")}`,
          requestId,
        },
        { status: 400 }
      );
    }

    // Validate file size
    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    if (imageBuffer.length > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        {
          error: `Image too large: ${imageBuffer.length} bytes. Maximum: ${MAX_IMAGE_BYTES} bytes`,
          requestId,
        },
        { status: 400 }
      );
    }

    if (imageBuffer.length === 0) {
      return NextResponse.json(
        { error: "Image file is empty", requestId },
        { status: 400 }
      );
    }

    // Compute hash for idempotency/logging
    const imageHash = createHash("sha256")
      .update(imageBuffer)
      .digest("hex")
      .substring(0, 16);

    console.log(`[${requestId}] Processing image hash: ${imageHash}, size: ${imageBuffer.length} bytes`);

    // Extract text using OCR
    let ocrText = "";
    try {
      ocrText = await extractTextFromImage(imageBuffer);
      console.log(`[${requestId}] OCR extracted ${ocrText.length} characters`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[${requestId}] OCR failed:`, errorMessage);
      
      // Provide more helpful error messages
      if (errorMessage.includes("Permission denied") || errorMessage.includes("403")) {
        return NextResponse.json(
          {
            error: "Vision API permission denied. Please check service account permissions.",
            requestId,
            details: "Ensure the service account has 'Cloud Vision API User' role",
          },
          { status: 403 }
        );
      }
      if (errorMessage.includes("API not enabled")) {
        return NextResponse.json(
          {
            error: "Vision API is not enabled. Please enable it in Google Cloud Console.",
            requestId,
            details: "Run: gcloud services enable vision.googleapis.com",
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        {
          error: errorMessage || "Failed to extract text from image",
          requestId,
        },
        { status: 500 }
      );
    }

    // If OCR text is too short, we could use Gemini vision as fallback
    // For MVP, we'll proceed with what we have
    if (ocrText.length < OCR_MIN_CHARS) {
      console.warn(
        `[${requestId}] OCR text too short (${ocrText.length} < ${OCR_MIN_CHARS}), proceeding anyway`
      );
    }

    // Score nutrition using Vertex AI (requires GOOGLE_CLOUD_PROJECT)
    // Check for project ID first
    if (!process.env.GOOGLE_CLOUD_PROJECT && !process.env.GCP_PROJECT) {
      console.error(`[${requestId}] GOOGLE_CLOUD_PROJECT not set`);
      return NextResponse.json(
        {
          error: "Server misconfigured: GOOGLE_CLOUD_PROJECT not set. Vertex AI requires a GCP project ID.",
          requestId,
        },
        { status: 500 }
      );
    }

    let scoreResult;
    try {
      scoreResult = await scoreNutrition({
        ocrText,
        requestId,
      });
      console.log(`[${requestId}] Scoring completed successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[${requestId}] Scoring failed:`, errorMessage);
      return NextResponse.json(
        {
          error: "Failed to analyze nutrition",
          requestId,
        },
        { status: 502 }
      );
    }

    // Validate final result (should already be validated, but double-check)
    const validated = ScoreResultSchema.parse(scoreResult);

    return NextResponse.json({
      success: true,
      requestId,
      imageHash,
      result: validated,
    });
  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return NextResponse.json(
      {
        error: "Internal server error",
        requestId,
      },
      { status: 500 }
    );
  }
}
