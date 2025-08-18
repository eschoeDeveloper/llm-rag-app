# ⚡ LLM-RAG-APP

---
## 📖 프로젝트 개요

**LLM-RAG-APP** 은 react 기반의 LLM+RAG 테스팅을 위한 모바일 앱으로서, OpenAI Client를 통한 LLM 및 PgVector + PostgreSQL 기반의 RAG API를 거쳐서 사용자 입력에 대한 결과를 모델링으로 받아오는 테스팅입니다.

---

## 🛠 주요 로직

1. ASK (no RAG) -> OPENAI CLIENT를 통한 LLM
2. CHAT (RAG) -> PgVector를 통한 벡터 연산 및 Top-K 유사도 검색
3. Vector Search -> 벡터 수치 및 pgVector 라이브러리를 활용한 검색

---

## 🏗 아키텍처 및 기술 스택

### 프론트엔드

# **언어/프레임워크** : react 19, tailwind 3.x

---

## 🚀 설치 및 실행

1. 저장소 클론

   ```bash
   git clone https://github.com/eschoeDeveloper/llm-rag-app.git
   cd llm-rag-app
   ```


---

## 📂 프로젝트 구조

```
├── 
│   ├── LLM-RAG-APP       # Config 클래스
│   └── 
├── 
│   ├── application.yaml # 애플리케이션 설정 파일
```

---

## 🤝 연락처

* **GitHub:** [github.com/eschoeDeveloper/llm-rag-app](https://github.com/eschoeDeveloper/llm-rag-app)
* **Email:** [develop.eschoe@gmail.com](mailto:develop.eschoe@gmail.com)

---

## 📜 라이선스

Apache License 2.0 © 2025 ChoeEuiSeung
