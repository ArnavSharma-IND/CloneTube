/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { RouterProvider, useRouter } from "./context/RouterContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import AuthModal from "./components/AuthModal";
import UploadModal from "./components/UploadModal";

// Views
import VideoGrid from "./components/VideoGrid";
import ShortsViewer from "./components/ShortsViewer";
import WatchPage from "./components/WatchPage";
import StudioDashboard from "./components/StudioDashboard";
import ChannelPage from "./components/ChannelPage";
import Library from "./components/Library";

import { Video } from "./types";
import { api } from "./lib/api";

function AppContent() {
  const { view, params, navigate } = useRouter();
  const { currentUser } = useAuth();

  // Sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Modal states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Search & Curation filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Dynamic videos database state
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial data loader on mounting and on updates
  const loadVideos = async () => {
    setLoading(true);
    try {
      const resp = await api.getVideos({
        category: activeCategory !== "All" ? activeCategory : undefined,
        search: searchQuery || undefined,
        isShort: view === "shorts" ? true : false,
      });
      setVideos(resp.videos || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, [activeCategory, searchQuery, view]);

  // Synchronize router parameters with our locally filtered searches
  useEffect(() => {
    if (params.search) {
      setSearchQuery(params.search);
    } else {
      setSearchQuery("");
    }
  }, [params]);

  // View renderer helper
  const renderView = () => {
    switch (view) {
      case "home":
        return (
          <VideoGrid
            videos={videos}
            loading={loading}
            activeCategory={activeCategory}
            onFilterCategory={(cat) => {
              setActiveCategory(cat);
              setSearchQuery("");
            }}
            searchQuery={searchQuery}
          />
        );
      case "shorts":
        return <ShortsViewer />;
      case "watch":
        return <WatchPage />;
      case "studio":
        return <StudioDashboard />;
      case "channel":
        return <ChannelPage />;
      case "library":
        return <Library />;
      default:
        return (
          <div className="flex-1 flex items-center justify-center font-mono text-zinc-500 text-xs">
            404 - Cosmic View Not Found
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-dark-theme-bg text-[#F1F1F1] flex flex-col antialiased selection:bg-red-500 selection:text-white">
      {/* Header bar */}
      <Header
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onSearch={(q) => {
          setSearchQuery(q);
          setActiveCategory("All");
          navigate("home", { search: q });
        }}
        searchVal={searchQuery}
        setSearchVal={setSearchQuery}
      />

      {/* Main Container */}
      <div className="flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          activeCategory={activeCategory}
          onFilterCategory={(cat) => {
            setActiveCategory(cat);
            setSearchQuery("");
          }}
        />

        {/* Dynamic page contents block */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-dark-theme-bg relative scrollbar-none">
          {renderView()}
        </main>
      </div>

      {/* Overlays / Portals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          loadVideos();
          navigate("studio");
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </AuthProvider>
  );
}
