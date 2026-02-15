KODEX200 추종 종목 모니터링 웹앱 기술서

1. 프로젝트 개요

본 프로젝트는 kodex200.json 파일에 정의된 200개 종목 데이터를 기반으로, 다음 기능을 제공하는 웹 애플리케이션을 구축하는 것을 목표로 한다.
 1. KODEX200 ETF의 실시간(또는 장중) 현재가 조회
 2. KODEX200이 추종하는 200개 종목의 현재가 및 주요 지표 조회
 3. 데스크탑 HTS 수준의 직관적 UI 제공

기술 스택은 다음과 같다.
 • Framework: Next.js (App Router 기반)
 • UI: shadcn/ui
 • Styling: Tailwind CSS
 • Data Fetching: Server Actions + Route Handlers
 • 상태 관리: React Query 또는 SWR (선택)
 • 배포: Vercel 또는 자체 서버

⸻

1. 시스템 아키텍처

2.1 전체 구조

[Client (Next.js)]
↓
[API Route / Server Action]
↓
[외부 주식 시세 API]
↓
[kodex200.json]

2.2 주요 구성 요소
 1. kodex200.json
 • KODEX200이 보유한 200개 종목 코드 및 종목명 포함
 • 예시 구조:
{
“etf”: “KODEX200”,
“trackingIndex”: “KOSPI200”,
“components”: [
{
“code”: “005930”,
“name”: “삼성전자”
},
{
“code”: “000660”,
“name”: “SK하이닉스”
}
]
}
 2. 외부 시세 API
 • 국내 주식 시세 조회 API 필요 (예: 증권사 Open API, 공공 API, 유료 API 등)
 • 기능 요구사항:
 • 개별 종목 현재가 조회
 • 복수 종목 일괄 조회
 • ETF 현재가 조회
 3. Next.js 서버 레이어
 • app/api/quotes/route.ts
 • kodex200.json을 읽고 종목 코드 리스트 추출
 • 외부 API 호출 후 가공
 • 클라이언트에 JSON 반환

⸻

1. 기능 명세

3.1 메인 대시보드

경로: /

구성:
 1. 상단 요약 패널
 • KODEX200 현재가
 • 전일 대비 등락률
 • 거래량
 • 장 상태 (개장/마감)
 2. 종목 테이블
 • 컬럼
 • 종목명
 • 종목코드
 • 현재가
 • 등락률
 • 거래량
 • 정렬 기능 (등락률, 거래량 등)
 • 검색 필터
 3. 자동 새로고침
 • 장중 10~30초 간격 polling
 • React Query의 refetchInterval 활용

⸻

1. Next.js 프로젝트 구조

hts/
 ├─ app/
 │   ├─ page.tsx
 │   ├─ api/
 │   │   └─ quotes/
 │   │       └─ route.ts
 │   └─ layout.tsx
 ├─ components/
 │   ├─ EtfSummaryCard.tsx
 │   ├─ StockTable.tsx
 │   └─ RefreshButton.tsx
 ├─ lib/
 │   ├─ fetchQuotes.ts
 │   └─ loadKodexComponents.ts
 ├─ data/
 │   └─ kodex200.json
 ├─ styles/
 └─ package.json

⸻

1. 핵심 구현 로직

5.1 kodex200.json 로딩

lib/loadKodexComponents.ts
 • fs 모듈을 이용하여 서버 사이드에서 JSON 로딩
 • components 배열에서 종목코드 추출

5.2 시세 데이터 병합
 1. kodex200.json에서 종목코드 배열 생성
 2. 외부 API로 일괄 요청
 3. 응답 데이터를 Map 형태로 변환
 4. 기존 종목 메타데이터와 병합

반환 형태 예시:

{
etf: {
price: 35000,
changeRate: 0.52
},
stocks: [
{
code: “005930”,
name: “삼성전자”,
price: 72000,
changeRate: -0.12,
volume: 1234567
}
]
}

⸻

1. UI 설계 (shadcn + Tailwind)

6.1 EtfSummaryCard
 • Card 컴포넌트 사용
 • 현재가: text-2xl font-bold
 • 등락률 색상 조건부 처리
 • 상승: text-red-500
 • 하락: text-blue-500

6.2 StockTable
 • shadcn Table 컴포넌트 기반
 • sticky header 적용
 • hover 효과
 • 반응형 스크롤

⸻

1. MCP 및 필요한 Skill

7.1 MCP (Model Context Protocol) 활용
 1. 파일 시스템 접근 MCP
 • kodex200.json 자동 로딩
 • 종목 변경 시 즉시 반영
 2. 외부 API 연동 MCP
 • 증권사 Open API 연동
 • 인증 토큰 관리
 3. 스케줄링 MCP
 • 장중 자동 업데이트
 • 장 종료 시 polling 중단

7.2 필요한 기술 Skill
 1. Next.js App Router 구조 이해
 2. 서버 컴포넌트와 클라이언트 컴포넌트 분리 설계
 3. REST API 설계 및 외부 API 연동
 4. TypeScript 타입 설계 능력
 5. React Query 또는 SWR를 이용한 데이터 캐싱 전략
 6. Tailwind 기반 반응형 UI 설계
 7. 금융 데이터 정합성 검증 및 예외 처리

⸻

1. 확장 계획
 1. 종목 상세 페이지 (/stocks/[code])
 2. 캔들 차트 (TradingView 위젯 또는 chart library)
 3. 포트폴리오 가중치 기반 ETF 추적 오차 계산
 4. 알림 기능 (특정 등락률 도달 시)

⸻

1. 결론

본 설계는 kodex200.json을 단일 진실 공급원(Single Source of Truth)으로 활용하여, ETF와 구성 종목을 통합 모니터링하는 데 목적이 있다. 구조적으로 서버 중심 데이터 집계 후 클라이언트에 전달하는 방식을 채택함으로써, 성능과 보안(외부 API 키 보호)을 동시에 확보한다.
