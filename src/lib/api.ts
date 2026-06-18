/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Video, Comment, Reply, CreatorAnalytics } from "../types";

const TOKEN_KEY = "clonetube_session_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Request dispatcher
async function request<T>(
  url: string,
  method = "GET",
  body?: any,
  customHeaders: Record<string, string> = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "An unexpected error occurred");
  }

  return data as T;
}

export const api = {
  // Auth
  async register(payload: any): Promise<{ token: string; user: User }> {
    const data = await request<{ token: string; user: User }>("/api/auth/register", "POST", payload);
    saveStoredToken(data.token);
    return data;
  },

  async login(payload: any): Promise<{ token: string; user: User }> {
    const data = await request<{ token: string; user: User }>("/api/auth/login", "POST", payload);
    saveStoredToken(data.token);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>("/api/auth/me");
  },

  // Videos
  async getVideos(params: {
    search?: string;
    category?: string;
    isShort?: boolean;
    creatorId?: string;
  } = {}): Promise<{ videos: Video[] }> {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.category) query.append("category", params.category);
    if (params.isShort !== undefined) query.append("isShort", params.isShort ? "true" : "false");
    if (params.creatorId) query.append("creatorId", params.creatorId);

    return request<{ videos: Video[] }>(`/api/videos?${query.toString()}`);
  },

  async getVideo(id: string): Promise<{ video: Video }> {
    return request<{ video: Video }>(`/api/videos/${id}`);
  },

  async uploadVideo(videoData: any): Promise<{ video: Video }> {
    return request<{ video: Video }>("/api/videos", "POST", videoData);
  },

  async deleteVideo(id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/videos/${id}`, "DELETE");
  },

  async rateVideo(id: string, action: "like" | "dislike" | "remove"): Promise<{ likes: number; dislikes: number; userRating: string }> {
    return request<{ likes: number; dislikes: number; userRating: string }>(`/api/videos/${id}/rate`, "POST", { action });
  },

  // Comments
  async getComments(videoId: string): Promise<{ comments: Comment[] }> {
    return request<{ comments: Comment[] }>(`/api/videos/${videoId}/comments`);
  },

  async createComment(videoId: string, content: string, enableAIModeration: boolean): Promise<{ comment: Comment }> {
    return request<{ comment: Comment }>(`/api/videos/${videoId}/comments`, "POST", { content, enableAIModeration });
  },

  async replyToComment(commentId: string, content: string): Promise<{ reply: Reply }> {
    return request<{ reply: Reply }>(`/api/comments/${commentId}/replies`, "POST", { content });
  },

  // Library/Progress saving
  async getLibrary(): Promise<{ watchHistory: Video[]; likedVideos: Video[]; savedVideos: Video[] }> {
    return request<{ watchHistory: Video[]; likedVideos: Video[]; savedVideos: Video[] }>("/api/users/library");
  },

  async toggleSaveVideo(videoId: string): Promise<{ saved: boolean }> {
    return request<{ saved: boolean }>("/api/users/save-video", "POST", { videoId });
  },

  // Channels
  async getChannel(id: string): Promise<{ channel: any; videos: Video[]; isSubscribed: boolean }> {
    return request<{ channel: any; videos: Video[]; isSubscribed: boolean }>(`/api/channels/${id}`);
  },

  async updateMyChannel(channelData: { channelName?: string; bio?: string; bannerUrl?: string; avatarUrl?: string }): Promise<{ user: User }> {
    return request<{ user: User }>("/api/channels/me", "PUT", channelData);
  },

  async toggleSubscribe(channelId: string): Promise<{ subscribed: boolean; subscriberCount: number }> {
    return request<{ subscribed: boolean; subscriberCount: number }>(`/api/channels/${channelId}/subscribe`, "POST");
  },

  // Analytics
  async getCreatorAnalytics(): Promise<{ analytics: CreatorAnalytics }> {
    return request<{ analytics: CreatorAnalytics }>("/api/creator/analytics");
  },

  /* =========================================
     🤖 DYNAMIC GEMINI AI API ASSISTERS
     ========================================= */

  async getAISummary(videoId: string): Promise<{ summary: string }> {
    return request<{ summary: string }>("/api/gemini/summarize", "POST", { videoId });
  },

  async generateAIMetadata(prompt: string, category: string): Promise<{ title: string; description: string; tags: string[] }> {
    return request<{ title: string; description: string; tags: string[] }>("/api/gemini/generate-metadata", "POST", { prompt, category });
  },

  async parseAIVoiceQuery(speechText: string): Promise<{ searchQuery: string; category: string }> {
    return request<{ searchQuery: string; category: string }>("/api/gemini/voice-search", "POST", { speechText });
  },

  async getAIRecommendations(): Promise<{ recommendations: { videoId: string; reason: string }[] }> {
    return request<{ recommendations: { videoId: string; reason: string }[] }>("/api/gemini/recommendations");
  }
};
