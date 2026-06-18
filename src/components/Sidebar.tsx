/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Home, Compass, FolderHeart, LayoutDashboard, History, CheckSquare, Sparkles, Youtube, Flame, GraduationCap, Popcorn, Music2 } from "lucide-react";
import { useRouter } from "../context/RouterContext";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onFilterCategory: (category: string) => void;
  activeCategory: string;
}

export default function Sidebar({ isOpen, onFilterCategory, activeCategory }: SidebarProps) {
  const { navigate, view } = useRouter();
  const { currentUser } = useAuth();

  const mainNavItems = [
    { view: "home" as const, label: "Home Feed", icon: Home },
    { view: "shorts" as const, label: "Shorts player", icon: Compass },
    { view: "library" as const, label: "My Library", icon: FolderHeart },
    { view: "studio" as const, label: "Creator Studio", icon: LayoutDashboard },
  ];

  const exploreCategories = [
    { label: "Trending", category: "All", icon: Flame },
    { label: "Technology", category: "Technology", icon: Youtube },
    { label: "Science", category: "Science & Education", icon: GraduationCap },
    { label: "Cooking", category: "Cooking", icon: Popcorn },
    { label: "Music", category: "Music", icon: Music2 },
  ];

  if (!isOpen) return null;

  return (
    <aside className="w-64 bg-dark-theme-bg border-r border-white/5 h-[calc(100vh-3.5rem)] overflow-y-auto p-3 shrink-0 hidden md:block select-none scrollbar-thin scrollbar-thumb-zinc-800">
      {/* Navigation Group 1 */}
      <div className="space-y-1 mb-4 pb-4 border-b border-white/5">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = view === item.view;
          return (
            <button
              key={item.view}
              onClick={() => navigate(item.view)}
              className={`flex items-center gap-4 w-full px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-red-500/10 text-red-500 font-semibold"
                  : "text-gray-300 hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${isActive ? "text-red-500" : "text-gray-400"}`} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Explore Category Quick Filter */}
      <div className="mb-4 pb-4 border-b border-white/5">
        <p className="text-xs font-bold text-gray-500 px-3 mb-2 uppercase tracking-wider">
          Explore Categories
        </p>
        <div className="space-y-1">
          {exploreCategories.map((cat) => {
            const Icon = cat.icon;
            const isFilterActive = activeCategory === cat.category;
            return (
              <button
                key={cat.label}
                onClick={() => {
                  onFilterCategory(cat.category);
                  navigate("home");
                }}
                className={`flex items-center gap-4 w-full px-3 py-2 rounded-xl text-left text-xs font-medium transition-all cursor-pointer ${
                  isFilterActive && view === "home"
                    ? "bg-red-500/10 text-red-500 font-semibold"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isFilterActive && view === "home" ? "text-red-500" : "text-gray-400"}`} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subscriptions Hub (Only show if logged in and has subscriptions) */}
      {currentUser && (
        <div className="space-y-1">
          <p className="text-xs font-bold text-gray-500 px-3 mb-2 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            Subscriptions
          </p>
          {currentUser.subscriptions && currentUser.subscriptions.length > 0 ? (
            <div className="space-y-1">
              {currentUser.subscriptions.map((subId) => {
                // Map creator channels nicely
                const mapSeedCreators: Record<string, { name: string; avatar: string }> = {
                  "creator-technexus": {
                    name: "TechNexus AI",
                    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop",
                  },
                  "creator-chef": {
                    name: "Chef Elite",
                    avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=80&auto=format&fit=crop",
                  },
                  "creator-cosmic": {
                    name: "Cosmic Wanderer",
                    avatar: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=80&auto=format&fit=crop",
                  },
                  "creator-lofi": {
                    name: "Lofi Beats Studio",
                    avatar: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=80&auto=format&fit=crop",
                  },
                };
                const profile = mapSeedCreators[subId] || {
                  name: "Seeded Creator",
                  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop",
                };

                return (
                  <button
                    key={subId}
                    onClick={() => navigate("channel", { id: subId })}
                    className="flex items-center gap-3 w-full px-3 py-1.8 rounded-xl text-left text-xs text-gray-300 hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-6.5 h-6.5 rounded-full object-cover border border-white/5"
                    />
                    <span className="truncate">{profile.name}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-[10px] text-gray-500 px-3 italic">
              Subscribe to channels to see them here!
            </p>
          )}
        </div>
      )}

      {/* Copywrite notice */}
      <div className="mt-8 pt-4 border-t border-white/5 px-3">
        <p className="text-[10px] text-gray-600 leading-relaxed font-mono">
          CloneTube Premium v1.4.2
          <br />
          Joint Gemini API Pipeline
          <br />
          © 2026 CloneTube Org.
        </p>
      </div>
    </aside>
  );
}
