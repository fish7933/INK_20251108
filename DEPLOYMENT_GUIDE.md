# GitHub Actions 자동 배포 설정 가이드

이 프로젝트는 GitHub Actions를 통해 Vercel에 자동으로 배포됩니다.

## 🚀 설정 방법

### 1. Vercel 프로젝트 생성

1. https://vercel.com 접속 및 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - Framework Preset: **Vite**
   - Build Command: `pnpm run build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`

### 2. Vercel 토큰 발급

1. Vercel 대시보드 → Settings → Tokens
2. "Create Token" 클릭
3. 토큰 이름 입력 (예: github-actions)
4. Scope: Full Account
5. 생성된 토큰 복사 (한 번만 표시됩니다!)

### 3. Vercel 프로젝트 ID 및 조직 ID 확인

프로젝트 디렉토리에서 다음 명령어 실행:

```bash
# Vercel CLI 설치
npm install -g vercel

# Vercel 로그인
vercel login

# 프로젝트 링크 (프로젝트 선택)
vercel link

# .vercel/project.json 파일 확인
cat .vercel/project.json
```

파일 내용:
```json
{
  "orgId": "team_xxxxx",
  "projectId": "prj_xxxxx"
}
```

### 4. GitHub Secrets 설정

GitHub 저장소 → Settings → Secrets and variables → Actions → "New repository secret"

다음 시크릿을 추가하세요:

| Secret 이름 | 값 | 설명 |
|------------|-----|------|
| `VERCEL_TOKEN` | `your_vercel_token` | 2단계에서 생성한 토큰 |
| `VERCEL_ORG_ID` | `team_xxxxx` | .vercel/project.json의 orgId |
| `VERCEL_PROJECT_ID` | `prj_xxxxx` | .vercel/project.json의 projectId |
| `VITE_SUPABASE_URL` | `https://kxxdrwwqdjkynbuyzrpz.supabase.co` | Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase Anon Key |

### 5. 배포 테스트

```bash
# main 브랜치에 푸시
git add .
git commit -m "Setup GitHub Actions deployment"
git push origin main
```

GitHub Actions 탭에서 배포 진행 상황을 확인할 수 있습니다.

## 📋 워크플로우 설명

### deploy.yml (프로덕션 배포)
- **트리거**: main/master 브랜치에 푸시할 때
- **작업**:
  1. 코드 체크아웃
  2. Node.js 및 pnpm 설정
  3. 의존성 설치 (캐시 사용)
  4. 린트 검사
  5. 프로젝트 빌드
  6. Vercel에 프로덕션 배포

### preview.yml (프리뷰 배포)
- **트리거**: Pull Request 생성/업데이트 시
- **작업**:
  1. 코드 체크아웃
  2. Node.js 및 pnpm 설정
  3. 의존성 설치
  4. 린트 검사
  5. 프로젝트 빌드
  6. Vercel에 프리뷰 배포

## 🎯 배포 후 확인사항

### 1. Supabase 설정 업데이트

Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://your-project.vercel.app`
- **Redirect URLs**: `https://your-project.vercel.app/**`

### 2. 환경 변수 확인

Vercel 프로젝트 → Settings → Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

모두 설정되어 있는지 확인하세요.

## 🔧 트러블슈팅

### 배포 실패 시

1. **GitHub Actions 로그 확인**
   - GitHub 저장소 → Actions 탭
   - 실패한 워크플로우 클릭
   - 각 단계의 로그 확인

2. **일반적인 문제**
   - Vercel 토큰 만료: 새 토큰 생성 후 GitHub Secrets 업데이트
   - 빌드 오류: 로컬에서 `pnpm run build` 실행하여 확인
   - 환경 변수 누락: GitHub Secrets 및 Vercel 환경 변수 확인

3. **로컬 테스트**
   ```bash
   # 로컬에서 빌드 테스트
   pnpm install
   pnpm run lint
   pnpm run build
   ```

## 📚 추가 자료

- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Vercel 배포 가이드](https://vercel.com/docs/deployments/overview)
- [Vercel CLI 문서](https://vercel.com/docs/cli)

## 💡 팁

1. **자동 배포 비활성화**
   - 워크플로우 파일 삭제 또는 이름 변경

2. **특정 브랜치만 배포**
   - `deploy.yml`의 `branches` 섹션 수정

3. **배포 알림**
   - Slack, Discord 등과 연동 가능
   - GitHub Actions Marketplace에서 알림 액션 검색

4. **배포 승인 프로세스**
   - GitHub Environments 사용
   - 프로덕션 배포 전 승인 필요하도록 설정 가능