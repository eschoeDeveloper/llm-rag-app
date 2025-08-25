import { Link } from "react-router-dom";

export function LandingPage() {
  return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-semibold">LLM Demo Landing Page</h1>
        <p className="mt-2 text-neutral-600 text-sm">Hi. My name is LLM-RAG-APP</p>
        <Link to="/prompt" className="mt-6 rounded-xl bg-black px-5 py-3 text-white text-sm">
          Start LLM+RAG Playground
        </Link>
      </div>
  );
}
