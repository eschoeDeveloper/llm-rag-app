import { Link } from "react-router-dom";
import { Button } from "../../shared/ui/Button.tsx";
import { Chip } from "../../shared/ui/Chip.tsx";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <nav className="border-b border-line-subtle">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-matcha" />
            <span className="font-semibold">LLM RAG</span>
            <Chip variant="soft" size="sm" className="ml-2">v2.0</Chip>
          </div>
          <Link to="/prompt">
            <Button variant="primary" size="sm">앱 열기</Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-5xl font-semibold leading-tight tracking-tight mb-6">
          문서를 이해하는<br />
          <span className="text-matcha">RAG 기반</span> AI 어시스턴트
        </h1>
        <p className="text-lg text-ink-secondary leading-relaxed mb-10 max-w-2xl">
          업로드한 문서에서 컨텍스트를 가져와 답하고, 대화 스레드로 맥락을 이어갑니다.
          벡터 검색과 프롬프트 튜닝으로 답변 품질을 조절할 수 있습니다.
        </p>

        <div className="flex items-center gap-3 mb-20">
          <Link to="/prompt">
            <Button variant="primary" size="lg">시작하기</Button>
          </Link>
          <Button variant="ghost" size="lg">문서 보기</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard title="검색 기반 답변" body="pgvector 코사인 검색으로 관련 문서를 가져와 답변에 인용합니다." />
          <FeatureCard title="대화 스레드" body="주제별 스레드로 컨텍스트를 분리해 관리합니다." />
          <FeatureCard title="튜닝 가능" body="Top-K, threshold, 프롬프트 템플릿을 직접 조정합니다." />
        </div>
      </main>

      <footer className="border-t border-line-subtle">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between text-xs text-ink-tertiary">
          <span>LLM RAG Playground</span>
          <span>React · Spring WebFlux · pgvector</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-line-subtle bg-elevated p-5">
      <div className="text-sm font-semibold mb-2">{title}</div>
      <div className="text-sm text-ink-secondary leading-relaxed">{body}</div>
    </div>
  );
}
