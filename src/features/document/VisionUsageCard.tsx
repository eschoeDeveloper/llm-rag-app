import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../shared/ui/Button.tsx";
import { adminService, VisionUsageSnapshot } from "../../shared/services/AdminService.ts";

type Props = {
  baseUrl: string;
  sessionId: string | null;
};

/**
 * Vision 사용량 카드 — 오늘자 세션·전역 페이지 수, 비용, 한도를 시각화.
 * 응답 캐시 즉시 비우기 버튼 포함.
 *
 * React Query 활용:
 *   - useQuery 로 자동 캐싱 + 화면 진입 시 fetch
 *   - useMutation 으로 캐시 무효화 호출 + 성공 메시지 표시
 *   - mutation 성공 후 같은 key 재조회는 안 함 (캐시 invalidate 결과는 Vision 사용량과 무관)
 */
export function VisionUsageCard({ baseUrl, sessionId }: Props) {
  const queryClient = useQueryClient();
  const usageQuery = useQuery<VisionUsageSnapshot>({
    queryKey: ["vision-usage", baseUrl, sessionId],
    queryFn: () => adminService.getVisionUsage(baseUrl, sessionId!),
    enabled: !!sessionId,
  });

  const cacheMutation = useMutation({
    mutationFn: () => adminService.invalidateCache(baseUrl, sessionId!),
  });

  if (!sessionId) return null;

  const usage = usageQuery.data;
  const sessionPct = usage && usage.sessionDailyLimit > 0
    ? Math.min(100, Math.round((usage.sessionPagesToday / usage.sessionDailyLimit) * 100))
    : 0;
  const globalPct = usage && usage.globalDailyLimit > 0
    ? Math.min(100, Math.round((usage.globalPagesToday / usage.globalDailyLimit) * 100))
    : 0;

  return (
    <div className="rounded-md border border-line-subtle bg-elevated p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-ink">Vision 사용량</h4>
          {usage && <p className="text-[11px] text-ink-tertiary">{usage.date}</p>}
        </div>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["vision-usage"] })}
          variant="ghost"
          size="sm"
          disabled={usageQuery.isFetching}
        >
          {usageQuery.isFetching ? "…" : "↻"}
        </Button>
      </div>

      {!usage ? (
        <p className="text-xs text-ink-tertiary">
          {usageQuery.isLoading ? "불러오는 중…" : "아직 사용 기록 없음"}
        </p>
      ) : (
        <>
          <UsageRow
            label="세션 (오늘)"
            current={usage.sessionPagesToday}
            limit={usage.sessionDailyLimit}
            cost={usage.sessionCostTodayUsd}
            pct={sessionPct}
          />
          <UsageRow
            label="시스템 전체 (오늘)"
            current={usage.globalPagesToday}
            limit={usage.globalDailyLimit}
            cost={usage.globalCostTodayUsd}
            pct={globalPct}
          />
        </>
      )}

      <div className="pt-2 border-t border-line-subtle">
        <Button
          onClick={() => cacheMutation.mutate()}
          variant="outline"
          size="sm"
          className="w-full"
          disabled={cacheMutation.isPending}
        >
          {cacheMutation.isPending ? "비우는 중…" : "응답 캐시 비우기"}
        </Button>
        {cacheMutation.isSuccess && (
          <p className="mt-2 text-[11px] text-ink-secondary">
            {cacheMutation.data.message} ({cacheMutation.data.deletedKeys}개)
          </p>
        )}
        {cacheMutation.isError && (
          <p className="mt-2 text-[11px] text-ink-secondary">
            실패: {(cacheMutation.error as Error).message}
          </p>
        )}
      </div>
    </div>
  );
}

function UsageRow({ label, current, limit, cost, pct }: {
  label: string;
  current: number;
  limit: number;
  cost: number;
  pct: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-ink-secondary">{label}</span>
        <span className="text-ink">
          {current}<span className="text-ink-tertiary"> / {limit}p</span>
          <span className="ml-2 text-ink-tertiary">${cost.toFixed(2)}</span>
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded overflow-hidden">
        <div
          className={`h-full rounded transition-all ${pct >= 80 ? "bg-soft-sand" : "bg-matcha"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
