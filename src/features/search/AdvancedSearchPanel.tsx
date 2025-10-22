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
      onSearchResults(response.results);
      
      // 검색 히스토리에 추가
      setSearchHistory(prev => [query, ...prev.slice(0, 4)]);
    } catch (error) {
      onError('검색 중 오류가 발생했습니다: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [query, searchType, filters, sessionId, baseUrl, onSearchResults, onError]);

  const addFilter = useCallback(() => {
    const newFilter: SearchFilter = {
      field: 'score',
      operator: 'GREATER_THAN',
      value: 0.8,
    };
    setFilters(prev => [...prev, newFilter]);
  }, []);

  const removeFilter = useCallback((index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateFilter = useCallback((index: number, field: keyof SearchFilter, value: any) => {
    setFilters(prev => prev.map((filter, i) => 
      i === index ? { ...filter, [field]: value } : filter
    ));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">고급 검색</h3>
      
      {/* 검색어 입력 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">검색어</label>
        <div className="flex space-x-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색어를 입력하세요..."
            className="flex-1"
          />
          <Button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-6"
          >
            {loading ? '검색 중...' : '검색'}
          </Button>
        </div>
      </div>

      {/* 검색 타입 선택 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">검색 타입</label>
        <div className="flex space-x-2">
          {(['SEMANTIC', 'KEYWORD', 'HYBRID'] as const).map((type) => (
            <Chip
              key={type}
              onClick={() => setSearchType(type)}
              active={searchType === type}
              className="cursor-pointer"
            >
              {type === 'SEMANTIC' ? '의미 검색' : 
               type === 'KEYWORD' ? '키워드 검색' : '하이브리드 검색'}
            </Chip>
          ))}
        </div>
      </div>

      {/* 필터 설정 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">필터</label>
          <Button onClick={addFilter} size="sm" variant="outline">
            + 필터 추가
          </Button>
        </div>
        
        {filters.map((filter, index) => (
          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
            <select
              value={filter.field}
              onChange={(e) => updateFilter(index, 'field', e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="score">점수</option>
              <option value="title">제목</option>
              <option value="createdAt">생성일</option>
            </select>
            
            <select
              value={filter.operator}
              onChange={(e) => updateFilter(index, 'operator', e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="GREATER_THAN">보다 큰</option>
              <option value="LESS_THAN">보다 작은</option>
              <option value="EQUALS">같은</option>
              <option value="CONTAINS">포함하는</option>
            </select>
            
            <Input
              value={filter.value}
              onChange={(e) => updateFilter(index, 'value', e.target.value)}
              placeholder="값"
              className="w-32"
            />
            
            <Button
              onClick={() => removeFilter(index)}
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              삭제
            </Button>
          </div>
        ))}
      </div>

      {/* 검색 히스토리 */}
      {searchHistory.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">최근 검색어</label>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((historyQuery, index) => (
              <Chip
                key={index}
                onClick={() => setQuery(historyQuery)}
                className="cursor-pointer hover:bg-blue-100"
              >
                {historyQuery}
              </Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
