import React, { useState, useCallback } from 'react';
import { Button } from '../../shared/ui/Button.tsx';
import { Input } from '../../shared/ui/Input.tsx';
import { Chip } from '../../shared/ui/Chip.tsx';
import { advancedSearchService, AdvancedSearchRequest, SearchFilter, SearchResult } from '../../shared/services/AdvancedSearchService.ts';

interface AdvancedSearchPanelProps {
  sessionId: string | null;
  baseUrl: string;
  onSearchResults: (results: SearchResult[]) => void;
  onError: (error: string) => void;
}

const SEARCH_TYPES: Array<{ value: 'SEMANTIC' | 'KEYWORD' | 'HYBRID'; label: string }> = [
  { value: 'SEMANTIC', label: '의미' },
  { value: 'KEYWORD', label: '키워드' },
  { value: 'HYBRID', label: '하이브리드' },
];

export const AdvancedSearchPanel: React.FC<AdvancedSearchPanelProps> = ({
  sessionId,
  baseUrl,
  onSearchResults,
  onError,
}) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'SEMANTIC' | 'KEYWORD' | 'HYBRID'>('HYBRID');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || !sessionId) return;

    setLoading(true);
    try {
      advancedSearchService.setBaseUrl(baseUrl);
      const request: AdvancedSearchRequest = {
        query: query.trim(),
        searchType,
        filters: filters.length > 0 ? filters : undefined,
        page: 0,
        size: 10,
        sessionId,
      };
      const response = await advancedSearchService.search(request);
      setResults(response.results);
      setExpandedIndex(null);
      setSearched(true);
      onSearchResults(response.results);
      setSearchHistory(prev => [query, ...prev.filter(q => q !== query).slice(0, 4)]);
    } catch (error) {
      onError('검색 중 오류가 발생했습니다: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [query, searchType, filters, sessionId, baseUrl, onSearchResults, onError]);

  const addFilter = useCallback(() => {
    setFilters(prev => [...prev, { field: 'score', operator: 'GREATER_THAN', value: 0.8 }]);
  }, []);

  const removeFilter = useCallback((index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateFilter = useCallback((index: number, field: keyof SearchFilter, value: any) => {
    setFilters(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f));
  }, []);

  return (
    <div className="space-y-5">
      <div className="px-2.5 py-2 bg-canvas border border-line-subtle rounded text-[11px] text-ink-secondary leading-relaxed">
        업로드한 문서에서 직접 검색합니다. LLM 답변 없이 청크 원본을 보여줘요 — RAG가 어떤 자료를 참조하는지 미리 확인용.
      </div>

      <Section title="검색어">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={setQuery}
            placeholder="검색할 내용 입력"
            className="flex-1"
          />
          <Button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            variant="primary"
            size="sm"
          >
            {loading ? '…' : '검색'}
          </Button>
        </div>
      </Section>

      <Section title="검색 타입">
        <div className="flex gap-1.5 flex-wrap">
          {SEARCH_TYPES.map((t) => (
            <Chip
              key={t.value}
              onClick={() => setSearchType(t.value)}
              active={searchType === t.value}
              size="sm"
            >
              {t.label}
            </Chip>
          ))}
        </div>
      </Section>

      <Section
        title="필터"
        action={
          <Button onClick={addFilter} size="sm" variant="ghost" className="text-xs">
            + 추가
          </Button>
        }
      >
        {filters.length === 0 ? (
          <p className="text-[11px] text-ink-tertiary">필터 없음</p>
        ) : (
          <div className="space-y-2">
            {filters.map((filter, index) => (
              <FilterRow
                key={index}
                filter={filter}
                onChange={(field, value) => updateFilter(index, field, value)}
                onRemove={() => removeFilter(index)}
              />
            ))}
          </div>
        )}
      </Section>

      {searched && (
        <Section title={`결과 ${results.length > 0 ? `(${results.length})` : ''}`}>
          {results.length === 0 ? (
            <p className="text-[11px] text-ink-tertiary text-center py-3">
              매칭되는 청크가 없습니다.
            </p>
          ) : (
            <div className="space-y-1.5">
              {results.map((r, i) => (
                <ResultItem
                  key={r.id ?? i}
                  result={r}
                  expanded={expandedIndex === i}
                  onToggle={() => setExpandedIndex(expandedIndex === i ? null : i)}
                />
              ))}
            </div>
          )}
        </Section>
      )}

      {searchHistory.length > 0 && (
        <Section title="최근 검색어">
          <div className="flex flex-wrap gap-1.5">
            {searchHistory.map((q, i) => (
              <Chip key={i} onClick={() => setQuery(q)} variant="default" size="sm">
                {q}
              </Chip>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
};

function ResultItem({
  result,
  expanded,
  onToggle,
}: {
  result: SearchResult;
  expanded: boolean;
  onToggle: () => void;
}) {
  const score = typeof result.score === 'number' ? result.score : 0;
  const title = (result.metadata?.title as string) || `chunk #${result.id}`;
  const docId = result.metadata?.documentId as string | undefined;
  const chunkIdx = result.metadata?.chunkIndex as number | undefined;

  return (
    <div className="border border-line-subtle rounded-md hover:bg-muted transition-colors">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-2.5 py-2 space-y-1"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-ink truncate" title={title}>
            {title}
          </span>
          <span className="text-[10px] text-matcha-hover bg-matcha-soft px-1.5 py-0.5 rounded shrink-0">
            {score.toFixed(3)}
          </span>
        </div>
        <p className={`text-[11px] text-ink-secondary leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
          {result.content}
        </p>
        {expanded && (docId || chunkIdx !== undefined) && (
          <div className="text-[10px] text-ink-tertiary pt-1 border-t border-line-subtle">
            {docId && <span>doc {docId.substring(0, 8)}…</span>}
            {chunkIdx !== undefined && <span> · chunk {chunkIdx}</span>}
          </div>
        )}
      </button>
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wide">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function FilterRow({
  filter,
  onChange,
  onRemove,
}: {
  filter: SearchFilter;
  onChange: (field: keyof SearchFilter, value: any) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-1.5 p-2 bg-canvas border border-line-subtle rounded-md">
      <div className="grid grid-cols-2 gap-1.5">
        <select
          value={filter.field}
          onChange={(e) => onChange('field', e.target.value)}
          className="text-xs border border-line rounded px-2 py-1 bg-elevated text-ink"
        >
          <option value="score">점수</option>
          <option value="title">제목</option>
          <option value="createdAt">생성일</option>
        </select>
        <select
          value={filter.operator}
          onChange={(e) => onChange('operator', e.target.value)}
          className="text-xs border border-line rounded px-2 py-1 bg-elevated text-ink"
        >
          <option value="GREATER_THAN">{'>'}</option>
          <option value="LESS_THAN">{'<'}</option>
          <option value="EQUALS">=</option>
          <option value="CONTAINS">포함</option>
        </select>
      </div>
      <div className="flex gap-1.5">
        <Input
          value={String(filter.value ?? '')}
          onChange={(v) => onChange('value', v)}
          placeholder="값"
          className="flex-1"
        />
        <Button onClick={onRemove} variant="ghost" size="sm" className="text-xs">✕</Button>
      </div>
    </div>
  );
}
