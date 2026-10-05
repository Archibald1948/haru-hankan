import Storage from 'expo-sqlite/kv-store';

export function readItem(key: string): string | null {
  return Storage.getItemSync(key);
}

export function writeItem(key: string, value: string): void {
  Storage.setItemSync(key, value);
}
