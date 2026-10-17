# 인계 문서 (Claude Code → Codex 인계)

작성일: 2026-10-15

## 프로젝트
- **하루한칸**: 매일 습관을 한 칸씩 체크하는 습관 트래커 앱. 첫 목표는 구글 플레이 출시.
- 스택: Expo SDK 57, Expo Router(`src/app/`), React Native 0.86, React 19, TypeScript 6, react-native-reanimated 4, expo-sqlite(kv-store), expo-haptics, phosphor-react-native
- 저장소: https://github.com/Archibald1948/haru-hankan (공개, 브랜치 `main`, 원격과 동기화됨)
- 데이터는 기기 안에만 저장(서버 없음). 라이트/다크 자동 전환.

## 실행/검증 명령
```bash
npm install
npx expo start            # 개발 서버 (Expo Go 로 QR 스캔, 안 되면 --tunnel)
npx expo lint             # 린트
npx tsc --noEmit          # 타입체크
npx expo-doctor           # 설정 진단
```
- 패키지 추가는 `npx expo install <패키지>` 로만 (SDK 호환 버전 해석).
- 테스트 코드/테스트 명령: 없음(확인 필요).
- 작업 끝내기 전에 lint 와 typecheck 실행 (AGENTS.md 지침).

## 현재 상태
- 브랜치 `main`, 작업 트리 깨끗함(커밋 안 된 변경 없음), 원격과 동일.
- 구현 완료: 오늘의 습관 화면(체크, 연속 기록, 최근 7일 점), 습관 추가 화면(직접 입력/추천), 길게 눌러 삭제, 테마(색/모서리/간격 토큰), 다크 모드, PressableScale, 햅틱, 앱 아이콘/스플래시, README, MIT 라이선스.
- 구조: `src/app`(index, new, _layout), `src/components`(check-button, habit-row, pressable-scale), `src/hooks`(use-theme, use-today, use-color-scheme), `src/lib`(date, habits, storage, storage.web), `src/constants/theme.ts`
- 마지막 커밋: `3107707 toss 웹뷰 가이트` (`webview-app-guide.md` 추가, 참고 문서일 뿐 적용 여부는 미정).
- 웹 미리보기(390px, 라이트/다크)로 화면 확인은 했으나, 실제 폰(Expo Go) 확인 결과는 기록에 없음(확인 필요).

## 남은 작업 (우선순위 순)
1. **실기기 테스트 환경 정리**: 마지막 대화에서 Mac 에서 폰 화면을 보려고 `adb`(약 40MB) 설치 + USB/무선 디버깅 연결을 제안했고 사용자 답변 전에 끊김. 현재 `adb` 미설치. 진행 여부 사용자 확인 필요.
2. **플레이스토어 출시 준비**: EAS 빌드/제출 설정(`eas.json` 없음), 패키지 이름/버전, 스토어 자산. 현재 `app.json` 기준 설정 상태는 확인 필요.
3. **앱 이름 최종 확정**: "하루한칸" 은 임시 이름이라고 안내했음(사용자가 언제든 바꿀 수 있다고 함).
4. `webview-app-guide.md`(Next.js + RN 웹뷰 구조 가이드)를 이 프로젝트에 적용할지 결정. 현재 앱은 순수 네이티브 RN 화면이라 필수 아님, 사용자 판단 필요.
5. 알림/위젯/백업 같은 추가 기능은 논의된 기록 없음(확인 필요).

## 주의할 점 / 결정 사항
- **답변은 항상 한국어 존댓말.** 긴 작업 중 영어로 바뀌어 사용자가 두 번 지적함(2026-10-05). 도구 호출 사이 짧은 상태 메시지도 한국어. (Claude 메모리 `always-korean`)
- **Expo 는 API 변경이 잦음.** 코드 쓰기 전에 `package.json` 의 expo 메이저(57) 확인 후 https://docs.expo.dev/versions/v57.0.0/ 와 https://docs.expo.dev/llms.txt 참고. 기억에 의존 금지.
- React Compiler 규칙 때문에 Reanimated 값은 `.set()` 사용. 템플릿의 웹 전용 훅은 정리해 둠.
- 연속 기록 규칙: 오늘 아직 체크 안 했으면 어제까지 기준으로 계산(0 으로 떨어지지 않게).
- `ios/`, `android/` 폴더는 없음(CNG). 직접 만들거나 고치지 말고 `app.json` 과 config plugin 으로 설정.
- 네이티브 모듈 추가 시 Expo Go 로 안 될 수 있음. 개발 빌드 필요.
- 커밋 규칙(사용자 전역 지침): 의미 단위로 잘게 쪼개고 폴더/파일이 다르면 별도 커밋, Conventional Commits(`type(scope): 요약`) 한국어 요약, 사용자가 요청할 때만 커밋/푸시.
- UI 작업 선호: AI 티 나는 디자인 금지(보라색 그라데이션, 똑같은 카드 3장, 엠대시 금지). 완성 후 모바일(390)/데스크톱, 라이트/다크 스크린샷 확인.
- GitHub CLI 로그인 이름이 `kss2002` 로 표시되지만 실제 토큰 계정은 `Archibald1948`(계정명 변경으로 추정). 푸시 시 `Archibald1948` 사용.
- `.claude/settings.json` 에는 expo 플러그인만 활성화되어 있음.

## 지침 파일 위치
- `AGENTS.md`: 프로젝트 지침(Expo 규칙, 명령어, 라우팅, EAS). 이미 존재하며 Codex 가 자동으로 읽음.
- 이 프로젝트에 `CLAUDE.md` 는 없음. 전역 `~/.claude/CLAUDE.md` 의 말투/커밋/UI 규칙은 위 내용에 옮겨 둠.
- 비밀값(키, 토큰)은 이 문서에 없음.
