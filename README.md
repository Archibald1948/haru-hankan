# 하루한칸

매일 지키고 싶은 습관을 하루에 한 칸씩 채워 가는 습관 트래커입니다.
React Native와 Expo로 만들었고, 첫 목표는 구글 플레이 출시예요.

## 기능

- 오늘 할 습관을 한 번에 체크
- 연속 달성 일수와 최근 7일 기록 표시
- 길게 눌러 습관 삭제
- 기록은 기기 안에만 저장 (서버 없음)
- 라이트/다크 모드 자동 전환

## 실행하기

```bash
npm install
npx expo start
```

안드로이드 휴대폰에 [Expo Go](https://expo.dev/go)를 설치하고, 터미널에 뜬 QR 코드를 스캔하면 바로 실행됩니다.
휴대폰과 컴퓨터가 같은 와이파이에 있어야 하고, 연결이 안 되면 `npx expo start --tunnel`을 써 보세요.

## 기술 스택

- Expo SDK 57, Expo Router
- react-native-reanimated (애니메이션)
- expo-sqlite/kv-store (기기 저장소)
- expo-haptics, phosphor-react-native

## 라이선스

MIT
