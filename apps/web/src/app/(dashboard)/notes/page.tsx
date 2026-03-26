"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../hooks/useAuth";
import { api, type Note, type NoteFilter } from "../../../lib/api";

const stats = [
  {
    label: "Total Notes",
    value: "142",
    change: "+18",
    trend: "up",
  },
  {
    label: "This Week",
    value: "23",
    change: "+4",
    trend: "up",
  },
  {
    label: "AI Transcribed",
    value: "89",
    change: "+12",
    trend: "up",
  },
  {
    label: "Shared",
    value: "34",
    change: "+2",
    trend: "up",
  },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<NoteFilter>({});
  const [searchQuery, setSearchQuery] = useState("");
  
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotes();
    }
  }, [isAuthenticated, user, filter]);

  const loadNotes = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const response = await api.getNotes({
        userId: user.id,
        workspaceId: { value: "default-workspace" }, // TODO: Get from context
        ...filter,
      });
      setNotes(response.notes || []);
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!user || !searchQuery.trim()) return;
    
    try {
      setIsLoading(true);
      const response = await api.searchNotes(searchQuery, user.id.value, "default-workspace");
      setNotes(response.notes || []);
    } catch (error) {
      console.error("Failed to search notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranscribe = async (noteId: string) => {
    try {
      await api.transcribeNote(noteId);
      await loadNotes(); // Refresh notes
    } catch (error) {
      console.error("Failed to transcribe note:", error);
    }
  };

  const handleShare = async (noteId: string) => {
    try {
      // TODO: Show share dialog with user selection
      await api.shareNote(noteId, [], { canEdit: false, canComment: true, canShare: false });
      await loadNotes(); // Refresh notes
    } catch (error) {
      console.error("Failed to share note:", error);
    }
  };

  const getNoteIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return "👥";
      case "call":
        return "📞";
      case "email":
        return "📧";
      case "voice_memo":
        return "🎙️";
      case "document":
        return "📄";
      default:
        return "📝";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  if (!isAuthenticated || !user) {
    return <div>Please sign in to view notes.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-600 mt-2">Capture ideas, meetings, and conversations with AI transcription</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/notes/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Note
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`text-sm ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter.type || ""}
              onChange={(e) => setFilter({ ...filter, type: e.target.value as any || undefined })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="manual">Manual</option>
              <option value="meeting">Meeting</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="voice_memo">Voice Memo</option>
              <option value="document">Document</option>
            </select>
            <select
              value={filter.hasTranscript !== undefined ? filter.hasTranscript.toString() : ""}
              onChange={(e) => setFilter({ 
                ...filter, 
                hasTranscript: e.target.value === "" ? undefined : e.target.value === "true" 
              })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Notes</option>
              <option value="true">Transcribed</option>
              <option value="false">Not Transcribed</option>
            </select>
            <select
              value={filter.isShared !== undefined ? filter.isShared.toString() : ""}
              onChange={(e) => setFilter({ 
                ...filter, 
                isShared: e.target.value === "" ? undefined : e.target.value === "true" 
              })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Notes</option>
              <option value="true">Shared</option>
              <option value="false">Private</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">Loading notes...</div>
          </div>
        ) : notes.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">No notes found</div>
            <Link
              href="/dashboard/notes/new"
              className="inline-block mt-4 text-blue-600 hover:text-blue-700"
            >
              Create your first note →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notes.map((note) => (
              <div key={note.id.value} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{getNoteIcon(note.type)}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                      {note.isShared && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          Shared
                        </span>
                      )}
                      {note.metadata.aiTranscribed && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          AI Transcribed
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{note.content.value}</p>
                    
                    {note.metadata.summary && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <p className="text-sm text-blue-800 font-medium mb-1">AI Summary</p>
                        <p className="text-sm text-blue-700">{note.metadata.summary}</p>
                      </div>
                    )}

                    {note.metadata.keyPoints && note.metadata.keyPoints.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-500 font-medium mb-1">Key Points</p>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {note.metadata.keyPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {note.metadata.actionItems && note.metadata.actionItems.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-500 font-medium mb-1">Action Items</p>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {note.metadata.actionItems.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{formatDate(note.createdAt)}</span>
                        {note.metadata.duration && (
                          <span>• {note.metadata.duration} min</span>
                        )}
                        {note.metadata.participantCount && (
                          <span>• {note.metadata.participantCount} participants</span>
                        )}
                        {note.tags.length > 0 && (
                          <div className="flex gap-1">
                            {note.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {!note.metadata.aiTranscribed && (note.type === "voice_memo" || note.type === "meeting" || note.type === "call") && (
                      <button
                        onClick={() => handleTranscribe(note.id.value)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Transcribe with AI"
                      >
                        🎙️
                      </button>
                    )}
                    <button
                      onClick={() => handleShare(note.id.value)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Share note"
                    >
                      📤
                    </button>
                    <Link
                      href={`/dashboard/notes/${note.id.value}`}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit note"
                    >
                      ✏️
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
