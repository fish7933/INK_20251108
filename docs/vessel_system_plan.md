# 선박별 구인 광고 시스템 전환 계획

## 개요
기존 직급별 구인 광고 시스템을 선박별 시스템으로 전환합니다.
1개 선박 포스팅에 여러 직급이 포함되며, 지원 완료 시 자동으로 확인 이메일이 발송됩니다.

## 데이터베이스 구조

### 1. Vessels Table (선박 테이블)
```sql
app_7c39e793e3_vessels
- id (uuid, primary key)
- vessel_name (text, 선박명)
- vessel_type (text, 선종: Bulk Carrier, Container, Tanker, etc.)
- tonnage (integer, 톤수)
- route (text, 항로)
- flag (text, 선적)
- built_year (integer, 건조년도)
- description (text, 선박 설명)
- image_url (text, 선박 이미지)
- is_active (boolean, 활성 상태)
- created_at (timestamp)
- updated_at (timestamp)
```

### 2. Positions Table (직급 테이블)
```sql
app_7c39e793e3_positions
- id (uuid, primary key)
- vessel_id (uuid, foreign key → vessels.id)
- position_name (text, 직급명: Captain, Chief Engineer, etc.)
- rank (text, 계급: Officer, Rating)
- vacancies (integer, 모집 인원)
- salary_min (integer, 최소 급여)
- salary_max (integer, 최대 급여)
- salary_currency (text, 통화: USD, EUR, etc.)
- contract_duration (text, 계약 기간)
- requirements (text, 자격 요건)
- responsibilities (text, 업무 내용)
- is_active (boolean, 활성 상태)
- created_at (timestamp)
- updated_at (timestamp)
```

### 3. Applications Table (지원서 테이블 - 업데이트)
```sql
app_7c39e793e3_applications
- id (uuid, primary key)
- vessel_id (uuid, foreign key → vessels.id)
- position_id (uuid, foreign key → positions.id)
- full_name (text)
- email (text)
- phone (text)
- nationality (text)
- date_of_birth (date)
- experience_years (integer)
- certificates (text)
- previous_vessels (text)
- expected_salary (integer)
- salary_currency (text)
- cover_letter (text)
- resume_url (text)
- resume_filename (text)
- status (text: pending, reviewing, accepted, rejected)
- email_sent (boolean)
- email_sent_at (timestamp)
- email_recipients (jsonb)
- resume_attached (boolean)
- submitted_date (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

## UI 구조

### 관리자 페이지 (CareersAdmin)
1. **Vessels Tab**: 선박 관리
   - 선박 목록 (카드 형식)
   - 선박 추가/수정/삭제
   - 각 선박의 직급 관리 버튼

2. **Positions Tab**: 직급 관리
   - 선박별 직급 목록
   - 직급 추가/수정/삭제
   - 선박 필터링

3. **Applications Tab**: 지원서 관리
   - 선박별/직급별 필터링
   - 지원서 상세 보기
   - 상태 변경

### 사용자 페이지 (Careers)
1. **선박 그리드**: 활성 선박 카드 표시
   - 선박명, 선종, 톤수, 항로
   - 모집 중인 직급 수
   - 선박 이미지

2. **직급 모달**: 선박 클릭 시 표시
   - 해당 선박의 모든 직급 목록
   - 직급별 상세 정보
   - "Apply" 버튼

3. **지원서 폼**: 직급 선택 시 표시
   - 기존 폼 유지
   - vessel_id + position_id 자동 설정

## 이메일 시스템

### 기존 Function 확장
`app_7c39e793e3_send_application_email`를 수정하여:
1. 관리자에게 이메일 발송 (기존)
2. 지원자에게 확인 이메일 발송 (추가)

### 확인 이메일 내용
- 지원 완료 확인
- 선박명 + 직급명
- 검토 예상 기간
- 연락처 정보

## 구현 순서
1. 데이터베이스 재구성 (기존 테이블 삭제 + 새 테이블 생성)
2. 관리자 페이지 업데이트
3. 사용자 페이지 업데이트
4. 이메일 Function 확장
5. 테스트 및 디버깅