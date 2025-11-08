# 선원 채용 시스템 개발 계획

## 1. 데이터베이스 설계
- [ ] Supabase 테이블 생성 (job_postings, applications, user_profiles)
- [ ] RLS 정책 설정
- [ ] Storage 버킷 생성 (이력서, 자격증)

## 2. 인증 시스템
- [ ] 로그인 페이지 (Login.tsx)
- [ ] 회원가입 페이지 (Signup.tsx)
- [ ] 인증 컨텍스트 (AuthContext.tsx)
- [ ] 보호된 라우트 (ProtectedRoute.tsx)

## 3. 구인 광고 관리 (관리자)
- [ ] 관리자 대시보드 (AdminDashboard.tsx)
- [ ] 구인 광고 등록 페이지 (CreateJob.tsx)
- [ ] 구인 광고 수정 페이지 (EditJob.tsx)
- [ ] 지원자 관리 페이지 (Applications.tsx)

## 4. 구인 광고 보기 (일반 사용자)
- [ ] 채용 공고 목록 페이지 (Careers.tsx)
- [ ] 채용 공고 상세 페이지 (JobDetail.tsx)
- [ ] 지원서 작성 페이지 (ApplyJob.tsx)
- [ ] 내 지원 내역 페이지 (MyApplications.tsx)

## 5. 공통 컴포넌트
- [ ] 네비게이션 바 업데이트 (로그인/로그아웃 버튼)
- [ ] 파일 업로드 컴포넌트

## 6. 라우팅 설정
- [ ] App.tsx 라우트 추가

## 파일 구조
```
src/
├── contexts/
│   └── AuthContext.tsx
├── pages/
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── Signup.tsx
│   ├── careers/
│   │   ├── Careers.tsx
│   │   ├── JobDetail.tsx
│   │   ├── ApplyJob.tsx
│   │   └── MyApplications.tsx
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── CreateJob.tsx
│       ├── EditJob.tsx
│       └── Applications.tsx
├── components/
│   ├── ProtectedRoute.tsx
│   └── FileUpload.tsx
└── lib/
    └── supabase.ts
```

## 데이터베이스 스키마

### job_postings 테이블
- id (uuid, primary key)
- title (text)
- vessel_type (text)
- position (text)
- requirements (text)
- salary_range (text)
- contract_duration (text)
- vacancies (integer)
- location (text)
- deadline (date)
- description (text)
- status (text: 'active', 'closed')
- created_at (timestamp)
- created_by (uuid, foreign key to auth.users)

### applications 테이블
- id (uuid, primary key)
- job_id (uuid, foreign key to job_postings)
- user_id (uuid, foreign key to auth.users)
- full_name (text)
- email (text)
- phone (text)
- experience (text)
- certificates (text)
- cover_letter (text)
- resume_url (text)
- certificates_url (text)
- status (text: 'pending', 'reviewed', 'accepted', 'rejected')
- created_at (timestamp)

### user_profiles 테이블
- id (uuid, primary key, foreign key to auth.users)
- full_name (text)
- role (text: 'admin', 'user')
- created_at (timestamp)