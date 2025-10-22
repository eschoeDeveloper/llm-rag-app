# LLM RAG App

고급 LLM + RAG (Retrieval Augmented Generation) 웹 애플리케이션입니다. 문서 업로드, 고급 검색, 대화 스레드 관리, 그리고 컨텍스트 유지 기능을 제공하는 현대적인 React 애플리케이션입니다.

## 🚀 주요 기능

### 💬 통합 채팅 인터페이스
- **탭 기반 UI**: 채팅, 검색, 스레드, 문서 관리가 하나의 인터페이스에 통합
- **실시간 채팅**: WebSocket 기반 실시간 대화
- **컨텍스트 유지**: 이전 대화 내용을 자동으로 기억
- **세션 관리**: 자동 세션 ID 생성 및 관리

### 🔍 고급 검색
- **하이브리드 검색**: 의미 검색 + 키워드 검색 결합
- **고급 필터링**: 점수, 날짜, 제목별 필터 옵션
- **검색 히스토리**: 최근 검색어 자동 저장 및 재사용
- **실시간 결과**: 검색 결과 즉시 표시

### 🧵 대화 스레드 관리
- **스레드 생성**: 주제별 대화 분리 관리
- **스레드 목록**: 모든 대화 스레드 한눈에 보기
- **상태 관리**: 활성/보관/삭제 상태 관리
- **제목 관리**: 대화 제목 수정 및 관리

### 📄 문서 업로드 및 관리
- **다양한 형식 지원**: PDF, DOCX, TXT, MD 파일
- **진행률 표시**: 업로드 진행률 실시간 표시
- **문서 목록**: 업로드된 문서 관리
- **메타데이터**: 제목, 설명, 카테고리 관리

### ⚙️ 고급 설정
- **RAG 설정**: Top K, Threshold 등 파라미터 조정
- **프롬프트 템플릿**: 다양한 프롬프트 템플릿 제공
- **커스텀 프롬프트**: 사용자 정의 프롬프트 작성
- **Rate Limiting**: 요청 제한 상태 표시

## 🛠 기술 스택

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build**: Create React App
- **HTTP Client**: Fetch API
- **State Management**: React Hooks
- **UI Components**: Custom Components

## 📦 설치 및 실행

### 필수 요구사항
- Node.js 16+ 
- npm 또는 yarn

### 설치
```bash
# 저장소 클론
git clone https://github.com/your-username/llm-rag-app.git
cd llm-rag-app

# 의존성 설치
npm install
```

### 개발 서버 실행
```bash
npm start
```

### 프로덕션 빌드
```bash
npm run build
```

## 🔧 환경 설정

### 환경 변수
`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
REACT_APP_API_BASE=https://your-api-url.com/api
```

### API 연결
기본적으로 Heroku에 배포된 API에 연결됩니다:
```
https://llm-rag-api-a8768292f672.herokuapp.com/api
```

## 📱 사용법

### 1. 채팅 시작
1. **채팅 탭**에서 질문을 입력하세요
2. **Ask Mode**: 직접 질문 (컨텍스트 없음)
3. **Chat Mode**: RAG 기반 대화 (컨텍스트 포함)

### 2. 고급 검색
1. **검색 탭**으로 이동
2. 검색어 입력 및 검색 타입 선택
3. 필터 옵션 설정 (선택사항)
4. 검색 결과 확인

### 3. 대화 스레드 관리
1. **스레드 탭**으로 이동
2. "새 스레드" 버튼으로 스레드 생성
3. 기존 스레드 클릭하여 대화 이어가기
4. 스레드 보관/삭제 관리

### 4. 문서 업로드
1. **문서 탭**으로 이동
2. 파일 선택 (PDF, DOCX, TXT, MD)
3. 문서 정보 입력 (제목, 설명, 카테고리)
4. 업로드 진행률 확인

## 🎨 UI/UX 특징

### 반응형 디자인
- **모바일 친화적**: 모든 화면 크기에서 최적화
- **탭 기반 네비게이션**: 직관적인 사용자 경험
- **실시간 피드백**: 로딩 상태, 진행률, 에러 메시지

### 시각적 피드백
- **그라데이션 디자인**: 현대적이고 세련된 UI
- **애니메이션**: 부드러운 전환 효과
- **상태 표시**: 명확한 상태 인디케이터

## 📁 프로젝트 구조

```
src/
├── features/                 # 기능별 컴포넌트
│   ├── chat/               # 채팅 관련
│   │   ├── ChatPanel.tsx
│   │   └── EnhancedChatPanel.tsx
│   ├── search/            # 검색 기능
│   │   └── AdvancedSearchPanel.tsx
│   ├── conversation/      # 대화 스레드
│   │   └── ConversationThreadPanel.tsx
│   ├── document/          # 문서 관리
│   │   └── DocumentUploadPanel.tsx
│   └── vector/            # 벡터 검색
│       └── VectorPanel.tsx
├── shared/                 # 공통 컴포넌트
│   ├── api/              # API 클라이언트
│   ├── hooks/            # 커스텀 훅
│   ├── services/         # 서비스 레이어
│   ├── types/            # 타입 정의
│   └── ui/               # UI 컴포넌트
└── App.tsx               # 메인 앱
```

## 🔌 API 연동

### 서비스 레이어
- **RAGService**: 채팅 및 RAG 기능
- **AdvancedSearchService**: 고급 검색
- **ConversationThreadService**: 대화 스레드 관리
- **DocumentUploadService**: 문서 업로드

### 에러 처리
- **사용자 친화적 메시지**: 기술적 에러를 이해하기 쉬운 메시지로 변환
- **재시도 메커니즘**: 네트워크 오류 시 자동 재시도
- **로딩 상태**: 명확한 로딩 인디케이터

## 🚀 배포

### GitHub Pages
```bash
npm run build
# build 폴더를 GitHub Pages에 배포
```

### Netlify
```bash
npm run build
# build 폴더를 Netlify에 드래그 앤 드롭
```

### Vercel
```bash
npm run build
# Vercel CLI로 배포
```

## 🧪 테스트

### 단위 테스트
```bash
npm test
```

### E2E 테스트
```bash
npm run test:e2e
```

## 📈 성능 최적화

- **코드 분할**: React.lazy를 사용한 지연 로딩
- **메모이제이션**: React.memo, useMemo, useCallback 활용
- **이미지 최적화**: WebP 형식 지원
- **번들 최적화**: Tree shaking으로 불필요한 코드 제거

## 🛡 보안

- **XSS 방지**: 입력값 검증 및 이스케이프
- **CSRF 보호**: SameSite 쿠키 설정
- **HTTPS**: 프로덕션 환경에서 HTTPS 강제

## 📝 라이선스

MIT License

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문제가 있으시면 이슈를 생성해주세요.

## 🎯 로드맵

- [ ] 다크 모드 지원
- [ ] 다국어 지원 (i18n)
- [ ] PWA 기능 추가
- [ ] 오프라인 지원
- [ ] 실시간 협업 기능
- [ ] 고급 분석 대시보드