import React from "react";
import { useQuery } from "@tanstack/react-query";

type Counters = {
  cache_hit?: number;
  cache_miss?: number;
  llm_calls?: number;
  retrieval_empty?: number;
  rerank_calls?: number;
  vision_pages?: number;
};

type MetricsResponse = {
  counters: Counters;
  derived: {
    hit_rate: number;
    total_requests: number;
  };
};

type Props = {
  baseUrl: string;
};

/**
 * 운영 메트릭 카드 — cache hit률, LLM 호출 수, 빈 retrieval 비율 등.
 * 30초마다 자동 refetch.
 */
export function MetricsCard({ baseUrl }: Props) {
  const query = useQuery<MetricsResponse>({
    queryKey: ["metrics", baseUrl],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/admin/metrics`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    refetchInterval: 30_000,
    staleTime: 25_000,
  });

  if (query.isLoading) {
    return (
      <div className="p-3 border border-line-subtle rounded-md bg-elevated">
        <p className="text-xs text-ink-tertiary">메트릭 로딩 중…</p>
      </div>
    );
  }

  if (query.error || !query.data) {
    return (
      <div className="p-3 border border-line-subtle rounded-md bg-elevated">
        <p className="text-xs text-ink-tertiary">메트릭 조회 실패</p>
      </div>
    );
  }

  const { counters, derived } = query.data;
  const hitPct = (derived.hit_rate * 100).toFixed(1);
  const emptyRate = counters.llm_calls
    ? (((counters.retrieval_empty ?? 0) / counters.llm_calls) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="p-3 border border-line-subtle rounded-md bg-elevated space-y-2.5">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-ink-tertiary uppercase tracking-wide">
          운영 메트릭
        </h4>
        <span className="text-[10px] text-ink-tertiary">30s 갱신</span>
      </div>

      <div className="space-y-1.5">
        <Row
          label="캐시 hit률"
          value={`${hitPct}%`}
          hint={`${counters.cache_hit ?? 0} hit / ${(counters.cache_hit ?? 0) + (counters.cache_miss ?? 0)} 총`}
          highlight={derived.hit_rate > 0.3}
        />
        <Row
          label="LLM 호출"
          value={String(counters.llm_calls ?? 0)}
          hint="실제 외부 API 호출 횟수 (캐시 miss)"
        />
        <Row
          label="빈 retrieval"
          value={`${emptyRate}%`}
          hint={`${counters.retrieval_empty ?? 0} 회 — 컨텍스트 검색 실패`}
          warn={parseFloat(emptyRate) > 30}
        />
        <Row
          label="Rerank 호출"
          value={String(counters.rerank_calls ?? 0)}
          hint="Cohere API"
        />
        <Row
          label="Vision 페이지"
          value={String(counters.vision_pages ?? 0)}
          hint="누적 (TTL 26h 적용)"
        />
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  hint,
  highlight,
  warn,
}: {
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
  warn?: boolean;
}) {
  const valueClass = warn
    ? "text-soft-sand-strong"
    : highlight
    ? "text-matcha-hover"
    : "text-ink";
  return (
    <div className="flex items-baseline justify-between gap-2">
      <div className="min-w-0 flex-1">
        <div className="text-xs text-ink">{label}</div>
        {hint && <div className="text-[10px] text-ink-tertiary truncate">{hint}</div>}
      </div>
      <div className={`text-sm font-semibold tabular-nums ${valueClass}`}>{value}</div>
    </div>
  );
}
