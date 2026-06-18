/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from "react";
import { CheckCircle, ThumbsUp, ThumbsDown, Bookmark, Share2, Sparkles, Send, Play, Pause, FastForward, Info, Loader2, ArrowRight } from "lucide-react";
import { Video, Comment, Reply } from "../types";
import { useRouter } from "../context/RouterContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export default function WatchPage() {
  const { params, navigate } = useRouter();
  const { currentUser, updateUser } = useAuth();
  const videoId = params.v;

  const [video, setVideo] = useState<Video | null>(null);
  const [recommendations, setRecommendations] = useState<Video[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Video Playing parameters
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isPlayingStr, setIsPlayingStr] = useState(true);

  // Ratings parameters
  const [userRating, setUserRating] = useState<string>("none"); // "like", "dislike", "none"
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // AI Summary states
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Comment Creation state
  const [commentText, setCommentText] = useState("");
  const [aiModeration, setAiModeration] = useState(true);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [commentError, setCommentError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoId) return;

    async function loadVideoDetails() {
      setLoading(true);
      setErrorState("");
      setAiSummary("");
      try {
        // Get primary video
        const detailsResp = await api.getVideo(videoId);
        setVideo(detailsResp.video);
        
        if (detailsResp.video.aiSummary) {
          setAiSummary(detailsResp.video.aiSummary);
        }

        // Get comments
        const commentsResp = await api.getComments(videoId);
        setComments(commentsResp.comments || []);

        // Load recommended sidebar
        const allVideosResp = await api.getVideos({ isShort: false });
        setRecommendations((allVideosResp.videos || []).filter((v) => v.id !== videoId).slice(0, 8));

        // Get channel's relative subscription state
        const channelResp = await api.getChannel(detailsResp.video.creatorId);
        setIsSubscribed(channelResp.isSubscribed);

        // Check if liked in user profile
        if (currentUser) {
          if (currentUser.likedVideos?.includes(videoId)) setUserRating("like");
          else if (currentUser.dislikedVideos?.includes(videoId)) setUserRating("dislike");
          else setUserRating("none");

          setIsSaved(currentUser.savedVideos?.includes(videoId) || false);
        }
      } catch (err) {
        console.error("Could not load video requirements", err);
        setErrorState("Video failed to play. Check parameter IDs.");
      } finally {
        setLoading(false);
      }
    }

    loadVideoDetails();
  }, [videoId, currentUser]);

  const [errorState, setErrorState] = useState("");

  useEffect(() => {
    // Reset video speed when changing videos
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, video]);

  const handlePlayRateChange = (rate: number) => {
    setPlaybackSpeed(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlayingStr(true);
      } else {
        videoRef.current.pause();
        setIsPlayingStr(false);
      }
    }
  };

  const handleAISummarize = async () => {
    if (!video) return;
    setAiLoading(true);
    setAiSummary("");
    try {
      const data = await api.getAISummary(video.id);
      setAiSummary(data.summary);
    } catch (e: any) {
      console.error(e);
      setAiSummary("AI Summary Simulation: This video explores " + video.category + " methods, providing rich tips on tags: " + video.tags.join(", ") + ".");
    } finally {
      setAiLoading(false);
    }
  };

  const handleLikeToggle = async (action: "like" | "dislike") => {
    if (!currentUser || !video) return;
    try {
      const currentAction = userRating === action ? "remove" : action;
      const data = await api.rateVideo(video.id, currentAction);
      
      setVideo({
        ...video,
        likes: data.likes,
        dislikes: data.dislikes,
      });
      setUserRating(data.userRating as any);

      // Save user session changes
      const updatedUser = { ...currentUser };
      updatedUser.likedVideos = updatedUser.likedVideos || [];
      updatedUser.dislikedVideos = updatedUser.dislikedVideos || [];

      if (data.userRating === "like") {
        updatedUser.likedVideos.push(video.id);
        updatedUser.dislikedVideos = updatedUser.dislikedVideos.filter((id) => id !== video.id);
      } else if (data.userRating === "dislike") {
        updatedUser.dislikedVideos.push(video.id);
        updatedUser.likedVideos = updatedUser.likedVideos.filter((id) => id !== video.id);
      } else {
        updatedUser.likedVideos = updatedUser.likedVideos.filter((id) => id !== video.id);
        updatedUser.dislikedVideos = updatedUser.dislikedVideos.filter((id) => id !== video.id);
      }
      updateUser(updatedUser);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubscribeToggle = async () => {
    if (!currentUser || !video) return;
    try {
      const data = await api.toggleSubscribe(video.creatorId);
      setIsSubscribed(data.subscribed);

      // Sync active auth user channels
      const updatedUser = { ...currentUser };
      updatedUser.subscriptions = updatedUser.subscriptions || [];
      if (data.subscribed) {
        updatedUser.subscriptions.push(video.creatorId);
      } else {
        updatedUser.subscriptions = updatedUser.subscriptions.filter((id) => id !== video.creatorId);
      }
      updateUser(updatedUser);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveToggle = async () => {
    if (!currentUser || !video) return;
    try {
      const data = await api.toggleSaveVideo(video.id);
      setIsSaved(data.saved);

      const updatedUser = { ...currentUser };
      updatedUser.savedVideos = updatedUser.savedVideos || [];
      if (data.saved) {
        updatedUser.savedVideos.push(video.id);
      } else {
        updatedUser.savedVideos = updatedUser.savedVideos.filter((id) => id !== video.id);
      }
      updateUser(updatedUser);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError("");
    if (!currentUser || !video || !commentText.trim()) return;

    try {
      const resp = await api.createComment(video.id, commentText, aiModeration);
      setComments([resp.comment, ...comments]);
      setCommentText("");
    } catch (err: any) {
      console.error(err);
      setCommentError(err.message || "Could not publish comment. AI safeguard flagged content.");
    }
  };

  const handleReplySubmit = async (commentId: string) => {
    const text = replyInputs[commentId];
    if (!currentUser || !text || !text.trim()) return;

    try {
      const resp = await api.replyToComment(commentId, text);
      setComments(
        comments.map((c) => {
          if (c.id === commentId) {
            return {
              ...c,
              replies: [...(c.replies || []), resp.reply],
            };
          }
          return c;
        })
      );
      setReplyInputs({
        ...replyInputs,
        [commentId]: "",
      });
      setActiveReplyId(null);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center uppercase tracking-widest font-mono font-bold">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-3" />
        <span className="text-xs text-gray-400">Loading High-Fidelity video...</span>
      </div>
    );
  }

  if (errorState || !video) {
    return (
      <div className="flex-1 p-6 text-center py-20 bg-zinc-950 rounded-2xl m-6">
        <p className="text-sm text-red-400 font-bold font-mono mb-4">⚠️ {errorState || "Video Unavailable"}</p>
        <button
          onClick={() => navigate("home")}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-full font-semibold text-xs"
        >
          Back to feed
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 md:p-6 font-sans overflow-y-auto max-w-7xl mx-auto">
      {/* Primary Video Stream and details column */}
      <div className="flex-1 space-y-4">
        {/* Custom video frame wrapper */}
        <div className="rounded-xl overflow-hidden shadow-2xl relative border border-white/10 aspect-video bg-zinc-950">
          <video
            ref={videoRef}
            src={video.videoUrl}
            controls
            autoPlay
            className="w-full h-full"
            poster={video.thumbnailUrl}
          />
        </div>

        {/* Video Speed controls overlay strip */}
        <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl border border-white/5 text-xs text-gray-400 font-mono">
          <span className="flex items-center gap-1.5 font-bold text-red-500 uppercase tracking-wider">
            <Info className="w-3.5 h-3.5" />
            Media player adjustments
          </span>
          <div className="flex items-center gap-2">
            <span>Video Speed:</span>
            {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
              <button
                key={speed}
                onClick={() => handlePlayRateChange(speed)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                  playbackSpeed === speed
                    ? "bg-red-600 text-white shadow"
                    : "bg-white/5 hover:bg-white/10 text-gray-300"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Video tags */}
        <div className="flex flex-wrap gap-1.5">
          {video.tags.map((tag) => (
            <span
              key={tag}
              onClick={() => navigate("home", { search: tag })}
              className="text-[10px] font-bold text-blue-400 hover:underline cursor-pointer bg-blue-500/5 border border-blue-500/10 p-1 px-2.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Primary Video Title */}
        <h1 className="text-lg md:text-xl font-extrabold text-[#F1F1F1] leading-tight">
          {video.title}
        </h1>

        {/* Views and operations status strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-white/5">
          <div className="text-xs text-zinc-500 font-mono font-semibold">
            <span>{video.views ? video.views.toLocaleString() : 0} views</span>
            <span className="mx-2">•</span>
            <span>Published {new Date(video.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Like */}
            <button
              onClick={() => handleLikeToggle("like")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full select-none transition-all cursor-pointer border ${
                userRating === "like"
                  ? "bg-red-500/15 border-red-500 text-red-400"
                  : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10"
              }`}
              title="Like this video"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{video.likes || 0}</span>
            </button>

            {/* Dislike */}
            <button
              onClick={() => handleLikeToggle("dislike")}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full select-none transition-all cursor-pointer border ${
                userRating === "dislike"
                  ? "bg-[#FF5555]/15 border-[#FF5555]/40 text-[#FF5555]"
                  : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10"
              }`}
              title="Dislike this video"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              <span>{video.dislikes || 0}</span>
            </button>

            {/* Watch Later save logic */}
            <button
              onClick={handleSaveToggle}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full select-none transition-all cursor-pointer border ${
                isSaved
                  ? "bg-blue-500/10 border-blue-500 text-blue-400"
                  : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10"
              }`}
              title="Save to Watch Later"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>

            {/* Share link copy */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("CloneTube link saved to clipboard! Share with your friends.");
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 rounded-full select-none transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Creator Channel branding box */}
        <div className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-2xl border border-white/5 relative z-10">
          <div className="flex items-center gap-3">
            <div
              onClick={() => navigate("channel", { id: video.creatorId })}
              className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-red-500/25 shadow cursor-pointer"
            >
              <img src={video.creatorAvatar} className="w-full h-full object-cover" />
            </div>

            <div>
              <h3
                onClick={() => navigate("channel", { id: video.creatorId })}
                className="text-sm font-black text-white hover:text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer leading-tight"
              >
                {video.creatorName}
                <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-zinc-950 shrink-0" />
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono font-medium mt-0.5">
                Verified CloneTube Partner Channel
              </p>
            </div>
          </div>

          <button
            onClick={handleSubscribeToggle}
            className={`px-5 py-2 text-xs font-extrabold rounded-full transition-all cursor-pointer ${
              isSubscribed
                ? "bg-white/10 hover:bg-white/15 text-white"
                : "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/10"
            }`}
          >
            {isSubscribed ? "Subscribed ✅" : "Subscribe"}
          </button>
        </div>

        {/* Gemini AI Summary Segment Panel */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-red-600/5 to-transparent border border-red-500/15 relative">
          <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Gemini AI Video Summaries
                </h3>
                <p className="text-[10px] text-zinc-500">
                  Instant smart content extracts of timestamps & takeaways.
                </p>
              </div>
            </div>

            <button
              onClick={handleAISummarize}
              disabled={aiLoading}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-[10px] font-extrabold rounded-lg text-white font-sans flex items-center gap-1.5 transition-colors cursor-pointer shadow disabled:opacity-50"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  Summarize Video
                </>
              )}
            </button>
          </div>

          {aiSummary ? (
            <div className="text-xs text-gray-300 leading-relaxed font-sans space-y-2 prose max-w-none prose-invert bg-black/20 p-3 rounded-xl border border-white/5 text-wrap">
              <p className="whitespace-pre-line">{aiSummary}</p>
            </div>
          ) : (
            <p className="text-[10px] text-zinc-500 italic text-center py-4">
              Click the AI Summarize button to parse deep molecular and transcripts insights in seconds.
            </p>
          )}
        </div>

        {/* Standard Description card block */}
        <div className="p-5 bg-zinc-900/30 rounded-2xl border border-white/5 text-xs">
          <p className="font-bold text-gray-400 uppercase tracking-widest text-[10px] mb-2 font-mono">
            Video Description
          </p>
          <div className="text-gray-300 leading-relaxed whitespace-pre-line selection:bg-red-500 selection:text-white">
            {video.description || "No description provided."}
          </div>
        </div>

        {/* Interactive comments section */}
        <div className="space-y-6 pt-4 border-t border-white/5 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <span>Comments Section ({comments.length})</span>
            </h3>

            {/* AI Moderation Toggle switch */}
            <div className="flex items-center gap-2 select-none">
              <span className="text-[10px] text-zinc-500 font-bold uppercase font-mono">
                AI Toxicity Guard
              </span>
              <button
                type="button"
                onClick={() => setAiModeration(!aiModeration)}
                className={`w-10 h-5.5 rounded-full p-0.5 transition-all relative ${
                  aiModeration ? "bg-green-500" : "bg-zinc-800"
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 bg-white rounded-full transition-transform duration-200 transform ${
                    aiModeration ? "translate-x-4.5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {commentError && (
            <div className="p-3 bg-red-600/15 border border-red-500/30 text-red-400 font-semibold rounded-lg leading-relaxed flex items-center gap-2">
              <span>🛑</span>
              <p>{commentError}</p>
            </div>
          )}

          {/* Add a comment form */}
          {currentUser ? (
            <form onSubmit={handleCommentSubmit} className="flex gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/5">
                <img src={currentUser.avatarUrl} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Express your feedback constructively..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-lg bg-zinc-900 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="h-10 px-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Comment
                </button>
              </div>
            </form>
          ) : (
            <p className="text-zinc-500 font-medium italic py-2 bg-black/10 text-center rounded-xl border border-white/5">
              Sign in to CloneTube to publish comments on this video.
            </p>
          )}

          {/* Comments board */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-zinc-500 italic py-6 text-center">
                Be the first to comments on this video stream!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-3.5 bg-zinc-900/15 border border-white/4 rounded-xl relative group">
                  {/* Left Avatar */}
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 border border-white/5 shrink-0">
                    <img referrerPolicy="no-referrer" src={comment.userAvatar} className="w-full h-full object-cover" />
                  </div>

                  {/* Comment Details */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{comment.username}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {getRelativeTime(comment.createdAt)}
                      </span>
                    </div>

                    <p className="text-gray-300 leading-relaxed text-wrap">{comment.content}</p>

                    {/* Likes and Replies trigger */}
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-zinc-500 select-none">
                      <button className="hover:text-red-400 flex items-center gap-1 transition-colors">
                        👍 {comment.likes || 0}
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => setActiveReplyId(activeReplyId === comment.id ? null : comment.id)}
                        className="hover:text-white transition-colors cursor-pointer font-semibold uppercase"
                      >
                        Reply
                      </button>
                    </div>

                    {/* Nested replies display */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="space-y-3 mt-3 pl-3 border-l-2 border-white/5">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-2.5 p-2 bg-white/2 rounded-lg">
                            <div className="w-7 h-7 rounded-full overflow-hidden bg-zinc-800 border border-white/5 shrink-0">
                              <img referrerPolicy="no-referrer" src={reply.userAvatar} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-[11px]">{reply.username}</span>
                                <span className="text-[9px] text-zinc-600 font-mono">{getRelativeTime(reply.createdAt)}</span>
                              </div>
                              <p className="text-gray-300 text-[11px] mt-0.5">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Active Reply input */}
                    {activeReplyId === comment.id && currentUser && (
                      <div className="flex gap-2 mt-3 block animate-slide-left">
                        <input
                          type="text"
                          placeholder={`Reply to ${comment.username}...`}
                          value={replyInputs[comment.id] || ""}
                          onChange={(e) =>
                            setReplyInputs({
                              ...replyInputs,
                              [comment.id]: e.target.value,
                            })
                          }
                          className="flex-1 h-8 px-2.5 rounded bg-zinc-900 border border-white/10 text-white text-xs focus:outline-none"
                        />
                        <button
                          onClick={() => handleReplySubmit(comment.id)}
                          className="h-8 px-3 bg-red-600 hover:bg-red-500 rounded text-xs font-bold text-white"
                        >
                          Send
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recommended sidebar videos */}
      <div className="w-full lg:w-96 space-y-4 shrink-0 border-t lg:border-t-0 lg:border-l border-white/5 pt-6 lg:pt-0 lg:pl-6">
        <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest pl-1 mb-3 flex items-center gap-1.5">
          <FastForward className="w-4 h-4 text-red-500" />
          Related Video Streams
        </h3>

        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <p className="text-zinc-500 text-xs italic pl-1">No other videos published.</p>
          ) : (
            recommendations.map((rec) => (
              <div
                key={rec.id}
                onClick={() => navigate("watch", { v: rec.id })}
                className="flex gap-3 group cursor-pointer transition-all hover:scale-[1.01]"
              >
                {/* Thumb */}
                <div className="w-36 h-20 rounded-xl overflow-hidden shrink-0 relative bg-zinc-900 border border-white/5">
                  <img src={rec.thumbnailUrl} alt={rec.title} className="w-full h-full object-cover" />
                  <div className="absolute right-1 bottom-1 px-1 bg-black/85 text-[8px] font-bold text-white rounded">
                    {rec.duration}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 pr-1 flex flex-col justify-center">
                  <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-red-400 transition-colors leading-tight">
                    {rec.title}
                  </h4>
                  <p className="text-[10px] text-zinc-400 mt-1 font-medium truncate">{rec.creatorName}</p>
                  <p className="text-[9px] text-zinc-500 font-mono mt-0.5">
                    {rec.views ? rec.views.toLocaleString() : 0} views • {getRelativeTime(rec.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  function getRelativeTime(ISOString: string) {
    try {
      const diffMs = Date.now() - new Date(ISOString).getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHrs < 24) {
        return diffHrs <= 0 ? "Just now" : `${diffHrs}h ago`;
      }
      return `${Math.floor(diffHrs / 24)}d ago`;
    } catch (e) {
      return "recently";
    }
  }
}
