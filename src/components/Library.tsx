/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { FolderHeart, History, Heart, Bookmark, Play, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "../context/RouterContext";
import { Video } from "../types";
import { api } from "../lib/api";

export default function Library() {
  const { currentUser } = useAuth();
  const { navigate } = useRouter();

  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const resp = await api.getVideos({ isShort: false });
        setAllVideos(resp.videos || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (!currentUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center bg-zinc-950 m-6 rounded-2xl p-6 font-sans">
        <p className="text-sm text-gray-400 font-mono mb-4">You must sign in to save preferences and check library logs.</p>
        <button
          onClick={() => navigate("home")}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-full text-xs font-semibold text-white cursor-pointer"
        >
          Explore CloneTube Feed
        </button>
      </div>
    );
  }

  // Filter lists based on session profile data
  const historyVideos = allVideos.filter((v) => currentUser.watchHistory?.includes(v.id)).slice(0, 4);
  const likedVideos = allVideos.filter((v) => currentUser.likedVideos?.includes(v.id));
  const savedVideos = allVideos.filter((v) => currentUser.savedVideos?.includes(v.id));

  return (
    <div className="flex-1 p-4 md:p-6 font-sans space-y-8 overflow-y-auto max-w-7xl mx-auto">
      {/* Title */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
          <FolderHeart className="w-6 h-6 text-red-500" />
          My Personal Library
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Review liked video collections, saved queues, and recently streamed history.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-600 rounded-full animate-spin mb-3"></div>
          <p className="text-xs text-gray-400 font-mono font-bold">Assembling collections...</p>
        </div>
      ) : (
        <div className="space-y-8.5">
          {/* Section 1: Watch History */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-widest flex items-center gap-2">
              <History className="w-4 h-4 text-red-500" />
              Watch History ({historyVideos.length})
            </h3>

            {historyVideos.length === 0 ? (
              <p className="text-[10px] text-zinc-500 italic p-6 bg-zinc-900/15 border border-white/4 rounded-xl text-center">
                Watch history logging is currently empty. Play videos from recommended feed.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {historyVideos.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => navigate("watch", { v: v.id })}
                    className="group cursor-pointer space-y-2"
                  >
                    <div className="ratio-16-9 rounded-xl overflow-hidden relative shadow bg-zinc-900 border border-white/5">
                      <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                      <span className="absolute right-1.5 bottom-1.5 px-1 bg-black/85 text-[8px] font-bold text-white rounded">
                        {v.duration}
                      </span>
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-[#222]">
                        <div className="h-full bg-red-600 w-3/4" /> {/* simulate partial view */}
                      </div>
                    </div>
                    <div className="px-1 text-xs">
                      <h4 className="font-bold text-white line-clamp-1 group-hover:text-red-400">
                        {v.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{v.creatorName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section 2: Liked videos */}
            <div className="p-5 bg-zinc-900/15 border border-white/4 rounded-2xl space-y-4 h-max">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-widest flex items-center gap-2">
                <Heart className="w-4 h-4 text-green-400" />
                Liked Videos ({likedVideos.length})
              </h3>

              {likedVideos.length === 0 ? (
                <p className="text-[10px] text-zinc-500 italic text-center py-10">
                  No liked videos in your library collection.
                </p>
              ) : (
                <div className="space-y-3">
                  {likedVideos.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => navigate("watch", { v: v.id })}
                      className="flex gap-3 hover:bg-white/2 p-2 rounded-xl transition-all cursor-pointer group"
                    >
                      <div className="w-20 h-12 rounded-lg overflow-hidden shrink-0 relative bg-zinc-900">
                        <img src={v.thumbnailUrl} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex flex-col justify-center">
                        <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors leading-snug truncate">
                          {v.title}
                        </h4>
                        <p className="text-[10px] text-zinc-500 mt-1">{v.creatorName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Saved queue */}
            <div className="p-5 bg-zinc-900/15 border border-white/4 rounded-2xl space-y-4 h-max">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-widest flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-blue-400" />
                Watch Later Queue ({savedVideos.length})
              </h3>

              {savedVideos.length === 0 ? (
                <p className="text-[10px] text-zinc-500 italic text-center py-10">
                  Queue is empty. Flag videos using bookmarks.
                </p>
              ) : (
                <div className="space-y-3">
                  {savedVideos.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => navigate("watch", { v: v.id })}
                      className="flex gap-3 hover:bg-white/2 p-2 rounded-xl transition-all cursor-pointer group"
                    >
                      <div className="w-20 h-12 rounded-lg overflow-hidden shrink-0 relative bg-zinc-900">
                        <img src={v.thumbnailUrl} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex flex-col justify-center">
                        <h4 className="text-xs font-bold text-white group-hover:text-red-400 transition-colors leading-snug truncate">
                          {v.title}
                        </h4>
                        <p className="text-[10px] text-zinc-500 mt-1">{v.creatorName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
