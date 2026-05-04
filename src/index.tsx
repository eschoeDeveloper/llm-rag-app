import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import { AppRouter } from './Router.tsx';

/**
 * React Query 전역 설정.
 * - 1분 staleTime: 같은 query key 1분 안 재호출 방지 (사용량 카드 등 자주 보는 패널 트래픽 ↓)
 * - 5분 gcTime: 화면 언마운트 후 5분간 캐시 보존 (탭 전환 시 즉시 표시)
 * - 1회 retry: 일시 네트워크 오류 자동 복구, 영속 오류는 빨리 노출
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  </React.StrictMode>
);
