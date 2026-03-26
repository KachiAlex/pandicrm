"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../hooks/useAuth";
import { api, type Ritual, type RitualFilter, type RitualStats } from "../../../lib/api";

export default function RitualsPage() {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [stats, setStats] = useState<RitualStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<RitualFilter>({});
  const [showCompleteModal, setShowCompleteModal] = useState<string | null>(null);
  const [completionData, setCompletionData] = useState({
    duration: 0,
    quality: "good" as const,
    notes: "",
    mood: 3 as const,
    energy: 3 as const,
  });
  
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, user, filter]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const [ritualsResponse, statsResponse] = await Promise.all([
        api.getRituals({
          userId: user.id,
          workspaceId: { value: "default-workspace" },
          ...filter,
        }),
        api.getRitualStats(user.id.value, "default-workspace"),
      ]);
      
      setRituals(ritualsResponse.rituals || []);
      setStats(statsResponse.ritualStats ?? null);
    } catch (error) {
      console.error("Failed to load rituals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async (ritualId: string) => {
    try {
      await api.completeRitual(ritualId, {
        ritualId: { value: ritualId },
        duration: completionData.duration,
        quality: completionData.quality,
        notes: completionData.notes,
        mood: completionData.mood,
        energy: completionData.energy,
      });
      
      setShowCompleteModal(null);
      setCompletionData({
        duration: 0,
        quality: "good",
        notes: "",
        mood: 3,
        energy: 3,
      });
      
      await loadData(); // Refresh data
    } catch (error) {
      console.error("Failed to complete ritual:", error);
    }
  };

  const getRitualIcon = (icon: string) => {
    return icon || "📌";
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!isAuthenticated || !user) {
    return <div>Please sign in to view rituals.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rituals</h1>
          <p className="text-gray-600 mt-2">Build consistent habits and track your daily routines</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/rituals/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Ritual
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats && (
          <>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Rituals</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeRituals}</p>
                </div>
                <div className="text-sm text-green-600">
                  {stats.totalRituals > 0 ? `${Math.round((stats.activeRituals / stats.totalRituals) * 100)}%` : "0%"}
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.currentStreak} days</p>
                </div>
                <div className="text-sm text-blue-600">
                  🔥
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(stats.completionRate)}%</p>
                </div>
                <div className="text-sm text-green-600">
                  ⬆️
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Completions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCompletions}</p>
                </div>
                <div className="text-sm text-purple-600">
                  ✨
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2">
            <select
              value={filter.category || ""}
              onChange={(e) => setFilter({ ...filter, category: e.target.value as any || undefined })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="health">Health</option>
              <option value="mindfulness">Mindfulness</option>
              <option value="productivity">Productivity</option>
              <option value="business">Business</option>
              <option value="learning">Learning</option>
              <option value="social">Social</option>
              <option value="creativity">Creativity</option>
              <option value="personal">Personal</option>
            </select>
            <select
              value={filter.frequency || ""}
              onChange={(e) => setFilter({ ...filter, frequency: e.target.value as any || undefined })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Frequencies</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
            <select
              value={filter.isActive !== undefined ? filter.isActive.toString() : ""}
              onChange={(e) => setFilter({ 
                ...filter, 
                isActive: e.target.value === "" ? undefined : e.target.value === "true" 
              })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Rituals</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Today's Rituals */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Today's Rituals</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">Loading rituals...</div>
          </div>
        ) : rituals.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">No rituals found</div>
            <Link
              href="/dashboard/rituals/new"
              className="inline-block mt-4 text-blue-600 hover:text-blue-700"
            >
              Create your first ritual →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {rituals.map((ritual) => (
              <div key={ritual.id.value} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span 
                        className="text-2xl p-2 rounded-lg"
                        style={{ backgroundColor: ritual.color + "20" }}
                      >
                        {getRitualIcon(ritual.icon)}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{ritual.name.value}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{formatTime(ritual.targetTime)}</span>
                          <span>• {ritual.duration} min</span>
                          <span>• {ritual.category}</span>
                          <span>• {ritual.frequency}</span>
                        </div>
                      </div>
                      {ritual.isActive && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    {ritual.description && (
                      <p className="text-gray-600 mb-3">{ritual.description}</p>
                    )}
                    
                    <div className="flex items-center gap-3">
                      {ritual.isActive && (
                        <button
                          onClick={() => setShowCompleteModal(ritual.id.value)}
                          className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          ✓ Complete
                        </button>
                      )}
                      <Link
                        href={`/dashboard/rituals/${ritual.id.value}`}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Complete Ritual</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={completionData.duration}
                  onChange={(e) => setCompletionData({ ...completionData, duration: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="How long did it take?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
                <select
                  value={completionData.quality}
                  onChange={(e) => setCompletionData({ ...completionData, quality: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mood (1-5)</label>
                <select
                  value={completionData.mood}
                  onChange={(e) => setCompletionData({ ...completionData, mood: parseInt(e.target.value) as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1 - Very Low</option>
                  <option value={2}>2 - Low</option>
                  <option value={3}>3 - Neutral</option>
                  <option value={4}>4 - Good</option>
                  <option value={5}>5 - Excellent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Energy (1-5)</label>
                <select
                  value={completionData.energy}
                  onChange={(e) => setCompletionData({ ...completionData, energy: parseInt(e.target.value) as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>1 - Very Low</option>
                  <option value={2}>2 - Low</option>
                  <option value={3}>3 - Neutral</option>
                  <option value={4}>4 - Good</option>
                  <option value={5}>5 - Excellent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={completionData.notes}
                  onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="How did it go? Any thoughts or reflections?"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCompleteModal(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleComplete(showCompleteModal)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Complete Ritual
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
