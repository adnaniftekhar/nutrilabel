import { z } from "zod";

// Health mode score schema
const HealthModeScoreSchema = z.object({
  score: z.number().min(1).max(10),
  justification: z.string().max(400),
});

export const ScoreResultSchema = z.object({
  generalScore: z.number().min(1).max(10),
  generalJustification: z.string().max(400),
  // Dynamic health mode scores - keys match preference health mode keys
  healthModeScores: z
    .record(z.string(), HealthModeScoreSchema)
    .optional()
    .default({}),
  warnings: z.array(z.string()).optional(),
  extracted: z
    .object({
      calories: z.number().optional(),
      servingSize: z.string().optional(),
      totalFat: z.string().optional(),
      sodium: z.string().optional(),
      totalCarbs: z.string().optional(),
      sugars: z.string().optional(),
      protein: z.string().optional(),
    })
    .optional(),
});

export type ScoreResult = z.infer<typeof ScoreResultSchema>;
