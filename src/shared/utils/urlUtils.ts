/**
 * 상대 경로를 절대 URL로 변환하는 유틸리티 함수
 * 프로덕션 환경에서 baseUrl이 상대 경로(/api)인 경우 window.location.origin을 사용하여 절대 URL로 변환
 */
export function toAbsoluteUrl(baseUrl: string, path: string): string {
  // 이미 절대 URL이면 그대로 사용
  if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
    // baseUrl 끝에 슬래시가 있고 path 시작이 슬래시면 중복 제거
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  }
  
  // 상대 경로인 경우 window.location.origin 사용
  if (typeof window !== 'undefined') {
    const cleanBase = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    // baseUrl 끝에 슬래시 제거
    const finalBase = cleanBase.endsWith('/') ? cleanBase.slice(0, -1) : cleanBase;
    return `${window.location.origin}${finalBase}${cleanPath}`;
  }
  
  // window가 없는 경우 (SSR) 그대로 반환
  return `${baseUrl}${path}`;
}

