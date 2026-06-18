# CloneTube - Modern AI-Powered Video Streaming Ecosystem 🚀

CloneTube is a high-fidelity, production-ready, fully functional video streaming clone designed under React 19, Express.js, TypeScript, and Tailwind CSS. The system integrates six intelligent server-side **Gemini AI Pipelines** mapping advanced content discovery, real-time metadata expansion, and moderation controls.

---

## 🎨 Creative Aesthetics & Architecture

- **Visual Frame & Motion**: Configured in a modern cinematic aesthetic using dark theme carbon offsets (`#0B0B0B`), crisp typography pairing (**Inter** headings paired with **JetBrains Mono** data lines), responsive side navigation drawers, custom glassmorphism overlays, and smooth layout entry transitions.
- **Client Routing & Storage**: Incorporates a self-sufficient custom Client Routing Context and standard Auth Context backed by client-side local states and server-side persistent SQLite/JSON storage written directly to disk. Fully insulated form React 19 routing compatibility bottlenecks.
- **Interactive Multimedia Frame**: High-fidelity HTML5 streaming players, custom playback speed multipliers, slider-based timeline seeks, relative watch logging, and vertical reels (Reels/Shorts viewer) supporting reactive ratings, nesting comments, and audio mute triggers.

---

## ⚡ Built-In Gemini AI Features

CloneTube features standard server-side mock handles backed by standard **Google GenAI API** SDK parameters:

1. **Gemini Semantic Voice Search** (`/api/gemini/parse-voice`): Click the **Mic** icon inside the Header to enter a conceptual thought (e.g. *"I want some spicy low-tempo lo-fi coding tracks"*). Gemini parses semantic intents, extract subjects/moods, and redirects search filters.
2. **Personalized Spark Recommendations** (`/api/gemini/recommendations`): Based on subscribers' subscriptions and watch logs, Gemini dynamically pushes three tailored recommendations at the top feed with user-friendly explanations.
3. **Automated Video Summaries** (`/api/gemini/summarize`): While watch a stream, click the **AI Summarize** button to stream high-quality markdown summaries mapping key takeaways and sequential chronological timestamps.
4. **Viral Title & SEO Generator** (`/api/gemini/generate-metadata`): Inside the Upload dialog, click **Tune with AI** and enter a raw thought. Gemini suggests a viral hook, rich formatted description text, and dynamic search tags.
5. **AI Content Moderation Guard** (`/api/gemini/moderate`): Toggle the **AI Toxicity Guard** in Comments! If comments trigger vulgarity or harmful language, Gemini flags them as toxic content, shielding creators from harassment.
6. **AI Metadata Refactoring**: Seamlessly refactor specs and SEO criteria from the Creator Studio directly on edit.

---

## 🛠️ Quick Trial User Passwords

For ease of review, you can trigger visual data modifications instantly using our **1-Click Quick Login** drawer at the top of the header:

- **Chef Elite** (User Session: `chefelite` | Channel profile: `Chef Elite` cooking specialized tutorials)
- **TechNexus AI** (User Session: `technexus` | Cosmic and future computing specs)
- **Cosmic Wanderer** (User Session: `cosmic` | Space and planetary science catalog)
- **Lofi Beats Studio** (User Session: `lofibeats` | Warm background code music)
