import React from "react";
import { Section } from "../../shared/ui/Section.tsx";
import { Textarea } from "../../shared/ui/Textarea.tsx";
import { Input } from "../../shared/ui/Input.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { postJson } from "../../shared/api/http.ts";
import { toAbsoluteUrl } from "../../shared/utils/urlUtils.ts";

function parseEmbedding(text: string) {
  const cleaned = text.trim().replace(/^\s*[\[(]|[\])]\s*$/g, "");
  if (!cleaned) return [] as number[];
  return cleaned
    .split(/[\s,]+/)
    .map((x) => parseFloat(x))
    .filter((x) => !Number.isNaN(x));
}

export function VectorPanel({ base }: { base: string }) {
  const [rawEmbedding, setRawEmbedding] = React.useState("");
  const [topK, setTopK] = React.useState("10");
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  async function runSearch() {
    setError("");
    const arr = parseEmbedding(rawEmbedding);
    if (!arr.length) {
      setError("벡터 값을 한 개 이상 입력하세요.");
      return;
    }
    setLoading(true);
    try {
      const url = toAbsoluteUrl(base, '/embeddings/search');
      const data = await postJson<any[]>(url, {
        embedding: arr,
        topK: Number(topK) || 10,
      });
      setResults(Array.isArray(data) ? data : [data]);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 p-5 bg-canvas">
      <div className="md:col-span-2">
        <Section title="Vector 검색">
          <div className="mb-3 text-sm text-ink-secondary">
            DB 컬럼 차원과 일치하는 벡터를 입력하세요. (text-embedding-3-small = 1536)
          </div>
          <Textarea
            value={rawEmbedding}
            onChange={setRawEmbedding}
            placeholder="예: 0.12, -0.03, 0.88, ..."
            rows={6}
          />
          <div className="mt-3 flex items-center gap-2">
            <Input value={topK} onChange={setTopK} placeholder="Top K" />
            <Button onClick={runSearch} disabled={loading} variant="primary">
              {loading ? "검색 중…" : "검색"}
            </Button>
          </div>
          {error && <div className="mt-3 text-sm text-ink">{error}</div>}
        </Section>
      </div>

      <div>
        <Section title="결과">
          <div className="space-y-2">
            {results.length === 0 && <div className="text-sm text-ink-tertiary">결과 없음</div>}
            {results.map((r, i) => (
              <div key={i} className="rounded border border-line-subtle p-3">
                <div className="text-sm font-medium text-ink">#{r.id} {r.title || "(제목 없음)"}</div>
                <div className="text-xs text-ink-secondary line-clamp-3 mt-1">
                  {typeof r.content === 'string' ? r.content : JSON.stringify(r.content)}
                </div>
                <div className="mt-1 text-[11px] text-ink-tertiary">created_at: {r.created_at}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
