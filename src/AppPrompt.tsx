import React from "react";

import { EnhancedChatPanel } from "./features/chat/EnhancedChatPanel.tsx";
import { VectorPanel } from "./features/vector/VectorPanel.tsx";
import { Input } from "./shared/ui/Input.tsx";
import { Button } from "./shared/ui/Button.tsx";
import { Chip } from "./shared/ui/Chip.tsx";
import { useLocalStorage } from "./shared/hooks/useLocalStorage.ts";

// 프로덕션 환경 자동 감지
const getDefaultBase = () => {
  // 환경 변수에서 먼저 가져오기
  const envBase = (import.meta as any).env?.VITE_API_BASE;
  if (envBase) {
    return envBase;
  }
  
  // 현재 도메인이 프로덕션인 경우
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // www.llmragapp.com이면 같은 도메인의 /api 사용
    if (origin.includes('llmragapp.com')) {
      return '/api';
    }
    // 로컬 개발 환경
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return '/api'; // vite proxy 사용
    }
  }
  
  return '/api';
};

const DEFAULT_BASE = getDefaultBase();
type Tab = "chat" | "vector";

export default function AppPrompt() {
  const [base, setBase] = useLocalStorage("apiBase", DEFAULT_BASE);
  const [tab, setTab] = React.useState("chat" as Tab);

  // 초기화 시 현재 설정 로그
  React.useEffect(() => {
    console.log('[AppPrompt] Initial API base URL:', base);
    console.log('[AppPrompt] Window location origin:', typeof window !== 'undefined' ? window.location.origin : 'N/A');
    console.log('[AppPrompt] Environment VITE_API_BASE:', (import.meta as any).env?.VITE_API_BASE || 'not set');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-12">
        {/* Hero Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-lg">
            <span className="text-3xl">🚀</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900 bg-clip-text text-transparent mb-4">
            LLM RAG Playground
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Advanced AI-powered chat with <span className="font-semibold text-purple-600">Retrieval Augmented Generation</span>, 
            intelligent prompt engineering, and real-time vector search optimization
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Chip className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-md">
              ✨ Advanced RAG
            </Chip>
            <Chip className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-md">
              🧠 Smart Prompts
            </Chip>
            <Chip className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md">
              ⚡ Real-time Search
            </Chip>
            <Chip className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-md">
              🎯 Vector Optimization
            </Chip>
          </div>
        </header>

        {/* API Configuration Card */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🔧 Configuration</h2>
              <p className="text-gray-600">Connect to your LLM RAG API endpoint</p>
            </div>
            <Chip className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-0">
              {base}
            </Chip>
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="lg:col-span-3">
              <Input 
                value={base}
                onChange={setBase} 
                placeholder="Enter your API base URL (e.g., /api or https://api.llmragapp.com/api)" 
                disabled={false}
                className="text-lg py-4 px-6 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setTab("chat")}
                disabled={tab === "chat"}
                variant={tab === "chat" ? "primary" : "outline"}
                size="lg"
                className="flex-1 rounded-2xl font-semibold transition-all duration-200 hover:scale-105"
              >
                💬 Chat
              </Button>
              <Button 
                onClick={() => setTab("vector")}
                disabled={tab === "vector"}
                variant={tab === "vector" ? "primary" : "outline"}
                size="lg"
                className="flex-1 rounded-2xl font-semibold transition-all duration-200 hover:scale-105"
              >
                🔍 Vector Search
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {tab === "chat" ? <EnhancedChatPanel base={base} /> : <VectorPanel base={base} />}
        </div>

        {/* Enhanced Footer */}
        <footer className="mt-12 text-center">
          <div className="bg-white/50 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 text-lg mb-3">🔧 Advanced Features</h3>
                <p className="text-gray-600">Intelligent prompt templates with dynamic context injection</p>
                <p className="text-gray-600">Real-time RAG parameter optimization</p>
                <p className="text-gray-600">Search quality evaluation and feedback</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 text-lg mb-3">⚡ Performance</h3>
                <p className="text-gray-600">Vector similarity search with pgvector</p>
                <p className="text-gray-600">Streaming responses and real-time updates</p>
                <p className="text-gray-600">Intelligent caching and optimization</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 text-lg mb-3">🎯 Pro Tips</h3>
                <p className="text-gray-600">Configure CORS for your development environment</p>
                <p className="text-gray-600">Use advanced prompt templates for better results</p>
                <p className="text-gray-600">Monitor search quality metrics for optimization</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}