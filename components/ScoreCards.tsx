"use client";

import { ScoreResult } from "@/lib/schemas";
import { UserPreferences, loadPreferences } from "@/lib/preferences";
import { useState, useEffect } from "react";

interface ScoreCardProps {
  title: string;
  score: number;
  justification: string;
  color: "blue" | "purple" | "green" | "orange" | "teal" | "pink" | "indigo";
}

function ScoreCard({ title, score, justification, color }: ScoreCardProps) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      scoreBg: "bg-blue-100",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      scoreBg: "bg-purple-100",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      scoreBg: "bg-green-100",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
      scoreBg: "bg-orange-100",
    },
    teal: {
      bg: "bg-teal-50",
      text: "text-teal-700",
      border: "border-teal-200",
      scoreBg: "bg-teal-100",
    },
    pink: {
      bg: "bg-pink-50",
      text: "text-pink-700",
      border: "border-pink-200",
      scoreBg: "bg-pink-100",
    },
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      scoreBg: "bg-indigo-100",
    },
  };

  const classes = colorClasses[color];

  // Determine score quality for visual feedback
  const getScoreQuality = (score: number) => {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    if (score >= 4) return "Fair";
    return "Poor";
  };

  return (
    <div
      className={`p-5 rounded-xl border-2 ${classes.bg} ${classes.border} transition-all hover:shadow-lg`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
          <span className="text-xs text-gray-500">{getScoreQuality(score)}</span>
        </div>
        <div className={`px-4 py-2 rounded-lg ${classes.scoreBg} ${classes.text}`}>
          <div className={`text-3xl font-bold ${classes.text} leading-none`}>
            {score}
          </div>
          <div className="text-xs font-medium opacity-75 mt-0.5">/10</div>
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{justification}</p>
    </div>
  );
}

interface ScoreCardsProps {
  result: ScoreResult;
}

// Health mode configuration
const HEALTH_MODE_CONFIG: Record<
  keyof UserPreferences["healthModes"],
  { title: string; color: ScoreCardProps["color"] }
> = {
  diabetesFriendly: {
    title: "Diabetes-Friendly",
    color: "purple",
  },
  heartHealth: {
    title: "Heart Health",
    color: "orange",
  },
  weightManagement: {
    title: "Weight Management",
    color: "green",
  },
  gutHealth: {
    title: "Gut Health",
    color: "teal",
  },
  highProtein: {
    title: "High-Protein Focus",
    color: "orange",
  },
  lowSodium: {
    title: "Low-Sodium Focus",
    color: "indigo",
  },
  lowAddedSugar: {
    title: "Low-Added-Sugar Focus",
    color: "pink",
  },
};

export default function ScoreCards({ result }: ScoreCardsProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  useEffect(() => {
    setPreferences(loadPreferences());
  }, []);

  // Get selected health modes
  const selectedHealthModes = preferences
    ? (Object.entries(preferences.healthModes)
        .filter(([_, selected]) => selected)
        .map(([key, _]) => key) as Array<keyof UserPreferences["healthModes"]>)
    : [];

  // Health mode color override (heartHealth uses orange since red isn't in our palette)
  const getHealthModeColor = (
    mode: keyof UserPreferences["healthModes"]
  ): ScoreCardProps["color"] => {
    if (mode === "heartHealth") return "orange";
    return HEALTH_MODE_CONFIG[mode].color;
  };

  return (
    <div className="space-y-4">
      {/* General Health - Always shown */}
      <ScoreCard
        title="General Health"
        score={result.generalScore}
        justification={result.generalJustification}
        color="blue"
      />

      {/* Health Mode Cards - One for each selected mode */}
      {selectedHealthModes.length > 0 && result.healthModeScores ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selectedHealthModes.map((mode) => {
            const modeScore = result.healthModeScores?.[mode];
            if (!modeScore) return null;

            const config = HEALTH_MODE_CONFIG[mode];
            return (
              <ScoreCard
                key={mode}
                title={config.title}
                score={modeScore.score}
                justification={modeScore.justification}
                color={getHealthModeColor(mode)}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
