/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ViewType = "home" | "watch" | "channel" | "studio" | "shorts" | "library";

interface RouterContextType {
  view: ViewType;
  params: Record<string, string>;
  navigate: (view: ViewType, params?: Record<string, string>) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewType>("home");
  const [params, setParams] = useState<Record<string, string>>({});

  // Parse current URL on load and popstate
  const parseUrl = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const viewParam = searchParams.get("view") as ViewType;
    
    const parsedParams: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      if (key !== "view") {
        parsedParams[key] = val;
      }
    });

    if (viewParam && ["home", "watch", "channel", "studio", "shorts", "library"].includes(viewParam)) {
      setView(viewParam);
    } else {
      setView("home");
    }
    setParams(parsedParams);
  };

  useEffect(() => {
    parseUrl();
    window.addEventListener("popstate", parseUrl);
    return () => window.removeEventListener("popstate", parseUrl);
  }, []);

  const navigate = (newView: ViewType, newParams: Record<string, string> = {}) => {
    const searchParams = new URLSearchParams();
    searchParams.set("view", newView);
    Object.entries(newParams).forEach(([key, val]) => {
      searchParams.set(key, val);
    });

    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.pushState({}, "", newUrl);
    setView(newView);
    setParams(newParams);
  };

  return (
    <RouterContext.Provider value={{ view, params, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return context;
}
