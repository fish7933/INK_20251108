# 선박별 구인 광고 시스템 전환 계획

## 현재 시스템 분석
- **현재**: 직급별로 개별 구인 광고 (1 직급 = 1 포스팅)
- **새로운**: 선박별로 1개 포스팅 (1 선박 = 여러 직급)

## 데이터베이스 변경 사항

### 1. job_postings 테이블 구조 변경
```sql
-- 기존 구조
{
  id: string
  title: string (예: "Chief Engineer")
  position: string (단일 직급)
  vessel_type: string
  location: string
  salary_range: string
  requirements: string[]
  responsibilities: string[]
  status: 'active' | 'closed'
  created_at: string
}

-- 새로운 구조
{
  id: string
  vessel_name: string (예: "M/V OCEAN STAR")
  vessel_type: string (예: "Container Ship")
  vessel_description: string (선박 설명)
  location: string
  positions: [
    {
      position_name: string (예: "Chief Engineer")
      openings: number (모집 인원)
      salary_range: string
      requirements: string[]
      responsibilities: string[]
    }
  ]
  status: 'active' | 'closed'
  created_at: string
}
```

### 2. applications 테이블 구조 변경
```sql
-- 추가 필드
{
  vessel_id: string (job_posting id)
  vessel_name: string
  selected_position: string (지원한 직급)
  ...기존 필드들
}
```

## 구현 단계

### Phase 1: 데이터베이스 마이그레이션
1. 새로운 테이블 구조 생성
2. 기존 데이터 마이그레이션 (직급별 → 선박별 그룹화)
3. 테스트 데이터 확인

### Phase 2: 타입 정의 업데이트
1. `src/lib/supabase.ts` - JobPosting 인터페이스 수정
2. `src/pages/admin/types.ts` - 타입 동기화
3. Position 서브타입 정의

### Phase 3: 관리자 페이지 수정
1. Job Postings 탭 - 선박별 등록 UI
2. 각 선박에 여러 직급 추가/수정/삭제 기능
3. 직급별 모집 인원, 급여, 요구사항 관리

### Phase 4: 사용자 페이지 수정
1. Careers 페이지 - 선박별 카드 표시
2. 상세 페이지 - 선박 정보 + 직급 목록
3. 지원 폼 - 직급 선택 드롭다운 추가

### Phase 5: 이메일 자동 발송
1. Edge Function 생성 (`send_application_confirmation`)
2. 지원 완료 시 자동 트리거
3. 이메일 템플릿 (선박명, 직급, 지원 일시 포함)

### Phase 6: 테스트 및 배포
1. 전체 플로우 테스트
2. 빌드 및 린트 체크
3. GitHub 푸시

## 이메일 서비스 설정 필요
- Resend API (추천)
- SendGrid
- 또는 SMTP 설정

## 예상 작업 시간
- Phase 1-2: 30분
- Phase 3: 1시간
- Phase 4: 1시간
- Phase 5: 30분
- Phase 6: 30분
총 약 3.5시간