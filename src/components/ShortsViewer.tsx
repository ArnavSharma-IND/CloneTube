/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from "react";
import { CheckCircle, ThumbsUp, ThumbsDown, MessageSquare, Share2, Compass, Volume2, VolumeX, Flame, Heart, Play, Pause } from "lucide-react";
import { Video } from "../types";
import { api } from "../lib/api";
import { useRouter } from "../context/RouterContext";
import { useAuth } from "../context/AuthContext";

export default function ShortsViewer() {
  const { navigate } = useRouter();
  const { currentUser } = useAuth();

  const [shorts, setShorts] = useState<Video[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Audio/Playback states
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  // Comment overlay states
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newCommentInput, setNewCommentInput] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function loadShorts() {
      setLoading(true);
      try {
        const data = await api.getVideos({ isShort: true });
        setShorts(data.videos || []);
      } catch (err) {
        console.error("Failed loading shorts", err);
      } finally {
        setLoading(false);
      }
    }
    loadShorts();
  }, []);

  const activeShort = shorts[currentIndex];

  useEffect(() => {
    // Autoplay when index changes
    if (videoRef.current) {
      videoRef.current.load();
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      }
    }

    // Load active short's comments if panel is open
    if (activeShort && showComments) {
      loadShortsComments();
    }
  }, [currentIndex, activeShort, showComments]);

  const loadShortsComments = async () => {
    if (!activeShort) return;
    try {
      const data = await api.getComments(activeShort.id);
      setComments(data.comments || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNextShort = () => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(true);
    } else {
      // Circle back
      setCurrentIndex(0);
      setIsPlaying(true);
    }
  };

  const handlePrevShort = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(true);
    }
  };

  const handleLike = async () => {
    if (!currentUser) return;
    try {
      const resp = await api.rateVideo(activeShort.id, "like");
      setShorts((prev) =>
        prev.map((s, idx) =>
          idx === currentIndex ? { ...s, likes: resp.likes, dislikes: resp.dislikes } : s
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newCommentInput.trim()) return;

    try {
      const data = await api.createComment(activeShort.id, newCommentInput, false);
      setComments([data.comment, ...comments]);
      setNewCommentInput("");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-8 h-8 border-4 border-red-500/30 border-t-red-600 rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-gray-400 font-mono">Loading dynamic shorts...</p>
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-gray-400 font-mono mb-2">No vertical shorts published yet.</p>
        <button
          onClick={() => navigate("home")}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-semibold cursor-pointer border border-white/5"
        >
          Back to Home Feed
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-black flex items-center justify-center relative p-3 md:p-6 overflow-hidden">
      {/* Background hazy blur decoration */}
      <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl select-none" style={{ backgroundImage: `url(${activeShort.thumbnailUrl})` }}></div>

      {/* Main vertical viewer */}
      <div className="relative w-full max-w-[380px] h-[calc(100vh-7rem)] bg-zinc-950 rounded-2xl flex border border-white/10 overflow-hidden shadow-2xl z-10">
        
        {/* HTML5 video element source container */}
        <div className="relative flex-1 h-full cursor-pointer overflow-hidden" onClick={handleTogglePlay}>
          <video
            ref={videoRef}
            src={activeShort.videoUrl}
            loop
            muted={isMuted}
            playsInline
            controls={false}
            className="w-full h-full object-cover select-none"
          />

          {/* Muted toggle overlay button (Top Right) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
            className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur hover:bg-black/80 rounded-full text-white z-30 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400 animate-pulse" />}
          </button>

          {/* Play/Pause state bubble indicator */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20 transition-all">
              <div className="p-4 bg-black/65 rounded-full text-white animate-scale-up">
                <Pause className="w-8 h-8 text-red-500 fill-red-500" />
              </div>
            </div>
          )}

          {/* Shorts top title */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 p-1 px-2.5 bg-black/45 backdrop-blur rounded-full text-[10px] font-black tracking-widest text-[#FFF] uppercase shadow-lg border border-white/5">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            CloneShorts
          </div>

          {/* Channel / Description Overlay (Inside Video Column bottom) */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent p-4 flex flex-col justify-end text-white z-20 space-y-2 pointer-events-none">
            
            {/* Publisher metadata (enable pointers specifically for navigation) */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("channel", { id: activeShort.creatorId });
                }}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-red-500/30 cursor-pointer"
              >
                <img src={activeShort.creatorAvatar} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h4
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("channel", { id: activeShort.creatorId });
                  }}
                  className="text-xs font-bold flex items-center gap-1 cursor-pointer hover:text-red-400 truncate"
                >
                  {activeShort.creatorName}
                  <CheckCircle className="w-3 h-3 text-blue-500 fill-zinc-950 shrink-0" />
                </h4>
                <p className="text-[9px] text-[#A1A1A1] font-medium font-mono">@{activeShort.creatorName.toLowerCase().replace(/\s/g, "")}</p>
              </div>
            </div>

            {/* Post Title */}
            <p className="text-[11px] font-medium leading-relaxed line-clamp-2 pr-4">{activeShort.title}</p>

            {/* Dynamic Sound beats */}
            <div className="flex items-center gap-1.5 text-[9px] text-red-400 font-bold font-mono">
              <div className="flex items-end gap-0.5 h-2.5 w-3.5">
                <span className="w-0.5 h-full bg-red-500 animate-pulse"></span>
                <span className="w-0.5 h-3/5 bg-red-500 animate-pulse"></span>
                <span className="w-0.5 h-4/5 bg-red-500 animate-pulse"></span>
              </div>
              <span>Original Sound beats • Custom Lofi</span>
            </div>
          </div>
        </div>

        {/* Sidebar Controls Widget Panel (Right aligned inside card) */}
        <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4 z-30 select-none">
          {/* Like */}
          <div className="flex flex-col items-center text-center">
            <button
              onClick={handleLike}
              className="p-3 bg-black/60 hover:bg-black/80 rounded-full hover:scale-105 transition-all text-white cursor-pointer shadow border border-white/5 active:text-red-500"
            >
              <ThumbsUp className="w-4 h-4 fill-white" />
            </button>
            <span className="text-[10px] font-extrabold text-white font-mono mt-1">{activeShort.likes || 0}</span>
          </div>

          {/* Dislike */}
          <div className="flex flex-col items-center text-center">
            <button className="p-3 bg-black/60 hover:bg-black/80 rounded-full hover:scale-105 transition-all text-white cursor-pointer shadow border border-white/5">
              <ThumbsDown className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-extrabold text-zinc-400 font-mono mt-1">Dislike</span>
          </div>

          {/* Comments Trigger */}
          <div className="flex flex-col items-center text-center">
            <button
              onClick={() => setShowComments(!showComments)}
              className={`p-3 rounded-full hover:scale-105 transition-all cursor-pointer shadow border border-white/5 ${
                showComments ? "bg-red-600 text-white border-red-500" : "bg-black/60 hover:bg-black/80 text-white"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-extrabold text-white font-mono mt-1">Comm</span>
          </div>

          {/* Share link snippet */}
          <div className="flex flex-col items-center text-center">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + "/?view=shorts");
                alert("Short link saved to clipboard!");
              }}
              className="p-3 bg-black/60 hover:bg-black/80 rounded-full hover:scale-105 transition-all text-white cursor-pointer shadow border border-white/5"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <span className="text-[10px] text-zinc-400 font-medium font-mono mt-1">Share</span>
          </div>
        </div>

        {/* Floating Comments Lateral Slide-over Panel */}
        {showComments && (
          <div className="absolute inset-y-0 right-0 w-4/5 bg-zinc-900 border-l border-white/10 z-45 flex flex-col p-4 animate-slide-left shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-red-500" />
                Comments ({comments.length})
              </h3>
              <button onClick={() => setShowComments(false)} className="text-gray-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none">
              {comments.length === 0 ? (
                <p className="text-[10px] text-zinc-500 text-center py-10 italic">
                  No comments yet. Start the conversation!
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="text-[10px] bg-black/20 p-2 rounded-lg border border-white/5">
                    <p className="font-bold text-white mb-0.5">{c.username}</p>
                    <p className="text-gray-300 leading-normal">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment */}
            {currentUser ? (
              <form onSubmit={handleCommentSubmit} className="mt-4 pt-2 border-t border-white/5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Express your feedback..."
                    value={newCommentInput}
                    onChange={(e) => setNewCommentInput(e.target.value)}
                    className="flex-1 h-8 px-2.5 rounded bg-black/40 border border-white/10 text-white text-[11px] focus:outline-none focus:border-red-500"
                  />
                  <button type="submit" className="h-8 px-3 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold">
                    Send
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-[9px] text-[#FF5555] font-semibold text-center mt-4 pt-2 border-t border-white/5">
                Sign in to post comments!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Circle Slide arrows (prev/next) for desktop navigation */}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40 hidden md:flex select-none">
        <button
          onClick={handlePrevShort}
          disabled={currentIndex === 0}
          className="p-3 bg-zinc-900 border border-white/10 hover:bg-zinc-800 rounded-full text-white cursor-pointer transition-colors shadow disabled:opacity-30"
          title="Previous Short"
        >
          ▲
        </button>
        <button
          onClick={handleNextShort}
          className="p-3 bg-zinc-900 border border-white/10 hover:bg-zinc-800 rounded-full text-white cursor-pointer transition-colors shadow"
          title="Next Short"
        >
          ▼
        </button>
      </div>
    </div>
  );
}
