"use client";

import { ScoreResult } from "@/lib/schemas";

interface ScoreCardProps {
  title: string;
  score: number;
  justification: string;
  color: "blue" | "purple";
}

function ScoreCard({ title, score, justification, color }: ScoreCardProps) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-200",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-200",
    },
  };

  const classes = colorClasses[color];

  return (
    <div
      className={`p-4 rounded-xl border ${classes.bg} ${classes.border} transition-shadow hover:shadow-md`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <div className={`text-3xl font-bold ${classes.text}`}>
          {score}/10
        </div>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">{justification}</p>
    </div>
  );
}

interface ScoreCardsProps {
  result: ScoreResult;
}

export default function ScoreCards({ result }: ScoreCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <ScoreCard
        title="General Health"
        score={result.generalScore}
        justification={result.generalJustification}
        color="blue"
      />
      <ScoreCard
        title="Diabetes-Friendly"
        score={result.diabetesScore}
        justification={result.diabetesJustification}
        color="purple"
      />
    </div>
  );
}
