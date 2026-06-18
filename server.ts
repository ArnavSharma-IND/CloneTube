/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body parsing for high-volume uploads (base64 pictures/videos)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Setup Gemini client
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const ai = GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Initialize Database Storage
const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "database.json");

interface DatabaseSchema {
  users: any[];
  videos: any[];
  comments: any[];
  playlists: any[];
}

// Ensure database exists with high-quality default seed data
function initDatabase() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
      if (data.users && data.videos && data.comments) {
        return data;
      }
    } catch (e) {
      console.error("Error reading database, re-initializing", e);
    }
  }

  // Prepopulated Seed Data
  const seedUsers = [
    {
      id: "creator-technexus",
      username: "technexus",
      email: "technexus@clonetube.ai",
      passwordHash: crypto.createHash("sha256").update("tech123").digest("hex"),
      channelName: "TechNexus AI",
      avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      subscriberCount: 234500,
      subscriptions: ["creator-cosmic"],
      likedVideos: ["v-pizza-perfect"],
      dislikedVideos: [],
      savedVideos: [],
      watchHistory: ["v-pizza-perfect"],
      bio: "Your hub for artificial intelligence, next-gen hardware, and premium tech breakdowns. Uploads every Tuesday and Friday.",
      verified: true,
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "creator-chef",
      username: "chefelite",
      email: "chef@clonetube.ai",
      passwordHash: crypto.createHash("sha256").update("chef123").digest("hex"),
      channelName: "Chef Elite",
      avatarUrl: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&auto=format&fit=crop&q=80",
      subscriberCount: 89600,
      subscriptions: ["creator-technexus"],
      likedVideos: ["v-gemini-revolution"],
      dislikedVideos: [],
      savedVideos: [],
      watchHistory: ["v-gemini-revolution"],
      bio: "Unlocking culinary secrets. We present fine dining methodologies styled for home cooks. Join the gastronomy revolution!",
      verified: true,
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "creator-cosmic",
      username: "cosmic",
      email: "cosmic@clonetube.ai",
      passwordHash: crypto.createHash("sha256").update("space123").digest("hex"),
      channelName: "Cosmic Wanderer",
      avatarUrl: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=150&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
      subscriberCount: 154000,
      subscriptions: ["creator-chef"],
      likedVideos: [],
      dislikedVideos: [],
      savedVideos: [],
      watchHistory: [],
      bio: "A cinematic voyage through deep space, cosmic mysteries, astrophysics, and standard cosmological predictions. Verified facts.",
      verified: true,
      createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "creator-lofi",
      username: "lofibox",
      email: "lofi@clonetube.ai",
      passwordHash: crypto.createHash("sha256").update("lofi123").digest("hex"),
      channelName: "Lofi Beats Studio",
      avatarUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=150&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80",
      subscriberCount: 421000,
      subscriptions: [],
      likedVideos: [],
      dislikedVideos: [],
      savedVideos: [],
      watchHistory: [],
      bio: "Relaxing beatscapes, focus sound, ambient sound, curated precisely for technical developers and students.",
      verified: false,
      createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ];

  const seedVideos = [
    {
      id: "v-gemini-revolution",
      title: "AI Revolution 2026: Designing with Gemini 1.5 & Multi-Modal Frameworks",
      description: "Dive deep into modern artificial intelligence. We explore multi-modal inputs, system reasoning, contextual tokens, and practical demonstrations of deploying high-performance server-side capabilities.\n\nTimestamps:\n0:00 - Introduction\n2:15 - Multi-Dimensional Input Parsing\n6:40 - Standard Realtime SDK Demos\n10:12 - Future Predictions",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
      duration: "12:14",
      views: 74210,
      likes: 3120,
      dislikes: 12,
      creatorId: "creator-technexus",
      creatorName: "TechNexus AI",
      creatorAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
      category: "Technology",
      tags: ["AI", "Gemini", "Software Engineering", "Tech Specs"],
      isShort: false,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      aiSummary: "The video explores the significant updates of Gemini AI in 2026, highlighting multi-modal reasoning and dynamic programmatic tool call parameters. It covers server-oriented pipeline integrations and practical context window scalability, concluding that server-authoritative API routing represents a solid standard for client safety.",
    },
    {
      id: "v-cosmic-pillars",
      title: "Cradles of Stars: Flying Through the Pillars of Creation in NASA 4K",
      description: "An immersive voyage into the heart of the Eagle Nebula. Rendered using modern astronomical telemetry and James Webb Space Telescope datasets, witness the birth of solar structures inside dense molecular columns.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
      duration: "09:56",
      views: 114500,
      likes: 8900,
      dislikes: 45,
      creatorId: "creator-cosmic",
      creatorName: "Cosmic Wanderer",
      creatorAvatar: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=150&auto=format&fit=crop&q=80",
      category: "Science & Education",
      tags: ["Space", "NASA", "James Webb", "Astronomy", "Education"],
      isShort: false,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      aiSummary: "A cinematic simulation mapping NASA celestial measurements inside interstellar gas columns. The host outlines molecular composition, gas collapse mechanics, and how thermal pressures ignite nuclear fusion to forge stars inside these towering majestic cosmic structures.",
    },
    {
      id: "v-pizza-perfect",
      title: "Gourmet Neapolitan Pizza at Home: 72-Hour Cold Fermentation Masterclass",
      description: "Chef Elite reveals the absolute golden rules of perfect pizza. From double-zero flour choice, precise hydration percentages, up to micro-fermentation handling and cooking on conventional kitchen ovens.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80",
      duration: "15:05",
      views: 45100,
      likes: 2240,
      dislikes: 18,
      creatorId: "creator-chef",
      creatorName: "Chef Elite",
      creatorAvatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80",
      category: "Cooking",
      tags: ["Pizza", "Cooking", "Baking", "Masterclass", "Foodie"],
      isShort: false,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      aiSummary: "The Chef demonstrates creating a 72% hydration Neapolitan pizza dough using Type 00 high-protein flour. Keys highlighted include a slow 72-hour cold storage fermentation to yield superior gluten structures and deep complex lactic-acid notes in the finished crust.",
    },
    {
      id: "v-lofi-beats",
      title: "1 Hour Relaxing Lofi Beats for Deep Coding, Hacking & General Productivity",
      description: "Put your headphones on, open your IDE, and enjoy the perfect companion soundtrack. Curated with dusty tape vinyl crackles, laid-back instrumental drums, and subtle synth filters.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80",
      duration: "58:00",
      views: 312000,
      likes: 18600,
      dislikes: 67,
      creatorId: "creator-lofi",
      creatorName: "Lofi Beats Studio",
      creatorAvatar: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=150&auto=format&fit=crop&q=80",
      category: "Music",
      tags: ["Lofi", "Coding Beats", "Chill", "Ambient", "Instrumental"],
      isShort: false,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "v-blackhole-mystery",
      title: "Speculative Realities: Navigating the Singularity of an Active Black Hole",
      description: "What actually lies beyond the event horizon? Combining general relativity calculations with speculative particle mechanics, explore spatial distortions where time and coordinates swap places.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop&q=80",
      duration: "11:22",
      views: 92400,
      likes: 6730,
      dislikes: 21,
      creatorId: "creator-cosmic",
      creatorName: "Cosmic Wanderer",
      creatorAvatar: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=150&auto=format&fit=crop&q=80",
      category: "Science & Education",
      tags: ["Space", "Relativity", "Cosmology", "Physics", "Science"],
      isShort: false,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "s-nano-drone",
      title: "Testing the Next-Gen 15g Micro Stealth Drone!",
      description: "Checking out this incredible ultra-lightweight micro stealth drone mapping rooms using real-time infrared lasers!",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=400&auto=format&fit=crop&q=80",
      duration: "0:45",
      views: 89000,
      likes: 7400,
      dislikes: 12,
      creatorId: "creator-technexus",
      creatorName: "TechNexus AI",
      creatorAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
      category: "Technology",
      tags: ["Shorts", "Drone", "Tech", "Stealth"],
      isShort: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "s-chef-trick",
      title: "Secret Fresh Herb Preservation Trick! 🌿",
      description: "Preserve parsley, cilantro, and rosemary fresh for over a month with this quick Chef water-glass method!",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&auto=format&fit=crop&q=80",
      duration: "0:30",
      views: 124000,
      likes: 9200,
      dislikes: 54,
      creatorId: "creator-chef",
      creatorName: "Chef Elite",
      creatorAvatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80",
      category: "Cooking",
      tags: ["Shorts", "Kitchen Hacks", "Food Hacks", "Cooking Hacks"],
      isShort: true,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "s-space-sound",
      title: "Webb Captures Spooky Deep Space Resonance 😱",
      description: "Translating radio waves from around the Supermassive Black Hole in Perseus Cluster into audible sound frequencies.",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=400&auto=format&fit=crop&q=80",
      duration: "0:52",
      views: 295000,
      likes: 21500,
      dislikes: 120,
      creatorId: "creator-cosmic",
      creatorName: "Cosmic Wanderer",
      creatorAvatar: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=150&auto=format&fit=crop&q=80",
      category: "Science & Education",
      tags: ["Shorts", "Space", "Black Hole Sound", "Astronomy"],
      isShort: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ];

  const seedComments = [
    {
      id: "c1",
      videoId: "v-gemini-revolution",
      userId: "creator-chef",
      username: "Chef Elite",
      userAvatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150&auto=format&fit=crop&q=80",
      content: "Excellent coverage! The detailed code walkthrough on the server authorization checks is remarkably helpful even for non-devs who manage creator hosting accounts. Looking forward to integrating some model-based descriptions myself.",
      likes: 42,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      replies: [
        {
          id: "r1",
          commentId: "c1",
          userId: "creator-technexus",
          username: "TechNexus AI",
          userAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
          content: "Thank you Chef! Truly appreciate your support. Let me know if you want a custom script to automate those Neapolitan description tags!",
          createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        }
      ]
    },
    {
      id: "c2",
      videoId: "v-gemini-revolution",
      userId: "creator-cosmic",
      username: "Cosmic Wanderer",
      userAvatar: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=150&auto=format&fit=crop&q=80",
      content: "These multi-modal token processing times inside production servers are insanely fast now. Can you provide thoughts on prompt caching structures for heavy queries?",
      likes: 18,
      createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      replies: []
    }
  ];

  const initialDB = {
    users: seedUsers,
    videos: seedVideos,
    comments: seedComments,
    playlists: []
  };

  fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2), "utf-8");
  return initialDB;
}

let db = initDatabase();

function saveDatabase() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

// Simple security layer: Custom Signature Authentication Token Engine
// We sign/verify tokens using standard crypto hashes to keep it completely self-contained
const JWT_SECRET = "clonetube-secure-2026-superkey";

function generateToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString("base64");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

function verifyToken(token: string): string | null {
  try {
    const [payloadBase64, signature] = token.split(".");
    if (!payloadBase64 || !signature) return null;

    const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(payloadBase64).digest("hex");
    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf-8"));
    if (payload.exp < Date.now()) return null; // Expired

    return payload.userId;
  } catch (e) {
    return null;
  }
}

// Authentication Middleware
function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  const token = authHeader.split(" ")[1];
  const userId = verifyToken(token);
  if (!userId) {
    return res.status(401).json({ error: "Session expired or invalid" });
  }

  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  req.user = user;
  next();
}

// optional Auth Middleware that doesn't block but populates user if valid token exists
function optionalAuthenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const userId = verifyToken(token);
    if (userId) {
      const user = db.users.find((u) => u.id === userId);
      if (user) {
        req.user = user;
      }
    }
  }
  next();
}

/* =========================================
   AUTHENTICATION API ROUTES
   ========================================= */

app.post("/api/auth/register", (req, res) => {
  const { username, email, password, channelName, bio } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Please input a username, email, and password." });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUsername = username.toLowerCase().trim();

  const emailExists = db.users.some((u) => u.email.toLowerCase() === normalizedEmail);
  const usernameExists = db.users.some((u) => u.username.toLowerCase() === normalizedUsername);

  if (emailExists) {
    return res.status(400).json({ error: "Email already registered." });
  }
  if (usernameExists) {
    return res.status(400).json({ error: "Username already taken." });
  }

  const userId = "u-" + crypto.randomUUID().substring(0, 8);
  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

  // Choose a charming avatar and default banner based on name
  const avatarIndex = Math.floor(Math.random() * 10) + 1;
  const avatarUrl = `https://images.unsplash.com/photo-${[
    "1534528741775-53994a69daeb",
    "1507003211169-0a1dd7228f2d",
    "1494790108377-be9c29b29330",
    "1500648767791-00dcc994a43e",
    "1438761681033-6461ffad8d80",
    "1522075469751-3a6694fb2f61",
    "1544005313-94ddf0286df2",
    "1506794778202-cad84cf45f1d",
    "1487412720507-e7ab37603c6f",
    "1539571696357-5a69c17a67c6",
  ][avatarIndex % 10]}?w=150&auto=format&fit=crop&q=80`;

  const bannerUrl = "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&auto=format&fit=crop&q=80";

  const newUser = {
    id: userId,
    username: normalizedUsername,
    email: normalizedEmail,
    passwordHash,
    channelName: channelName || `${username}'s Channel`,
    avatarUrl,
    bannerUrl,
    subscriberCount: 0,
    subscriptions: [],
    likedVideos: [],
    dislikedVideos: [],
    savedVideos: [],
    watchHistory: [],
    bio: bio || "Welcome to my CloneTube channel!",
    verified: false,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDatabase();

  const token = generateToken(userId);
  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      channelName: newUser.channelName,
      avatarUrl: newUser.avatarUrl,
      bannerUrl: newUser.bannerUrl,
      subscriberCount: newUser.subscriberCount,
      subscriptions: newUser.subscriptions,
      likedVideos: newUser.likedVideos,
      savedVideos: newUser.savedVideos,
      bio: newUser.bio,
      verified: newUser.verified,
    },
  });
});

app.post("/api/auth/login", (req, res) => {
  const { loginIdentifier, password } = req.body; // email or username

  if (!loginIdentifier || !password) {
    return res.status(400).json({ error: "Please provide credentials." });
  }

  const normalized = loginIdentifier.toLowerCase().trim();
  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

  const user = db.users.find(
    (u) =>
      (u.email.toLowerCase() === normalized || u.username.toLowerCase() === normalized) &&
      u.passwordHash === passwordHash
  );

  if (!user) {
    return res.status(400).json({ error: "Invalid username, email, or password." });
  }

  const token = generateToken(user.id);
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      channelName: user.channelName,
      avatarUrl: user.avatarUrl,
      bannerUrl: user.bannerUrl,
      subscriberCount: user.subscriberCount,
      subscriptions: user.subscriptions,
      likedVideos: user.likedVideos,
      dislikedVideos: user.dislikedVideos || [],
      savedVideos: user.savedVideos || [],
      watchHistory: user.watchHistory || [],
      bio: user.bio,
      verified: user.verified,
    },
  });
});

app.get("/api/auth/me", authenticate, (req: any, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      channelName: req.user.channelName,
      avatarUrl: req.user.avatarUrl,
      bannerUrl: req.user.bannerUrl,
      subscriberCount: req.user.subscriberCount,
      subscriptions: req.user.subscriptions,
      likedVideos: req.user.likedVideos,
      dislikedVideos: req.user.dislikedVideos || [],
      savedVideos: req.user.savedVideos || [],
      watchHistory: req.user.watchHistory || [],
      bio: req.user.bio,
      verified: req.user.verified,
    },
  });
});

/* =========================================
   VIDEO SERVICE ROUTES
   ========================================= */

// Get videos (with search, category, and shorts filtering)
app.get("/api/videos", optionalAuthenticate, (req: any, res) => {
  const { search, category, isShort, creatorId } = req.query;

  let list = [...db.videos];

  if (isShort !== undefined) {
    const filterShorts = isShort === "true";
    list = list.filter((v) => !!v.isShort === filterShorts);
  }

  if (creatorId) {
    list = list.filter((v) => v.creatorId === creatorId);
  }

  if (category && category !== "All") {
    list = list.filter((v) => v.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (search) {
    const term = (search as string).toLowerCase().trim();
    list = list.filter(
      (v) =>
        v.title.toLowerCase().includes(term) ||
        v.description.toLowerCase().includes(term) ||
        v.creatorName.toLowerCase().includes(term) ||
        v.tags.some((t: string) => t.toLowerCase().includes(term))
    );
  }

  // Sort descending by creation date by default
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ videos: list });
});

// Create/Upload Video
app.post("/api/videos", authenticate, (req: any, res) => {
  const { title, description, category, tags, duration, isShort, thumbnailUrl, videoUrl } = req.body;

  if (!title || !category) {
    return res.status(400).json({ error: "Title and Category are required." });
  }

  const newVideoId = "v-" + crypto.randomUUID().substring(0, 8);

  const formattedTags = Array.isArray(tags)
    ? tags
    : typeof tags === "string"
    ? tags.split(",").map((t: string) => t.trim()).filter(Boolean)
    : ["CloneTube"];

  // Fallbacks if user uploads mock files or uses placeholders
  const videoFileUrl = videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4";
  const finalThumbnail = thumbnailUrl || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80";

  const newVideo = {
    id: newVideoId,
    title,
    description: description || "No description provided.",
    videoUrl: videoFileUrl,
    thumbnailUrl: finalThumbnail,
    duration: duration || (isShort ? "0:30" : "5:12"),
    views: 0,
    likes: 0,
    dislikes: 0,
    creatorId: req.user.id,
    creatorName: req.user.channelName,
    creatorAvatar: req.user.avatarUrl,
    category,
    tags: formattedTags,
    isShort: !!isShort,
    createdAt: new Date().toISOString(),
  };

  db.videos.push(newVideo);
  saveDatabase();

  res.status(201).json({ video: newVideo });
});

// Get Video details and increment view count
app.get("/api/videos/:id", optionalAuthenticate, (req: any, res) => {
  const video = db.videos.find((v) => v.id === req.params.id);
  if (!video) {
    return res.status(404).json({ error: "Video not found" });
  }

  // Increment view count
  video.views = (video.views || 0) + 1;
  saveDatabase();

  // If there's an authenticated user, add to watch history list
  if (req.user) {
    const userIndex = db.users.findIndex((u) => u.id === req.user.id);
    if (userIndex !== -1) {
      const history = db.users[userIndex].watchHistory || [];
      const updatedHistory = [video.id, ...history.filter((id) => id !== video.id)].slice(0, 50);
      db.users[userIndex].watchHistory = updatedHistory;
      req.user.watchHistory = updatedHistory;
      saveDatabase();
    }
  }

  res.json({ video });
});

// Like / Dislike Video
app.post("/api/videos/:id/rate", authenticate, (req: any, res) => {
  const { action } = req.body; // "like" or "dislike" or "remove"
  const videoId = req.params.id;

  const videoIndex = db.videos.findIndex((v) => v.id === videoId);
  if (videoIndex === -1) {
    return res.status(404).json({ error: "Video not found" });
  }

  const video = db.videos[videoIndex];
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  if (!user.likedVideos) user.likedVideos = [];
  if (!user.dislikedVideos) user.dislikedVideos = [];

  const wasLiked = user.likedVideos.includes(videoId);
  const wasDisliked = user.dislikedVideos.includes(videoId);

  // Clear original rates
  if (wasLiked) {
    user.likedVideos = user.likedVideos.filter((id: string) => id !== videoId);
    video.likes = Math.max(0, (video.likes || 0) - 1);
  }
  if (wasDisliked) {
    user.dislikedVideos = user.dislikedVideos.filter((id: string) => id !== videoId);
    video.dislikes = Math.max(0, (video.dislikes || 0) - 1);
  }

  // Apply new action
  if (action === "like") {
    user.likedVideos.push(videoId);
    video.likes = (video.likes || 0) + 1;
  } else if (action === "dislike") {
    user.dislikedVideos.push(videoId);
    video.dislikes = (video.dislikes || 0) + 1;
  }

  saveDatabase();
  res.json({
    likes: video.likes,
    dislikes: video.dislikes,
    userRating: action === "remove" ? "none" : action,
  });
});

// Delete Video
app.delete("/api/videos/:id", authenticate, (req: any, res) => {
  const videoIndex = db.videos.findIndex((v) => v.id === req.params.id);
  if (videoIndex === -1) {
    return res.status(404).json({ error: "Video not found" });
  }

  const v = db.videos[videoIndex];
  if (v.creatorId !== req.user.id) {
    return res.status(403).json({ error: "Access Denied. You are not the creator." });
  }

  db.videos.splice(videoIndex, 1);
  // clean comments as well
  db.comments = db.comments.filter((c) => c.videoId !== req.params.id);

  saveDatabase();
  res.json({ success: true, message: "Video deleted successfully" });
});

/* =========================================
   COMMENTS & COMMUNITY APIS
   ========================================= */

// Get Comments for a video
app.get("/api/videos/:id/comments", (req, res) => {
  const videoComments = db.comments.filter((c) => c.videoId === req.params.id);
  // Sort fresh first
  videoComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ comments: videoComments });
});

// Create Comment with AI Safety moderation option
app.post("/api/videos/:id/comments", authenticate, async (req: any, res) => {
  const { content, enableAIModeration } = req.body;
  const videoId = req.params.id;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: "Comment content cannot be empty." });
  }

  // AI Moderation Flow
  if (enableAIModeration && ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Evaluate the following comment intended for a video. Determine if it is excessively abusive, contains slurs, is highly toxic, or spam. Respond in JSON with schema properties 'isToxic' (boolean) and 'reason' (string). Comment to evaluate: "${content}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isToxic: { type: Type.BOOLEAN },
              reason: { type: Type.STRING },
            },
            required: ["isToxic"],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || "{}");
      if (parsed.isToxic) {
        return res.status(422).json({
          error: "Comment flagged by AI Moderation Safeguard",
          reason: parsed.reason || "Content violates community standards of CloneTube.",
        });
      }
    } catch (e) {
      console.error("AI Moderation error, continuing safely", e);
    }
  }

  const commentId = "c-" + crypto.randomUUID().substring(0, 8);
  const newComment = {
    id: commentId,
    videoId,
    userId: req.user.id,
    username: req.user.channelName,
    userAvatar: req.user.avatarUrl,
    content: content.trim(),
    likes: 0,
    createdAt: new Date().toISOString(),
    replies: [],
  };

  db.comments.push(newComment);
  saveDatabase();

  res.status(201).json({ comment: newComment });
});

// Reply to a comment
app.post("/api/comments/:id/replies", authenticate, (req: any, res) => {
  const { content } = req.body;
  const commentId = req.params.id;

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Reply content cannot be empty." });
  }

  const commentIndex = db.comments.findIndex((c) => c.id === commentId);
  if (commentIndex === -1) {
    return res.status(404).json({ error: "Comment not found" });
  }

  const replyId = "r-" + crypto.randomUUID().substring(0, 8);
  const newReply = {
    id: replyId,
    commentId,
    userId: req.user.id,
    username: req.user.channelName,
    userAvatar: req.user.avatarUrl,
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };

  db.comments[commentIndex].replies = db.comments[commentIndex].replies || [];
  db.comments[commentIndex].replies.push(newReply);
  saveDatabase();

  res.status(201).json({ reply: newReply });
});

/* =========================================
   USER LIBRARY & PLAYLIST SERVICE
   ========================================= */

app.get("/api/users/library", authenticate, (req: any, res) => {
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const watchHistory = (user.watchHistory || [])
    .map((id: string) => db.videos.find((v) => v.id === id))
    .filter(Boolean);

  const likedVideos = (user.likedVideos || [])
    .map((id: string) => db.videos.find((v) => v.id === id))
    .filter(Boolean);

  const savedVideos = (user.savedVideos || [])
    .map((id: string) => db.videos.find((v) => v.id === id))
    .filter(Boolean);

  res.json({
    watchHistory,
    likedVideos,
    savedVideos,
  });
});

app.post("/api/users/save-video", authenticate, (req: any, res) => {
  const { videoId } = req.body;
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(410).json({ error: "User not found" });

  if (!user.savedVideos) user.savedVideos = [];

  const saved = user.savedVideos.includes(videoId);
  if (saved) {
    user.savedVideos = user.savedVideos.filter((id: string) => id !== videoId);
  } else {
    user.savedVideos.push(videoId);
  }

  saveDatabase();
  res.json({ saved: !saved });
});

/* =========================================
   CHANNEL & CREATOR API ROUTES
   ========================================= */

// Get Channel profile Details
app.get("/api/channels/:id", optionalAuthenticate, (req: any, res) => {
  const channelCreator = db.users.find((u) => u.id === req.params.id);
  if (!channelCreator) {
    return res.status(404).json({ error: "Channel creator not found" });
  }

  const videos = db.videos.filter((v) => v.creatorId === req.params.id);

  let isSubscribed = false;
  if (req.user) {
    const user = db.users.find((u) => u.id === req.user.id);
    if (user && user.subscriptions) {
      isSubscribed = user.subscriptions.includes(req.params.id);
    }
  }

  res.json({
    channel: {
      id: channelCreator.id,
      channelName: channelCreator.channelName,
      avatarUrl: channelCreator.avatarUrl,
      bannerUrl: channelCreator.bannerUrl,
      subscriberCount: channelCreator.subscriberCount || 0,
      bio: channelCreator.bio || "No bio yet",
      verified: !!channelCreator.verified,
      createdAt: channelCreator.createdAt,
    },
    videos,
    isSubscribed,
  });
});

// Edit personal channel details
app.put("/api/channels/me", authenticate, (req: any, res) => {
  const { channelName, bio, bannerUrl, avatarUrl } = req.body;
  const userIndex = db.users.findIndex((u) => u.id === req.user.id);

  if (userIndex === -1) {
    return res.status(404).json({ error: "User profile not found." });
  }

  if (channelName) db.users[userIndex].channelName = channelName;
  if (bio) db.users[userIndex].bio = bio;
  if (bannerUrl) db.users[userIndex].bannerUrl = bannerUrl;
  if (avatarUrl) db.users[userIndex].avatarUrl = avatarUrl;

  // Sync creator name and avatar on their existing videos
  db.videos.forEach((video) => {
    if (video.creatorId === req.user.id) {
      if (channelName) video.creatorName = channelName;
      if (avatarUrl) video.creatorAvatar = avatarUrl;
    }
  });

  saveDatabase();
  res.json({ user: db.users[userIndex] });
});

// Subscribe / Unsubscribe channel
app.post("/api/channels/:id/subscribe", authenticate, (req: any, res) => {
  const creatorId = req.params.id;
  if (creatorId === req.user.id) {
    return res.status(400).json({ error: "You cannot subscribe to your own channel!" });
  }

  const creator = db.users.find((u) => u.id === creatorId);
  const user = db.users.find((u) => u.id === req.user.id);

  if (!creator) {
    return res.status(404).json({ error: "Channel not found" });
  }

  if (!user.subscriptions) user.subscriptions = [];

  const subbed = user.subscriptions.includes(creatorId);
  if (subbed) {
    user.subscriptions = user.subscriptions.filter((id: string) => id !== creatorId);
    creator.subscriberCount = Math.max(0, (creator.subscriberCount || 0) - 1);
  } else {
    user.subscriptions.push(creatorId);
    creator.subscriberCount = (creator.subscriberCount || 0) + 1;
  }

  saveDatabase();
  res.json({
    subscribed: !subbed,
    subscriberCount: creator.subscriberCount,
  });
});

// Analytics Dashboard for Creator
app.get("/api/creator/analytics", authenticate, (req: any, res) => {
  const userVideos = db.videos.filter((v) => v.creatorId === req.user.id);

  const totalViews = userVideos.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalLikes = userVideos.reduce((sum, v) => sum + (v.likes || 0), 0);
  const totalVideos = userVideos.length;
  const subscriberCount = req.user.subscriberCount || 0;

  // Group by category
  const catMap: { [key: string]: number } = {};
  userVideos.forEach((v) => {
    catMap[v.category] = (catMap[v.category] || 0) + (v.views || 0);
  });
  const viewsByCategory = Object.keys(catMap).map((k) => ({
    category: k,
    count: catMap[k],
  }));

  // Create clean trending views simulation over last 7 days
  const viewsOverTime = Array.from({ length: 7 })
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const factor = 1 + Math.sin(i * 1.2) * 0.4; // smooth wave
      return {
        date: dateStr,
        views: Math.round((totalViews / 7) * factor + (i * 25)),
      };
    });

  const analytics: any = {
    totalViews,
    totalSubscribers: subscriberCount,
    totalVideos,
    totalLikes,
    viewsByCategory,
    viewsOverTime,
  };

  res.json({ analytics });
});

/* =========================================
   🤖 GEMINI INTUITIVE AI FEATURES
   ========================================= */

// AI Video Summarization
app.post("/api/gemini/summarize", async (req, res) => {
  const { videoId } = req.body;
  if (!videoId) {
    return res.status(400).json({ error: "videoId is required" });
  }

  const video = db.videos.find((v) => v.id === videoId);
  if (!video) {
    return res.status(404).json({ error: "Video not found" });
  }

  // Use cached summary to save tokens, or recreate if missing/requested
  if (video.aiSummary) {
    return res.json({ summary: video.aiSummary });
  }

  if (!ai) {
    return res.status(503).json({
      error: "Gemini integration is active, but the key is not set in the Panel.",
      summary: "Simulated Summary: This is an outstanding video about " + video.category + " that outlines key tactics concerning " + video.tags.join(", ") + ". Viewers found the instructions highly practical and helpful.",
    });
  }

  try {
    const prompt = `You are CloneTube AI, a highly articulate video summaries expert. Your task is to analyze the video credentials below and draft a professional, YouTube-friendly "AI Smart Summary". Keep it structured, informative, and engaging. Return purely formatted markdown text ready for high-contrast viewing.

Video Title: "${video.title}"
Video Description: "${video.description}"
Category: "${video.category}"
Tags: [${video.tags.join(", ")}]

Include key takeaways, concepts discussed, and a closing evaluation sentence. Keep the response to 3 clear short bullet points and a wrapping concluding paragraph (about 120 words total).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const summary = response.text || "Summary completed with success.";
    video.aiSummary = summary;
    saveDatabase();

    res.json({ summary });
  } catch (e: any) {
    console.error("Gemini summary error", e);
    res.status(500).json({ error: "AI summary failed to execute", details: e.message });
  }
});

// AI Metadata Title & Description & Tags generator
app.post("/api/gemini/generate-metadata", async (req, res) => {
  const { prompt, category } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Concept prompt is required" });
  }

  if (!ai) {
    // Elegant simulation fallback
    return res.json({
      title: `The Ultimate Guide to ${prompt} in 2026`,
      description: `In this video, we deep dive into ${prompt}. We cover all the key components, standard architectures, error resolutions, and deployment insights to make your project successful!\n\nTimestamps:\n0:50 - Core Concepts\n3:20 - Real-World Demos\n8:15 - Tips & Best Practices\n\nMake sure to like, comment, and subscribe!`,
      tags: ["Tech", prompt.replace(/\s+/g, ""), "ModernGuide", "2026Explained", "HowTo"],
    });
  }

  try {
    const systemPrompt = `You are a specialist YouTube Optimizer. Your goal is to convert a user's basic video idea into high-engagement, SEO-optimized metadata. 

User Concept: "${prompt}"
Category Type: "${category || "General"}"

Respond strictly in valid JSON format conforming to the following structure:
{
  "title": "A highly engaging, catchy video title (under 80 characters)",
  "description": "A comprehensive video description including an intro hooks paragraph, features section, simulated timestamps layout, and call-to-actions (using clean spacing and standard linebreaks)",
  "tags": ["an", "array", "of", "5-8", "highly", "searched", "short", "tags"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["title", "description", "tags"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (e: any) {
    console.error("Gemini metadata generation failed", e);
    res.status(500).json({ error: "AI metadata generation failed", details: e.message });
  }
});

// AI Semantic Voice Search Parser
app.post("/api/gemini/voice-search", async (req, res) => {
  const { speechText } = req.body;
  if (!speechText) {
    return res.status(400).json({ error: "Speech text is empty" });
  }

  if (!ai) {
    return res.json({ searchQuery: speechText, category: "All" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are the CloneTube Voice Search compiler. Convert raw, unstructured voice speech transcripts into a clean search phrase and category filter.
      
Speech Transcript: "${speechText}"

Represented Categories Available: ["Technology", "Science & Education", "Cooking", "Music", "General"]

Return purely a JSON response. Schema:
{
  "searchQuery": "the refined keyword search phrase (e.g. if speech is 'find stars compilation that JWST took' output 'James Webb Space Telescope stars Eagle Nebula')",
  "category": "one of the available categories mapping the speech, or 'All' if general or uncertain"
}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            searchQuery: { type: Type.STRING },
            category: { type: Type.STRING },
          },
          required: ["searchQuery", "category"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (e) {
    res.json({ searchQuery: speechText, category: "All" });
  }
});

// AI Personalised Video Recommendations Engine
app.get("/api/gemini/recommendations", optionalAuthenticate, async (req: any, res) => {
  // We send the current video library and user preferences to Gemini.
  // Gemini decides which 3 videos fit the profile, and gives custom, personalized reasons.
  const user = req.user;
  const allVideos = db.videos;

  if (!user || !ai) {
    // If no user/key, return standard recommendations based on high view count
    const sorted = [...allVideos].sort((a, b) => b.views - a.views).slice(0, 3);
    const standardRecs = sorted.map((v) => ({
      videoId: v.id,
      reason: "Popular on CloneTube • Recommended based on active viewer spikes.",
    }));
    return res.json({ recommendations: standardRecs });
  }

  try {
    // map user details
    const likedTitles = (user.likedVideos || [])
      .map((id: string) => allVideos.find((v) => v.id === id)?.title)
      .filter(Boolean);

    const historyTitles = (user.watchHistory || [])
      .map((id: string) => allVideos.find((v) => v.id === id)?.title)
      .filter(Boolean);

    const videoCatalogBrief = allVideos.map((v) => ({
      id: v.id,
      title: v.title,
      category: v.category,
    }));

    const systemPrompt = `You are the CloneTube personalized Recommendations Engine. Analyze the user profile below:
User Subscriptions Channels: [${user.subscriptions.join(", ")}]
User Liked Video Titles: [${likedTitles.join(" | ")}]
User Recent Watch History: [${historyTitles.join(" | ")}]

Pick exactly 3 video IDs from the following catalog of items which would appeal most to the user, and write a human-readable, friendly 1-sentence recommended reason (e.g., "Because you matched Chef Elite pizza tips, master authentic cooking methods").

Available Video Catalog:
${JSON.stringify(videoCatalogBrief)}

Return purely a JSON response. Schema:
{
  "recommendations": [
    { "videoId": "string matching catalog id", "reason": "string (friendly 1-sentence reason)" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  videoId: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["videoId", "reason"],
              },
            },
          },
          required: ["recommendations"],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json(parsed);
  } catch (e) {
    // Fallback on error
    const sorted = [...allVideos].sort((a, b) => b.likes - a.likes).slice(0, 3);
    const fallbackRecs = sorted.map((v) => ({
      videoId: v.id,
      reason: "High Rating Rec • Suggested due to substantial viewer appreciation.",
    }));
    res.json({ recommendations: fallbackRecs });
  }
});

// Custom API Endpoint dynamically extracting live character data from the external API of Ice and Fire
app.get("/api/custom/character", async (req, res) => {
  try {
    const { id, name } = req.query;

    let targetUrl = "https://anapioficeandfire.com/api/characters/583"; // Default: Jon Snow

    if (id) {
      targetUrl = `https://anapioficeandfire.com/api/characters/${id}`;
    } else if (name) {
      targetUrl = `https://anapioficeandfire.com/api/characters?name=${encodeURIComponent(name as string)}`;
    }

    console.log(`[API Proxy] Fetching live data from: ${targetUrl}`);
    const externalResponse = await fetch(targetUrl);

    if (!externalResponse.ok) {
      return res.status(externalResponse.status).json({
        error: `Failed to fetch dynamic data from Ice and Fire API. Status: ${externalResponse.status}`,
        details: await externalResponse.text()
      });
    }

    const data = await externalResponse.json();
    res.json({
      source: "Live An API of Ice and Fire",
      timestamp: new Date().toISOString(),
      data: data
    });
  } catch (err: any) {
    console.error("Live fetch error in custom endpoint:", err);
    res.status(500).json({
      error: "Internal server error during live content extraction",
      message: err.message
    });
  }
});

/* =========================================
   VITE DEV SERVER OR STATIC PROD SERVING
   ========================================= */

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting node dev server in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== "true" },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving node full stack server in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server successfully listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
