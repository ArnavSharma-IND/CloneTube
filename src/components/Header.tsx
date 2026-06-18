/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Search, Mic, Video, LogIn, LogOut, User as UserIcon, LayoutDashboard, Compass, Sparkles, Sliders, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "../context/RouterContext";
import { api } from "../lib/api";

interface HeaderProps {
  onSearch: (query: string, category?: string) => void;
  onOpenAuth: () => void;
  onOpenUpload: () => void;
  toggleSidebar: () => void;
  searchVal: string;
  setSearchVal: (val: string) => void;
}

export default function Header({
  onSearch,
  onOpenAuth,
  onOpenUpload,
  toggleSidebar,
  searchVal,
  setSearchVal,
}: HeaderProps) {
  const { currentUser, signOut, easyLogin } = useAuth();
  const { navigate, view } = useRouter();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceInput, setVoiceInput] = useState("");
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
  };

  const handleVoiceSearchSubmit = async () => {
    if (!voiceInput.trim()) return;
    setVoiceProcessing(true);
    try {
      const data = await api.parseAIVoiceQuery(voiceInput);
      setSearchVal(data.searchQuery);
      onSearch(data.searchQuery, data.category);
      setShowVoiceModal(false);
    } catch (err) {
      console.error(err);
      onSearch(voiceInput);
      setShowVoiceModal(false);
    } finally {
      setVoiceProcessing(false);
      setVoiceInput("");
    }
  };

  const handleEasyLoginClick = async (profile: "tech" | "chef" | "space" | "lofi") => {
    try {
      await easyLogin(profile);
      setSearchVal("");
      onSearch("");
    } catch (err) {
      console.error("Quick login failed", err);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex flex-col w-full bg-dark-theme-bg/85 backdrop-blur-md border-b border-white/5 px-4 py-2">
      <div className="flex items-center justify-between h-14 gap-4">
        {/* Logo Section */}
        <div className="flex items-center gap-3 min-w-max">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-white/10 rounded-full text-gray-300 transition-colors cursor-pointer"
            id="sidebar-toggle-btn"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div
            onClick={() => {
              setSearchVal("");
              onSearch("");
              navigate("home");
            }}
            className="flex items-center gap-1.5 cursor-pointer group"
          >
            <div className="flex items-center justify-center w-8.5 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-lg shadow-lg group-hover:scale-105 transition-transform">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tighter text-white">
              Clone<span className="text-red-500">Tube</span>
            </span>
          </div>
        </div>

        {/* Action Center - Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg md:max-w-2xl px-2">
          <div className="flex items-center w-full">
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                placeholder="Search Videos, Creators, Tags..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full h-10 px-4 pr-10 rounded-l-full bg-[#181818] border border-white/10 focus:border-red-500/50 text-white placeholder-gray-400 focus:outline-none focus:bg-[#202020] transition-all text-sm"
              />
              {searchVal && (
                <button
                  type="button"
                  onClick={() => setSearchVal("")}
                  className="absolute right-3 text-gray-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="h-10 px-6 bg-white/5 border border-l-0 border-white/10 rounded-r-full hover:bg-white/10 text-gray-300 transition-all cursor-pointer flex items-center justify-center shadow-inner"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setVoiceInput("");
                setShowVoiceModal(true);
              }}
              className="ml-3 p-2.5 h-10 w-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-gray-300 rounded-full transition-all cursor-pointer"
              title="Search with smart voice parsing"
            >
              <Mic className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </form>

        {/* User / Authentication Center */}
        <div className="flex items-center gap-2 min-w-max">
          {currentUser ? (
            <>
              {/* Creator upload button */}
              <button
                onClick={onOpenUpload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-semibold rounded-full select-none cursor-pointer shadow transition-all"
              >
                <Video className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload</span>
              </button>

              {/* Creator dashboard link */}
              <button
                onClick={() => navigate("studio")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold select-none cursor-pointer transition-all ${
                  view === "studio"
                    ? "bg-white/15 text-white"
                    : "bg-white/5 hover:bg-white/10 text-gray-300"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Studio</span>
              </button>

              {/* Dropdown Menu */}
              <div className="relative animate-fade-in" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-9 h-9 rounded-full border-2 border-red-500/30 hover:border-red-500 transition-colors cursor-pointer overflow-hidden"
                >
                  <img
                    referrerPolicy="no-referrer"
                    src={currentUser.avatarUrl}
                    alt={currentUser.channelName}
                    className="w-full h-full object-cover"
                  />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 glass-panel rounded-xl shadow-2xl overflow-hidden py-1 border border-white/10">
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-semibold text-white truncate">
                        {currentUser.channelName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        @{currentUser.username}
                      </p>
                      {currentUser.subscriberCount > 0 && (
                        <p className="text-[10px] text-red-400 font-medium mt-0.5">
                          {currentUser.subscriberCount.toLocaleString()} Subscriber
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("channel", { id: currentUser.id });
                      }}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-300 hover:bg-white/5 text-left transition-colors cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      My Channel
                    </button>

                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("studio");
                      }}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-300 hover:bg-white/5 text-left transition-colors cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      Creator Studio
                    </button>

                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("library");
                      }}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-300 hover:bg-white/5 text-left transition-colors cursor-pointer"
                    >
                      <Compass className="w-4 h-4 text-gray-400" />
                      My Library
                    </button>

                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        signOut();
                        navigate("home");
                      }}
                      className="flex items-center gap-2.5 w-full px-4 py-2 mt-1 text-sm text-red-400 hover:bg-red-500/10 text-left border-t border-white/5 transition-colors cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-4 py-1.8 border border-red-500/50 hover:bg-red-500/10 text-red-500 hover:text-red-400 text-xs font-semibold rounded-full select-none cursor-pointer transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Quick / Seed Account Login Bar (Only visible if signed out) */}
      {!currentUser && (
        <div className="flex flex-wrap items-center gap-2 mt-1 mb-1 py-1 border-t border-white/5 text-xs text-gray-400">
          <span className="font-medium mr-1 flex items-center gap-1 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
            Quick Creator Demoroles:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleEasyLoginClick("tech")}
              className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/25 border border-blue-500/20 text-blue-400 rounded-full text-[10px] font-semibold cursor-pointer transition-all"
            >
              💻 TechNexus AI
            </button>
            <button
              onClick={() => handleEasyLoginClick("chef")}
              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/20 text-amber-400 rounded-full text-[10px] font-semibold cursor-pointer transition-all"
            >
              🍕 Chef Elite
            </button>
            <button
              onClick={() => handleEasyLoginClick("space")}
              className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/20 text-purple-400 rounded-full text-[10px] font-semibold cursor-pointer transition-all"
            >
              🌌 Cosmic Wanderer
            </button>
            <button
              onClick={() => handleEasyLoginClick("lofi")}
              className="px-2.5 py-1 bg-teal-500/10 hover:bg-teal-500/25 border border-teal-500/20 text-teal-400 rounded-full text-[10px] font-semibold cursor-pointer transition-all"
            >
              🎧 Lofi Beats
            </button>
          </div>
        </div>
      )}

      {/* Voice Search Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#181818] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Mic className="w-4 h-4 text-red-500 animate-pulse" />
                Smart Gemini Voice Search
              </h3>
              <button
                onClick={() => setShowVoiceModal(false)}
                className="text-gray-400 hover:text-white"
                disabled={voiceProcessing}
              >
                ✕
              </button>
            </div>
            
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Gemini translates unstructured speech/talk commands (e.g. <i>"show me space stuff that NASA shot in UHD"</i>) into highly targeted search keyword tags and proper categories.
            </p>

            <textarea
              rows={3}
              placeholder="Speak or type what you're looking for (e.g. 'Show me a pizza sourdough masterclass recipe' or 'find space pillars')..."
              value={voiceInput}
              onChange={(e) => setVoiceInput(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#222] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 text-sm mb-4"
              disabled={voiceProcessing}
              autoFocus
            />

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowVoiceModal(false)}
                className="px-4 py-2 hover:bg-white/5 text-gray-300 text-xs font-semibold rounded-lg transition-colors"
                disabled={voiceProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVoiceSearchSubmit}
                disabled={voiceProcessing || !voiceInput.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow disabled:opacity-50"
              >
                {voiceProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Gemini Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    Process Voice Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
