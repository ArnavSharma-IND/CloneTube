/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { CheckCircle, Sparkles, Sliders, Play, Edit3, Loader2, Compass } from "lucide-react";
import { useRouter } from "../context/RouterContext";
import { useAuth } from "../context/AuthContext";
import { Video } from "../types";
import { api } from "../lib/api";

export default function ChannelPage() {
  const { params, navigate } = useRouter();
  const { currentUser, updateUser } = useAuth();
  const creatorId = params.id;

  const [channelData, setChannelData] = useState<any | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editBio, setEditBio] = useState("");

  useEffect(() => {
    if (!creatorId) return;

    async function loadChannelDetails() {
      setLoading(true);
      setError("");
      try {
        const resp = await api.getChannel(creatorId);
        setChannelData(resp.channel);
        setVideos(resp.videos || []);
        setIsSubscribed(resp.isSubscribed);
        setEditBio(resp.channel.bio || "");
      } catch (err) {
        console.error(err);
        setError("Could not locate this channel creator profile.");
      } finally {
        setLoading(false);
      }
    }
    loadChannelDetails();
  }, [creatorId, currentUser]);

  const handleSubscribeToggle = async () => {
    if (!currentUser || !channelData) return;
    try {
      const resp = await api.toggleSubscribe(channelData.id);
      setIsSubscribed(resp.subscribed);
      setChannelData({
        ...channelData,
        subscriberCount: resp.subscriberCount,
      });

      // Sync active auth user channels
      const updatedUser = { ...currentUser };
      updatedUser.subscriptions = updatedUser.subscriptions || [];
      if (resp.subscribed) {
        updatedUser.subscriptions.push(channelData.id);
      } else {
        updatedUser.subscriptions = updatedUser.subscriptions.filter((id) => id !== channelData.id);
      }
      updateUser(updatedUser);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBio = async () => {
    if (!channelData) return;
    try {
      const resp = await api.updateMyChannel({ bio: editBio });
      setChannelData({
        ...channelData,
        bio: editBio,
      });
      setIsEditingBio(false);
      
      if (currentUser) {
        const updated = { ...currentUser, bio: editBio };
        updateUser(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isMyProfile = currentUser && channelData && currentUser.id === channelData.id;

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-center uppercase tracking-widest font-mono font-bold col-span-full">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin mb-3" />
        <span className="text-xs text-gray-500">Loading channel dashboard...</span>
      </div>
    );
  }

  if (error || !channelData) {
    return (
      <div className="flex-1 p-6 text-center py-20 bg-zinc-950 m-6 rounded-2xl">
        <p className="text-sm text-red-400 font-bold font-mono mb-4">⚠️ {error || "Channel Not Found"}</p>
        <button
          onClick={() => navigate("home")}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-full text-white text-xs"
        >
          Back to Feed
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto font-sans">
      {/* Dynamic Background Banner Canvas */}
      <div className="w-full h-36 md:h-48 rounded-2xl overflow-hidden border border-white/5 relative bg-zinc-900 group">
        <img src={channelData.bannerUrl} alt="Channel Cover Banner" className="w-full h-full object-cover" />
      </div>

      {/* Profile Branding Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-5 p-1">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-20 h-20 rounded-full border-3 border-red-500/30 overflow-hidden bg-zinc-900 shrink-0 select-none">
            <img src={channelData.avatarUrl} alt={channelData.channelName} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-1">
            <h1 className="text-lg md:text-xl font-extrabold text-white flex items-center justify-center sm:justify-start gap-1.5 leading-none">
              {channelData.channelName}
              {channelData.verified && <CheckCircle className="w-4 h-4 text-blue-500 fill-zinc-950" />}
            </h1>
            <p className="text-xs text-gray-400 font-medium font-mono">
              @{channelData.channelName.toLowerCase().replace(/\s/g, "")}
            </p>
            <div className="text-[11px] text-zinc-500 font-mono">
              <span>{channelData.subscriberCount ? channelData.subscriberCount.toLocaleString() : 0} subscribers</span>
              <span className="mx-2">•</span>
              <span>{videos.length} videos published</span>
            </div>
          </div>
        </div>

        {/* Subscribe Trigger vs Profile Edits */}
        <div className="shrink-0 flex items-center justify-end gap-2">
          {isMyProfile ? (
            <button
              onClick={() => navigate("studio")}
              className="flex items-center gap-1.5 px-4 h-9.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-bold rounded-full select-none cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              Creator Studio specs
            </button>
          ) : (
            <button
              onClick={handleSubscribeToggle}
              className={`px-5 py-2.5 text-xs font-extrabold rounded-full select-none transition-all cursor-pointer ${
                isSubscribed
                  ? "bg-white/10 hover:bg-white/15 text-white"
                  : "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/10"
              }`}
            >
              {isSubscribed ? "Subscribed ✅" : "Subscribe"}
            </button>
          )}
        </div>
      </div>

      {/* Biography (About) section */}
      <div className="p-5 bg-zinc-900/30 rounded-2xl border border-white/5 space-y-3.5">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest font-mono">
            About {channelData.channelName}
          </h3>
          {isMyProfile && !isEditingBio && (
            <button
              onClick={() => setIsEditingBio(true)}
              className="text-[10px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              Edit bio
            </button>
          )}
        </div>

        {isEditingBio ? (
          <div className="space-y-3">
            <textarea
              rows={3}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="w-full p-3 bg-zinc-900 rounded-lg border border-white/10 text-xs focus:outline-none focus:border-red-500"
            />
            <div className="flex justify-end gap-2 text-[10px]">
              <button onClick={() => setIsEditingBio(false)} className="px-3 hover:bg-white/5 rounded text-gray-400">
                Cancel
              </button>
              <button onClick={handleUpdateBio} className="px-4.5 py-1.5 bg-red-600 text-white rounded font-bold">
                Save Bio
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-300 leading-relaxed font-medium">
            {channelData.bio || `Welcome to ${channelData.channelName}. We feature modern content discovery workflows with HD feeds.`}
          </p>
        )}
      </div>

      {/* Video catalog grids */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">
          Published Catalog items ({videos.length})
        </h3>

        {videos.length === 0 ? (
          <div className="py-16 text-center italic text-xs text-zinc-500 bg-zinc-950 rounded-2xl">
            This channel hasn't uploaded any content yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((v) => (
              <div
                key={v.id}
                onClick={() => navigate("watch", { v: v.id })}
                className="group cursor-pointer space-y-2"
              >
                <div className="ratio-16-9 rounded-xl overflow-hidden relative shadow bg-zinc-900 border border-white/5">
                  <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                  <span className="absolute right-1.5 bottom-1.5 px-1.5 bg-black/85 text-[10px] font-bold text-white rounded">
                    {v.duration}
                  </span>
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>
                <div className="px-1 shrink-0">
                  <h4 className="text-xs font-bold leading-snug text-white line-clamp-2 pr-2 group-hover:text-red-400">
                    {v.title}
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-mono mt-1 font-semibold">
                    {v.views ? v.views.toLocaleString() : 0} views • Published recently
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
