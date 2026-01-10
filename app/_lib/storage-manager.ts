export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  const item = localStorage.getItem(key);
  var returnValue: typeof defaultValue;
  if (item) {
    try {
      returnValue = JSON.parse(item) as T;
    } catch {
      returnValue = defaultValue;
    }
  } else {
    returnValue = defaultValue;
  }
  setLocalStorageItem<T>(key, returnValue);
  return returnValue!;
}

export function setLocalStorageItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
