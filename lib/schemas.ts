import { z } from "zod";

export const ScoreResultSchema = z.object({
  generalScore: z.number().min(1).max(10),
  diabetesScore: z.number().min(1).max(10),
  generalJustification: z.string().max(400),
  diabetesJustification: z.string().max(400),
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
