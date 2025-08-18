import React from "react";
import { Section } from "../../shared/ui/Section.tsx";
import { Textarea } from "../../shared/ui/Textarea.tsx";
import { Input } from "../../shared/ui/Input.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { postJson } from "../../shared/api/http.ts";

function parseEmbedding(text: string) {
  // accepts: "0.1, 0.2, -0.3" or "[0.1,0.2]" or "(0.1,0.2)"
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
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  async function runSearch() {
    setError("");
    const arr = parseEmbedding(rawEmbedding);
    if (!arr.length) {
      setError("Enter at least one float value for the embedding.");
      return;
    }
    setLoading(true);
    try {
      const data = await postJson<any[]>(`${base}/embeddings/search`, {
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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <Section title="Vector Search">
          <div className="mb-3 text-sm text-gray-600">
            Paste a vector to test cosine search (dimension must match your DB column).
          </div>
          <Textarea
            value={rawEmbedding}
            onChange={setRawEmbedding}
            placeholder="e.g. 0.12, -0.03, 0.88, ... (1536 dims for text-embedding-3-small)"
            rows={6}
          />
          <div className="mt-3 flex items-center gap-2">
            <Input value={topK} onChange={setTopK} placeholder="Top K" />
            <Button onClick={runSearch} disabled={loading}>{loading ? "Searching…" : "Search"}</Button>
          </div>
          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        </Section>
      </div>

      <div>
        <Section title="Results">
          <div className="space-y-3">
            {results.length === 0 && <div className="text-sm text-gray-500">No results.</div>}
            {results.map((r, i) => (
              <div key={i} className="rounded-xl border p-3">
                <div className="text-sm font-medium">#{r.id} {r.title || "(no title)"}</div>
                <div className="text-xs text-gray-600 line-clamp-3">{r.content}</div>
                <div className="mt-1 text-[11px] text-gray-500">created_at: {r.created_at}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}