/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  username: string;
  email: string;
  channelName: string;
  avatarUrl: string;
  bannerUrl: string;
  subscriberCount: number;
  subscriptions: string[]; // channels the user is subscribed to
  likedVideos: string[];
  dislikedVideos: string[];
  savedVideos: string[]; // Watch Later
  watchHistory: string[];
  bio: string;
  verified: boolean;
  createdAt: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string; // e.g., "12:34" or "0:45" for shorts
  views: number;
  likes: number;
  dislikes: number;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  category: string;
  tags: string[];
  aiSummary?: string;
  isShort: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  likes: number;
  createdAt: string;
  replies: Reply[];
}

export interface Reply {
  id: string;
  commentId: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface CreatorAnalytics {
  totalViews: number;
  totalSubscribers: number;
  totalVideos: number;
  totalLikes: number;
  viewsByCategory: { category: string; count: number }[];
  viewsOverTime: { date: string; views: number }[];
}

export interface Playlist {
  id: string;
  name: string;
  videoIds: string[];
  userId: string;
  createdAt: string;
}
