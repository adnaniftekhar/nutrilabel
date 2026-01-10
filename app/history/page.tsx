"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllHistory, deleteHistoryEntry, HistoryEntry } from "@/lib/history";
import BottomNav from "@/components/BottomNav";
import ScoreCards from "@/components/ScoreCards";
import WarningsCard from "@/components/WarningsCard";

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const allEntries = await getAllHistory();
      // Sort by timestamp, newest first
      setEntries(allEntries.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this entry?")) return;

    try {
      await deleteHistoryEntry(id);
      setEntries(entries.filter((e) => e.id !== id));
      if (expandedId === id) {
        setExpandedId(null);
      }
    } catch (error) {
      console.error("Failed to delete entry:", error);
      alert("Failed to delete entry");
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Clear all history? This cannot be undone.")) return;

    try {
      for (const entry of entries) {
        await deleteHistoryEntry(entry.id);
      }
      setEntries([]);
      setExpandedId(null);
    } catch (error) {
      console.error("Failed to clear history:", error);
      alert("Failed to clear history");
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-24">
        <div className="text-gray-600">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-900">History</h1>
          {entries.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {entries.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-gray-600 mb-6">No history yet</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/25"
            >
              Analyze a Label
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => {
              const isExpanded = expandedId === entry.id;
              return (
                <div
                  key={entry.id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  {/* Collapsed view */}
                  <div className="p-4">
                    <div className="flex gap-4">
                      {entry.imagePreview && (
                        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={entry.imagePreview}
                            alt="Label preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(entry.timestamp)}
                          </span>
                          <button
                            onClick={(e) => handleDelete(entry.id, e)}
                            className="flex-shrink-0 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div>
                            <div className="text-xs text-gray-600 mb-1">
                              General Health
                            </div>
                            <div className="text-xl font-bold text-blue-600">
                              {entry.scores.generalScore}/10
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600 mb-1">
                              Diabetes-Friendly
                            </div>
                            <div className="text-xl font-bold text-purple-600">
                              {entry.scores.diabetesScore}/10
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {entry.scores.generalJustification}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded view */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
                      <ScoreCards result={entry.scores} />
                      {entry.scores.warnings &&
                        entry.scores.warnings.length > 0 && (
                          <WarningsCard warnings={entry.scores.warnings} />
                        )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom navigation (mobile) */}
      <BottomNav />
    </div>
  );
}
