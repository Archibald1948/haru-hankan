# Next.js + React Native 웹뷰 앱 구축 가이드

> 토스 프론트엔드 사례를 바탕으로 정리한 실전용 문서입니다.
> 각 주장의 근거는 문서 하단 [출처](#출처)에 정리했습니다. 출처 없이 적은 부분은 "일반적인 구현 관행"으로 표시했습니다.

---

## 1. 핵심 개념

### 웹뷰(WebView)란
- 네이티브 앱 안에 내장된 브라우저입니다. 주소창·새로고침 없이 웹페이지만 보여줍니다. [5]
- 엔진은 OS마다 다릅니다.
  - **Android**: Chromium 기반
  - **iOS**: WebKit (애플 심사 규정 2.5.6상 웹을 띄우는 앱은 WebKit 사용 필수, EU·일본 예외) [1][2]

### React Native vs Next.js
둘 다 **언어가 아니라 프레임워크**이고, 언어는 둘 다 JavaScript/TypeScript, 기반은 React입니다.

| 구분 | React Native | Next.js |
|---|---|---|
| 결과물 | iOS/Android 앱 (설치 파일) | 웹사이트 |
| 배포처 | App Store / Play Store | 서버 (예: Vercel) |
| 웹뷰 구조에서의 역할 | **껍데기(셸)**: 웹뷰 + 기기 기능 | **실제 화면** |
| 업데이트 | 스토어 심사 필요 | 배포 즉시 반영 |

### 토스는 어떻게 나눠 쓰나
- 최고의 경험이 필요한 곳은 **Native**, 매일 실험하며 개선하는 제품은 **React Native / WebView**. [3]
- 2024년 기준 RN 화면이 WebView 화면보다 더 많이 실행됨. [3]
- 토스뱅크 화면은 대부분 토스 앱 안의 **웹뷰**(Next.js Pages Router). [1]

---

## 2. 아키텍처

```
┌──────────────────┐   main 머지   ┌──────────────┐
│  Next.js 레포     │ ───────────▶ │ Vercel 프로덕션 │ ─▶ https://app.example.com
└──────────────────┘              └──────────────┘            ▲
                                                               │ WebView가 URL 로드
┌──────────────────┐   빌드·심사   ┌──────────────┐            │
│  RN(Expo) 레포    │ ───────────▶ │  스토어 배포   │ ─▶ 사용자 폰 앱
└──────────────────┘              └──────────────┘
        ▲                                   │
        └──────── 앱 브릿지 (postMessage) ───┘
```

- **두 개의 독립 프로젝트**로 운영합니다.
- 화면 대부분을 웹뷰로 띄우면 **실제 개발의 대부분은 Next.js**에서 이뤄지고, RN은 껍데기와 기기 기능 연결만 담당합니다.
- 껍데기는 RN 외에 Swift/Kotlin으로 직접 만들어도 됩니다. RN을 쓰는 이유는 React 경험을 그대로 쓸 수 있어서입니다.

---

## 3. 배포 흐름

### 웹 (Next.js)
- Vercel은 **프로덕션 브랜치(기본 `main`)에 머지될 때마다 프로덕션 배포**를 생성합니다. [6]
- `main` 외 브랜치는 **프리뷰 배포**가 되고, 브랜치별 고유 도메인이 생깁니다. [6]
- → 개발용 앱 빌드에서 프리뷰 URL을 띄우면 실제 앱 환경에서 미리 테스트 가능.

### 앱 (RN)
아래를 바꿀 때만 다시 빌드 → 스토어 제출:
- 웹뷰 설정, 앱 브릿지(카메라·생체인증·햅틱·푸시 등), 아이콘, 권한

### 업데이트가 "즉시"가 아닌 경우
- 이미 열려 있는 화면은 새로고침 전까지 옛 버전입니다.
- 웹뷰 캐시 때문에 늦게 반영될 수 있습니다 → HTML 응답은 `Cache-Control: no-cache` 등으로 짧게 설정 (일반적인 구현 관행).

---

## 4. 구현 단계

### Step 1. Next.js — 모바일 웹뷰 전용 설정

```tsx
// app/layout.tsx 또는 pages/_document.tsx
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,       // 확대 방지
  viewportFit: 'cover',  // 노치 영역까지 사용
};
```

```css
/* globals.css */
body {
  min-height: 100dvh;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  overscroll-behavior: none;            /* 바운스 스크롤 방지 */
  -webkit-tap-highlight-color: transparent;
}
```

**토스가 겪은 웹뷰 함정 (미리 대비할 것)** [3]
- [ ] iOS `position: fixed` 문제
- [ ] iOS `autoFocus` 문제
- [ ] Android WebView 버전마다 동작이 다름
- [ ] History를 자유롭게 제어하기 어려움

### Step 2. RN(Expo) — 웹뷰 껍데기

```bash
npx create-expo-app my-app
cd my-app
npx expo install react-native-webview expo-haptics
```

> `react-native-webview`는 iOS·Android·Windows·macOS를 지원하고 Expo와 호환됩니다.
> 최신 버전은 New Architecture 전용이며 **React Native 0.76+ / iOS 15.1+** 가 필요합니다. [4]

```tsx
// App.tsx
import { useEffect, useRef, useState } from 'react';
import { BackHandler, Platform, SafeAreaView } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';

const WEB_URL = __DEV__
  ? 'https://my-app-git-feature-xxx.vercel.app' // 프리뷰 URL
  : 'https://app.example.com';

const APP_VERSION = Constants.expoConfig?.version ?? '0.0.0';

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  // Android 하드웨어 뒤로가기 → 웹뷰 뒤로가기
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack) {
        webViewRef.current?.goBack();
        return true; // 앱 종료 막기
      }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack]);

  const onMessage = (e: WebViewMessageEvent) => {
    const msg = JSON.parse(e.nativeEvent.data) as BridgeMessage;
    switch (msg.type) {
      case 'HAPTIC':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      // 기능 추가 시 여기에 case 추가
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        source={{ uri: WEB_URL }}
        onMessage={onMessage}
        onNavigationStateChange={(s) => setCanGoBack(s.canGoBack)}
        allowsBackForwardNavigationGestures // iOS 스와이프 뒤로가기
        applicationNameForUserAgent={`MyApp/${APP_VERSION}`} // 웹에서 앱 버전 식별
        bounces={false}
      />
    </SafeAreaView>
  );
}
```

### Step 3. 앱 브릿지 — 웹 ↔ 앱 통신

**메시지 타입은 한 곳에서 정의하고 두 레포가 공유** (복붙 또는 공용 패키지)

```ts
// bridge-types.ts
export type BridgeMessage =
  | { type: 'HAPTIC' }
  | { type: 'OPEN_EXTERNAL'; url: string }
  | { type: 'CLOSE' };
```

**웹 쪽 유틸**

```ts
// lib/bridge.ts
import type { BridgeMessage } from './bridge-types';

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage(message: string): void };
  }
}

export const isInApp = () =>
  typeof window !== 'undefined' && !!window.ReactNativeWebView;

/** UA의 "MyApp/1.2.0"에서 앱 버전 추출 */
export const getAppVersion = (): string | null => {
  if (typeof navigator === 'undefined') return null;
  return navigator.userAgent.match(/MyApp\/([\d.]+)/)?.[1] ?? null;
};

export function postToApp(message: BridgeMessage): boolean {
  if (!isInApp()) return false; // 일반 브라우저에서는 무시
  window.ReactNativeWebView!.postMessage(JSON.stringify(message));
  return true;
}
```

### Step 4. 앱 버전 호환성 (가장 중요)

사용자 폰에는 **옛 버전 앱이 계속 남아 있습니다.** 웹은 즉시 최신이 되지만 앱은 아닙니다.

```ts
import { compare } from 'compare-versions';

// 새 브릿지 기능은 반드시 버전 체크 후 호출
const v = getAppVersion();
if (v && compare(v, '1.3.0', '>=')) {
  postToApp({ type: 'OPEN_EXTERNAL', url });
} else {
  window.open(url); // 구버전 fallback
}
```

> 토스 사례: 앱 브릿지는 앱 밖에서도 문제없이 돌도록 만들어져 있어서, 잘못된 환경(Server Component)에서 호출해도 **에러 없이 조용히 실패**했습니다. [1]
> → `postToApp`이 `false`를 반환하면 로깅하는 등, 실패를 드러나게 만드세요.

---

## 5. 성능 · 체감 품질 체크리스트

토스 퀄리티는 프레임워크보다 **측정과 디테일**에서 나옵니다.

### 로딩
- [ ] iOS(WebKit)는 콘텐츠가 충분하다고 판단할 때까지 첫 표시를 미룰 수 있음
  - 토스 실험: 1·3·5초 지연 영역에서 FCP가 Chromium 64ms vs WebKit 5,065ms [1]
  - 우회: 화면 위에 보이지 않는 SVG 추가 → WebKit FCP 103ms [1]
- [ ] **Chromium과 WebKit 양쪽 모두에서 측정**할 것

### 레이아웃 흔들림 (CLS)
- [ ] 스켈레톤 높이를 실제 콘텐츠 높이와 맞추기
  - 토스: CLS 0.138 → 0.036 [1]
  - 단, 섹션 추가·변경마다 다시 맞춰야 하는 관리 비용이 있음 [1]

### 네이티브 같은 느낌 (일반적인 구현 관행)
- [ ] 뒤로가기: Android 하드웨어 버튼, iOS 스와이프 제스처
- [ ] 키보드가 올라올 때 입력창이 가려지지 않는지
- [ ] 탭 하이라이트·텍스트 선택·롱프레스 메뉴 제거
- [ ] 버튼 탭 시 햅틱 피드백

---

## 6. 스토어 심사 주의사항 (Apple)

| 항목 | 내용 |
|---|---|
| **4.2 최소 기능** | 웹사이트를 단순히 감싼 수준을 넘어서는 기능·UI가 있어야 함. 아니면 반려 가능 [2] |
| **2.5.2** | 심사 후 기능을 바꾸는 코드를 다운로드·실행하면 안 됨 [2] |
| **2.5.6** | 웹 브라우징은 WebKit 사용 [2] |
| **5.1.1(ix)** | 금융 등 규제 분야 앱은 개인이 아닌 해당 서비스를 제공하는 법인이 제출해야 함 [2] |

→ 웹뷰 콘텐츠 갱신 자체는 괜찮지만, 이를 이용해 **앱 성격 자체를 바꾸면 문제**가 됩니다.

---

## 7. 더 나아가기 — 토스의 인프라 (참고)

개인 프로젝트에서 바로 할 필요는 없지만, 규모가 커지면 참고할 방향입니다. [3]

- **화면별 렌더링 방식 선택**: RN은 파일 시스템에서 JS를 읽어 웹뷰의 네트워크 로딩을 없앰 → "매일 방문 미션" 로딩 1초 이상 단축
- **마이크로 프론트엔드**: Shared 번들 + Service 번들로 나눠 필요한 JS만 동적 로드
- **배포**: 자체 어드민으로 CDN에 1초 배포, 1~100% 카나리 배포
- **빌드**: Metro 대신 ESBuild → 빌드 1분 이내
- **코드 기준 공유**: Frontend Fundamentals [7], 디자인 시스템 TDS (RN 버전 포함) [3]

---

## 8. 다음 할 일

- [ ] Next.js 프로젝트에 모바일 웹뷰 설정 적용 (Step 1)
- [ ] Expo 프로젝트 생성 + WebView 껍데기 (Step 2)
- [ ] `bridge-types.ts` 정의 + 햅틱 1개로 브릿지 동작 확인 (Step 3)
- [ ] UA 기반 앱 버전 체크 유틸 (Step 4)
- [ ] 실기기(iOS·Android)에서 FCP·CLS 측정 (5장)
- [ ] 앱다운 네이티브 기능 최소 1~2개 확보 후 심사 제출 (6장)

---

## 출처

1. [App Router의 장점은 우리에게도 장점일까요? – 토스테크 (2026.09.09)](https://toss.tech/article/52999)
2. [App Review Guidelines – Apple Developer](https://developer.apple.com/app-store/review/guidelines/)
3. [토스가 꿈꾸는 React Native 기술의 미래 – 토스테크 (2024.03.25)](https://toss.tech/article/react-native-2024)
4. [react-native-webview – GitHub](https://github.com/react-native-webview/react-native-webview)
5. [웹뷰(WebView) – 토스페이먼츠 개발자센터 용어사전](https://docs.tosspayments.com/resources/glossary/webview)
6. [Deploying Git Repositories with Vercel – Vercel Docs](https://vercel.com/docs/git)
7. [Frontend Fundamentals](https://frontend-fundamentals.com/)
