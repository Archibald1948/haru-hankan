// 웹 미리보기용. expo-sqlite는 웹에서 추가 서버 설정이 필요해서 localStorage로 대신한다.
export function readItem(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeItem(key: string, value: string): void {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    // 저장소를 쓸 수 없는 환경(시크릿 창 등)에서는 메모리 상태만 유지한다.
  }
}
