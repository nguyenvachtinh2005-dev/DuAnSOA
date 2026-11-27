export const MOCK_ADMIN_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInJvbGUiOiJBRE1JTiJ9.mock-signature';

export const MOCK_CUSTOMER_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEwMSwicm9sZSI6IkNVU1RPTUVSIn0.mock-signature';

const memoryStorage = new Map<string, string>();

function getSafeStorage(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  const globalLocalStorage = (globalThis as { localStorage?: Storage }).localStorage;
  if (
    globalLocalStorage &&
    typeof globalLocalStorage.setItem === 'function' &&
    typeof globalLocalStorage.removeItem === 'function'
  ) {
    return globalLocalStorage;
  }

  return {
    getItem: (key: string) => memoryStorage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memoryStorage.set(key, value);
    },
    removeItem: (key: string) => {
      memoryStorage.delete(key);
    },
  };
}

export function setMockToken(token: string | null = MOCK_ADMIN_TOKEN): void {
  const storage = getSafeStorage();
  if (token) {
    storage.setItem('accessToken', token);
    storage.setItem('token', token);
  } else {
    storage.removeItem('accessToken');
    storage.removeItem('token');
  }
}