/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { Play, Flame, Sparkles, TrendingUp, CheckCircle, SearchCode, Bookmark, Clock } from "lucide-react";
import { Video } from "../types";
import { useRouter } from "../context/RouterContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

interface VideoGridProps {
  videos: Video[];
  loading: boolean;
  activeCategory: string;
  onFilterCategory: (category: string) => void;
  searchQuery: string;
}

export default function VideoGrid({
  videos,
  loading,
  activeCategory,
  onFilterCategory,
  searchQuery,
}: VideoGridProps) {
  const { navigate } = useRouter();
  const { currentUser } = useAuth();
  
  // Custom Gemini recommended list
  const [aiRecs, setAiRecs] = useState<{ videoId: string; reason: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Load personalization on user login
  useEffect(() => {
    async function loadPersonalization() {
      if (!currentUser) {
        setAiRecs([]);
        return;
      }
      setAiLoading(true);
      try {
        const data = await api.getAIRecommendations();
        setAiRecs(data.recommendations || []);
      } catch (err) {
        console.error("Failed loading Gemini personalized recs", err);
      } finally {
        setAiLoading(false);
      }
    }
    loadPersonalization();
  }, [currentUser]);

  const categories = ["All", "Technology", "Science & Education", "Cooking", "Music"];

  // Helper relative time generator
  const getRelativeTime = (ISOString: string) => {
    try {
      const diffMs = Date.now() - new Date(ISOString).getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHrs < 24) {
        return diffHrs <= 0 ? "Just now" : `${diffHrs}h ago`;
      }
      const diffDays = Math.floor(diffHrs / 24);
      if (diffDays < 30) {
        return `${diffDays}d ago`;
      }
      return new Date(ISOString).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } catch (e) {
      return "Recently";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 font-sans md:px-6">
      {/* Search Header state if active */}
      {searchQuery && (
        <div className="mb-6 animate-fade-in flex items-center justify-between bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <SearchCode className="w-5 h-5 text-red-500" />
              Search results for "{searchQuery}"
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Found {videos.length} videos matching your query parameters.
            </p>
          </div>
          <button
            onClick={() => onFilterCategory("All")}
            className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Category Pills Slider */}
      {!searchQuery && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none select-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onFilterCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                activeCategory === cat
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/10"
                  : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              {cat === "All" && "✨ All Videos"}
              {cat === "Technology" && "💻 Tech & AI"}
              {cat === "Science & Education" && "🌌 Cosmos & Science"}
              {cat === "Cooking" && "🍕 Food & Cuisine"}
              {cat === "Music" && "🎧 Focus beats"}
            </button>
          ))}
        </div>
      )}

      {/* Gemini recommendation section if user is signed in */}
      {currentUser && !searchQuery && aiRecs.length > 0 && (
        <div className="mb-8 p-4 md:p-5 rounded-2xl border border-red-500/15 bg-gradient-to-br from-red-600/5 to-transparent relative overflow-hidden animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-6.5 h-6.5 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow">
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                Gemini Personal recommendations
              </h3>
              <p className="text-[10px] text-gray-400">
                Cognitive neural recommendations mapping your subscriptions and history.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiRecs.map((rec) => {
              const video = videos.find((v) => v.id === rec.videoId);
              if (!video) return null;
              return (
                <div
                  key={rec.videoId}
                  onClick={() => navigate("watch", { v: video.id })}
                  className="bg-[#181818] hover:bg-[#202020] border border-white/5 rounded-xl overflow-hidden p-2 flex gap-3 cursor-pointer transition-all group hover:scale-[1.01]"
                >
                  <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0 relative bg-zinc-800">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute right-1 bottom-1 px-1 bg-black/85 text-[8px] font-bold text-white rounded">
                      {video.duration}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white leading-snug truncate group-hover:text-red-400 transition-colors">
                      {video.title}
                    </h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{video.creatorName}</p>
                    <p className="text-[9px] text-red-400/90 leading-tight mt-1 bg-red-600/5 p-1 rounded border border-red-500/10 shrink-0 select-none">
                      💡 {rec.reason}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main recommended Video list header */}
      {!searchQuery && (
        <div className="flex items-center gap-1.5 mb-4">
          <Flame className="w-4.5 h-4.5 text-red-500 animate-bounce" />
          <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest">
            {activeCategory === "All" ? "Recommended feed" : `${activeCategory} curation`}
          </h3>
        </div>
      )}

      {/* Skeleton loading animation */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3 animate-pulse">
              <div className="bg-[#222] rounded-xl ratio-16-9 w-full"></div>
              <div className="flex gap-3">
                <div className="w-9 h-9 bg-[#222] rounded-full shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-[#222] rounded-lg w-5/6"></div>
                  <div className="h-2.5 bg-[#222] rounded-lg w-2/5"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <p className="text-gray-400 text-sm">No videos found matching the filter.</p>
          <button
            onClick={() => onFilterCategory("All")}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs text-white font-semibold cursor-pointer border border-white/5 transition-all"
          >
            Reset filter
          </button>
        </div>
      ) : (
        /* Video grid layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-7">
          {videos.map((video) => (
            <div
              key={video.id}
              onClick={() => navigate("watch", { v: video.id })}
              className="flex flex-col gap-3 group cursor-pointer transition-all hover:scale-[1.01]"
              id={`video-card-${video.id}`}
            >
              {/* Thumbnail Container */}
              <div className="relative ratio-16-9 rounded-xl overflow-hidden shadow-lg border border-white/5 bg-zinc-900">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Duration overlay */}
                <div className="absolute right-2 bottom-2 px-1.5 py-0.5 bg-black/85 text-[10px] font-bold text-white rounded-md flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  {video.duration}
                </div>

                {/* Instant play badge on hover */}
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <div className="w-11 h-11 bg-red-600 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Text metadata */}
              <div className="flex gap-3 px-1.5">
                {/* Creator Avatar */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("channel", { id: video.creatorId });
                  }}
                  className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-1 ring-white/5 hover:scale-105 transition-transform"
                >
                  <img
                    referrerPolicy="no-referrer"
                    src={video.creatorAvatar}
                    alt={video.creatorName}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold leading-relaxed text-white group-hover:text-red-400 transition-colors line-clamp-2">
                    {video.title}
                  </h4>

                  <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-medium mt-1">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("channel", { id: video.creatorId });
                      }}
                      className="hover:text-red-400 transition-colors truncate"
                    >
                      {video.creatorName}
                    </span>
                    <CheckCircle className="w-3 h-3 text-blue-500 fill-zinc-900 shrink-0" />
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono mt-0.5">
                    <span>{video.views ? video.views.toLocaleString() : 0} views</span>
                    <span>•</span>
                    <span>{getRelativeTime(video.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
