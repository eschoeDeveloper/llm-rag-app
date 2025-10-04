import { Link } from "react-router-dom";
import { Button } from "../../shared/ui/Button.tsx";
import { Chip } from "../../shared/ui/Chip.tsx";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        <div className="absolute top-1/2 right-1/4 w-60 h-60 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-1000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="p-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">🚀</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                LLM RAG
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Chip variant="info" size="sm">v2.0</Chip>
              <Link to="/prompt">
                <Button variant="outline" size="sm">
                  Go to App
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-6xl mx-auto text-center">
            {/* Main Hero */}
            <div className="mb-12">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl mb-8 shadow-2xl animate-float animate-fade-in-up">
                <span className="text-4xl">🤖</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-fade-in-up-delay-1">
                <span className="bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900 bg-clip-text text-transparent">
                  LLM RAG
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Playground
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8 animate-fade-in-up-delay-2">
                Experience the future of AI-powered conversations with 
                <span className="font-semibold text-purple-600"> Retrieval Augmented Generation</span>, 
                intelligent prompt engineering, and real-time vector search optimization.
              </p>

              {/* Feature badges */}
              <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in-up-delay-3">
                <Chip variant="primary" size="lg" className="hover-glow">✨ Advanced RAG</Chip>
                <Chip variant="secondary" size="lg" className="hover-glow">🧠 Smart Prompts</Chip>
                <Chip variant="success" size="lg" className="hover-glow">⚡ Real-time Search</Chip>
                <Chip variant="warning" size="lg" className="hover-glow">🎯 Vector Optimization</Chip>
                <Chip variant="info" size="lg" className="hover-glow">🔧 Spring WebFlux</Chip>
                <Chip variant="danger" size="lg" className="hover-glow">🗄️ PostgreSQL</Chip>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up-delay-3">
                <Link to="/prompt">
                  <Button variant="primary" size="xl" className="min-w-[200px] hover-glow">
                    <span className="flex items-center gap-3">
                      🚀 Start Chatting
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </span>
                  </Button>
                </Link>
                <Button variant="outline" size="xl" className="min-w-[200px] hover-glow">
                  <span className="flex items-center gap-3">
                    📚 Learn More
                  </span>
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 hover-glow animate-fade-in-up-delay-1">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 mx-auto animate-float">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Intelligent RAG</h3>
                <p className="text-gray-600 leading-relaxed">
                  Advanced Retrieval Augmented Generation with real-time vector similarity search and intelligent context injection.
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 hover-glow animate-fade-in-up-delay-2">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto animate-float" style={{animationDelay: '0.5s'}}>
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Real-time Optimization</h3>
                <p className="text-gray-600 leading-relaxed">
                  Dynamic parameter tuning, search quality evaluation, and performance optimization for the best AI experience.
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 hover-glow animate-fade-in-up-delay-3">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto animate-float" style={{animationDelay: '1s'}}>
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Enterprise Ready</h3>
                <p className="text-gray-600 leading-relaxed">
                  Built with Spring WebFlux, PostgreSQL, and pgvector for scalable, production-ready AI applications.
                </p>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl hover-glow animate-fade-in-up-delay-3">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-reveal">Powered by Modern Technology</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center hover:scale-110 transition-transform duration-300">
                  <div className="text-3xl font-bold text-purple-600 mb-2 animate-pulse-slow">100%</div>
                  <div className="text-sm text-gray-600">Real-time</div>
                </div>
                <div className="text-center hover:scale-110 transition-transform duration-300">
                  <div className="text-3xl font-bold text-blue-600 mb-2">∞</div>
                  <div className="text-sm text-gray-600">Scalable</div>
                </div>
                <div className="text-center hover:scale-110 transition-transform duration-300">
                  <div className="text-3xl font-bold text-green-600 mb-2 animate-pulse-slow">99.9%</div>
                  <div className="text-sm text-gray-600">Reliable</div>
                </div>
                <div className="text-center hover:scale-110 transition-transform duration-300">
                  <div className="text-3xl font-bold text-orange-600 mb-2 animate-pulse">⚡</div>
                  <div className="text-sm text-gray-600">Fast</div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 border-t border-white/20">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-sm">🚀</span>
                </div>
                <span className="text-gray-600">© 2024 LLM RAG Playground. Built with ❤️</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>React + TypeScript</span>
                <span>•</span>
                <span>Spring WebFlux</span>
                <span>•</span>
                <span>PostgreSQL + pgvector</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
