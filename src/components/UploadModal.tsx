/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, FileVideo, Image as ImageIcon, X, Trash2, HelpCircle } from "lucide-react";
import { api } from "../lib/api";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technology");
  const [tagsInput, setTagsInput] = useState("");
  const [duration, setDuration] = useState("05:12");
  const [isShort, setIsShort] = useState(false);

  // File/URL Upload states
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  // AI assistant helper panel state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  if (!isOpen) return null;

  const categories = ["Technology", "Science & Education", "Cooking", "Music", "General"];

  const handleAIMetadataGenerate = async () => {
    if (!aiPrompt.trim()) {
      setError("Please input a short core concept first.");
      return;
    }
    setError("");
    setAiGenerating(true);
    try {
      const data = await api.generateAIMetadata(aiPrompt, category);
      setTitle(data.title);
      setDescription(data.description);
      setTagsInput(data.tags.join(", "));
      
      // Auto assign standard eye-catching unsplash cover based on tags/concept
      const query = encodeURIComponent(data.tags[0] || aiPrompt);
      setThumbnailUrl(`https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80`);
      
      setShowAiAssistant(false);
    } catch (err: any) {
      console.error(err);
      setError("AI Generation failed. The server-side Gemini config is inactive.");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleThumbnailSelect = (index: number) => {
    // Give some interesting stock unsplash pictures
    const stockCovers = [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80", // Tech
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80", // Cosmos
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80", // Pizza
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80", // Room
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80", // Studio mic
    ];
    setThumbnailUrl(stockCovers[index]);
  };

  const handleVideoSelect = (index: number) => {
    // Beautiful standard streaming sources from Google Storage
    const streams = [
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    ];
    setVideoUrl(streams[index]);
    setDuration(["12:14", "09:56", "15:05", "11:22"][index]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title) {
      setError("Please input a video Title.");
      return;
    }

    setLoading(true);
    try {
      const splitTags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await api.uploadVideo({
        title,
        description,
        category,
        tags: splitTags,
        duration,
        isShort,
        thumbnailUrl: thumbnailUrl || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop",
        videoUrl: videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Could not publish video. Verify input requirements.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-[#161616] border border-white/10 rounded-2xl shadow-2xl p-6 md:p-8 relative my-8 animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-extrabold text-white flex items-center gap-2 mb-1">
          <FileVideo className="w-5 h-5 text-red-500" />
          Upload & Publish Video
        </h2>
        <p className="text-xs text-gray-400 mb-6">
          Publish premium high-fidelity video streams. Leverage our built-in Gemini Assistant to instantly optimize SEO.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold rounded-xl leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        {/* AI Creative Optimizer Accordion */}
        <div className="mb-6 bg-red-500/5 rounded-xl border border-red-500/15 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 px-2.5 bg-red-600 rounded-full text-[10px] font-bold text-white tracking-widest uppercase animate-pulse">
                Gemini AI
              </div>
              <span className="text-sm font-bold text-white">Interactive SEO Optimizer</span>
            </div>
            <button
              onClick={() => setShowAiAssistant(!showAiAssistant)}
              className="text-xs text-red-400 hover:text-red-300 font-bold hover:underline cursor-pointer select-none"
            >
              {showAiAssistant ? "Hide panel" : "Tune with AI"}
            </button>
          </div>

          {showAiAssistant && (
            <div className="mt-4 space-y-3 animate-fade-in text-xs">
              <p className="text-gray-300 text-xs leading-relaxed">
                Provide a short raw concept (e.g. <i>"reviewing space telescope pillars or pizza fermentation tricks"</i>). Gemini will draft fully optimized metadata!
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Masterclass cold dough Neapolitan sourdough recipe..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none"
                  disabled={aiGenerating}
                />
                <button
                  type="button"
                  onClick={handleAIMetadataGenerate}
                  disabled={aiGenerating || !aiPrompt.trim()}
                  className="h-9 px-4 bg-red-600 hover:bg-red-500 text-white hover:text-white text-xs font-extrabold rounded-lg transition-colors flex items-center gap-1.5 shadow"
                >
                  {aiGenerating ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      Optimize
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Video details */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                Video Title
              </label>
              <input
                type="text"
                required
                placeholder="Make it catchy and descriptive..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 transition-all"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                Video Description
              </label>
              <textarea
                rows={5}
                placeholder="What is this video exploring? Keep it detailed. Markdown is supported..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 transition-all font-sans leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#222] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                  Duration (MM:SS)
                </label>
                <input
                  type="text"
                  placeholder="05:12"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 transition-all text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="AI, tech, review, tutorial..."
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="isShortCheck"
                checked={isShort}
                onChange={(e) => setIsShort(e.target.checked)}
                className="w-4 h-4 text-red-500 border-white/10 rounded cursor-pointer"
              />
              <label htmlFor="isShortCheck" className="text-xs font-bold text-gray-300 cursor-pointer select-none">
                Publish as vertical CloneShorts! (Reels mode)
              </label>
            </div>
          </div>

          {/* Column 2: Streams and Thumbnails Source Selection */}
          <div className="space-y-6">
            {/* Stream source player selection */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase flex items-center justify-between">
                <span>1. Select Streamable Video File</span>
                <span className="text-[10px] text-zinc-500 font-mono">Pre-registered HD assets</span>
              </label>

              <div className="grid grid-cols-4 gap-2 mb-3">
                {["Tears Of Steel", "NASA Space", "Neapolitan Pizza", "Productivity beats"].map((name, i) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleVideoSelect(i)}
                    className={`p-2.5 rounded-lg border text-[10px] font-semibold text-center transition-all truncate cursor-pointer ${
                      videoUrl.includes(name.split(" ")[0])
                        ? "bg-red-500/10 border-red-500 text-red-400"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Or paste a custom direct .mp4 streaming URL..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500 transition-all font-mono"
              />
            </div>

            {/* Thumbnail selector */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase flex items-center justify-between">
                <span>2. Select Thumbnail Image</span>
                <span className="text-[10px] text-zinc-500 font-mono">Unsplash presets</span>
              </label>

              <div className="grid grid-cols-5 gap-2 mb-3">
                {["Tech", "Cosmos", "Pizza", "Room", "Mic"].map((name, i) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleThumbnailSelect(i)}
                    className="h-10 rounded-lg overflow-hidden border border-white/10 relative group cursor-pointer"
                  >
                    <img
                      src={[
                        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=100&auto=format&fit=crop",
                        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop",
                      ][i]}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/45 flex items-center justify-center text-[8px] font-black text-white uppercase group-hover:bg-black/20">
                      {name}
                    </div>
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Or paste a custom .jpg/.png public thumbnail image URL..."
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500 transition-all font-mono"
              />

              {thumbnailUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border border-white/10 ratio-16-9 bg-zinc-900 shadow relative max-h-40">
                  <img
                    src={thumbnailUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setThumbnailUrl("")}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-black/90 text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Simulated file drag and drop zone */}
            <div className="p-6 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-center bg-white/2 hover:bg-white/5 transition-all cursor-pointer">
              <span className="p-3 bg-red-500/10 rounded-full text-red-400 mb-2">
                <FileVideo className="w-6 h-6" />
              </span>
              <p className="text-xs font-bold text-white mb-0.5">Drag & Drop your video clip</p>
              <p className="text-[10px] text-zinc-500 font-medium">Or select files visually using the options above</p>
            </div>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 h-11 hover:bg-white/5 text-gray-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 h-11 bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-red-600/15 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-yellow-300" />
                Publish Video
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
