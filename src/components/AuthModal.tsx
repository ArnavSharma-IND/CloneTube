/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogIn, UserPlus, Eye, EyeOff, Sparkles, X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [channelName, setChannelName] = useState("");
  const [bio, setBio] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email || username, password);
      } else {
        await signUp({
          username,
          email,
          password,
          channelName,
          bio,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication process failed. Correct input fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg glass-panel text-white rounded-2xl shadow-2xl overflow-hidden relative border border-white/10 animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              Clone<span className="text-red-500">Tube</span> Account
            </h2>
          </div>

          <p className="text-xs text-gray-400 mb-6 font-medium">
            {isLogin
              ? "Sign in to subscribe, like, comment, and access the Gemini Creator Studio."
              : "Register your secure channels and start publishing with smart Gemini metadata assists."}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold rounded-lg flex items-center gap-2 animate-shake">
              <span>⚠️</span>
              <p className="flex-1 text-wrap leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isLogin ? (
              // Login Fields
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                  Username or Email
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. chefelite or chef@clonetube.ai"
                  value={email} // reuse email state for loginIdentifier
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 focus:bg-[#181818] transition-all"
                />
              </div>
            ) : (
              // Register Fields
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. techguy"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 focus:bg-[#181818] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. tech@guy.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 focus:bg-[#181818] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                      Channel Display Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tech & Gears Hub"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 focus:bg-[#181818] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                      Channel Description (Bio)
                    </label>
                    <input
                      type="text"
                      placeholder="Brief bio about your channel uploads..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 focus:bg-[#181818] transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Password input common for both */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 pr-11 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500 focus:bg-[#181818] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-extrabold rounded-xl shadow-lg hover:shadow-red-500/15 cursor-pointer select-none transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In to Account
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Register New Account
                </>
              )}
            </button>
          </form>

          {/* Toggle login vs signup */}
          <div className="mt-6 pt-6 border-t border-white/5 text-center text-xs">
            {isLogin ? (
              <p className="text-gray-400">
                New to CloneTube?{" "}
                <button
                  onClick={() => {
                    setError("");
                    setIsLogin(false);
                  }}
                  className="text-red-400 hover:text-red-300 font-bold hover:underline cursor-pointer"
                >
                  Register a secure channel
                </button>
              </p>
            ) : (
              <p className="text-gray-400">
                Already have a channel?{" "}
                <button
                  onClick={() => {
                    setError("");
                    setIsLogin(true);
                  }}
                  className="text-red-400 hover:text-red-300 font-bold hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
